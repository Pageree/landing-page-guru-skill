import { readdir, readFile, stat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadContract } from '../skills/landing-page-guru-skill/scripts/lib/common.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const skill = resolve(root, 'skills/landing-page-guru-skill');
const failures = [];
async function filesAt(folder) {
  const files = [];
  for (const item of await readdir(folder, { withFileTypes: true })) {
    if (['node_modules', '.git', 'dist', 'artifacts', 'runs'].includes(item.name)) continue;
    if (item.isSymbolicLink()) { failures.push(`Unexpected symlink: ${item.name}`); continue; }
    const path = resolve(folder, item.name);
    files.push(...item.isDirectory() ? await filesAt(path) : [path]);
  }
  return files;
}
const entry = await readFile(resolve(skill, 'SKILL.md'), 'utf8');
const metadata = entry.match(/^---\n([\s\S]+?)\n---\n/);
if (!metadata) failures.push('Missing YAML frontmatter');
if (!/^name: landing-page-guru-skill$/m.test(metadata?.[1] ?? '')) failures.push('Skill name differs from directory');
const description = metadata?.[1].match(/^description: (.+)$/m)?.[1];
if (!description || description.length > 1024) failures.push('Invalid description length');
if (entry.split('\n').length >= 200) failures.push('Entry exceeds our 200-line budget');
const paths = await filesAt(root);
for (const path of paths) {
  if (path.endsWith('.json')) { try { JSON.parse(await readFile(path, 'utf8')); } catch { failures.push(`Invalid JSON: ${path}`); } }
  if (path.endsWith('integration-contract.json') || path.endsWith('integration-contract-template.json')) {
    try { await loadContract(path); } catch (error) { failures.push(`${path}: ${error.message}`); }
  }
  if (!path.endsWith('.md')) continue;
  const text = await readFile(path, 'utf8');
  for (const match of text.matchAll(/\[[^\]\n]+\]\(([^)\s]+)\)/g)) {
    const link = match[1];
    if (/^(?:https?:|mailto:|#)/.test(link)) continue;
    const target = resolve(dirname(path), link.split('#')[0]);
    if (path.startsWith(skill) && !target.startsWith(skill + '/')) failures.push(`Installed skill reference escapes directory: ${link}`);
    try { await stat(target); } catch { failures.push(`Broken link in ${path}: ${link}`); }
  }
}
if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1; }
else console.log(`Checked ${paths.length} files: skill metadata, self-contained references, local Markdown links, JSON, and integration contracts.`);
