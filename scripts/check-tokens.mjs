import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOTS = ["src/app", "src/components"];
const EXTENSIONS = [".ts", ".tsx", ".css"];

const RULES = [
  { name: "color hexadecimal", pattern: /#[0-9a-fA-F]{3,8}\b/ },
  { name: "rgb(", pattern: /\brgba?\(/ },
  { name: "valor en px", pattern: /\b\d+(\.\d+)?px\b/ },
  { name: "clase arbitraria de Tailwind", pattern: /[\w:-]+-\[[^\]]+\]/ },
];

function* walk(dir) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const entry of entries) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) yield* walk(path);
    else if (EXTENSIONS.some((ext) => path.endsWith(ext))) yield path;
  }
}

const problems = [];
for (const root of ROOTS) {
  for (const file of walk(root)) {
    readFileSync(file, "utf8")
      .split("\n")
      .forEach((line, index) => {
        for (const rule of RULES) {
          if (rule.pattern.test(line)) {
            problems.push(`${relative(".", file)}:${index + 1}  ${rule.name}: ${line.trim()}`);
          }
        }
      });
  }
}

if (problems.length > 0) {
  console.error("check:tokens, valores sueltos fuera de tokens:\n" + problems.join("\n"));
  process.exit(1);
}
console.log("check:tokens, sin valores sueltos");
