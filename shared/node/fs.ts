import type fs from 'node:fs';
import type { readdirSync as readdirSync_ } from 'node:fs';

type Mod = typeof fs;

const mod: Mod = globalThis.require('fs');

export const readFile = mod.readFile;
export const readFileSync = mod.readFileSync;
export const writeFile = mod.writeFile;
export const writeFileSync = mod.writeFileSync;
export const existsSync = mod.existsSync;
export const mkdirSync = mod.mkdirSync;
export const readdirSync: typeof readdirSync_ = mod.readdirSync;
export const statSync = mod.statSync;
export const rename = mod.rename;
export default mod;
