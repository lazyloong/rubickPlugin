import type * as Mod from 'node:http';

const mod = globalThis.require('http') as typeof Mod;

export const createServer: typeof Mod.createServer = mod.createServer;
export const request: typeof Mod.request = mod.request;
export const get: typeof Mod.get = mod.get;
export default mod;
