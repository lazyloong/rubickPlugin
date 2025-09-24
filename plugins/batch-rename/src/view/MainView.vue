<template>
  <div class="batch-rename-container">
    <!-- 顶部标题和操作按钮 -->
    <div class="header">
      <h2>批量文件重命名工具</h2>
      <div class="actions">
        <el-button type="primary" @click="executeRename">执行重命名</el-button>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 左侧文件列表 -->
      <div class="file-list">
        <div class="actions">
          <el-button type="primary" @click="selectFiles">选择文件</el-button>
          <el-button type="primary" @click="selectFolder">读取文件夹</el-button>
        </div>
        <div class="preview-area">
          <h3>预览结果</h3>
          <div class="table">
            <el-table native-scrollbar :data="previewResults" height="100%">
              <el-table-column prop="oldName" label="原文件名" />
              <el-table-column prop="newName" label="新文件名" />
            </el-table>
          </div>
        </div>
      </div>

      <!-- 右侧规则编辑 -->
      <div class="rule-editor">
        <div class="rule-selector">
          <el-select de v-model="selectedRuleType" placeholder="选择规则类型">
            <el-option
              v-for="rule in ruleTypes"
              :key="rule.value"
              :label="rule.label"
              :value="rule.value"
              @click="addRule"
            />
          </el-select>
          <el-button @click="addRule">添加规则</el-button>
        </div>

        <div class="rule-pipeline">
          <div v-for="(rule, index) in rulePipeline" :key="index" class="rule-item">
            <div class="rule-header">
              <span>{{ getRuleLabel(rule.type) }}</span>
              <el-button type="danger" size="small" @click="removeRule(index)"> 删除 </el-button>
            </div>
            <div class="rule-body">
              <generic-rule
                :rule-type="rule.type"
                :model-value="rule.params"
                @update:model-value="rule.params = $event"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { readdirSync, rename } from '@shared/node/fs';
import { RULE_CONFIGS } from '@/utils/ruleConfig';
import { processBatchRename } from '@/utils/ruleProcessor';
import GenericRule from './components/GenericRule.vue';
import { ElMessage } from 'element-plus';

export default defineComponent({
  name: 'BatchRenameView',
  components: {
    GenericRule,
  },
  data() {
    return {
      fileList: [] as { folder: string; name: string }[],
      selectedRuleType: Object.keys(RULE_CONFIGS)[0],
      rulePipeline: [] as Array<{ type: string; params: any }>,
      previewResults: [] as Array<{ folder: string; oldName: string; newName: string }>,
    };
  },
  computed: {
    ruleTypes() {
      return Object.entries(RULE_CONFIGS).map(([key, value]) => ({
        value: key,
        label: value.label,
      }));
    },
  },
  watch: {
    fileList: { handler: 'updatePreview', deep: true },
    rulePipeline: { handler: 'updatePreview', deep: true },
  },
  methods: {
    selectFiles() {
      const files = rubick.showOpenDialog({
        properties: ['openFile', 'multiSelections'],
      });
      if (!files) return;
      this.fileList = files.map((file) => {
        const parts = file.split(/[/\\]/);
        return {
          folder: parts.slice(0, -1).join('/'),
          name: parts[parts.length - 1],
        };
      });
    },
    selectFolder() {
      let folder = rubick
        .showOpenDialog({
          properties: ['openDirectory'],
        })?.[0]
        ?.replace(/\\/g, '/');
      if (!folder) return;
      const files: string[] = readdirSync(folder);
      if (files && files.length > 0) {
        this.fileList = files.map((file) => ({ folder, name: file }));
      }
    },
    addRule() {
      if (!this.selectedRuleType) return;
      this.rulePipeline.push({
        type: this.selectedRuleType,
        params: Object.assign({}, RULE_CONFIGS[this.selectedRuleType].defaultValue),
      });
    },
    removeRule(index: number) {
      this.rulePipeline.splice(index, 1);
    },
    getRuleLabel(type: string): string {
      const rule = this.ruleTypes.find((r) => r.value === type);
      return rule ? rule.label : type;
    },
    updatePreview() {
      this.previewResults = processBatchRename(this.fileList, this.rulePipeline);
    },
    executeRename() {
      // TODO: 失败处理
      for (const { folder, oldName, newName } of this.previewResults) {
        rename(folder + '/' + oldName, folder + '/' + newName, () => {});
      }
      this.fileList = this.previewResults.map(({ folder, newName }) => ({
        folder,
        name: newName,
      }));
      ElMessage.success('重命名成功');
    },
  },
});
</script>

<style lang="less">
.batch-rename-container {
  height: 100%;
  display: flex;
  flex-direction: column;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    border-bottom: 1px solid #eee;
  }

  .main-content {
    display: flex;
    flex: 1;
    padding: 20px;
    gap: 20px;
    min-height: 0;

    .file-list {
      flex: 2;
      width: 66.6%;
      display: flex;
      flex-direction: column;
      gap: 10px;

      .preview-area {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 0;

        .table {
          flex: 1;
          min-height: 0;
        }

        .el-scrollbar__wrap {
          overflow-y: auto;
          overflow-x: hidden;
        }
      }
    }

    .rule-editor {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 20px;

      .rule-selector {
        display: flex;
        gap: 10px;
      }

      .rule-pipeline {
        flex: 1;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 15px;

        .rule-item {
          border: 1px solid #eee;
          border-radius: 4px;
          padding: 10px;

          .rule-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
          }

          .el-form-item__label {
            white-space: nowrap;
          }
        }
      }
    }
  }
}
</style>
