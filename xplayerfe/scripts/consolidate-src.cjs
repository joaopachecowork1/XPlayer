
// consolidate-src.cjs (CommonJS) — corre com `node scripts/consolidate-src.cjs`
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const projectRoot = process.cwd();        // executar na raiz
const srcDir = path.join(projectRoot, 'src');
const legacyDir = path.join(srcDir, 'legacy');

const exts = new Set(['.ts','.tsx','.js','.jsx','.css','.scss','.sass']);
const ignoreTop = new Set(['node_modules','.next','.git','dist','build','.turbo','.vercel','scripts']);
const ignoreAny = new Set(['node_modules','.next','.git','dist','build','.turbo','.vercel']);

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if ((dir === projectRoot && ignoreTop.has(entry.name)) || ignoreAny.has(entry.name)) continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(p);
    else yield p;
  }
}
function hashFile(p) {
  const data = fs.readFileSync(p);
  return require('node:crypto').createHash('sha256').update(data).digest('hex');
}
function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }

function main() {
  ensureDir(srcDir);
  ensureDir(legacyDir);

  const moved = [];
  const dup = {};

  for (const file of walk(projectRoot)) {
    const rel = path.relative(projectRoot, file);
    if (rel.startsWith('src' + path.sep)) continue;
    const ext = path.extname(file).toLowerCase();
    if (!exts.has(ext)) continue;

    const h = hashFile(file);
    dup[h] = dup[h] ?? [];
    dup[h].push(rel);

    const dest = path.join(legacyDir, rel);
    ensureDir(path.dirname(dest));
    if (!fs.existsSync(dest)) fs.copyFileSync(file, dest);
    moved.push({ from: rel, to: path.relative(projectRoot, dest) });
  }

  const report = {
    moved,
    duplicates: Object.entries(dup).filter(([_, arr]) => arr.length > 1)
      .map(([hash, files]) => ({ hash, files })),
    note: 'Se existir mais de um ficheiro com o mesmo hash, podes apagar os duplicados com segurança.'
  };
  fs.writeFileSync(path.join(projectRoot, 'consolidation-report.json'), JSON.stringify(report, null, 2));
  console.log(`Movidos ${moved.length} ficheiros. Reporte em consolidation-report.json`);
}

main();
