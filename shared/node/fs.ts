import type * as Mod from 'node:fs';
const mod = (globalThis as any).require('fs') as typeof Mod;
export const { readFile, readFileSync, writeFile, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } = mod;
export default mod;
