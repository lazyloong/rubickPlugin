<template>
  <div class="match-visualizer">
    <div class="visualization-header">
      <div class="match-info">
        <span>找到 {{ matches.length }} 个匹配项</span>
        <el-button v-if="matches.length > 0" size="small" @click="exportMatches">
          导出结果
        </el-button>
      </div>
    </div>

    <div class="visualization-content">
      <div ref="textContainer" class="highlighted-text" v-html="highlightedText" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, nextTick, PropType } from 'vue';
import type { RegexMatch } from '../types/regex';

interface Props {
  text: string;
  matches: RegexMatch[];
  regexPattern: string;
  flags: string[];
}

export default defineComponent({
  name: 'MatchVisualizer',
  props: {
    text: String,
    matches: {
      type: Array as PropType<RegexMatch[]>,
      default: () => [],
    },
    regexPattern: String,
    flags: {
      type: Array as () => string[],
      default: () => [],
    },
  },
  setup(props) {
    const textContainer = ref<HTMLElement>();

    // 生成高亮文本
    const highlightedText = computed(() => {
      if (!props.text || props.matches.length === 0) {
        return escapeHtml(props.text);
      }

      let result = '';
      let lastIndex = 0;

      props.matches.forEach((match, matchIndex) => {
        // 添加匹配前的内容
        result += escapeHtml(props.text.slice(lastIndex, match.start));

        // 添加高亮的匹配内容
        result += `<span class="match-highlight" data-match-index="${matchIndex}">${escapeHtml(match.match)}</span>`;

        lastIndex = match.end;
      });

      // 添加剩余内容
      result += escapeHtml(props.text.slice(lastIndex));

      return result;
    });

    // HTML转义函数
    const escapeHtml = (text: string): string => {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    };

    // 导出匹配结果
    const exportMatches = () => {
      const data = props.matches.map((match) => ({
        match: match.match,
        index: match.index,
        groups: match.groups,
      }));

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'regex-matches.json';
      a.click();
      URL.revokeObjectURL(url);
    };

    return {
      textContainer,
      highlightedText,
      exportMatches,
    };
  },
});
</script>

<style lang="less" scoped>
.match-visualizer {
  height: 100%;
  display: flex;
  flex-direction: column;

  .visualization-header {
    padding: 16px 20px;
    border-bottom: 1px solid #e4e7ed;

    .match-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  .visualization-content {
    flex: 1;
    padding: 20px;
    overflow: auto;

    .highlighted-text {
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 14px;
      line-height: 1.5;
      white-space: pre-wrap;
      word-wrap: break-word;

      :deep(.match-highlight) {
        background-color: #ffd700;
        padding: 2px 1px;
        border-radius: 3px;
        border: 1px solid #ffc400;

        &:hover {
          background-color: #ffed4a;
          cursor: pointer;
        }
      }
    }
  }
}
</style>
