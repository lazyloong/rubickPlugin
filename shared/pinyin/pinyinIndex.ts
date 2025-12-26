import Pinyin from './pinyin';
import { Item, MatchData } from './types';

export default class PinyinIndex<D extends object | string, T extends Item<D>> {
  items: T[] = [];
  constructor(items: D[], mapper?: (item: D) => string) {
    if (items.length === 0) return;
    mapper = mapper ?? ((item) => item as string);
    this.items = items.map((item) => ({
      name: mapper(item),
      pinyin: new Pinyin(mapper(item)),
      data: item,
    })) as T[];
  }

  has(query: string): boolean {
    return Boolean(this.items.find((p) => p.name === query));
  }

  search(query: string, sort: boolean = true): MatchData<T>[] {
    if (!query || query.length === 0)
      return this.items.map((p) => ({ item: p, score: 1, range: [[0, p.name.length]] }));
    const smathCase = /[A-Z]/.test(query);
    const matchData: MatchData<T>[] = [];
    for (const p of this.items) {
      const d = p.pinyin.match(query, p, smathCase);
      if (d) matchData.push(d);
    }
    if (sort) matchData.sort((a, b) => b.score - a.score);
    return matchData;
  }

  searchData(query: string, sort: boolean = true): D[] {
    return this.search(query, sort).map((d) => d.item.data);
  }
}
