import fs from "node:fs";

const config = fs.readFileSync("config/runtime-config.js", "utf8");

// Support multiline runtime config expressions such as:
// window.INDO_API_BASE = window.INDO_API_BASE || "https://...";
const apiBaseMatch = config.match(
  /INDO_API_BASE\s*=\s*[\s\S]*?['\"](https:\/\/[^'\"]+)['\"]/,
);

if (!apiBaseMatch) {
  console.error(
    "Invalid INDO_API_BASE production configuration. Expected an https:// URL or an explicit deployment-time override.",
  );
  process.exit(1);
}

const apiBase = apiBaseMatch[1].replace(/\/$/, "");
if (
  /^https:\/\/localhost(?::\d+)?$/i.test(apiBase) ||
  /example\.com/i.test(apiBase)
) {
  console.error("INDO_API_BASE still points to a local/example URL.");
  process.exit(1);
}

console.log(`Frontend production API configuration is valid: ${apiBase}`);
