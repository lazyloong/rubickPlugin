import type * as Mod from 'node:os';
const mod = (globalThis as any).require('os') as typeof Mod;
export const { platform, homedir, tmpdir, cpus, freemem, totalmem } = mod;
export default mod;
