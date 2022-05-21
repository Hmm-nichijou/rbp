<template>
  <div class="discern-content-meter"
       v-show="data.imgFtpPath||data.aiImgFtpPath">
    <el-image
        :src="data.aiImgFtpPath?data.aiImgFtpPath:data.imgFtpPath"
        fit="contain"
        :preview-src-list="[data.aiImgFtpPath?data.aiImgFtpPath:data.imgFtpPath]">
      <div slot="error" class="img-slot">暂无图片</div>
    </el-image>
    <div class="discern-content-table" :class="{'table-error':data.error}">
      <div class="discern-content-table-item table-title">
        <p>设备名称</p>
        <p>{{ data.itemName }}</p>
      </div>
      <template v-if="data.calcResultArray&&data.calcResultArray.length">
        <div class="discern-content-table-item" v-for="(item,index) in data.calcResultArray"
             :key="index">
          <p>{{ item.title }}</p>
          <p v-if="item.calcMsg">{{ item.calcMsg }}</p>
          <p v-else>{{ item.calcValue }}{{ item.unit }}</p>
        </div>
      </template>
      <template v-else>
        <div class="discern-content-table-item">
          <p>仪表值</p>
          <p>{{ data.error ? data.mes : data.calcValue }}</p>
        </div>
        <div class="discern-content-table-item">
          <p>单位</p>
          <p>{{ data.calcUnit }}</p>
        </div>
      </template>
      <div class="discern-content-table-item">
        <p>结果状态</p>
        <p>{{ data.calcSuccess }}</p>
      </div>
      <div class="discern-content-table-item">
        <p>识别耗时</p>
        <p>{{ data.aiCost }}</p>
      </div>
    </div>
  </div>
</template>
<script>
import meter from "./meter.js";

export default meter;
</script>
<style scoped lang="scss">
@import "meter";
</style>