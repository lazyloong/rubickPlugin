<template>
  <div class="main-view">
    <div class="project-list">
      <Item v-for="(project, index) in projects" :key="index" :path="project" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import getProjects from '@/utils/vscdb';
import Item from '@/components/Item.vue';

export default defineComponent({
  components: {
    Item,
  },
  mounted() {
    getProjects().then((projects) => {
      this.projects = projects;
    });
  },
  data() {
    return {
      projects: [] as string[],
    };
  },
});
</script>

<style lang="less">
.main-view {
  .project-list {
    height: 100%;
    overflow-y: auto;
    border-radius: 4px;
    background-color: #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
}
</style>
