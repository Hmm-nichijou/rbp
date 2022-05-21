<template>
  <div class="info">
    <div v-for="(value,key) in currentInfo" :key="key">
      <p>{{ key }}</p>
      <p v-if="value!==''&&value!==undefined">
        <!--       当前电量       -->
        <span
            v-if="key==='当前电量'"
            :class="[value>0&&value<=20?'error':value<=50&&value>20?'warning':'']">{{
            value
          }}%</span>
        <!--       本次工作时长       -->
        <span v-else-if="key==='本次运行时长'">{{ value | timeStamp }}</span>
        <!--       重启次数       -->
        <span v-else-if="key==='重启次数'">{{ value }}次</span>
        <!--   单位：mbar     -->
        <span v-else-if="key==='气压'||key==='输入电流'">{{ value }}mbar</span>
        <!--   单位：mm     -->
        <span v-else-if="key==='降水'||key==='输出电压'">{{ value }}mm</span>
        <!--   单位：kHZ     -->
        <span v-else-if="key==='充电频率'">{{ value }}kHZ</span>
        <!--   单位：℃     -->
        <span v-else-if="key==='温度'||key==='充电房温度'">{{ value }}℃</span>
        <!--   单位：m/s     -->
        <span v-else-if="key==='风速'">{{ value }}m/s</span>
        <!--   单位：%rh     -->
        <span v-else-if="key==='湿度'">{{ value }}%rh</span>
        <!--   单位：m     -->
        <span v-else-if="key==='总里程'">{{ Number(value).toFixed(0) }}m</span>
        <!--   导航状态    -->
        <span v-else-if="key==='导航状态'">{{ value | formatterNavigationStatus }}</span>
        <!--    触发/未触发状态    -->
        <span v-else-if="key==='接近开关'||key==='前防撞条'||key==='后防撞条'||key==='急停'"
              :class="{'error':value===1}">{{ value === 1 ? '触发' : value === 2 ? '未触发' : '-' }}</span>
        <!--       各种状态-数字 0：异常 1：正常       -->
        <span v-else-if="typeof value==='number'"
              :class="{'error':value===1}">{{ value === 1 ? '异常' : value === 2 ? '正常' : '-' }}</span>
        <!--   其他     -->
        <span v-else>{{ value }}</span>
      </p>
      <p v-else>
        <span>-</span>
      </p>
    </div>
  </div>
</template>
<script>
import robotStatus from "./info.js";

export default robotStatus;
</script>
<style scoped lang="scss">
@import "info.scss";
</style>