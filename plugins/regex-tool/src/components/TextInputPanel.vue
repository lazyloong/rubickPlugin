<template>
  <div class="text-input-panel">
    <div class="panel-header">
      <h3>输入文本</h3>
      <div class="text-stats">
        <span>字符: {{ charCount }}</span>
        <span>匹配: {{ matchCount }}</span>
      </div>
    </div>
    <el-input
      v-model="localText"
      type="textarea"
      placeholder="输入要处理的文本..."
      resize="none"
      class="text-input"
      :autosize="{ minRows: 20, maxRows: 30 }"
      @input="handleInput"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed } from 'vue';
import type { RegexMatch } from '@/types/regex';

export default defineComponent({
  name: 'TextInputPanel',
  props: {
    modelValue: {
      type: String,
      default: '',
    },
    matches: {
      type: Array as () => RegexMatch[],
      default: () => [],
    },
  },
  emits: ['update:modelValue', 'text-change'],
  setup(props, { emit }) {
    const localText = ref(props.modelValue);

    watch(
      () => props.modelValue,
      (newVal) => {
        localText.value = newVal;
      },
    );

    const handleInput = (value: string) => {
      emit('update:modelValue', value);
      emit('text-change', value);
    };

    const charCount = computed(() => localText.value.length);
    const matchCount = computed(() => props.matches.length);

    return {
      localText,
      charCount,
      matchCount,
      handleInput,
    };
  },
});
</script>

<style lang="less" scoped>
.text-input-panel {
  height: 100%;
  display: flex;
  flex-direction: column;

  .panel-header {
    padding: 16px 20px;
    border-bottom: 1px solid #e4e7ed;
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      margin: 0;
      color: #303133;
    }

    .text-stats {
      display: flex;
      gap: 16px;
      font-size: 12px;
      color: #909399;

      span {
        padding: 2px 8px;
        background: #f4f4f5;
        border-radius: 4px;
      }
    }
  }

  .text-input {
    flex: 1;
    border: none;

    :deep(.el-textarea__inner) {
      border: none;
      border-radius: 0;
      resize: none;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 14px;
      line-height: 1.5;
    }
  }
}
</style>
