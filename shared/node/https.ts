import type * as Mod from 'node:https';
const mod = (globalThis as any).require('https') as typeof Mod;
export const { createServer, request, get } = mod;
export default mod;
