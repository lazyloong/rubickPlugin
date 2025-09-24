import type * as Mod from 'node:os';

const mod = globalThis.require('os') as typeof Mod;

export const platform: typeof Mod.platform = mod.platform;
export const homedir: typeof Mod.homedir = mod.homedir;
export const tmpdir: typeof Mod.tmpdir = mod.tmpdir;
export const cpus: typeof Mod.cpus = mod.cpus;
export const freemem: typeof Mod.freemem = mod.freemem;
export const totalmem: typeof Mod.totalmem = mod.totalmem;
export default mod;
