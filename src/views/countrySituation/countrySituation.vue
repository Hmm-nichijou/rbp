<template>
  <div class="country-situation common" ref="scale" @click="hideAllPopover">
    <logo/>
    <div class="situation-content common-content">
      <topBar ref="topBar" @changeTheme="changeTheme" :id="$store.state.userInfo.id" type="country"/>
      <div class="content-container">
        <div class="content-left">
          <p class="left-title">省市态势</p>
          <div class="left-container">
            <div class="left-project-overview">
              <div class="overview-chart" ref="mapChart"></div>
              <div class="overview-info">
                <p class="overview-info-item">
                  <span>项目</span>
                  <span>{{ projectOverview.projectNo }}个</span>
                </p>
                <p class="overview-info-item">
                  <span>机器人</span>
                  <span>{{ projectOverview.robotNo }}台</span>
                </p>
                <p class="overview-info-item">
                  <span>安全巡检</span>
                  <span>{{ projectOverview.inspectionDay }}天</span>
                </p>
                <p class="overview-info-item">
                  <span>隐患预警</span>
                  <span>{{ projectOverview.warning }}次</span>
                </p>
                <p class="overview-info-item">
                  <span>设备保障</span>
                  <span>{{ projectOverview.guarantee }}台</span>
                </p>
                <p class="overview-info-item">
                  <span>巡检数据</span>
                  <span>{{ projectOverview.inspectionData }}条</span>
                </p>
              </div>
            </div>
            <div class="left-divider">
              <div>
                <i></i>
              </div>
              <p>项目实况</p>
              <div>
                <i></i>
              </div>
            </div>
            <div class="left-filters-btn" v-if="projectList.length&&!projectListLoading">
              <div class="filter-btn-item" :class="{'active':item.status===currentFilterRobotStatus}"
                   v-for="item in robotStatus" :key="item.id"
                   @click="filterRobotStatus(item.status)">
                <i v-if="item.status!=='all'" :class="[`robot-status-${item.status}`]"></i>
                <p>{{ item.status | filterRobotStatusName }}&ensp;[ {{ item.quantity }} ]</p>
              </div>
            </div>
            <div class="left-list">
              <template v-if="projectList.length&&!projectListLoading">
                <div class="list-item" v-for="item in projectList" :key="item.id">
                  <my-title :value="item.projectName"/>
                  <div class="item-content">
                    <div class="item-content-robot" :class="`${robot.condition}`" v-for="robot in item.robotList"
                         :key="robot.deviceId" @click="toRobot(robot.deviceId)">
                      <p class="robot-name">{{ robot.deviceName }}</p>
                      <div class="robot-status">
                        <i :class="`robot-status-${robot.condition}`"></i>
                        <p>{{ robot.condition | filterRobotStatusName }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
              <empty v-else :message="projectListLoadingText"/>
            </div>
          </div>
        </div>
        <div class="content-center">
          <div class="center-item" v-for="item in overview" :key="item.id"
               :style="item.bgImg | filterCenterItemBgImg(item.value,item.unit,currentTheme)">
            <p>{{ item.title }}</p>
            <p v-if="item.unit">
              <template v-if="item.value>=10000">
                <count-to :start-val="0" :end-val="item.value | filterGreaterTenThousand | filterDecimalPointBefore"
                          :duration="2000"
                          suffix="."/>
                <count-to style="margin-left: -10px" :start-val="0"
                          :end-val="item.value | filterGreaterTenThousand | filterDecimalPointAfter"
                          :duration="2000"
                          :suffix="item.unit"/>
              </template>
              <template v-else>
                <count-to :start-val="0" :end-val="item.value" :duration="2000"/>
              </template>
            </p>
            <p v-else>
              <count-to :start-val="0" :end-val="item.value" :duration="2000"/>
            </p>
            <i v-for="item in 4" :key="item"></i>
          </div>
        </div>
        <div class="content-center-bottom">
          <div class="center-bottom-rank">
            <p class="center-bottom-title">机器人数量TOP5</p>
            <div class="center-bottom-content">
              <p v-for="(item,index) in provinceRank" :key="item.name">
                <span>{{ index + 1 }}.&ensp;{{ item.name }}</span>
                <span>{{ item.value }}</span>
              </p>
            </div>
          </div>
          <!--          <div class="center-bottom-pie">-->
          <!--            <p class="center-bottom-title">项目类型占比</p>-->
          <!--            <div class="center-bottom-content" ref="projectType"></div>-->
          <!--          </div>-->
        </div>
        <div class="content-right">
          <div class="right-title">
            <p>{{ infoWindowData.name }}</p>
            <div class="chart-operating">
              <el-select v-model="chartOperatingData.yearValue" @change="changeSelect('year',$event)"
                         @visible-change="scaleElPopover"
                         placeholder="请选择" popper-class="chartSelectPopper">
                <el-option
                    v-for="item in chartOperatingData.yearOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                </el-option>
              </el-select>
              <el-select v-model="chartOperatingData.monthValue"
                         @change="changeSelect('month',$event)"
                         @visible-change="scaleElPopover"
                         placeholder="请选择" popper-class="chartSelectPopper">
                <el-option
                    v-for="item in chartOperatingData.monthOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                </el-option>
              </el-select>
            </div>
          </div>
          <div class="right-content">
            <div v-for="(item,index) in rightCharts" :key="index">
              <my-title :value="item.name"/>
              <div class="content-chart" :ref="item.ref"></div>
            </div>
          </div>
        </div>
        <div class="content-map" id="map"></div>
      </div>
    </div>

    <!--  start：地图信息窗口  -->
    <div :class="[infoWindowData.class,'robot-infoWindow']" ref="infoWindowContent" v-show="infoWindowData">
      <div class="infoWindow-project">
        <p class="project-title">{{ infoWindowData.name }}</p>
        <p>项目：{{ infoWindowData.projectNo >= 0 ? infoWindowData.projectNo : '-' }}个</p>
        <p>机器人：{{ infoWindowData.robotNo >= 0 ? infoWindowData.robotNo : '-' }}台</p>
      </div>
      <div class="infoWindow-trend">
        <p class="trend-title">本月趋势</p>
        <p v-if="infoWindowData.projectTrendNum!==''">
          <i :class="formatterTrendIcon(infoWindowData.projectTrendNum)"></i>
          <span>{{
              Math.abs(infoWindowData.projectTrendNum) >= 0 ? Math.abs(infoWindowData.projectTrendNum) : ''
            }}</span>
        </p>
        <p v-if="infoWindowData.robotTrendNum!==''">
          <i :class="formatterTrendIcon(infoWindowData.robotTrendNum)"></i>
          <span>{{ Math.abs(infoWindowData.robotTrendNum) >= 0 ? Math.abs(infoWindowData.robotTrendNum) : '' }}</span>
        </p>
      </div>
    </div>
    <!--  end：地图信息窗口  -->
  </div>
</template>
<script>
import countrySituation from "./countrySituation.js";

export default countrySituation;
</script>
<style scoped lang="scss">
@import "countrySituation.scss";
</style>