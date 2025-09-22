import type * as Mod from 'node:http';
const mod = (globalThis as any).require('http') as typeof Mod;
export const { createServer, request, get } = mod;
export default mod;
