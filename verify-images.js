// Checks every image in the project for a valid end-of-file marker.
// Files imported through the design API above 192 KiB came down truncated;
// run this after replacing them to confirm the full versions landed.
//   node verify-images.js
const fs = require("fs");
const path = require("path");

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if (e.name === "node_modules" || e.name.startsWith(".")) return [];
    const full = path.join(dir, e.name);
    return e.isDirectory() ? walk(full) : [full];
  });

const PNG_END = "0000000049454e44ae426082";

const isComplete = (file, buf) => {
  if (/\.jpe?g$/i.test(file)) return buf[buf.length - 2] === 0xff && buf[buf.length - 1] === 0xd9;
  if (/\.png$/i.test(file)) return buf.slice(-12).toString("hex") === PNG_END;
  return null;
};

const bad = [];
for (const file of walk(".").sort()) {
  const buf = fs.readFileSync(file);
  const ok = isComplete(file, buf);
  if (ok === null) continue;
  if (!ok) bad.push(file);
  console.log(`${String(buf.length).padStart(8)}  ${ok ? "complete " : "TRUNCATED"}  ${file}`);
}

console.log(bad.length ? `\n${bad.length} truncated:\n${bad.join("\n")}` : "\nAll images complete.");
process.exit(bad.length ? 1 : 0);
