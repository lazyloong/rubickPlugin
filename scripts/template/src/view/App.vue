<template>
  <router-view />
</template>
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'App',
  data() {
    return {
      context: {},
    };
  },
  mounted() {
    rubick.onPluginReady((context) => {
      this.context = context;
      const { code } = context;
      this.$router.push(`/${code}`);
    });
  },
});
</script>
<style lang="less">
body {
  margin: 0;
}
</style>
