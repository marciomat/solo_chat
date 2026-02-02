// scripts/build-sw.mjs
// Build the Serwist service worker for static export
import { execSync } from "child_process";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");

async function buildServiceWorker() {
  console.log("[build-sw] Building service worker with esbuild...");

  // Use esbuild to bundle the service worker
  try {
    execSync(
      `npx esbuild src/app/sw.ts --bundle --outfile=public/sw.js --format=iife --platform=browser --target=es2020 --minify`,
      { cwd: projectRoot, stdio: "inherit" }
    );
    console.log("[build-sw] Service worker built successfully!");
  } catch (error) {
    console.error("[build-sw] Failed to build service worker:", error);
    process.exit(1);
  }
}

buildServiceWorker();
