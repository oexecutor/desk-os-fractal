import { startDevApiServer } from "./dev-api-server.js";

process.env.MOCK_MODE = process.env.MOCK_MODE ?? "true";
process.env.QR_BASE_URL = process.env.QR_BASE_URL ?? "http://localhost:8901";

const port = Number(process.env.DEV_API_PORT ?? 8901);
await startDevApiServer(port);
console.log(`dev-api-server ouvindo em http://localhost:${port}`);
