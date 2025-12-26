<template>
  <div class="regex-tool">
    <el-container class="main-container">
      <!-- 顶部工具栏 -->
      <el-header class="tool-header">
        <div class="regex-input-section">
          <el-input
            v-model="regexPattern"
            placeholder="输入正则表达式"
            class="regex-input"
            :class="{ error: !processingResult.isValid }"
          >
            <template #prepend>
              <span class="input-prepend">正则表达式</span>
            </template>
          </el-input>

          <div class="flag-buttons">
            <el-checkbox-group v-model="activeFlags">
              <el-checkbox label="g">全局(g)</el-checkbox>
              <el-checkbox label="i">忽略大小写(i)</el-checkbox>
              <el-checkbox label="m">多行(m)</el-checkbox>
              <el-checkbox label="s">点匹配所有(s)</el-checkbox>
              <el-checkbox label="u">Unicode(u)</el-checkbox>
            </el-checkbox-group>
          </div>
        </div>
      </el-header>

      <el-container>
        <!-- 左侧文本输入 -->
        <el-aside width="40%" class="text-panel">
          <TextInputPanel
            v-model="inputText"
            :matches="processingResult.matches"
            @text-change="handleTextChange"
          />
        </el-aside>

        <!-- 主内容区 -->
        <el-main class="main-content">
          <el-tabs v-model="activeTab" class="content-tabs">
            <el-tab-pane label="匹配结果" name="matches">
              <MatchVisualizer
                :text="inputText"
                :matches="processingResult.matches"
                :regex-pattern="regexPattern"
                :flags="activeFlags"
              />
            </el-tab-pane>

            <el-tab-pane label="捕获组" name="captureGroups">
              <CaptureGroupPanel :matches="processingResult.matches" />
            </el-tab-pane>

            <el-tab-pane label="替换结果" name="replace">
              <ReplacePanel
                :text="inputText"
                :regex-pattern="regexPattern"
                :flags="activeFlags"
                @replace-complete="handleReplaceComplete"
              />
            </el-tab-pane>
          </el-tabs>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script lang="ts">
import TextInputPanel from '@/components/TextInputPanel.vue';
import MatchVisualizer from '@/components/MatchVisualizer.vue';
import CaptureGroupPanel from '@/components/CaptureGroupPanel.vue';
import ReplacePanel from '@/components/ReplacePanel.vue';
import { useRegexEngine } from '@/composables/useRegexEngine';

export default {
  name: 'RegexTool',
  components: {
    TextInputPanel,
    MatchVisualizer,
    CaptureGroupPanel,
    ReplacePanel,
  },
  data() {
    return {
      regexPattern: '',
      inputText: '',
      activeFlags: ['g'],
      activeTab: 'matches',
      replacedText: '',
      processingResult: useRegexEngine().processingResult,
    };
  },
  watch: {
    regexPattern: {
      handler() {
        this.processRegex();
      },
      immediate: true,
    },
    inputText: {
      handler() {
        this.processRegex();
      },
      immediate: true,
    },
    activeFlags: {
      handler() {
        this.processRegex();
      },
      immediate: true,
    },
  },
  methods: {
    processRegex() {
      if (this.regexPattern && this.inputText) {
        useRegexEngine().processRegex(this.regexPattern, this.inputText, this.activeFlags);
      }
    },
    handleTextChange(text: string) {
      this.inputText = text;
    },
    handleReplaceComplete(result: string) {
      this.replacedText = result;
    },
  },
};
</script>

<style lang="less" scoped>
.regex-tool {
  height: 100vh;
  display: flex;
  flex-direction: column;

  .main-container {
    height: 100%;
  }

  .tool-header {
    background: #f5f7fa;
    border-bottom: 1px solid #e4e7ed;
    display: flex;
    align-items: center;
    padding: 0 20px;

    .regex-input-section {
      display: flex;
      align-items: center;
      gap: 20px;
      width: 100%;

      .regex-input {
        flex: 1;

        &.error {
          :deep(.el-input__inner) {
            border-color: #f56c6c;
          }
        }

        .input-prepend {
          font-weight: 500;
        }
      }

      .flag-buttons {
        flex-shrink: 0;
      }
    }
  }

  .text-panel {
    border-right: 1px solid #e4e7ed;
    background: white;
  }

  .main-content {
    padding: 0;

    .content-tabs {
      height: 100%;

      :deep(.el-tabs__content) {
        height: calc(100% - 55px);
        padding: 0;
      }
    }
  }
}
</style>
