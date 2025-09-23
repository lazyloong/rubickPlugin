<template lang="html">
  <div class="settings-container">
    <el-tabs tab-position="left" v-model="activeTab">
      <el-tab-pane v-for="tab in tabs" :key="tab.name" :name="tab.name" :disabled="tab.disabled">
        <template #label>
          <span class="custom-tab-label">
            <img v-if="tab.icon" :src="tab.icon" class="tab-icon" />
            {{ tab.label }}
          </span>
        </template>
        <component :is="tab.component" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import VsCodeSetting from './VsCodeSetting.vue';
import vscodeIcon from '@/assets/vscode.svg';

export default defineComponent({
  name: 'SettingView',
  components: {
    VsCodeSetting,
  },
  data() {
    return {
      activeTab: 'vsc',
      tabs: [
        {
          name: 'vsc',
          label: 'Visual Studio Code',
          icon: vscodeIcon,
          component: 'VsCodeSetting',
          disabled: false,
        },
        {
          name: 'other',
          label: '其他软件',
          component: 'div',
          disabled: true,
        },
      ],
    };
  },
});
</script>

<style lang="less">
.settings-container {
  padding: 20px;

  .el-tabs {
    height: 100%;

    .el-tab-pane {
      padding: 20px;
    }

    .el-tabs__item {
      padding: 0 20px 0 0;
    }

    .coming-soon {
      color: #999;
      text-align: center;
      margin-top: 50px;
    }

    .el-form {
      max-width: 800px;
    }

    .form-tip {
      color: #999;
      font-size: 12px;
      margin-top: 8px;
    }

    .custom-tab-label {
      display: flex;
      align-items: center;

      .tab-icon {
        width: 22px;
        height: 22px;
        margin-right: 8px;
      }
    }
  }
}
</style>
