<template>
  <el-form label-position="top">
    <el-form-item label="VSCode 配置路径" :label-width="'120px'">
      <el-input
        v-model="configPath"
        placeholder="例如: C:\Users\username\AppData\Roaming\Code\User\globalStorage\state.vscdb"
        @change="changeConfigPath"
      >
        <template #append>
          <el-button @click="handleBrowseConfigPath">浏览</el-button>
        </template>
      </el-input>
      <div class="form-tip">指定VSCode的配置文件路径，用于读取和同步设置</div>
    </el-form-item>

    <el-form-item label="VSCode 可执行文件路径" :label-width="'120px'">
      <el-input
        v-model="executorPath"
        placeholder="例如: C:\Program Files\Microsoft VS Code\Code.exe"
        @change="changeExecutorPath"
      >
        <template #append>
          <el-button @click="handleBrowseExecutorPath">浏览</el-button>
        </template>
      </el-input>
      <div class="form-tip">指定VSCode可执行文件路径，用于快速启动</div>
    </el-form-item>
  </el-form>
</template>
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'VsCodeSetting',
  mounted() {
    this.configPath = this.$s.get('vsc.configPath') ?? '';
    this.executorPath = this.$s.get('vsc.executorPath') ?? '';
  },
  data() {
    return {
      configPath: '',
      executorPath: '',
    };
  },
  methods: {
    changeConfigPath() {
      this.$s.set('vsc.configPath', this.configPath);
      this.$message.success('配置路径已保存');
    },
    changeExecutorPath() {
      this.$s.set('vsc.executorPath', this.executorPath);
      this.$message.success('可执行文件路径已保存');
    },
    handleBrowseConfigPath() {
      const result = rubick.showOpenDialog({
        defaultPath: rubick.getPath('appData') + '\\Code\\User\\globalStorage\\state.vscdb',
      });
      if (!result || result?.length === 0) return;
      this.configPath = result[0];
      this.changeConfigPath();
    },
    handleBrowseExecutorPath() {
      const result = rubick.showOpenDialog();
      if (!result || result?.length === 0) return;
      this.executorPath = result[0];
      this.changeExecutorPath();
    },
  },
});
</script>
<style lang="less"></style>
