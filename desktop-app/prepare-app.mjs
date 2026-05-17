import fs from "node:fs/promises";
import path from "node:path";

const root = path.resolve("..");
const appDir = path.resolve("app");

await fs.mkdir(appDir, { recursive: true });
await fs.copyFile(
  path.join(root, "km-budget-studio.html"),
  path.join(appDir, "km-budget-studio.html")
);

console.log("Desktop app assets prepared.");
