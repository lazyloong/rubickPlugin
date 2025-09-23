import Pinyin from './pinyin';
import { Item, MatchData } from './types';

export default class PinyinIndex<D extends object | string, T extends Item<D>> {
  items: T[] = [];
  constructor(items: D[], mapper?: (item: D) => string) {
    if (items.length === 0) return;
    if (mapper) {
      this.items = (items as D[]).map((item) => ({
        name: mapper(item),
        pinyin: new Pinyin(mapper(item)),
        data: item,
      })) as T[];
    } else {
      this.items = (items as string[]).map((item) => ({
        name: item,
        pinyin: new Pinyin(item),
        data: item,
      })) as T[];
    }
  }

  has(query: string): boolean {
    return Boolean(this.items.find((p) => p.name === query));
  }

  search(query: string): MatchData<T>[] {
    if (!query || query.length === 0)
      return this.items.map((p) => ({ item: p, score: 1, range: [[0, p.name.length]] }));
    const smathCase = /[A-Z]/.test(query);
    const matchData: MatchData<T>[] = [];
    for (const p of this.items) {
      const d = p.pinyin.match(query, p, smathCase);
      if (d) matchData.push(d);
    }
    return matchData;
  }

  searchData(query: string): D[] {
    return this.search(query).map((d) => d.item.data);
  }
}
