import type * as Mod from 'node:crypto';

const mod = globalThis.require('crypto') as typeof Mod;

export const randomBytes: typeof Mod.randomBytes = mod.randomBytes;
export const createHash: typeof Mod.createHash = mod.createHash;
export const createHmac: typeof Mod.createHmac = mod.createHmac;
export const scryptSync: typeof Mod.scryptSync = mod.scryptSync;
export default mod;
