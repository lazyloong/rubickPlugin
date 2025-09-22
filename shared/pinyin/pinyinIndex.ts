import { Item, MatchData } from './types';

export default class PinyinIndex<T extends Item> {
  items: T[];
  constructor() {
    this.items = [];
  }
  has(query: string): boolean {
    return Boolean(this.items.find((p) => p.name === query));
  }
  search(query: string): MatchData<T>[] {
    const smathCase = /[A-Z]/.test(query);
    const matchData: MatchData<T>[] = [];
    for (const p of this.items) {
      const d = p.pinyin.match(query, p, smathCase);
      if (d) matchData.push(d);
    }
    return matchData;
  }
}
