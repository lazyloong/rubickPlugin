import { ref } from 'vue';
import type { RegexMatch, ProcessingResult } from '@/types/regex';

export function useRegexEngine() {
  const processingResult = ref<ProcessingResult>({
    matches: [],
    isValid: true,
    error: '',
  });

  const processRegex = (pattern: string, text: string, flags: string[]): void => {
    try {
      if (!pattern) {
        processingResult.value = {
          matches: [],
          isValid: true,
          error: '',
        };
        return;
      }

      const flagString = flags.join('');
      const regex = new RegExp(pattern, flagString);

      const matches: RegexMatch[] = [];
      let match: RegExpExecArray | null;

      // 重置正则表达式状态
      regex.lastIndex = 0;

      if (flags.includes('g')) {
        // 全局匹配
        while ((match = regex.exec(text)) !== null) {
          const groups = match.slice(1); // 排除完整匹配
          matches.push({
            index: match.index,
            match: match[0],
            groups: groups,
            start: match.index,
            end: match.index + match[0].length,
          });

          // 防止无限循环
          if (match.index === regex.lastIndex) {
            regex.lastIndex++;
          }
        }
      } else {
        // 单次匹配
        match = regex.exec(text);
        if (match) {
          const groups = match.slice(1);
          matches.push({
            index: match.index,
            match: match[0],
            groups: groups,
            start: match.index,
            end: match.index + match[0].length,
          });
        }
      }

      processingResult.value = {
        matches,
        isValid: true,
        error: '',
      };
    } catch (error) {
      processingResult.value = {
        matches: [],
        isValid: false,
        error: error instanceof Error ? error.message : '正则表达式错误',
      };
    }
  };

  const replaceText = (
    pattern: string,
    text: string,
    replacement: string,
    flags: string[],
  ): string => {
    try {
      const flagString = flags.join('');
      const regex = new RegExp(pattern, flagString);
      return text.replace(regex, replacement);
    } catch (error) {
      return text;
    }
  };

  return {
    processingResult,
    processRegex,
    replaceText,
  };
}
