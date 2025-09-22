import type * as Mod from 'node:events';
const mod = (globalThis as any).require('events') as typeof Mod;

export default mod;
