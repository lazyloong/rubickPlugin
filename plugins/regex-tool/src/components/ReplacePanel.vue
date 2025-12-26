<template>
  <div class="replace-panel">
    <div class="replace-config">
      <el-input
        v-model="replacementText"
        placeholder="输入替换文本（使用 $1, $2 等引用捕获组）"
        class="replacement-input"
      />
      <el-button type="primary" @click="handleReplace" :disabled="!canReplace">
        执行替换
      </el-button>
    </div>

    <div class="result-section">
      <div class="result-header">
        <h4>替换结果</h4>
        <el-button size="small" @click="copyResult" :disabled="!replacedText"> 复制结果 </el-button>
      </div>

      <el-input
        v-model="replacedText"
        type="textarea"
        readonly
        resize="none"
        :autosize="{ minRows: 15, maxRows: 25 }"
        placeholder="替换结果将显示在这里..."
        class="result-textarea"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, PropType } from 'vue';
import { useRegexEngine } from '@/composables/useRegexEngine';

export default defineComponent({
  name: 'ReplacePanel',
  props: {
    text: String,
    regexPattern: String,
    flags: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
  },
  emits: ['replace-complete'],
  setup(props, { emit }) {
    const replacementText = ref('');
    const replacedText = ref('');

    const { replaceText } = useRegexEngine();

    const canReplace = computed(() => {
      return props.regexPattern && props.text && replacementText.value !== null;
    });

    const handleReplace = () => {
      if (!props.regexPattern || !props.text) return;

      const result = replaceText(
        props.regexPattern,
        props.text,
        replacementText.value,
        props.flags,
      );

      replacedText.value = result;
      emit('replace-complete', result);
    };

    const copyResult = async () => {
      try {
        await navigator.clipboard.writeText(replacedText.value);
        // 这里可以添加成功提示
      } catch (err) {
        console.error('复制失败:', err);
      }
    };

    return {
      replacementText,
      replacedText,
      canReplace,
      handleReplace,
      copyResult,
    };
  },
});
</script>

<style lang="less" scoped>
.replace-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;

  .replace-config {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;

    .replacement-input {
      flex: 1;
    }
  }

  .result-section {
    flex: 1;
    display: flex;
    flex-direction: column;

    .result-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      h4 {
        margin: 0;
        color: #303133;
      }
    }

    .result-textarea {
      flex: 1;

      :deep(.el-textarea__inner) {
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 14px;
        line-height: 1.5;
      }
    }
  }
}
</style>
