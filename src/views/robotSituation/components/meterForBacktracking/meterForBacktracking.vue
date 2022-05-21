<template>
  <div class="content-item-meter">
    <div class="content-item-title" :key="data.aiImgFtpPath">
      <myTitle :value="title"/>
      <p><span>{{ data.startTime }}</span>-<span>{{ data.endTime }}</span></p>
    </div>
    <div class="content-item-content" :key="data.aiImgFtpPath">
      <el-image
          style="width: 100%"
          :src="`${resourceIp}/${data.result.aiImgFtpPath?data.result.aiImgFtpPath:data.result.imgFtpPath}`"
          :preview-src-list="[`${resourceIp}/${data.result.aiImgFtpPath?data.result.aiImgFtpPath:data.result.imgFtpPath}`]">
        <div slot="error">
          <empty message="加载失败" :current-theme="theme"></empty>
        </div>
      </el-image>
    </div>
  </div>
</template>
<script>
import meterForBacktracking from "./meterForBacktracking.js";

export default meterForBacktracking;
</script>
<style scoped lang="scss">
@import "meterForBacktracking";
</style>