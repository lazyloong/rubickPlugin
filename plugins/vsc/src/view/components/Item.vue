<template>
  <div
    class="item"
    :class="{ pathNoExist: !pathExist }"
    @click="handleClick"
    @contextmenu.prevent="handleContextmenu"
  >
    <img src="@/assets/vscode.svg" class="icon" />
    <div class="text-container">
      <div class="name">
        <el-rate class="star" v-if="isStarred" :max="1" size="small" disabled :model-value="1" />
        {{ name }}
      </div>
      <div class="path">{{ path }}</div>
    </div>
    <!-- <div v-if="ctrlIndex >= 0 && ctrlIndex <= 9" class="shortcut-tag" :class="{ active }">
      Ctrl+{{ (ctrlIndex + 1) % 10 }}
    </div> -->
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import fs from '@shared/node/fs';

export default defineComponent({
  props: {
    name: { type: String, required: true },
    path: { type: String, required: true },
    index: { type: Number, required: true },
    ctrlIndex: { type: Number, required: true },
    active: { type: Boolean, required: true },
    isStarred: { type: Boolean, required: true },
  },
  emits: ['open', 'toggleStar'],
  data() {},
  computed: {
    pathExist() {
      return fs.existsSync(this.path);
    },
    icon() {
      return rubick.getFileIcon(this.path);
    },
  },
  methods: {
    handleClick() {
      if (!this.pathExist) return;
      this.$emit('open', this.index);
    },
    handleContextmenu() {
      if (!this.pathExist) return;
      this.$emit('toggleStar');
    },
  },
});
</script>

<style lang="less">
.item {
  height: 38px;
  display: flex;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f5f5f5;
  }

  &.active {
    background-color: #e0e0e0;
  }

  .icon {
    width: 25px;
    height: 25px;
    margin-right: 12px;
  }

  .text-container {
    flex: 1;
    min-width: 0;
  }

  .name {
    font-size: 16px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    .star {
      height: 0;
    }
  }

  .path {
    font-size: 12px;
    color: #666;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.pathNoExist {
  .name,
  .path {
    text-decoration: line-through;
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.shortcut-tag {
  padding: 5px 8px;
  border-radius: 4px;
  background-color: #e0e0e0;
  color: #333;
  font-size: 12px;
  margin-left: 8px;

  &.active {
    background-color: #1976d2;
    color: white;
  }
}
</style>
