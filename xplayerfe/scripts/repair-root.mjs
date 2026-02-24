// scripts/repair-root.mjs
// Usage:
//   node scripts/repair-root.mjs           (dry-run)
//   node scripts/repair-root.mjs --apply   (performs moves/copies)
import fs from 'node:fs';
import path from 'node:path';

const APPLY = process.argv.includes('--apply');
const cwd = process.cwd();

const filesToRestore = [
  'next.config.ts',
  'tailwind.config.ts',
  'postcss.config.js',
  'postcss.config.cjs',
  'postcss.config.mjs'
];

function findUp(start, name) {
  const p = path.join(start, name);
  if (fs.existsSync(p)) return p;
  for (const cand of [
    path.join(start, 'src', name),
    path.join(start, 'src', 'legacy', name),
  ]) {
    if (fs.existsSync(cand)) return cand;
  }
  return null;
}

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }

const report = { actions: [], notes: [] };

// 1) package.json
const pkgAtRoot = path.join(cwd, 'package.json');
let pkgFound = fs.existsSync(pkgAtRoot) ? pkgAtRoot : null;
if (!pkgFound) {
  // try to find nested package.json (monorepo not supported here, just first hit)
  const candidates = [
    path.join(cwd, 'src', 'package.json'),
    path.join(cwd, 'src', 'legacy', 'package.json'),
    path.join(cwd, 'frontend', 'package.json'),
  ];
  for (const c of candidates) if (fs.existsSync(c)) { pkgFound = c; break; }
  if (pkgFound) {
    report.actions.push({ move: { from: pkgFound, to: pkgAtRoot } });
    if (APPLY) {
      fs.copyFileSync(pkgFound, pkgAtRoot);
    }
  } else {
    report.notes.push('package.json NÃO encontrado. Se não estás num monorepo, vou criar um mínimo.');
    const minimalPkg = JSON.stringify({
      name: "xplayer-frontend",
      version: "0.1.0",
      private: true,
      type: "module",
      scripts: { dev: "next dev", build: "next build", start: "next start" },
      dependencies: { next: "16.1.6", react: "18.2.0", "react-dom": "18.2.0" }
    }, null, 2);
    report.actions.push({ create: { file: pkgAtRoot } });
    if (APPLY) fs.writeFileSync(pkgAtRoot, minimalPkg);
  }
} else {
  report.notes.push('package.json encontrado na raiz.');
}

// 2) Restore config files if they were moved under src/ or src/legacy/
for (const name of filesToRestore) {
  const atRoot = path.join(cwd, name);
  if (fs.existsSync(atRoot)) continue;
  const found = findUp(cwd, name);
  if (found) {
    report.actions.push({ move: { from: found, to: atRoot } });
    if (APPLY) {
      fs.copyFileSync(found, atRoot);
    }
  }
}

// 3) tsconfig.json ensure baseUrl & paths (only update if file exists)
const tsPath = path.join(cwd, 'tsconfig.json');
if (fs.existsSync(tsPath)) {
  const json = JSON.parse(fs.readFileSync(tsPath, 'utf8'));
  json.compilerOptions = json.compilerOptions || {};
  json.compilerOptions.baseUrl = 'src';
  json.compilerOptions.paths = Object.assign({}, json.compilerOptions.paths || {}, { '@/*': ['*'] });
  if (APPLY) fs.writeFileSync(tsPath, JSON.stringify(json, null, 2));
  report.notes.push('tsconfig.json atualizado com baseUrl=src e @/*.');
} else {
  report.notes.push('tsconfig.json NÃO encontrado — cria um se precisares dos aliases.');
}

// 4) Print report
console.log(JSON.stringify(report, null, 2));
