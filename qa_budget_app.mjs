import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

const appPath = path.resolve("km-budget-studio.html").replace(/\\/g, "/");
const screenshotPath = path.resolve("outputs", "budget_tracker", "km-budget-studio-screenshot.png");
const edgeCandidates = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe"
];

const browserPath = edgeCandidates.find(candidate => fs.existsSync(candidate));
if (!browserPath) throw new Error("No local Edge/Chrome executable found for QA.");

const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "km-budget-qa-"));
const qaUrl = `file:///${appPath}?qa=1`;
const cleanUrl = `file:///${appPath}?qa=clean`;

const dom = execFileSync(browserPath, [
  "--headless=new",
  "--disable-gpu",
  "--disable-software-rasterizer",
  "--disable-dev-shm-usage",
  "--no-sandbox",
  "--allow-file-access-from-files",
  `--user-data-dir=${userDataDir}`,
  "--dump-dom",
  qaUrl
], { encoding: "utf8", timeout: 30000 });

if (!dom.includes("QA_PASS")) {
  throw new Error("Browser QA did not report QA_PASS.");
}

execFileSync(browserPath, [
  "--headless=new",
  "--disable-gpu",
  "--disable-software-rasterizer",
  "--disable-dev-shm-usage",
  "--no-sandbox",
  "--allow-file-access-from-files",
  `--user-data-dir=${userDataDir}`,
  "--window-size=1440,1000",
  `--screenshot=${screenshotPath}`,
  cleanUrl
], { stdio: "ignore", timeout: 30000 });

fs.rmSync(userDataDir, { recursive: true, force: true });
console.log(`QA passed: ${screenshotPath}`);
