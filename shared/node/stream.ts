import type * as Mod from 'node:stream';

const mod = globalThis.require('stream') as typeof Mod;

export const Readable: typeof Mod.Readable = mod.Readable;
export const Writable: typeof Mod.Writable = mod.Writable;
export const Transform: typeof Mod.Transform = mod.Transform;
export const pipeline: typeof Mod.pipeline = mod.pipeline;
export default mod;
