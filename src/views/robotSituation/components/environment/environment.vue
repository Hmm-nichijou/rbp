<template>
  <div class="discern-content-gas discern-content-TAH" key="TAH" :class="[itemsCount(data)]"
       v-show="isExecuting?allShow(data):true">
    <div v-show="isExecuting?item.flag:true" class="gas-item"
         :class="{'gas-item-temperature':item.name==='温度','gas-item-humidity':item.name==='湿度'}"
         v-for="item in data" :key="item.name">
      <div class="gas-item-circle">
        <div class="circle-text">
          <p>{{ item.unit }}</p>
          <p>
            <span>{{ item.value | filterDecimalPointBefore }}</span>
            <span class="text-after">.{{ item.value | filterDecimalPointAfter }}</span>
          </p>
        </div>
        <div ref="outer" class="circle-rotate-outer">
          <i></i>
        </div>
        <div ref="inner" class="circle-rotate-inner">
          <i></i>
        </div>
      </div>
      <p class="progress-item-name">{{ item.name }}</p>
    </div>
  </div>
</template>
<script>
import environment from "./environment.js";

export default environment;
</script>
<style scoped lang="scss">
@import "environment";
</style>