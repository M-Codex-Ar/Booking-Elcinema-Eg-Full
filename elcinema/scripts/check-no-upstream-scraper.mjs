import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const sourceRoot = fileURLToPath(new URL("../src/", import.meta.url));
const violations = [];
const sourceExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".json"]);

async function visit(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await visit(path);
    else if ([...sourceExtensions].some((extension) => entry.name.endsWith(extension))) {
      const source = await readFile(path, "utf8");
      const executable = entry.name.endsWith(".json")
        ? source
        : source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|\s)\/\/[^\n]*/g, "$1");
      if (/(?:https?:)?\/\/(?:[\w-]+\.)*elcinema\.com/i.test(executable)) {
        violations.push(`${relative(sourceRoot.pathname, path)}: upstream host URL`);
      }
      if (/(?:from\s*|import\s*\()\s*["']cheerio["']/i.test(executable)) {
        violations.push(`${relative(sourceRoot.pathname, path)}: cheerio import`);
      }
    }
  }
}

await visit(sourceRoot);
if (violations.length) {
  console.error(
    "Public source must not depend on upstream HTML or URLs:\n" + violations.join("\n"),
  );
  process.exitCode = 1;
} else {
  console.log("No upstream scraper URLs or cheerio imports found in src/.");
}
