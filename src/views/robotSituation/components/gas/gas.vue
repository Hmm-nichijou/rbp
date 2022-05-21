<template>
  <div class="discern-content-gas" :class="[itemsCount(data)]" v-show="isExecuting?allShow(data):true">
    <div class="gas-value">
      <div class="gas-item" v-for="item in data" :key="item.name" v-show="isExecuting?item.flag:true">
        <div class="gas-item-circle">
          <div class="circle-text">
            <p>{{ item.unit }}</p>
            <p>
              <span>{{ item.value | filterDecimalPointBefore }}</span>
              <span class="text-after">{{ item.value | filterDecimalPointAfter }}</span>
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
    <div class="discern-content-table" v-if="isTable">
      <div class="discern-content-table-item table-title">
        <p>气体名称</p>
        <p>单位</p>
        <p>一级预警</p>
        <p>二级预警</p>
        <p>三级预警</p>
      </div>
      <template v-for="item in data">
        <div class="discern-content-table-item" v-if="item.flag" :key="item.name">
          <p>{{ item.name }}</p>
          <p>{{ item.unit }}</p>
          <p>{{ item.level1 ? item.level1 : '-' }}</p>
          <p>{{ item.level2 ? item.level2 : '-' }}</p>
          <p>{{ item.level3 ? item.level3 : '-' }}</p>
        </div>
      </template>
    </div>
  </div>
</template>
<script>
import gas from "./gas.js";

export default gas;
</script>
<style scoped lang="scss">
@import "gas";
</style>