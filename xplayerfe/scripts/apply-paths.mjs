// scripts/apply-paths.mjs
// Adds/updates tsconfig.json with baseUrl: "src" and paths "@/ *": ["*"]
import fs from 'node:fs';
import path from 'node:path';

const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
if (!fs.existsSync(tsconfigPath)) {
  console.error('tsconfig.json not found at project root.');
  process.exit(1);
}
const ts = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
ts.compilerOptions = ts.compilerOptions || {};
ts.compilerOptions.baseUrl = 'src';
ts.compilerOptions.paths = Object.assign({}, ts.compilerOptions.paths || {}, { '@/*': ['*'] });
fs.writeFileSync(tsconfigPath, JSON.stringify(ts, null, 2));
console.log('✅ Updated tsconfig.json with baseUrl="src" and paths {"@/*": ["*"]}');
