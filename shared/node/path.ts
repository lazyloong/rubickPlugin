import type * as Mod from 'node:path';

const mod = globalThis.require('path') as typeof Mod;

export const join: typeof Mod.join = mod.join;
export const resolve: typeof Mod.resolve = mod.resolve;
export const dirname: typeof Mod.dirname = mod.dirname;
export const basename: typeof Mod.basename = mod.basename;
export const extname: typeof Mod.extname = mod.extname;
export const parse: typeof Mod.parse = mod.parse;
export default mod;
