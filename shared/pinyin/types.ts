import Pinyin from './pinyin';

type MatchData<T extends Item> = {
  item: T;
  score: number;
  range: Array<[number, number]>;
};

type Item<T extends any = any> = {
  name: string;
  pinyin: Pinyin;
  data: T;
};

export type { Item, MatchData };
