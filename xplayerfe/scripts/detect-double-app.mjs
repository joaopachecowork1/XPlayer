
// detect-double-app.mjs
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const hasRootApp = fs.existsSync(path.join(root, 'app'));
const hasSrcApp = fs.existsSync(path.join(root, 'src', 'app'));

if (hasRootApp && hasSrcApp) {
  console.log('⚠️  Tens `app/` na raiz E `src/app/`. Next irá usar a pasta da RAIZ.');
  console.log('   => Para testar `src/app`, renomeia `app/` -> `_app_backup`.');
} else if (hasSrcApp) {
  console.log('✅ Só tens `src/app/` — pronto para o layout em `src/`.');
} else if (hasRootApp) {
  console.log('ℹ️  Só tens `app/` na raiz. Podes migrar para `src/app/` se quiseres.');
} else {
  console.log('❓ Não encontrei app/ nem src/app/.');
}
