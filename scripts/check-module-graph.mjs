import { readdir, readFile } from 'node:fs/promises';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = join(root, 'src');

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full));
    else if (entry.isFile() && extname(entry.name) === '.js') files.push(full);
  }
  return files;
}

function importsFrom(source) {
  const matches = [];
  const patterns = [
    /\bimport\s+(?:[^'";]+?\s+from\s+)?['"]([^'"]+)['"]/g,
    /\bimport\(\s*['"]([^'"]+)['"]\s*\)/g
  ];
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(source))) matches.push(match[1]);
  }
  return [...new Set(matches)];
}

function resolveImport(fromFile, specifier) {
  const cleanSpecifier = String(specifier).split(/[?#]/, 1)[0];
  if (!cleanSpecifier.startsWith('.')) return null;
  if (cleanSpecifier.endsWith('.css')) {
    throw new Error(`${fromFile}: JavaScript must not import CSS module ${cleanSpecifier}`);
  }
  const base = resolve(dirname(fromFile), cleanSpecifier);
  const candidates = [base, `${base}.js`, join(base, 'index.js')];
  return candidates.find((candidate) => candidate.endsWith('.js') || extname(candidate) === '.js')
    && candidates.find((candidate) => candidate.endsWith('.js'));
}

const files = await walk(srcDir);
const errors = [];
let importCount = 0;

for (const file of files) {
  const source = await readFile(file, 'utf8');
  for (const specifier of importsFrom(source)) {
    const target = resolveImport(file, specifier);
    if (!target) continue;
    importCount += 1;
    try {
      await readFile(target, 'utf8');
    } catch {
      errors.push(`${file}: missing relative import ${specifier}`);
    }
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`Module graph check passed: ${files.length} JS files, ${importCount} relative imports.`);
