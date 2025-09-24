import type * as Mod from 'node:cluster';

const mod = globalThis.require('cluster') as typeof Mod;

export const fork: typeof Mod.fork = mod.fork;
export const isMaster: typeof Mod.isMaster = mod.isMaster;
export const isWorker: typeof Mod.isWorker = mod.isWorker;
export const workers: typeof Mod.workers = mod.workers;
export default mod;
