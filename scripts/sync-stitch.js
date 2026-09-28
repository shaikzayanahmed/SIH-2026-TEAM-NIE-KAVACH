import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

// Load .env manually if present
const envPath = path.join(rootDir, ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || "";
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      process.env[key] = value.trim();
    }
  }
}

const apiKey = process.env.STITCH_API_KEY;
const projectId = process.argv[2] || process.env.STITCH_PROJECT_ID;

// Save to frontend/stitch_designs/
const outDir = path.join(rootDir, "frontend", "stitch_designs");

if (!apiKey) {
  console.error("Error: STITCH_API_KEY environment variable is required.");
  process.exit(1);
}

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function syncStitch() {
  console.log(`Connecting to Stitch for Project ID: ${projectId}...`);
  const body = {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: {
      name: "list_screens",
      arguments: { projectId }
    }
  };

  try {
    const res = await fetch("https://stitch.googleapis.com/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      throw new Error(`Stitch API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    const screens = data.result?.structuredContent?.screens || [];

    console.log(`Found ${screens.length} screens.`);

    for (const s of screens) {
      const safeTitle = s.title.replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();
      const screenId = s.name.split("/").pop();
      const htmlUrl = s.htmlCode?.downloadUrl;
      if (htmlUrl) {
        const htmlRes = await fetch(htmlUrl);
        const html = await htmlRes.text();
        const filename = `${screenId}_${safeTitle}.html`;
        fs.writeFileSync(path.join(outDir, filename), html);
        console.log(`- Downloaded: ${s.title} -> ${filename} (${(html.length / 1024).toFixed(1)} KB)`);
      }
    }

    fs.writeFileSync(path.join(outDir, "screens_manifest.json"), JSON.stringify(screens, null, 2));
    console.log(`\nSync completed! All screens saved to: ${outDir}`);
  } catch (err) {
    console.error("Failed to sync from Stitch:", err.message);
  }
}

syncStitch();
