import type * as Mod from 'node:child_process';

const mod = globalThis.require('child_process') as typeof Mod;

export const exec: typeof Mod.exec = mod.exec;
export const spawn: typeof Mod.spawn = mod.spawn;
export const fork: typeof Mod.fork = mod.fork;
export const execFile: typeof Mod.execFile = mod.execFile;
export const execSync: typeof Mod.execSync = mod.execSync;
export const spawnSync: typeof Mod.spawnSync = mod.spawnSync;
export default mod;
