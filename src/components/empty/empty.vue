<template>
  <div class="empty" :class="type">
    <div class="empty-text">{{ message }}</div>
    <div v-if="currentTheme!=='minimalism'" class="empty-inner"></div>
    <div class="empty-outer"></div>
  </div>
</template>
<script>
import empty from "./empty";

export default empty;
</script>
<style scoped lang="scss">
@import "empty.scss";
</style>
