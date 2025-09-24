import type * as Mod from 'node:readline';

const mod = globalThis.require('readline') as typeof Mod;

export const createInterface: typeof Mod.createInterface = mod.createInterface;
export default mod;
