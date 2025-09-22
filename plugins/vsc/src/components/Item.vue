<template>
  <div class="item" :class="{ pathNoExist: !pathExist }" @click="handleClick">
    <img src="@/assets/vscode.svg" class="icon" />
    <span class="path">{{ path }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import fs from '@shared/node/fs';
import { exec } from '@shared/node/child_process';

export default defineComponent({
  props: {
    path: { type: String, required: true },
  },
  computed: {
    pathExist() {
      return fs.existsSync(this.path);
    },
    vscPath() {
      return this.$s.get('vsc.executorPath');
    },
  },
  methods: {
    handleClick() {
      if (!this.pathExist) return;
      exec(`"${this.vscPath}" "${this.path}"`);
      setTimeout(() => {
        rubick.outPlugin();
      }, 1000);
    },
  },
});
</script>

<style lang="less">
.item {
  display: flex;
  align-items: start;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f5f5f5;
  }

  .icon {
    width: 25px;
    height: 25px;
    margin-right: 12px;
  }

  .path {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 16px;
  }
}

.pathNoExist {
  .path {
    text-decoration: line-through;
    opacity: 0.6;
    cursor: not-allowed;
  }
}
</style>
