import { defineConfig } from "@playwright/test";
import { existsSync } from "node:fs";
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ||
  (process.platform === "linux" && existsSync("/usr/bin/chromium")
    ? "/usr/bin/chromium"
    : undefined);
export default defineConfig({
  testDir: "tests/browser",
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  use: {
    baseURL: "http://127.0.0.1:5173",
    headless: true,
    ...(!executablePath && process.platform === "win32" ? { channel: "msedge" } : {}),
    launchOptions: {
      executablePath,
      args: process.platform === "linux" ? ["--no-sandbox"] : [],
    },
  },
  webServer: {
    command: "node node_modules/vite/bin/vite.js --host 127.0.0.1",
    url: "http://127.0.0.1:5173",
    reuseExistingServer: true,
  },
  reporter: "list",
});
