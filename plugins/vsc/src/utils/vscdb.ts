import { queryFromSqlite } from '@shared/sqlite';
import settingStore from './settingStore';

type Result = { result: string }[];
type Entry = {
  entries: { folderUri: string }[];
};

export default async function getProjects(): Promise<string[]> {
  const vscDbPath = settingStore.get('vsc.configPath');
  if (vscDbPath === '') return [];
  const result = (await queryFromSqlite(
    vscDbPath,
    "select value as result from ItemTable where key = 'history.recentlyOpenedPathsList'",
  )) as Result;
  if (!result?.[0]?.result) return [];
  const { entries } = JSON.parse(result[0].result) as Entry;
  let projects = entries.map((entry) => decodeURIComponent(entry.folderUri).slice(8)); // remove file:///
  projects = projects.filter((project) => project.length > 1);
  return projects;
}
