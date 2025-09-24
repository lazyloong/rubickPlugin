import { InsertType, RegexType, ReplaceType, SequenceType, JsType, CaseType } from './ruleConfig';

export function applyInsertRule(name: string, params: InsertType): string {
  const { insert, position, reverse, keepExtension } = params;

  // 如果不反向，处理逻辑相对简单
  if (!reverse) {
    if (!keepExtension) {
      // 不保留扩展名，正向索引：从开头计算位置
      const insertPos = Math.min(position, name.length);
      return name.slice(0, insertPos) + insert + name.slice(insertPos);
    } else {
      // 保留扩展名，正向索引：在文件名主体部分插入
      const lastDotIndex = name.lastIndexOf('.');
      if (lastDotIndex === -1) {
        // 没有扩展名，在整个文件名上操作
        const insertPos = Math.min(position, name.length);
        return name.slice(0, insertPos) + insert + name.slice(insertPos);
      }

      const baseName = name.slice(0, lastDotIndex);
      const extension = name.slice(lastDotIndex);
      const insertPos = Math.min(position, baseName.length);
      const newBaseName = baseName.slice(0, insertPos) + insert + baseName.slice(insertPos);
      return newBaseName + extension;
    }
  }

  // 反向索引的情况
  if (!keepExtension) {
    // 不保留扩展名，反向索引：从扩展名后面开始计算（0在末尾）
    const insertPos = Math.max(0, name.length - position);
    return name.slice(0, insertPos) + insert + name.slice(insertPos);
  } else {
    // 保留扩展名，反向索引：从小数点前面开始计算（0在小数点前）
    const lastDotIndex = name.lastIndexOf('.');
    if (lastDotIndex === -1) {
      // 没有扩展名，从末尾开始计算
      const insertPos = Math.max(0, name.length - position);
      return name.slice(0, insertPos) + insert + name.slice(insertPos);
    }

    const baseName = name.slice(0, lastDotIndex);
    const extension = name.slice(lastDotIndex);

    // 在小数点前面开始计算，position=0 就在小数点前插入
    const insertPos = Math.max(0, baseName.length - position);
    const newBaseName = baseName.slice(0, insertPos) + insert + baseName.slice(insertPos);
    return newBaseName + extension;
  }
}

export function applyReplaceRule(name: string, params: ReplaceType): string {
  const { search, replace, caseSensitive, wholeWord } = params;
  const search_ = caseSensitive ? search : new RegExp(search, 'i');
  return name.replace(
    wholeWord ? new RegExp(`\\b${search}\\b`, caseSensitive ? '' : 'i') : search_,
    replace,
  );
}

export function applyRegexRule(name: string, params: RegexType): string {
  const { pattern, replacement, global, ignoreCase, multiline } = params;
  const flags = [global ? 'g' : '', multiline ? 'm' : '', ignoreCase ? 'i' : ''].join('');
  const regex = new RegExp(pattern, flags);
  return name.replace(regex, replacement);
}

const counterMap = new Map<object, number>();
export function applySequenceRule(name: string, params: SequenceType): string {
  const { start, step, digits, position } = params;
  if (!counterMap.has(params)) counterMap.set(params, start);
  const counter = counterMap.get(params)!;
  const sequence = counter.toString().padStart(digits, '0');
  const lastDotIndex = name.lastIndexOf('.');
  const safePosition = Math.min(position, lastDotIndex === -1 ? name.length : lastDotIndex);
  const newName = `${name.slice(0, safePosition)}${sequence}${name.slice(safePosition)}`;
  const newCounter = counter + step;
  counterMap.set(params, newCounter);
  return newName;
}

export function applyCaseRule(name: string, { case: type, keepextension }: CaseType): string {
  const convert = (s: string): string => {
    switch (type) {
      case 'lower':
        return s.toLowerCase();
      case 'upper':
        return s.toUpperCase();
      case 'capitalize':
        return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
      case 'title':
        return s.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());
      default:
        return s;
    }
  };

  const dot = name.lastIndexOf('.');
  const base = dot === -1 ? name : name.slice(0, dot);
  const ext = dot === -1 ? '' : name.slice(dot);

  return convert(base) + (keepextension ? ext : '.' + convert(ext.slice(1)));
}

export function applyJsRule(name: string, params: JsType): string {
  const lastDotIndex = name.lastIndexOf('.');
  const basename = lastDotIndex === -1 ? name : name.slice(0, lastDotIndex);
  const ext = lastDotIndex === -1 ? '' : name.slice(lastDotIndex);

  try {
    // 使用Function构造函数创建函数，限制作用域
    const renameFn = new Function('basename', 'ext', params.code);
    const newName = renameFn(basename, ext);

    if (typeof newName !== 'string') {
      console.error('JavaScript函数必须返回字符串');
      return name;
    }
    return newName;
  } catch (error) {
    console.error('执行JavaScript规则时出错:', error);
    return name;
  }
}

export function processRules(name: string, rules: Array<{ type: string; params: any }>): string {
  let result = name;
  const funcMap: Record<string, any> = {
    insert: applyInsertRule,
    replace: applyReplaceRule,
    regex: applyRegexRule,
    sequence: applySequenceRule,
    case: applyCaseRule,
    js: applyJsRule,
  };
  for (const rule of rules) {
    const { type, params } = rule;
    result = funcMap[type](result, params);
  }

  return result;
}

export function processBatchRename(
  files: { folder: string; name: string }[],
  rules: Array<{ type: string; params: any }>,
): Array<{ folder: string; oldName: string; newName: string }> {
  const results = files.map(({ folder, name }) => {
    const oldName = name.split(/[\\/]/).slice(-1)[0];
    const newName = processRules(oldName, rules);
    return { folder, oldName, newName };
  });
  counterMap.clear();
  return results;
}
