<template>
  <div class="situation-platform-bg">
    <div class="situation-platform-name">
      <a target="_blank" :href="$store.state.projectInfo.website">{{ $store.state.projectInfo.platformName }}</a>
    </div>
  </div>
</template>
<script>
import logo from "./logo.js";

export default logo;
</script>
<style scoped lang="scss">
@import "logo.scss";
</style>