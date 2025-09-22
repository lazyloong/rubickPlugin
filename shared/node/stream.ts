import type * as Mod from 'node:stream';
const mod = (globalThis as any).require('stream') as typeof Mod;
export const { Readable, Writable, Transform, pipeline } = mod;
export default mod;
