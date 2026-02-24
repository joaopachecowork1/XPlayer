
// promote-to-src.mjs
import fs from 'node:fs';
import path from 'node:path';

const APPLY = process.argv.includes('--apply');
const root = process.cwd();
const fromBase = path.join(root, 'src', 'legacy');
const toBase = path.join(root, 'src');

const allow = new Set(['app','components','hooks','lib','constants','contexts','models','pages']);
const skip = new Set(['globals.css']); // exemplo de ficheiros que preferes manter manualmente

if (!fs.existsSync(fromBase)) {
  console.error('src/legacy/ não existe. Nada a promover.');
  process.exit(0);
}

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(p);
    else yield p;
  }
}

const plan = [];
for (const file of walk(fromBase)) {
  const relFromLegacy = path.relative(fromBase, file); // ex: app\canhoes\page.tsx
  const top = relFromLegacy.split(path.sep)[0];
  if (!allow.has(top)) continue;
  if (skip.has(path.basename(file))) continue;

  const dest = path.join(toBase, relFromLegacy);
  if (fs.existsSync(dest)) {
    // já existe em src — NÃO sobrescreve
    continue;
  }
  plan.push({ from: file, to: dest });
}

console.log(`Encontrados ${plan.length} ficheiros para promover.`);
if (!APPLY) {
  for (const p of plan.slice(0, 20)) console.log(' -', path.relative(root, p.to));
  if (plan.length > 20) console.log(` ... +${plan.length-20} mais`);
  console.log('\nDry-run. Adiciona --apply para executar.');
  process.exit(0);
}

// aplicar
for (const { from, to } of plan) {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
}
console.log('✅ Promoção concluída (sem sobrescrever existentes).');
