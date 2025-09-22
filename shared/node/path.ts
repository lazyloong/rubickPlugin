import type * as Mod from 'node:path';
const mod = (globalThis as any).require('path') as typeof Mod;
export const { join, resolve, dirname, basename, extname, parse } = mod;
export default mod;
