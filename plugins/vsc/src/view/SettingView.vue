<template lang="html">
  <div class="settings-container">
    <el-tabs tab-position="left">
      <el-tab-pane label="VSC">
        <el-input
          v-model="configPath"
          placeholder="请输入配置项路径"
          @change="changeConfigPath"
        ></el-input>
        <el-input
          v-model="executorPath"
          placeholder="请输入可执行文件路径"
          @change="changeExecutorPath"
        ></el-input>
      </el-tab-pane>
      <!-- 预留其他软件配置tab -->
      <el-tab-pane label="其他软件" disabled>
        <div class="coming-soon">敬请期待</div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
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
    },
    changeExecutorPath() {
      this.$s.set('vsc.executorPath', this.executorPath);
    },
  },
});
</script>

<style lang="less">
.settings-container {
  padding: 20px;
  
  .el-tabs {
    height: 100%;
    
    .el-tab-pane {
      padding: 0 20px;
    }
    
    .coming-soon {
      color: #999;
      text-align: center;
      margin-top: 50px;
    }
  }
}
</style>
<style lang="less"></style>
