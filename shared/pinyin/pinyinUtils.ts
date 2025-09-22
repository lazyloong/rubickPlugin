type DoublePinyinDict = Record<string, string[]>;

export function fullPinyin2doublePinyin(
  fullPinyin: string,
  doublePinyinDict: DoublePinyinDict,
): string {
  let doublePinyin: string;
  let [shengmu, yunmu] = splitPinyin(fullPinyin);
  const findKeys = (pinyin: string, dict: DoublePinyinDict): string => {
    return Object.keys(dict).find((key) => dict[key].includes(pinyin)) as string;
  };
  if (shengmu !== '') shengmu = findKeys(shengmu, doublePinyinDict);
  if (yunmu !== '') yunmu = findKeys(yunmu, doublePinyinDict);
  doublePinyin = shengmu + yunmu;

  // 小鹤双拼的字典里没有 er，会拆成 e 和 r
  if (!yunmu && fullPinyin === 'er') doublePinyin = 'er';

  return doublePinyin;
}

const SHENG_MU: string[] = [
  'b',
  'p',
  'm',
  'f',
  'd',
  't',
  'n',
  'l',
  'g',
  'k',
  'h',
  'j',
  'q',
  'x',
  'zh',
  'ch',
  'sh',
  'r',
  'z',
  'c',
  's',
  'y',
  'w',
];

export function splitPinyin(pinyin: string): [string, string] {
  const matchedShengmu = SHENG_MU.find((sm) => pinyin.startsWith(sm));

  // 如果没有找到匹配的声母，可能意味着是零声母的韵母，或者输入不正确
  if (matchedShengmu) return [matchedShengmu, pinyin.slice(matchedShengmu.length)];
  else return ['', pinyin];
}

//模糊音
export const FuzzyPinyinDict = {
  zh: 'z',
  ch: 'c',
  sh: 's',
  n: 'l',
  h: 'f',
  l: 'r',
  ang: 'an',
  eng: 'en',
  ing: 'in',
  iang: 'ian',
  uang: 'uan',
};
