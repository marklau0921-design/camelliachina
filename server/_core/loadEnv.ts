import fs from "fs";
import path from "path";
import dotenv from "dotenv";

const cwd = process.cwd();
const candidates = [path.resolve(cwd, ".env")];
const domainMatch = cwd.match(/^(.*\/domains\/[^/]+)(?:\/.*)?$/);

if (domainMatch) {
  candidates.unshift(path.join(domainMatch[1], "nodejs", ".env"));
}

for (const envPath of Array.from(new Set(candidates))) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath, override: true });
    console.log(`[Startup] Loaded environment from ${envPath}`);
    break;
  }
}
