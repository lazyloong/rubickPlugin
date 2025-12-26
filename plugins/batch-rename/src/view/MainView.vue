<template>
  <div
    class="batch-rename-container"
    @drop="handleDrop"
    @dragover="handleDragOver"
    @dragenter="handleDragEnter"
    @dragleave="handleDragLeave"
  >
    <!-- 拖拽覆盖层 - 普通文件拖拽 -->
    <div v-if="isDragging && !folderDropMode" class="drag-overlay" @click="isDragging = false">
      <div class="drag-content">
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件或文件夹拖到此处</div>
        <div class="el-upload__tip">支持单个或批量上传</div>
      </div>
    </div>

    <!-- 文件夹拖拽选择层 -->
    <div
      v-if="isDragging && folderDropMode"
      class="drag-overlay folder-drop-overlay"
      @click="cancelFolderDrop"
    >
      <div class="drag-content folder-drop-content">
        <i class="el-icon-folder"></i>
        <div class="el-upload__text">检测到文件夹拖拽</div>
        <div class="el-upload__tip">请选择如何处理此文件夹</div>

        <div class="folder-options">
          <div
            class="folder-option"
            @click="handleFolderAsItem"
            @mouseenter="hoverOption = 'folder'"
            @mouseleave="hoverOption = ''"
            :class="{ hover: hoverOption === 'folder' }"
          >
            <i class="el-icon-folder-opened"></i>
            <div class="option-title">文件夹本身</div>
            <div class="option-desc">将文件夹名称作为一项添加到列表</div>
          </div>

          <div
            class="folder-option"
            @click="handleFolderContents"
            @mouseenter="hoverOption = 'contents'"
            @mouseleave="hoverOption = ''"
            :class="{ hover: hoverOption === 'contents' }"
          >
            <i class="el-icon-document"></i>
            <div class="option-title">文件夹内容</div>
            <div class="option-desc">读取文件夹内的所有文件</div>
          </div>

          <div
            class="folder-option"
            @click="handleFolderRecursive"
            @mouseenter="hoverOption = 'recursive'"
            @mouseleave="hoverOption = ''"
            :class="{ hover: hoverOption === 'recursive' }"
          >
            <i class="el-icon-files"></i>
            <div class="option-title">递归读取</div>
            <div class="option-desc">读取文件夹及所有子文件夹内容</div>
          </div>
        </div>

        <el-button class="cancel-btn" @click="cancelFolderDrop">取消</el-button>
      </div>
    </div>

    <!-- 隐藏的上传组件 -->
    <el-upload
      v-show="false"
      ref="uploadRef"
      class="upload-dragger"
      :auto-upload="false"
      :multiple="true"
      :show-file-list="false"
      :on-change="handleFileChange"
      action=""
    >
    </el-upload>

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
          <el-button type="primary" @click="selectFolderRecursive">递归读取文件夹</el-button>
        </div>
        <div class="preview-area">
          <h3>预览结果 ({{ fileList.length }} 个项目)</h3>
          <div class="table">
            <el-table native-scrollbar :data="previewResults" height="100%">
              <el-table-column prop="oldName" label="原文件名" />
              <el-table-column prop="newName" label="新文件名" />
              <el-table-column prop="type" label="类型" width="80">
                <template #default="scope">
                  <el-tag :type="scope.row.type === 'folder' ? 'warning' : 'primary'" size="small">
                    {{ scope.row.type === 'folder' ? '文件夹' : '文件' }}
                  </el-tag>
                </template>
              </el-table-column>
              <!-- 新增操作列 -->
              <el-table-column label="操作">
                <template #default="scope">
                  <el-button
                    size="small"
                    @click="removeFileItem(scope.$index)"
                    :title="`删除 ${scope.row.oldName}`"
                  >
                    <X :size="20" />
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>

      <!-- 右侧规则编辑 -->
      <div class="rule-editor">
        <div class="rule-selector">
          <el-select v-model="selectedRuleType" placeholder="选择规则类型">
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
import { defineComponent, ref } from 'vue';
import { X } from 'lucide-vue-next';
import { readdirSync, rename, statSync, existsSync } from '@shared/node/fs';
import { RULE_CONFIGS } from '@/utils/ruleConfig';
import { processBatchRename } from '@/utils/ruleProcessor';
import GenericRule from './components/GenericRule.vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { UploadInstance, UploadFile } from 'element-plus';

// 递归读取文件夹的函数
function readFolderRecursive(
  folderPath: string,
): Array<{ folder: string; name: string; type: string }> {
  const results: Array<{ folder: string; name: string; type: string }> = [];

  function traverse(currentPath: string) {
    try {
      const items = readdirSync(currentPath);

      for (const item of items) {
        const fullPath = `${currentPath}/${item}`;
        const stats = statSync(fullPath);

        if (stats.isDirectory()) {
          // 如果是文件夹，先添加文件夹本身，然后递归
          results.push({
            folder: currentPath,
            name: item,
            type: 'folder',
          });
          traverse(fullPath); // 递归遍历子文件夹
        } else {
          // 如果是文件
          results.push({
            folder: currentPath,
            name: item,
            type: 'file',
          });
        }
      }
    } catch (error) {
      console.error('Error reading folder:', error);
    }
  }

  traverse(folderPath);
  return results;
}

export default defineComponent({
  name: 'BatchRenameView',
  components: {
    GenericRule,
    X,
  },
  setup() {
    const uploadRef = ref<UploadInstance>();
    const isDragging = ref(false);
    const folderDropMode = ref(false);
    const hoverOption = ref('');
    const pendingFolderPath = ref('');
    let dragCounter = 0;

    return {
      uploadRef,
      isDragging,
      folderDropMode,
      hoverOption,
      pendingFolderPath,
      dragCounter,
    };
  },
  data() {
    return {
      fileList: [] as Array<{ folder: string; name: string; type: string }>,
      selectedRuleType: Object.keys(RULE_CONFIGS)[0],
      rulePipeline: [] as Array<{ type: string; params: any }>,
      previewResults: [] as Array<{
        folder: string;
        oldName: string;
        newName: string;
        type: string;
      }>,
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
    // 新增：删除文件项的方法
    async removeFileItem(index: number) {
      try {
        const item = this.previewResults[index];
        // 从 fileList 中删除对应的项
        const fileIndex = this.fileList.findIndex(
          (file) => file.folder === item.folder && file.name === item.oldName,
        );

        if (fileIndex !== -1) {
          this.fileList.splice(fileIndex, 1);
          ElMessage.success('删除成功');
        }
      } catch (error) {
        // 用户取消删除
        console.log('取消删除');
      }
    },

    // 拖拽相关方法
    handleDragEnter(e: DragEvent) {
      e.preventDefault();
      this.dragCounter++;
      if (e.dataTransfer?.types.includes('Files')) {
        this.isDragging = true;
      }
    },

    handleDragOver(e: DragEvent) {
      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'copy';
      }
    },

    handleDragLeave(e: DragEvent) {
      e.preventDefault();
      this.dragCounter--;
      if (this.dragCounter === 0) {
        this.isDragging = false;
        this.folderDropMode = false;
      }
    },

    handleDrop(e: DragEvent) {
      e.preventDefault();
      this.dragCounter = 0;

      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        // 检查是否包含文件夹
        const hasFolder = this.checkForFolder(files);

        if (hasFolder) {
          // 如果是文件夹，进入文件夹处理模式
          this.folderDropMode = true;
          this.pendingFolderPath = (files[0] as any).path;
        } else {
          // 如果是普通文件，直接处理
          this.isDragging = false;
          this.processDroppedFiles(files);
        }
      }
    },

    // 检查拖拽的文件中是否包含文件夹
    checkForFolder(fileList: FileList): boolean {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const filePath = (file as any).path;
        if (filePath) {
          try {
            const stats = statSync(filePath);
            if (stats.isDirectory()) {
              return true;
            }
          } catch (error) {
            console.error('Error checking file stats:', error);
          }
        }
      }
      return false;
    },

    // 处理拖拽的文件
    async processDroppedFiles(fileList: FileList) {
      const files: Array<{ folder: string; name: string; type: string }> = [];

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const filePath = (file as any).path || file.name;
        const parts = filePath.split(/[/\\]/);
        const fileName = parts.pop() || file.name;
        const folderPath = parts.join('/');

        try {
          const stats = statSync(filePath);
          files.push({
            folder: folderPath,
            name: fileName,
            type: stats.isDirectory() ? 'folder' : 'file',
          });
        } catch (error) {
          // 如果无法获取文件状态，默认当作文件处理
          files.push({
            folder: folderPath,
            name: fileName,
            type: 'file',
          });
        }
      }

      this.fileList = [...this.fileList, ...files];
      ElMessage.success(`成功添加 ${files.length} 个项目`);
    },

    // 文件夹拖拽处理选项
    handleFolderAsItem() {
      if (!this.pendingFolderPath) return;

      const parts = this.pendingFolderPath.split(/[/\\]/);
      const folderName = parts.pop() || '';
      const parentPath = parts.join('/');

      this.fileList.push({
        folder: parentPath,
        name: folderName,
        type: 'folder',
      });

      this.resetFolderDrop();
      ElMessage.success('已添加文件夹本身');
    },

    handleFolderContents() {
      if (!this.pendingFolderPath) return;

      try {
        const files: string[] = readdirSync(this.pendingFolderPath);
        const newFiles = files.map((file) => ({
          folder: this.pendingFolderPath,
          name: file,
          type: 'file', // 这里简化处理，实际可以根据需要判断类型
        }));

        this.fileList = [...this.fileList, ...newFiles];
        this.resetFolderDrop();
        ElMessage.success(`已添加 ${newFiles.length} 个文件`);
      } catch (error) {
        ElMessage.error('读取文件夹失败');
        this.resetFolderDrop();
      }
    },

    handleFolderRecursive() {
      if (!this.pendingFolderPath) return;

      try {
        const files = readFolderRecursive(this.pendingFolderPath);
        this.fileList = [...this.fileList, ...files];
        this.resetFolderDrop();
        ElMessage.success(`已递归添加 ${files.length} 个项目`);
      } catch (error) {
        ElMessage.error('递归读取文件夹失败');
        this.resetFolderDrop();
      }
    },

    cancelFolderDrop() {
      this.resetFolderDrop();
    },

    resetFolderDrop() {
      this.isDragging = false;
      this.folderDropMode = false;
      this.pendingFolderPath = '';
      this.hoverOption = '';
    },

    // 原有的文件选择方法
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
          type: 'file',
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

      try {
        const files: string[] = readdirSync(folder);
        if (files && files.length > 0) {
          const newFiles = files.map((file) => ({
            folder,
            name: file,
            type: 'file',
          }));
          this.fileList = [...this.fileList, ...newFiles];
          ElMessage.success(`已添加 ${newFiles.length} 个文件`);
        }
      } catch (error) {
        ElMessage.error('读取文件夹失败');
      }
    },

    // 新增的递归读取文件夹方法
    selectFolderRecursive() {
      let folder = rubick
        .showOpenDialog({
          properties: ['openDirectory'],
        })?.[0]
        ?.replace(/\\/g, '/');
      if (!folder) return;

      try {
        const files = readFolderRecursive(folder);
        this.fileList = [...this.fileList, ...files];
        ElMessage.success(`已递归添加 ${files.length} 个项目`);
      } catch (error) {
        ElMessage.error('递归读取文件夹失败');
      }
    },

    handleFileChange(file: UploadFile) {
      console.log('File changed:', file);
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

    async executeRename() {
      try {
        // 执行预检查
        const preCheck = await this.preCheckRename();

        if (!preCheck.canProceed) {
          // 显示错误冲突
          const errorConflicts = preCheck.conflicts.filter((c) => c.severity === 'error');
          await this.showConflictDialog(errorConflicts, 'error');
          return;
        }

        // 如果有警告级别的冲突，询问用户
        const warningConflicts = preCheck.conflicts.filter((c) => c.severity === 'warning');
        if (warningConflicts.length > 0) {
          const proceed = await this.showConflictDialog(warningConflicts, 'warning');
          if (!proceed) {
            return; // 用户取消操作
          }
        }

        // 执行重命名
        const results = await this.performRename();

        if (results.successCount > 0) {
          ElMessage.success(`成功重命名 ${results.successCount} 个项目`);
        }

        if (results.failedCount > 0) {
          ElMessage.warning(`${results.failedCount} 个项目重命名失败`);
        }

        // 更新文件列表
        this.fileList = this.previewResults
          .filter((_, index) => results.successIndexes.includes(index))
          .map(({ folder, newName, type }) => ({
            folder,
            name: newName,
            type,
          }));
      } catch (error) {
        console.error('重命名执行错误:', error);
        ElMessage.error('重命名过程中发生未知错误');
      }
    },

    // 显示冲突对话框
    async showConflictDialog(conflicts: any[], type: 'error' | 'warning'): Promise<boolean> {
      const title = type === 'error' ? '无法执行重命名' : '重命名警告';
      const confirmButtonText = type === 'error' ? '确定' : '继续执行';
      const cancelButtonText = type === 'error' ? null : '取消';

      let message = `<div class="conflict-dialog">`;
      message += `<p>发现以下问题：</p>`;

      conflicts.forEach((conflict) => {
        message += `<div class="conflict-item">
        <strong>${conflict.message}</strong>
        <ul>
          ${conflict.details
            .slice(0, 5)
            .map((detail) => `<li>${detail}</li>`)
            .join('')}
          ${conflict.details.length > 5 ? `<li>... 还有 ${conflict.details.length - 5} 个问题</li>` : ''}
        </ul>
      </div>`;
      });

      message += `</div>`;

      try {
        if (type === 'error') {
          await ElMessageBox.alert(message, title, {
            dangerouslyUseHTMLString: true,
            confirmButtonText,
          });
          return false;
        } else {
          await ElMessageBox.confirm(message, title, {
            dangerouslyUseHTMLString: true,
            confirmButtonText,
            cancelButtonText,
            type: 'warning',
          });
          return true;
        }
      } catch {
        return false;
      }
    },

    // 执行实际的重命名操作
    async performRename(): Promise<{
      successCount: number;
      failedCount: number;
      successIndexes: number[];
    }> {
      const results = {
        successCount: 0,
        failedCount: 0,
        successIndexes: [] as number[],
      };

      for (let i = 0; i < this.previewResults.length; i++) {
        const { folder, oldName, newName } = this.previewResults[i];

        // 如果文件名没有变化，跳过
        if (oldName === newName) {
          results.successCount++;
          results.successIndexes.push(i);
          continue;
        }

        try {
          await this.renameFile(folder, oldName, newName);
          results.successCount++;
          results.successIndexes.push(i);
        } catch (error: any) {
          results.failedCount++;
          console.error(`重命名失败: ${oldName} -> ${newName}`, error);
          ElMessage.error(`重命名失败: ${oldName} -> ${error.message}`);
        }
      }

      return results;
    },

    // 包装 rename 为 Promise
    renameFile(folder: string, oldName: string, newName: string): Promise<void> {
      return new Promise((resolve, reject) => {
        rename(`${folder}/${oldName}`, `${folder}/${newName}`, (error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });
    },

    async preCheckRename(): Promise<{
      canProceed: boolean;
      conflicts: Array<{
        type: string;
        message: string;
        details: string[];
        severity: 'error' | 'warning';
      }>;
    }> {
      const conflicts = [];

      // 检查重复的新文件名
      const duplicateConflicts = this.checkDuplicateNewNames();
      if (duplicateConflicts) conflicts.push(duplicateConflicts);

      // 检查文件覆盖
      const overwriteConflicts = await this.checkFileOverwrite();
      if (overwriteConflicts) conflicts.push(overwriteConflicts);

      // 检查文件名合法性
      const invalidNameConflicts = this.checkInvalidFileNames();
      if (invalidNameConflicts) conflicts.push(invalidNameConflicts);

      // 检查权限问题
      const permissionConflicts = await this.checkPermissions();
      if (permissionConflicts) conflicts.push(permissionConflicts);

      const hasErrors = conflicts.some((conflict) => conflict.severity === 'error');

      return {
        canProceed: !hasErrors,
        conflicts,
      };
    },

    // 检查重复的新文件名
    checkDuplicateNewNames() {
      const nameCount = new Map();
      const duplicates = [];

      for (const item of this.previewResults) {
        const key = `${item.folder}/${item.newName}`;
        const count = nameCount.get(key) || 0;
        nameCount.set(key, count + 1);

        if (count === 1) {
          duplicates.push(key);
        }
      }

      if (duplicates.length > 0) {
        return {
          type: 'duplicate',
          message: `发现 ${duplicates.length} 个重复的文件名`,
          details: duplicates,
          severity: 'error',
        };
      }

      return null;
    },

    // 检查文件覆盖
    async checkFileOverwrite() {
      const overwrites = [];

      for (const item of this.previewResults) {
        const oldPath = `${item.folder}/${item.oldName}`;
        const newPath = `${item.folder}/${item.newName}`;

        // 如果文件名改变且目标文件已存在
        if (item.oldName !== item.newName && existsSync(newPath)) {
          overwrites.push({
            oldPath,
            newPath,
            existingFile: newPath,
          });
        }
      }

      if (overwrites.length > 0) {
        return {
          type: 'overwrite',
          message: `将覆盖 ${overwrites.length} 个已存在的文件`,
          details: overwrites.map((ow) => `覆盖: ${ow.oldPath} → ${ow.newPath}`),
          severity: 'warning', // 用户可以决定是否继续
        };
      }

      return null;
    },

    // 检查非法文件名
    checkInvalidFileNames() {
      const invalidChars = /[<>:"/\\|?*\x00-\x1F]/g;
      const reservedNames = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])$/i;
      const invalids = [];

      for (const item of this.previewResults) {
        // 检查保留字符
        if (invalidChars.test(item.newName)) {
          invalids.push(`包含非法字符: ${item.oldName} → ${item.newName}`);
          continue;
        }

        // 检查保留文件名
        if (reservedNames.test(item.newName.replace(/\.[^/.]+$/, ''))) {
          invalids.push(`系统保留名称: ${item.oldName} → ${item.newName}`);
          continue;
        }

        // 检查文件名长度
        if (item.newName.length > 255) {
          invalids.push(`文件名过长: ${item.oldName} → ${item.newName}`);
          continue;
        }

        // 检查空文件名
        if (!item.newName.trim()) {
          invalids.push(`文件名为空: ${item.oldName}`);
        }
      }

      if (invalids.length > 0) {
        return {
          type: 'invalid',
          message: `发现 ${invalids.length} 个非法文件名`,
          details: invalids,
          severity: 'error',
        };
      }

      return null;
    },

    // 检查权限问题
    async checkPermissions() {
      const permissionErrors = [];

      for (const item of this.previewResults) {
        const filePath = `${item.folder}/${item.oldName}`;

        try {
          // 尝试读取文件状态检查权限
          const stats = statSync(filePath);

          // 检查写权限（简化检查，实际可能需要更复杂的权限验证）
          if (!(stats.mode & 0o200)) {
            permissionErrors.push(`无写权限: ${filePath}`);
          }
        } catch (error: any) {
          if (error.code === 'EPERM' || error.code === 'EACCES') {
            permissionErrors.push(`权限不足: ${filePath}`);
          } else if (error.code === 'ENOENT') {
            permissionErrors.push(`文件不存在: ${filePath}`);
          } else {
            permissionErrors.push(`访问错误: ${filePath} - ${error.message}`);
          }
        }
      }

      if (permissionErrors.length > 0) {
        return {
          type: 'permission',
          message: `发现 ${permissionErrors.length} 个权限问题`,
          details: permissionErrors,
          severity: 'error',
        };
      }

      return null;
    },
  },
});
</script>

<style lang="less">
.batch-rename-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;

  .drag-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    backdrop-filter: blur(4px);

    .drag-content {
      text-align: center;
      color: white;
      padding: 40px;
      border: 2px dashed #ffffff;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.1);

      .el-icon-upload {
        font-size: 48px;
        margin-bottom: 16px;
        color: #409eff;
      }

      .el-upload__text {
        font-size: 18px;
        margin-bottom: 8px;
        color: var(--el-text-color);
      }

      .el-upload__tip {
        font-size: 14px;
        opacity: 0.8;
        color: var(--el-text-color);
      }
    }

    // 文件夹拖拽样式
    &.folder-drop-overlay {
      .drag-content {
        background: rgba(255, 255, 255, 0.15);
        border: 2px solid #409eff;

        .el-icon-folder {
          font-size: 48px;
          margin-bottom: 16px;
          color: #e6a23c;
        }
      }

      .folder-options {
        display: flex;
        gap: 20px;
        margin: 30px 0;
        justify-content: center;

        .folder-option {
          padding: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 150px;
          background: rgba(255, 255, 255, 0.05);

          &:hover,
          &.hover {
            border-color: #409eff;
            background: rgba(64, 158, 255, 0.1);
            transform: translateY(-2px);

            .el-icon-folder-opened,
            .el-icon-document,
            .el-icon-files {
              color: #409eff;
            }
          }

          .el-icon-folder-opened,
          .el-icon-document,
          .el-icon-files {
            font-size: 36px;
            margin-bottom: 10px;
            color: #e6a23c;
            transition: color 0.3s ease;
          }

          .option-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 5px;
          }

          .option-desc {
            font-size: 12px;
            opacity: 0.8;
          }
        }
      }

      .cancel-btn {
        margin-top: 10px;
      }
    }
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    border-bottom: 1px solid #eee;
    z-index: 1;
    background: white;
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

      .actions {
        display: flex;
        gap: 10px;

        .el-button {
          flex: 1;
        }
      }

      .upload-dragger {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }

      .preview-area {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 0;

        h3 {
          margin-bottom: 10px;
        }

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
