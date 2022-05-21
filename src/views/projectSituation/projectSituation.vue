<template>
  <div class="project-situation common" ref="scale" @click="hideAllPopover">
    <logo/>
    <div class="situation-content common-content">
      <topBar ref="topBar" @changeTheme="changeTheme" :id="projectId" type="project"/>
      <div class="content-info">
        <div class="info-breadcrumbs">
          <div class="breadcrumb-tabs">
            <div class="tabs-tab">
              <div class="tab-item" :class="{'active':activeTabs===item.id}" v-for="item in tabs" :key="item.id">
                <span @click="toggleTab(item.id)">{{ item.name }}</span>
              </div>
            </div>
            <div class="tabs-navbar">
              <div class="navbar-item" v-for="(item,index) in navbar" :key="item.name">
                <p class="navbar-item-name navbar-item-country">{{ item.name }}</p>
                <!--                <p v-else-->
                <!--                   @mouseenter="showPopover($event,'breadcrumbPopover','bottom-start',0,8,{flag:'breadcrumbPopoverFlag',index})"-->
                <!--                   @mouseleave="hidePopover('breadcrumbPopoverFlag','breadcrumbPopoverTarget')"-->
                <!--                   class="navbar-item-name" @click="changeBreadcrumbValue(item)">{{ item.name }}</p>-->
                <i class="el-icon-arrow-right" v-if="index!==navbar.length-1"></i>
              </div>
            </div>
          </div>
        </div>
        <p class="info-company">{{ $store.state.projectInfo.name }}</p>
        <div class="info-weather">
          <div>气象信息</div>
          <div v-for="(value,key) in currentEnvironment" :key="key" v-show="key!=='风速'">
            <p>{{ key }}</p>
            <p v-if="value">
              <template v-if="key==='温度'">{{ value }}℃</template>
              <template v-else-if="key==='湿度'">{{ value }}%rh</template>
              <template v-else-if="key==='气压'">{{ value }}mbar</template>
              <template v-else>{{ value }}</template>
            </p>
            <p v-else>-</p>
          </div>
        </div>
      </div>
      <div class="content-container">
        <div class="content-map" id="map"></div>
        <div class="content-left">
          <div class="left-inspection" ref="inspection">
            <div class="left-top"></div>
            <div class="left-slider"></div>
            <div class="left-slider-right"></div>
            <div class="left-bottom"></div>
            <p class="left-title">机器人概况</p>
            <div class="left-content">
              <div class="left-filters-btn" v-if="robotList.length&&(robotStatus.all>6||robotStatus.all==='')">
                <div class="filter-btn-item" v-for="(value,key) in robotStatus" :key="key"
                     @click="changeFilterStatus(key)" :class="{'active':key===currentRobotStatus}">
                  <i v-if="key!=='all'" :class="[`robot-status-${key}`]"></i>
                  <p>{{ key | filterRobotStatusName }}&ensp;[ {{ value !== '' ? value : '-' }} ]</p>
                </div>
              </div>
              <div class="left-search" v-if="robotList.length">
                <input v-model="search.inspection" type="text" placeholder="输入机器人名称">
                <div class="search-btn" @click="searchRobotName">
                  <i></i>
                </div>
              </div>
              <div class="left-list" v-if="robotList.length&&!listLoading">
                <div class="list-filter" v-if="page.inspection.total>6">
                  <div class="filter-item" :class="{'active':item.id===robotsFilterActive}"
                       v-for="item in robotsFilters" :key="item.id">
                    <p @click="changeFilter(item)">{{ item.name }}</p>
                    <i v-if="item.id!=='pending'" :class="[item.filter===2?'el-icon-top':'el-icon-bottom']"></i>
                  </div>
                </div>
                <div class="list-task">
                  <div class="task-item" v-for="item in robotList" :key="item.id" @click="toRobotSituation(item.id)">
                    <i class="item-little-triangle"></i>
                    <i :class="['item-triangle',item.status]"></i>
                    <div class="item-name-status">
                      <p>{{ item.name }}</p>
                      <p>
                        <i :class="[`robot-status-${item.status}`]"></i>
                        <span>{{ item.status | filterRobotStatusName }}</span>
                      </p>
                    </div>
                    <div class="item-info">
                      <div class="info-warningFrequency">
                        <p>巡检次数</p>
                        <p class="warningFrequency-number">
                          <template v-if="item.inspection<1000">{{ item.inspection }}</template>
                          <template v-else>
                            {{ item.inspection | formatterInspectionNumber }}
                            <span>k</span>
                          </template>
                        </p>
                      </div>
                      <div class="info-item">
                        <p>
                          <span><span class="info-item-title">总识别次数：</span>{{ item.allDiscern }}</span>
                          <span><span class="info-item-title">识别成功率：</span>{{ item.discernRate }}</span>
                        </p>
                        <p>
                          <span><span class="info-item-title">总运行时间：</span>{{ item.allRun }}h</span>
                          <span><span class="info-item-title">巡检完成率：</span>{{ item.inspectionRate }}</span>
                        </p>
                        <p>
                          <span><span class="info-item-title">当前电量：</span>{{ item.battery }}%</span>
                          <span><span class="info-item-title">行驶里程：</span>{{ item.allMileage }}km</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="list-pagination" v-if="page.inspection.total>6">
                  <el-pagination
                      small
                      hide-on-single-page
                      :current-page.sync="page.inspection.currentPage"
                      :page-size="page.inspection.pageSize"
                      :total="page.inspection.total"
                      :pager-count="5"
                      @current-change="changeRobotListPage"
                      layout="prev, pager, next, jumper">
                  </el-pagination>
                </div>
              </div>
              <empty v-else :message="loadingMsg" :current-theme="currentTheme" type="small"/>
            </div>
          </div>
          <div class="left-security" ref="security">
            <p class="left-title">安全概况</p>
            <div class="left-content">
              <div class="left-warning-process">
                <div v-for="item in warningProcess" :key="item.name">
                  <p>{{ item.name }}</p>
                  <p>{{ item.value }}</p>
                </div>
              </div>
              <div class="left-search">
                <input v-model="search.security" type="text" placeholder="输入设备台账分类名称">
                <div class="search-btn" @click="getAssetsInfo">
                  <i></i>
                </div>
              </div>
              <div class="left-list" v-if="warningList.length&&!assetsLoading">
                <div class="list-filter">
                  <div class="filter-item" :class="{'active':item.id===warningFilterActive}"
                       v-for="item in warningFilters" :key="item.id">
                    <p @click="changeFilter(item)">{{ item.name }}</p>
                    <i v-if="item.id!=='pending'" :class="[item.filter===2?'el-icon-top':'el-icon-bottom']"></i>
                  </div>
                </div>
                <div class="list-task">
                  <div class="task-item" v-for="item in warningList" :key="item.id">
                    <i class="item-little-triangle"></i>
                    <i class="item-triangle" :class="item.notProcessed | filterBacktrackingItemClass"></i>
                    <div class="item-name-status">
                      <p>{{ item.name }}</p>
                      <p>{{ item.type }}</p>
                    </div>
                    <div class="item-info">
                      <div class="info-warningFrequency">
                        <p>未处理</p>
                        <p :class="['warningFrequency-number',formatWarningFrequency(item.notProcessed) ]">
                          {{ item.notProcessed }}</p>
                      </div>
                      <div class="info-item">
                        <p>
                          <span><span class="info-item-title">巡检次数：</span>{{ item.INOT }}</span>
                        </p>
                        <p>
                          <span><span class="info-item-title">预警次数：</span>{{ item.WNOT }}</span>
                          <span><span class="info-item-title">识别成功率：</span>{{ item.discernRate }}</span>
                        </p>
                        <p>
                          <span><span class="info-item-title">已处理：</span>{{ item.processed }}</span>
                          <span><span class="info-item-title">巡检完成率：</span>{{ item.inspectionRate }}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="list-pagination" v-if="page.security.total>6">
                  <el-pagination
                      small
                      hide-on-single-page
                      :current-page.sync="page.security.currentPage"
                      :page-size="page.security.pageSize"
                      :total="page.security.total"
                      :pager-count="5"
                      layout="prev, pager, next, jumper">
                  </el-pagination>
                </div>
              </div>
              <empty v-else :message="assetsLoadingMsg" :current-theme="currentTheme" type="small"></empty>
            </div>
          </div>
        </div>
        <div class="content-center" ref="contentCenter">
          <div class="center-box center-box-inspection">
            <div class="center-box-item"
                 :style="item.bgImg | filterCenterItemBgImg(item.value,item.unit,currentTheme)"
                 :class="[item.value<90?'center-box-item-ratio-warning':'',item.unit?'center-box-item-ratio':'']"
                 v-for="(item,index) in situationCenterData.inspection" :key="item.title">
              <p>{{ item.title }}</p>
              <p v-if="!index">
                <count-to :start-val="0" :end-val="item.value" :duration="2000"/>
                <count-to style="margin-left: -10px" :start-val="0" :end-val="robotStatus.all!==''?robotStatus.all:0"
                          :duration="2000"
                          prefix="/"/>
              </p>
              <p v-else-if="item.unit">
                <count-to :start-val="0" :end-val="item.value | filterDecimalPointBefore" :duration="2000"
                          suffix="."/>
                <count-to style="margin-left: -10px" :start-val="0" :end-val="item.value | filterDecimalPointAfter"
                          :duration="2000"
                          :suffix="item.unit"/>
              </p>
              <p v-else>
                <count-to :start-val="0" :end-val="item.value" :duration="2000"></count-to>
              </p>
              <i v-for="item in 4" :key="item"></i>
            </div>
          </div>
          <div class="center-box center-box-security">
            <div class="center-box-item"
                 :style="item.bgImg | filterCenterItemBgImg(item.value,item.unit,currentTheme)"
                 v-for="item in situationCenterData.security" :key="item.title">
              <p>{{ item.title }}</p>
              <p v-if="item.unit">
                <template v-if="typeof item.value==='string'">
                  <count-to :start-val="0" :end-val="item.value | filterDecimalPointBefore" :duration="2000"
                            suffix="."></count-to>
                  <count-to style="margin-left: -10px" :start-val="0" :end-val="item.value | filterDecimalPointAfter"
                            :duration="2000"
                            :suffix="item.unit"></count-to>
                </template>
                <template v-else>
                  <count-to :start-val="0" :end-val="item.value" :duration="2000"></count-to>
                </template>
              </p>
              <p v-else>
                <count-to :start-val="0" :end-val="item.value" :duration="2000"></count-to>
              </p>
              <i v-for="item in 4" :key="item"></i>
            </div>
          </div>
        </div>
        <div class="content-right">
          <div class="right-inspection" ref="rightInspection">
            <div class="right-chart NOT">
              <div class="chart-title">任务次数</div>
              <div class="chart-operating">
                <el-radio-group v-model="chartOperatingData.numberOfTasks.radio" @change="changeNOTRadio">
                  <el-radio label="line">完成率趋势</el-radio>
                  <el-radio label="bar">执行次数</el-radio>
                </el-radio-group>
                <el-select v-model="chartOperatingData.numberOfTasks.yearValue" @change="changeNOTSelect('year',$event)"
                           @visible-change="scaleElPopover"
                           placeholder="请选择" popper-class="chartSelectPopper">
                  <el-option
                      v-for="item in chartOperatingData.numberOfTasks.yearOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
                  </el-option>
                </el-select>
                <el-select v-model="chartOperatingData.numberOfTasks.monthValue"
                           @change="changeNOTSelect('month',$event)"
                           @visible-change="scaleElPopover"
                           placeholder="请选择" popper-class="chartSelectPopper">
                  <el-option
                      v-for="item in chartOperatingData.numberOfTasks.monthOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
                  </el-option>
                </el-select>
              </div>
              <div class="chart-content" ref="NOT"></div>
            </div>
            <div class="right-chart CR">
              <div class="chart-title">完成率分析</div>
              <div class="chart-box">
                <div class="chart-box-item">
                  <div ref="CR1" class="item-arrow"></div>
                  <div ref="CR2"></div>
                </div>
                <div class="chart-box-item">
                  <div ref="CR3"></div>
                  <div ref="CR4" class="item-arrow"></div>
                </div>
              </div>
            </div>
          </div>
          <div class="right-security" ref="rightSecurity">
            <div class="right-chart EWT">
              <div class="chart-title">预警趋势</div>
              <div class="chart-operating">
                <el-select v-model="chartOperatingData.EWT.yearValue" @change="changeNOTSelect('year',$event)"
                           @visible-change="scaleElPopover"
                           placeholder="请选择" popper-class="chartSelectPopper">
                  <el-option
                      v-for="item in chartOperatingData.EWT.yearOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
                  </el-option>
                </el-select>
                <el-select v-model="chartOperatingData.EWT.monthValue"
                           @change="changeNOTSelect('month',$event)"
                           @visible-change="scaleElPopover"
                           placeholder="请选择" popper-class="chartSelectPopper">
                  <el-option
                      v-for="item in chartOperatingData.EWT.monthOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
                  </el-option>
                </el-select>
              </div>
              <div class="chart-content" ref="EWT"></div>
            </div>
            <div class="right-chart POEWE">
              <div class="chart-title">预警设备占比</div>
              <div class="chart-content" ref="POEWE"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!--  start：面包屑弹出层  -->
    <popover ref="breadcrumbPopover" customClass="breadcrumb-popover popover" :visible="breadcrumbPopoverFlag"
             @target="setPopperTarget('breadcrumbPopoverTarget',$event)"
             @leave="hidePopover('breadcrumbPopoverFlag','breadcrumbPopoverTarget')">
      <ul v-if="breadcrumbPopoverData.length">
        <li @click="changeBreadcrumbValue(item)"
            v-for="item in breadcrumbPopoverData"
            :key="item.id"
            :class="{'active':item.name===navbar[currentBreadcrumbIndex].name}">
          <div>{{ item.name }}</div>
        </li>
      </ul>
    </popover>
    <!--  end：面包屑弹出层  -->
    <!--  start：地图信息窗口  -->
    <div :class="[infoWindowData.class,'robot-infoWindow']" ref="infoWindowContent"
         @click="toRobotSituation(infoWindowData.id)" v-show="infoWindowData">
      <template v-if="activeTabs===1">
        <div class="infoWindow-title">
          <p>{{ infoWindowData.name }}</p>
          <p>
            <i :class="[`robot-status-${infoWindowData.status}`]"></i>
            <span>{{ infoWindowData.status | filterRobotStatusName }}</span>
          </p>
        </div>
        <div class="infoWindow-info">
          <template v-if="infoWindowData.status==='on-line'">
            <p><span>任务名称：</span><span>{{ infoWindowData.taskName ? infoWindowData.taskName : '暂无任务' }}</span></p>
            <p><span>巡检进度：</span><span>{{ infoWindowData.schedule ? infoWindowData.schedule : '-' }}</span></p>
          </template>
          <template v-else-if="infoWindowData.status==='standby'||infoWindowData.status==='meet'">
            <p><span>任务名称：</span><span>{{ infoWindowData.taskName ? infoWindowData.taskName : '暂无任务' }}</span></p>
            <p><span>开始时间：</span><span>{{ infoWindowData.startTime ? infoWindowData.startTime : '-' }}</span></p>
          </template>
          <template v-else-if="infoWindowData.status==='charging'">
            <p><span>输出电流：</span><span>{{ infoWindowData.outputCurrent }}A</span></p>
            <p><span>输出电压：</span><span>{{ infoWindowData.outputVoltage }}V</span></p>
          </template>
          <p><span>当前电量：</span><span
              :class="[ infoWindowData.battery>0&&infoWindowData.battery<=20?'error':infoWindowData.battery<=50&&infoWindowData.battery>20?'warning':'normal']">{{
              infoWindowData.battery
            }}%</span></p>
          <template v-if="infoWindowData.status==='fault'||infoWindowData.status==='meet'">
            <div class="error">
              <span>巡检预警：</span>
              <span>{{ infoWindowData.warning.name }}</span>
              <span>{{ infoWindowData.warning.desc }}</span>
            </div>
          </template>
        </div>
      </template>
      <template v-else>
        <div class="infoWindow-title">
          <p>{{ infoWindowData.name }}</p>
          <p>
            <span>详情</span>
            <i class="el-icon-d-arrow-right"></i>
          </p>
        </div>
      </template>
    </div>
    <!--  end：地图信息窗口  -->
  </div>
</template>
<script>
import projectSituation from "./projectSituation.js";

export default projectSituation;
</script>
<style scoped lang="scss">
@import "projectSituation.scss";
</style>