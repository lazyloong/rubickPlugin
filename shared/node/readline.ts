import type * as Mod from 'node:readline';
const mod = (globalThis as any).require('readline') as typeof Mod;
export const { createInterface } = mod;
export default mod;
