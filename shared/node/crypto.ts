import type * as Mod from 'node:crypto';
const mod = (globalThis as any).require('crypto') as typeof Mod;
export const { randomBytes, createHash, createHmac, scryptSync } = mod;
export default mod;
