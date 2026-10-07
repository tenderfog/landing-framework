import {readdir, readFile, stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const files = [];
async function walk(dir) {
  for (const entry of await readdir(dir, {withFileTypes: true})) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(p); else files.push(p);
  }
}
await walk(root);
const errors = [];
let linkCount = 0, skillCount = 0, jsonCount = 0;
for (const file of files) {
  const relative = path.relative(root, file);
  if (!/\.(md|json)$/u.test(file)) continue;
  const source = await readFile(file, 'utf8');
  if (file.endsWith('.json')) {
    try {JSON.parse(source); jsonCount++;} catch (err) {errors.push(`${relative}: ${err.message}`);}
    continue;
  }
  // Exclude code fences: sample strings are not document links.
  const body = source.replace(/^```[^\n]*\n[\s\S]*?^```\s*$/gmu, '');
  for (const match of body.matchAll(/\[[^\]]*\]\(([^\n)]+)\)/gu)) {
    let target = match[1].trim().replace(/^<|>$/gu, '');
    if (/^[a-z][a-z\d+.-]*:/iu.test(target) || target.startsWith('#')) continue;
    target = target.split('#')[0];
    if (!target) continue;
    let resolved;
    try {resolved = path.resolve(path.dirname(file), decodeURIComponent(target));} catch {errors.push(`${relative}: malformed link ${target}`); continue;}
    if (!(resolved === root || resolved.startsWith(root + path.sep))) {
      errors.push(`${relative}: link escapes portable package: ${target}`); continue;
    }
    try {await stat(resolved); linkCount++;} catch {errors.push(`${relative}: missing link ${target}`);}
  }
  const fences = source.match(/^```/gmu) || [];
  if (fences.length % 2) errors.push(`${relative}: unbalanced code fences`);
  if (path.basename(file) === 'SKILL.md') {
    skillCount++;
    const frontmatter = source.match(/^---\n([\s\S]*?)\n---\n/u)?.[1];
    const name = frontmatter?.match(/^name:\s*([^\n]+)$/mu)?.[1]?.trim();
    const description = frontmatter?.match(/^description:\s*([^\n]+)$/mu)?.[1]?.trim();
    if (!name || !/^[a-z\d-]{1,64}$/u.test(name) || !description) errors.push(`${relative}: invalid required skill metadata`);
    if (name !== path.basename(path.dirname(file))) errors.push(`${relative}: skill name/folder mismatch`);
  }
}
if (errors.length) {console.error(errors.join('\n')); process.exitCode = 1;}
else console.log(`PASS: ${files.length} files, ${linkCount} internal links, ${jsonCount} JSON examples, ${skillCount} portable skills`);
