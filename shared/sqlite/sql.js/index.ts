import sqlWasmSource from './sql-wasm.js?raw';
import wasmUrl from './sql-wasm.wasm?url';

const initSqlJs: any = (() => {
  const module: any = { exports: {} };
  const fn = new Function('module', 'exports', sqlWasmSource);
  fn(module, module.exports);
  return module.exports.default || module.exports;
})();

export default () =>
  initSqlJs({
    locateFile: (f: string) => (f.endsWith('.wasm') ? wasmUrl : f),
  });

export type {
  Database,
  QueryExecResult,
  BindParams,
  SqlValue,
  SqlJsStatic,
  Statement,
} from 'sql.js';
