import sqlInit, { Database, SqlJsStatic, Statement } from './sql.js';
import fs from '../node/fs';

let SQL: SqlJsStatic;

export default async function queryFromSqlite(
  databaseFilePath: string,
  sql: string,
): Promise<Array<any>> {
  if (databaseFilePath.trim() === '') return [];
  if (SQL === undefined) SQL = await sqlInit();
  let database: Database | undefined, statement: Statement | undefined;
  try {
    const buffer = fs.readFileSync(databaseFilePath);
    database = new SQL.Database(buffer);
    statement = database.prepare(sql);
    const result: any[] = [];
    while (statement.step()) {
      result.push(statement.getAsObject());
    }
    return result;
  } finally {
    statement?.free();
    database?.close();
  }
  return [];
}
