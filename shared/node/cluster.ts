import type * as Mod from 'node:cluster';
const mod = (globalThis as any).require('cluster') as typeof Mod;
export const { fork, isMaster, isWorker, workers } = mod;
export default mod;
