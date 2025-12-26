/**
 * 验证正则表达式是否有效
 */
export const isValidRegex = (pattern: string, flags: string[] = []): boolean => {
  try {
    new RegExp(pattern, flags.join(''));
    return true;
  } catch {
    return false;
  }
};

/**
 * 获取正则表达式的捕获组数量
 */
export const getCaptureGroupCount = (pattern: string): number => {
  // 简单实现，实际需要更复杂的解析
  const matches = pattern.match(/\((?!\?)/g);
  return matches ? matches.length : 0;
};

/**
 * 转义正则表达式特殊字符
 */
export const escapeRegex = (text: string): string => {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};
