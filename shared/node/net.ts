import type * as Mod from 'node:net';

const mod = globalThis.require('net') as typeof Mod;


export default mod;
