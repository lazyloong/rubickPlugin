import { Pinyin } from './pinyin';

type MatchData<T> = {
  item: T;
  score: number;
  range: Array<[number, number]>;
};

type Item = {
  name: string;
  pinyin: Pinyin;
  data: any;
};

export type { Item, MatchData, Pinyin };
