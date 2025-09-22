import type * as Mod from 'node:child_process';
const mod = (globalThis as any).require('child_process') as typeof Mod;
export const { exec, spawn, fork, execFile, execSync, spawnSync } = mod;
export default mod;
