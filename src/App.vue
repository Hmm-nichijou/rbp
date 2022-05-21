<template>
  <div id="app">
    <router-view :key="$route.params.id||$route.query.projectId||$route.query.areaId"/>
  </div>
</template>
<script>

import commonJs from "@/assets/js/common";
import sevnceApi from "@/request/api/sevnce";

export default {
  created() {
    let currentTheme = localStorage.getItem('theme');
    if (!currentTheme) {
      currentTheme = 'default';
    }
    commonJs.setTheme(currentTheme);
  },
  mounted() {
    this.getProjectInfo();
  },
  methods: {
    // 获取项目logo、平台名称名称、机构名称数据
    getProjectInfo() {
      let {id, token} = this.$store.state.userInfo,
          interval = setInterval(() => {
            if (id && token) {
              clearInterval(interval);
              let data = {
                method: "selectOfficeInfoByUserId",
                params: [`{'id':'${id}'}`],
              };
              sevnceApi.getRbp(data, token).then(res => {
                let {icon} = res.result.mes;
                this.$store.commit('setData', {variable: 'projectInfo', data: res.result.mes});
                commonJs.setPageIcon(icon);
              }).catch(() => {
                // this.$message.error('获取项目信息失败');
              });
            } else {
              id = this.$store.state.userInfo.id;
              token = this.$store.state.userInfo.token;
            }
          }, 50);
    },
  }
}
</script>
<style lang="scss">
@import "~@/assets/style/common.scss";
</style>
