import { createHash } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import { ZipArchive } from "archiver";

/**
 * Empacota fonte + build estático (apps/web/dist) + Functions + contratos
 * em release/desk-os-netlify-release-<version>.zip, com RELEASE_MANIFEST.json
 * e CHECKSUMS.sha256 na RAIZ do zip (per NETLIFY_RELEASE_SPEC.md), mais
 * DEPLOY_NETLIFY.md / RELEASE_NOTES.md / VALIDATION_REPORT.md já versionados
 * na raiz do repo. O checksum do próprio .zip é circular (não pode se
 * autodescrever) e por isso vive só fora do zip, em release/<nome>.sha256.
 */
const ROOT = fileURLToPath(new URL("..", import.meta.url));
const RELEASE_DIR = join(ROOT, "release");

const EXCLUDED_DIR_NAMES = new Set([
  "node_modules",
  ".git",
  "build",
  "coverage",
  ".playwright",
  "test-results",
  "playwright-report",
  ".netlify",
  ".capacitor",
  ".claude",
  "release",
  ".turbo",
]);
const EXCLUDED_FILE_PATTERNS = [/\.log$/, /\.tsbuildinfo$/, /^\.env$/, /^\.env\.[^.]+$/, /\.DS_Store$/];

// build estático a publicar (FINAL_DELIVERABLE_MANIFEST.md exige "build
// estático" dentro do ZIP); os demais dist/ são saída intermediária de tsc
// para linkagem interna do workspace e são reproduzidos pelo build do
// Netlify a partir da fonte — não precisam viajar no ZIP.
const KEPT_DIST_PATH = join(ROOT, "apps", "web", "dist");

function isPathUnder(candidate: string, base: string): boolean {
  const rel = relative(base, candidate);
  return rel === "" || (!rel.startsWith("..") && !rel.startsWith(sep + "."));
}

async function walk(dir: string, acc: string[]): Promise<void> {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "dist" && !isPathUnder(full, KEPT_DIST_PATH) && full !== KEPT_DIST_PATH) continue;
      if (EXCLUDED_DIR_NAMES.has(entry.name)) continue;
      await walk(full, acc);
    } else if (entry.isFile()) {
      if (entry.name === ".env" || EXCLUDED_FILE_PATTERNS.some((re) => re.test(entry.name))) continue;
      acc.push(full);
    }
  }
}

async function sha256File(path: string): Promise<string> {
  const hash = createHash("sha256");
  await new Promise<void>((resolve, reject) => {
    const stream = createReadStream(path);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve());
    stream.on("error", reject);
  });
  return hash.digest("hex");
}

function gitCommit(): string {
  try {
    return execSync("git rev-parse HEAD", { cwd: ROOT }).toString().trim();
  } catch {
    return "unknown";
  }
}

function toolVersion(cmd: string): string {
  try {
    return execSync(cmd, { cwd: ROOT }).toString().trim();
  } catch {
    return "unknown";
  }
}

async function main() {
  const pkg = JSON.parse(await readFile(join(ROOT, "package.json"), "utf8"));
  const version = pkg.version as string;
  await mkdir(RELEASE_DIR, { recursive: true });

  const manifestPath = join(ROOT, "RELEASE_MANIFEST.json");
  const checksumsPath = join(ROOT, "CHECKSUMS.sha256");

  const files: string[] = [];
  await walk(ROOT, files);
  files.sort();

  const checksumLines: string[] = [];
  let totalBytes = 0;
  for (const absPath of files) {
    const relPath = relative(ROOT, absPath).split(sep).join("/");
    const digest = await sha256File(absPath);
    const size = (await stat(absPath)).size;
    totalBytes += size;
    checksumLines.push(`${digest}  ${relPath}`);
  }

  const manifest = {
    package: "desk-os-netlify-release",
    version,
    generated_at: new Date().toISOString(),
    git_commit: gitCommit(),
    toolchain: {
      node: process.version,
      pnpm: toolVersion("pnpm --version"),
      typescript: toolVersion("pnpm exec tsc --version"),
    },
    source_file_count: files.length,
    source_total_bytes: totalBytes,
    checksums_manifest: "CHECKSUMS.sha256",
    note: "SHA-256 do próprio .zip é circular e por isso fica fora do ZIP, em release/<nome>.zip.sha256.",
  };
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");
  const manifestRelPath = relative(ROOT, manifestPath).split(sep).join("/");
  checksumLines.push(`${await sha256File(manifestPath)}  ${manifestRelPath}`);
  checksumLines.sort();

  const checksumsContent = checksumLines.join("\n") + "\n";
  await writeFile(checksumsPath, checksumsContent, "utf8");

  const allFiles = [...files, manifestPath, checksumsPath];

  const zipPath = join(RELEASE_DIR, `desk-os-netlify-release-v${version}.zip`);
  const archive = new ZipArchive({ zlib: { level: 9 } });
  const output = createWriteStream(zipPath);
  const archiveDone = new Promise<void>((resolve, reject) => {
    output.on("close", () => resolve());
    archive.on("error", reject);
  });
  archive.pipe(output);
  for (const absPath of allFiles) {
    const relPath = relative(ROOT, absPath).split(sep).join("/");
    archive.file(absPath, { name: relPath });
  }
  await archive.finalize();
  await archiveDone;

  const zipSha256 = await sha256File(zipPath);
  const zipStat = await stat(zipPath);
  const zipName = `desk-os-netlify-release-v${version}.zip`;
  await writeFile(join(RELEASE_DIR, `${zipName}.sha256`), `${zipSha256}  ${zipName}\n`, "utf8");

  console.log(`OK  ${allFiles.length} arquivo(s) empacotado(s), ${(totalBytes / 1024 / 1024).toFixed(2)} MB de fonte.`);
  console.log(`OK  zip: ${zipPath}`);
  console.log(`OK  zip size: ${(zipStat.size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`OK  zip sha256: ${zipSha256}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
