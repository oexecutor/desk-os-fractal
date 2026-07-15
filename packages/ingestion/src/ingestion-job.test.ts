import { describe, expect, it } from "vitest";
import { advanceIngestionJob, createIngestionJob } from "./ingestion-job.js";

describe("IngestionJob lifecycle", () => {
  it("cria job UPLOADED e avança por status válidos do schema", () => {
    const job = createIngestionJob("0123456789abcdef0123", ["0123456789abcdef0001"]);
    expect(job.status).toBe("UPLOADED");
    expect(job.steps).toEqual([]);

    const extracting = advanceIngestionJob(job, "EXTRACTING", {
      name: "extract",
      status: "RUNNING",
    });
    expect(extracting.status).toBe("EXTRACTING");
    expect(extracting.steps).toHaveLength(1);
    expect(extracting.updated_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});
