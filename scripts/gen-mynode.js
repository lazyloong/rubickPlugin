#!/usr/bin/env tsx
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/* ---------- 配置区 ---------- */
const mods = [
  'fs',
  'path',
  'os',
  'crypto',
  'http',
  'https',
  'net',
  'events',
  'stream',
  'readline',
  'child_process',
  'cluster',
];

const topExports = {
  fs: [
    'readFile',
    'readFileSync',
    'writeFile',
    'writeFileSync',
    'existsSync',
    'mkdirSync',
    'readdirSync',
    'statSync',
  ],
  path: ['join', 'resolve', 'dirname', 'basename', 'extname', 'parse'],
  os: ['platform', 'homedir', 'tmpdir', 'cpus', 'freemem', 'totalmem'],
  crypto: ['randomBytes', 'createHash', 'createHmac', 'scryptSync'],
  http: ['createServer', 'request', 'get'],
  https: ['createServer', 'request', 'get'],
  child_process: ['exec', 'spawn', 'fork', 'execFile', 'execSync', 'spawnSync'],
  stream: ['Readable', 'Writable', 'Transform', 'pipeline'],
  readline: ['createInterface'],
  cluster: ['fork', 'isMaster', 'isWorker', 'workers'],
};

/* ---------- 模板函数 ---------- */
function tpl(mod) {
  const members = topExports[mod] ?? [];
  // 显式类型导出，避免 any
  const named = members.map((m) => `export const ${m}: typeof Mod.${m} = mod.${m};`).join('\n');

  return `import type * as Mod from 'node:${mod}';

const mod = globalThis.require('${mod}') as typeof Mod;

${named}
export default mod;
`;
}

/* ---------- 生成文件 ---------- */
const outDir = join(__dirname, '../shared/node');
mkdirSync(outDir, { recursive: true });

for (const m of mods) {
  writeFileSync(join(outDir, `${m}.ts`), tpl(m));
}

const indexLines = mods.map((m) => `export * as ${m} from './${m}';`).join('\n');
writeFileSync(join(outDir, 'index.ts'), indexLines + '\n');

console.log('✅ 带类型的动态 node 模块生成完毕！');
