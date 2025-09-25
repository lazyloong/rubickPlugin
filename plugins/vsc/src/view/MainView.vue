<template>
  <div class="main-view">
    <div
      class="project-list"
      tabindex="0"
      v-loading="loading"
      @keydown.ctrl.prevent="handleCtrlKeyDown"
      @keydown.prevent="handleKeyDown"
      @wheel.prevent="handleWheel"
      ref="listContainer"
    >
      <Item
        v-for="(project, index) in currentProjects"
        :key="index"
        :ctrlIndex="getCtrlIndex(index)"
        :name="project.name"
        :path="project.path"
        :index="index"
        :active="activeIndex === index"
        :isStarred="stars.includes(project.path)"
        :class="{ active: activeIndex === index }"
        @open="openProject(index)"
        @toggleStar="toggleStar(project.path)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, toRaw } from 'vue';
import { PinyinIndex } from '@shared/pinyin';
import getProjects from '@/utils/vscdb';
import Item from './components/Item.vue';
import { exec } from '@shared/node/child_process';

// 每页可见的项目数量（根据你的实际布局调整）
const VISIBLE_ITEMS_COUNT = 10;

export default defineComponent({
  components: {
    Item,
  },
  mounted() {
    rubick.setSubInput(({ text }) => {
      this.query = text;
    }, '搜索项目');
    getProjects().then((projects) => {
      this.projects = projects;
      this.currentProjects = projects;
      // 初始化容器焦点和项目高度
      const list = this.$refs.listContainer as HTMLElement;
      if (list) {
        list.focus();
        this.$nextTick(() => {
          this.calculateItemHeight();
        });
      }
      this.loading = false;
    });
  },
  data() {
    return {
      projects: [] as { name: string; path: string }[],
      currentProjects: [] as { name: string; path: string }[],
      activeIndex: 0,
      visibleTopIndex: 0, // 可见区域顶部项目的索引
      loading: true,
      query: '',
      itemHeight: 40,
      vscPath: this.$s.get('vsc.executorPath'),
      stars: this.$s.get('vsc.stars') || [],
    };
  },
  computed: {
    pinyinIndex() {
      return new PinyinIndex(this.projects, (project) => project.name);
    },
    // 可见区域底部项目的索引
    visibleBottomIndex(): number {
      return Math.min(
        this.visibleTopIndex + VISIBLE_ITEMS_COUNT - 1,
        this.currentProjects.length - 1,
      );
    },
  },
  watch: {
    query(value) {
      this.currentProjects = this.pinyinIndex.searchData(value);
      this.activeIndex = 0;
      this.visibleTopIndex = 0;
    },
    activeIndex(newIndex) {
      this.ensureVisible(newIndex);
    },
  },
  methods: {
    // 计算单个项目的高度
    calculateItemHeight() {
      const list = this.$refs.listContainer as HTMLElement;
      if (list && list.children.length > 0) {
        const firstItem = list.children[0] as HTMLElement;
        if (firstItem) {
          this.itemHeight = firstItem.offsetHeight;
        }
      }
    },

    // 根据索引计算ctrl索引（0-9）
    getCtrlIndex(index: number): number {
      const relativeIndex = index - this.visibleTopIndex;
      return relativeIndex >= 0 && relativeIndex < 10 ? relativeIndex : -1;
    },

    // 确保目标索引在可见区域内
    ensureVisible(targetIndex: number) {
      if (targetIndex < this.visibleTopIndex) {
        // 目标在可见区域上方，滚动到目标为顶部
        this.visibleTopIndex = targetIndex;
        this.scrollToIndex(targetIndex);
      } else if (targetIndex > this.visibleBottomIndex) {
        // 目标在可见区域下方，滚动到目标为底部
        this.visibleTopIndex = Math.max(0, targetIndex - VISIBLE_ITEMS_COUNT + 1);
        this.scrollToIndex(this.visibleTopIndex);
      }
    },

    // 滚动到指定索引位置
    scrollToIndex(index: number) {
      const list = this.$refs.listContainer as HTMLElement;
      if (!list) return;
      list.scrollTo({
        top: index * this.itemHeight,
      });
    },

    // 单步滚动处理
    async scrollStep(direction: 'up' | 'down') {
      if (direction === 'up') {
        if (this.activeIndex === this.visibleBottomIndex) {
          this.activeIndex--;
        }
        await this.$nextTick();
        if (this.visibleTopIndex > 0) {
          this.visibleTopIndex--;
          this.scrollToIndex(this.visibleTopIndex);
        }
      } else {
        if (this.activeIndex === this.visibleTopIndex) {
          this.activeIndex++;
        }
        await this.$nextTick();
        if (this.visibleBottomIndex < this.currentProjects.length - 1) {
          this.visibleTopIndex++;
          this.scrollToIndex(this.visibleTopIndex);
        }
      }
    },

    openProject(index: number) {
      exec(`"${this.vscPath}" "${this.currentProjects[index].path}"`);
      setTimeout(() => {
        getProjects().then((projects) => {
          this.projects = projects;
          this.currentProjects = projects;
        });
      }, 1000);
    },
    toggleStar(path: string) {
      this.stars = this.stars.includes(path)
        ? this.stars.filter((star) => star !== path)
        : [...this.stars, path];
      this.$s.set('vsc.stars', toRaw(this.stars));
    },
    // 鼠标滚轮事件处理
    handleWheel(event: WheelEvent) {
      if (event.deltaY < 0) {
        // 向上滚动
        this.scrollStep('up');
      } else {
        // 向下滚动
        this.scrollStep('down');
      }
    },

    handleCtrlKeyDown(e: KeyboardEvent) {
      console.log(e);
      if (this.currentProjects.length === 0) return;

      if (e.key < '0' || e.key > '9') return;
      const num = e.key === '0' ? 9 : parseInt(e.key) - 1; // 0对应索引9，1对应索引0
      const targetIndex = this.visibleTopIndex + num;

      if (targetIndex < this.currentProjects.length) {
        this.activeIndex = targetIndex;
        this.openProject(targetIndex);
      }
    },
    handleKeyDown(e: KeyboardEvent) {
      if (this.currentProjects.length === 0) return;
      switch (e.key) {
        case 'ArrowUp':
          this.activeIndex = Math.max(0, this.activeIndex - 1);
          break;
        case 'ArrowDown':
          this.activeIndex = Math.min(this.currentProjects.length - 1, this.activeIndex + 1);
          break;
        case 'PageUp':
          // 向上翻页，滚动一整页
          this.visibleTopIndex = Math.max(0, this.visibleTopIndex - VISIBLE_ITEMS_COUNT);
          this.activeIndex = this.visibleTopIndex;
          this.scrollToIndex(this.visibleTopIndex);
          break;
        case 'PageDown':
          // 向下翻页，滚动一整页
          this.visibleTopIndex = Math.min(
            this.currentProjects.length - VISIBLE_ITEMS_COUNT,
            this.visibleTopIndex + VISIBLE_ITEMS_COUNT,
          );
          this.activeIndex = this.visibleTopIndex;
          this.scrollToIndex(this.visibleTopIndex);
          break;
        case 'Home':
          // 跳到开头
          this.visibleTopIndex = 0;
          this.activeIndex = 0;
          this.scrollToIndex(0);
          break;
        case 'End':
          // 跳到结尾
          const lastPageStart = Math.max(0, this.currentProjects.length - VISIBLE_ITEMS_COUNT);
          this.visibleTopIndex = lastPageStart;
          this.activeIndex = this.currentProjects.length - 1;
          this.scrollToIndex(lastPageStart);
          break;
        case 'Enter':
          if (this.activeIndex >= 0) {
            this.openProject(this.activeIndex);
          }
          break;
      }
    },
  },
});
</script>

<style lang="less">
.main-view {
  height: 100%;

  .project-list {
    height: 100%;
    overflow-y: auto;
    border-radius: 4px;
    background-color: #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    outline: none;

    .item.active {
      background-color: #e0e0e0;
    }
  }
}
</style>
