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
html,
body {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  margin: 0;
}

#app {
  height: 100%;
}
</style>
