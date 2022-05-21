<template>
  <transition name="el-fade-in-linear">
    <div @mouseenter="enterBreadcrumbPopover" @mouseleave="leavePopover" :class="customClass" v-show="visible">
      <slot></slot>
    </div>
  </transition>
</template>
<script>
import popover from "./popover.js";

export default popover;
</script>
<style lang="scss">
@import "popover.scss";
</style>