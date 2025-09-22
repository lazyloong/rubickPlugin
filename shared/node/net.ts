import type * as Mod from 'node:net';
const mod = (globalThis as any).require('net') as typeof Mod;

export default mod;
