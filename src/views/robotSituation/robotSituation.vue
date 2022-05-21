<template>
  <div class="robot-situation common" ref="scale" @click="hideAllPopover">
    <logo/>
    <div class="top-bar-arrow"></div>
    <div class="situation-content common-content">
      <top-bar ref="topBar" @changeTheme="changeTheme" :id="robotInfo.id" type="robot"/>
      <div class="content-info">
        <div class="info-content">
          <div class="info-content-current">
            <div class="info-content-title">
              <p>机器人状态</p>
              <p>
                <i :class="[`robot-status-${robotInfo.condition}`]"></i>
                <span>{{ robotInfo.condition | filterRobotStatusName }}</span>
              </p>
            </div>
            <info :current-info="isOldRobot?oldRobotAllStatus:currentStatus"/>
            <div class="info-content-btn" v-if="!isOldRobot">
              <!--              <div class="btn-history">-->
              <!--                <i v-for="item in 3" :key="item"></i>-->
              <!--              </div>-->
              <div class="btn-more" :class="{'show':allStatusFlag}"
                   @click.stop="allStatusFlag=!allStatusFlag"></div>
            </div>
          </div>
          <el-collapse-transition>
            <div class="info-content-panel" @click.stop v-show="allStatusFlag">
              <template v-for="(item,index) in allStatus">
                <info :current-info="item" :key="index"
                      v-if="index!==currentStatusIndex"/>
              </template>
            </div>
          </el-collapse-transition>
        </div>
        <div class="info-company">{{ $store.state.projectInfo.name }}</div>
        <div class="info-content">
          <div class="info-content-current">
            <div class="info-content-title">
              <p>环境信息</p>
            </div>
            <info :current-info="currentEnvironment"/>
            <div class="info-content-btn">
              <!--              <div class="btn-history">-->
              <!--                <i v-for="item in 3" :key="item"></i>-->
              <!--              </div>-->
              <div class="btn-more" :class="{'show':allEnvironmentFlag}"
                   @click.stop="allEnvironmentFlag=!allEnvironmentFlag"></div>
            </div>
          </div>
          <el-collapse-transition>
            <div class="info-content-panel" @click.stop v-show="allEnvironmentFlag">
              <template v-for="(item,index) in allEnvironment">
                <info :current-info="item" :key="index"
                      v-if="index!==currentEnvironmentIndex"/>
              </template>
            </div>
          </el-collapse-transition>
        </div>
      </div>
      <div class="content-breadcrumb">
        <div class="breadcrumb-tabs">
          <div class="tabs-tab">
            <div class="tab-item" :class="{'active':activeTabs===item.id}" v-for="item in tabs" :key="item.id">
              <span @click="toggleTab(item.id)">{{ item.name }}</span>
            </div>
          </div>
          <div class="tabs-navbar">
            <div class="navbar-item" v-for="(item,index) in navbar" :key="item.name">
              <p v-if="index!==3" class="navbar-item-name navbar-item-country">{{ item.name }}</p>
              <p v-else
                 @mouseenter="showPopover($event,'breadcrumbPopover','bottom-start',0,8,{flag:'breadcrumbPopoverFlag',index})"
                 @mouseleave="hidePopover('breadcrumbPopoverFlag','breadcrumbPopoverTarget')"
                 class="navbar-item-name" @click="changeBreadcrumbValue(item,index)">{{ item.name }}</p>
              <i class="el-icon-arrow-right" v-if="index!==navbar.length-1"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="content-data-panel">
        <div ref="currentTask" class="panel-left">
          <div class="panel-left-info">
            <p>{{ currentDate }}&ensp;{{ currentWeek }}</p>
            <div class="info-task">
              <div class="task-item">
                <p>任务名称</p>
                <p>{{ currentTask.name ? currentTask.name : '-' }}&emsp;</p>
              </div>
              <div class="task-item">
                <p>巡检点</p>
                <p>
                  <span>{{
                      currentTask.pointName ? `${currentTask.pointName}（${currentTask.currentPoint}/${currentTask.totalPoint}）` : '-'
                    }}</span>
                  <!--                  <span v-show="executingPointTask" class="dot"><i>巡检中...</i></span>-->
                </p>
              </div>
              <div class="task-item">
                <p>巡检项</p>
                <p>
                  <span>{{
                      currentTask.itemsName ? `${currentTask.itemsName}（${currentTask.currentItems}/${currentTask.totalItems}）` : '-'
                    }}</span>
                  <!--                  <span v-show="executingItemsTask" class="dot"><i>巡检中...</i></span>-->
                </p>
              </div>
              <div class="task-item">
                <p>开始日期</p>
                <p>{{ currentTask.date ? currentTask.date : '-' }}</p>
              </div>
              <div class="task-inspecting" v-show="executingPointTask||executingItemsTask">
                <div class="inspecting-icon">
                  <img src="~@/assets/images/robotSituation/icon-inspecting.png" alt="巡检中图标">
                  <i class="inspecting-halo"></i>
                </div>
                <p class="inspecting-text">巡检中</p>
              </div>
            </div>
            <div class="info-task next-task">
              <div class="task-item">
                <p>上一任务</p>
                <p>{{ nextTask.patrolTaskName ? nextTask.patrolTaskName : '-' }}</p>
              </div>
              <div class="task-item">
                <p>开始日期</p>
                <p>{{ nextTask.date ? nextTask.date : '-' }}</p>
              </div>
              <div class="task-item">
                <p>巡检点</p>
                <template v-if="nextTask.taskStatus==='FINISHED'">
                  <p>{{
                      `已完成${nextTask.patrolPointTotal ? nextTask.patrolPointTotal : '-'}个，共${nextTask.patrolPointTotal ? nextTask.patrolPointTotal : '-'}个`
                    }}</p>
                </template>
                <template v-else-if="nextTask.taskStatus==='STOPPED'">
                  <p>{{
                      `已完成${nextTask.itemMap.itemSuccessCount ? nextTask.itemMap.itemSuccessCount : '-'}个，共${nextTask.patrolPointTotal ? nextTask.patrolPointTotal : '-'}个`
                    }}</p>
                </template>
                <template v-else>
                  <p>-</p>
                </template>
              </div>
              <div class="task-item">
                <p>状态</p>
                <p>{{
                    nextTask.taskStatus === 'FINISHED' ? '全部完成' : nextTask.taskStatus === 'STOPPED' ? '中断' : '-'
                  }}</p>
              </div>
              <!--              <p class="task-cancel">取消任务</p>-->
            </div>
            <div class="info-warning" v-if="currentTask.warning">
              <i></i>
              <div class="warning-halo"></div>
            </div>
          </div>
          <div class="panel-left-discern">
            <p class="discern-little-title">{{ currentDiscern }}</p>
            <div class="discern-title">当前巡检项</div>
            <div class="discern-content">
              <!--       温湿度       -->
              <transition name="el-fade-in">
                <environment key="TAH" :data="TAHData" :theme="currentTheme" :isExecuting="true"/>
              </transition>
              <!--       气体       -->
              <transition name="el-fade-in">
                <gas key="gas" :data="gasData" :theme="currentTheme" :isExecuting="true"/>
              </transition>
              <!--       仪表       -->
              <transition name="el-fade-in">
                <myMeter :key="currentItemsData.aiImgFtpPath||currentItemsData.imgFtpPath" :data="currentItemsData"/>
              </transition>
              <!--       AI识别视频       -->
              <!--              <transition name="el-fade-in">-->
              <!--                <iframe-->
              <!--                    v-show="!allShow(TAHData)&&!allShow(gasData)&&!(currentItemsData.imgFtpPath||currentItemsData.aiImgFtpPath)"-->
              <!--                    class="discern-video" ref="discernVideo" src="http://frp.7tyun.com:60150/deal_video"-->
              <!--                    frameborder="0" scrolling="no"></iframe>-->
              <!--              </transition>-->
              <!--       空状态       -->
              <transition name="el-fade-in">
                <empty :current-theme="currentTheme" message="暂无识别结果" key="empty"
                       v-show="!allShow(TAHData)&&!allShow(gasData)&&!(currentItemsData.imgFtpPath||currentItemsData.aiImgFtpPath)"/>
              </transition>
            </div>
          </div>
        </div>
        <backtrack ref="taskBacktracking" v-if="isPermission" :robot-id="robotInfo.id"
                   :current-theme="currentTheme"
                   @changeTask="changeTask" @nextTask="setNextTask" :id="backtrackingTaskId"/>
        <div class="panel-center">
          <svg ref="locationSVG" @click="switchLocation" xmlns="http://www.w3.org/2000/svg" width="14" height="14"
               viewBox="0 0 24 24" v-if="map">
            <g transform="translate(-274 -223)">
              <g transform="translate(276 225)" fill="none" stroke="#fff" stroke-width="2">
                <circle cx="10" cy="10" r="10" stroke="none"/>
                <circle cx="10" cy="10" r="9" fill="none"/>
              </g>
              <circle cx="2" cy="2" r="2" transform="translate(284 233)" fill="#fff"/>
              <rect width="6" height="3" transform="translate(292 233.5)" fill="#fff"/>
              <rect width="6" height="3" transform="translate(287.5 241) rotate(90)"
                    fill="#fff"/>
              <rect width="6" height="3" transform="translate(287.5 223) rotate(90)"
                    fill="#fff"/>
              <rect width="6" height="3" transform="translate(274 233.5)" fill="#fff"/>
            </g>
          </svg>
          <div class="center-map" id="map" v-loading="mapLoading" :element-loading-text="mapLoadingText"
               element-loading-spinner="none"></div>
          <div class="center-point-filter" :style="{'left':backtracking?'27px':'-213px'}">
            <div class="point-filter-title">
              <div class="title-btn-point" :class="{'hide':!pointVisibleFlag}"
                   @click="hideAllPoint">
                <i></i>
              </div>
              <p>筛选巡检点</p>
              <div class="title-btn-flag" :class="{'hide':!pointFilterBoxFlag}"
                   @click="pointFilterBoxFlag=!pointFilterBoxFlag">
                <i></i>
              </div>
            </div>
            <el-collapse-transition>
              <div class="center-point-container" v-show="pointFilterBoxFlag">
                <div class="point-container-item" v-for="item in pointFilters" :key="item.type">
                  <div class="container-item-label">
                    <i></i>
                    <span>{{ item.label }}</span>
                    <i></i>
                  </div>
                  <div class="container-item-filters">
                    <div class="filters-item" :class="formatterPointFiltersClass(item.type,filter.value)"
                         v-for="filter in item.filters" :key="filter.value"
                         @click="filterMapPoint(item.type,filter.value)">
                      <img v-if="filter.icon" :src="require(`@/assets/images/robotSituation/${filter.icon}.png`)"
                           alt="">
                      <p>{{ filter.label }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </el-collapse-transition>
          </div>
          <div class="center-inspection-items" :style="{'right':inspectionItemsFlag?0:'-284px'}">
            <div class="inspection-items-title">巡检项</div>
            <div class="inspection-items-content"
                 v-if="inspectionItemsDataForBacktracking.length&&!inspectionItemDataLoading">
              <el-tabs v-model="inspectionItemsActiveTab">
                <el-tab-pane label="全部" name="all">
                  <div class="content-item" v-for="item in inspectionItemsDataForBacktracking" :key="item.type">
                    <template v-if="item.type==='meter'">
                      <template v-for="meter in item.result">
                        <meterForBacktracking :data="meter" :title="item.name" :theme="currentTheme"
                                              :key="meter.aiImgFtpPath"/>
                      </template>
                    </template>
                    <template v-else>
                      <div class="content-item-title">
                        <myTitle :value="item.name"/>
                        <p><span>{{ item.startTime }}</span>-<span>{{ item.endTime }}</span></p>
                      </div>
                    </template>
                    <template v-if="item.type==='gas'">
                      <div class="content-item-content discern-content">
                        <gas :data="item.result" :theme="currentTheme" :isTable="false"/>
                      </div>
                    </template>
                    <template v-else-if="item.type==='envir'">
                      <environment :data="item.result" :theme="currentTheme"/>
                    </template>
                  </div>
                </el-tab-pane>
                <el-tab-pane :label="tab.name" :name="tab.type" v-for="tab in inspectionItemsDataForBacktracking"
                             :key="tab.type">
                  <div class="content-item">
                    <template v-if="tab.type==='meter'">
                      <template v-for="meter in tab.result">
                        <meterForBacktracking :data="meter" :title="tab.name" :theme="currentTheme"
                                              :key="meter.aiImgFtpPath"/>
                      </template>
                    </template>
                    <template v-else>
                      <div class="content-item-title">
                        <myTitle :value="tab.name"/>
                        <p><span>{{ tab.startTime }}</span>-<span>{{ tab.endTime }}</span></p>
                      </div>
                    </template>
                    <template v-if="tab.type==='gas'">
                      <gas :data="tab.result" :theme="currentTheme" :isTable="false"/>
                    </template>
                    <template v-else-if="tab.type==='envir'">
                      <environment :data="tab.result" :theme="currentTheme"/>
                    </template>
                  </div>
                </el-tab-pane>
              </el-tabs>
            </div>
            <empty :message="inspectionItemDataEmptyMsg" v-else></empty>
          </div>
          <div class="center-operating" v-if="robotInfo.id&&isPermission&&robotInfo.condition!=='off-line'">
            <i @click="changeMediaStatus('microphone')"
               :class="[robotInfo.microphoneStatus==='0'?'disabled':robotInfo.microphoneStatus==='2'?'close':'','operation-microphone']"
               @mouseenter="showPopover($event,'titlePopover','bottom',0,8,{flag:'titlePopoverFlag'})"
               @mouseleave="titlePopoverFlag=false"
               :data-text="robotInfo.microphoneStatus==='0'?'无法开启麦克风':robotInfo.microphoneStatus==='2'?'点击开启麦克风':'点击关闭麦克风'"></i>
            <i @click="changeMediaStatus('speaker')"
               :class="[robotInfo.speakerStatus==='0'?'disabled':robotInfo.speakerStatus==='2'?'close':'','operation-speaker']"
               @mouseenter="showPopover($event,'titlePopover','bottom',0,8,{flag:'titlePopoverFlag'})"
               @mouseleave="titlePopoverFlag=false"
               :data-text="robotInfo.speakerStatus==='0'?'无法开启扬声器':robotInfo.speakerStatus==='2'?'点击开启扬声器':'点击关闭扬声器'"></i>
          </div>
        </div>
        <div class="panel-bottom-center">
          <div class="bottom-center-title">
            <p>预警信息</p>
            <template v-if="backtracking&&inspectionWarningDataForBacktracking.length">
              <div class="title-operating" v-if="inspectionWarningDataForBacktracking.length">
                <p>共{{ inspectionWarningCountForBacktracking }}条记录</p>
                <!--              <div class="operation-btn">-->
                <!--                <i class="btn-checkbox"-->
                <!--                   @mouseenter="showPopover($event,'titlePopover','bottom',0,8,{flag:'titlePopoverFlag'})"-->
                <!--                   @mouseleave="titlePopoverFlag=false"-->
                <!--                   data-text="批量操作"></i>-->
                <!--                <i class="btn-more"-->
                <!--                   @click="dialogWarning=true"-->
                <!--                   @mouseenter="showPopover($event,'titlePopover','bottom',0,8,{flag:'titlePopoverFlag'})"-->
                <!--                   @mouseleave="titlePopoverFlag=false"-->
                <!--                   data-text="查看更多"></i>-->
                <!--              </div>-->
              </div>
            </template>
            <template v-else>
              <div class="title-operating" v-if="warningList.length">
                <p>共{{ warningListCount }}条记录</p>
                <!--              <div class="operation-btn">-->
                <!--                <i class="btn-checkbox"-->
                <!--                   @mouseenter="showPopover($event,'titlePopover','bottom',0,8,{flag:'titlePopoverFlag'})"-->
                <!--                   @mouseleave="titlePopoverFlag=false"-->
                <!--                   data-text="批量操作"></i>-->
                <!--                <i class="btn-more"-->
                <!--                   @click="dialogWarning=true"-->
                <!--                   @mouseenter="showPopover($event,'titlePopover','bottom',0,8,{flag:'titlePopoverFlag'})"-->
                <!--                   @mouseleave="titlePopoverFlag=false"-->
                <!--                   data-text="查看更多"></i>-->
                <!--              </div>-->
              </div>
            </template>
          </div>
          <div class="bottom-center-content">
            <!--     回溯中的巡检点预警信息       -->
            <template v-if="backtracking">
              <el-table
                  :data="inspectionWarningDataForBacktracking"
                  :row-class-name="notProcessed"
                  style="width: 100%">
                <el-table-column
                    type="index"
                    label="序号"
                    width="50">
                </el-table-column>
                <el-table-column
                    prop="time"
                    width="180"
                    label="识别时间">
                </el-table-column>
                <el-table-column
                    label="巡检点"
                    width="180"
                    show-overflow-tooltip>
                  <template slot-scope="scope">
                    {{ scope.row.pointName }}（第{{ scope.row.pointCurrentNum }}/{{ scope.row.pointTotal }}点）
                  </template>
                </el-table-column>
                <el-table-column
                    prop="itemName"
                    label="巡检项"
                    width="150"
                    show-overflow-tooltip>
                </el-table-column>
                <el-table-column
                    label="识别结果">
                  <template slot-scope="scope">
                    <p v-if="scope.row.type==='表计识别'">
                      <template v-if="scope.row.errorMsg">
                        {{ scope.row.errorMsg }}
                      </template>
                      <template v-else>
                        {{ scope.row.value }}{{ scope.row.unit }}
                      </template>
                    </p>
                    <p v-else-if="scope.row.type==='气体识别'">
                      <span v-for="(gas,index) in scope.row.gass"
                            :key="gas.name">{{ gas.name }}：{{ gas.value }}{{
                          gas.unit
                        }}{{ index === scope.row.gass.length - 1 ? '' : '、' }}</span>
                    </p>
                    <p v-else-if="scope.row.type==='环境识别'">
                      <span>温度：{{ scope.row.temperature }}℃</span>、
                      <span>湿度：{{ scope.row.humidity }}%rh</span>
                    </p>
                  </template>
                </el-table-column>
                <el-table-column
                    prop="type"
                    width="150"
                    label="识别类型">
                </el-table-column>
                <el-table-column
                    prop="level"
                    width="150"
                    label="预警等级">
                </el-table-column>
                <el-table-column
                    prop="status"
                    width="150"
                    label="处理状态">
                </el-table-column>
              </el-table>
            </template>
            <!--     该机器人的预警信息       -->
            <template v-else>
              <el-table
                  :data="warningList"
                  :row-class-name="notProcessed"
                  style="width: 100%">
                <el-table-column
                    type="index"
                    label="序号"
                    width="50">
                </el-table-column>
                <el-table-column
                    prop="date"
                    label="识别时间"
                    width="180">
                </el-table-column>
                <el-table-column
                    prop="source"
                    label="预警源"
                    show-overflow-tooltip
                    width="180">
                </el-table-column>
                <el-table-column
                    prop="category"
                    label="预警类型"
                    show-overflow-tooltip
                    width="180">
                </el-table-column>
                <el-table-column
                    prop="content"
                    label="预警内容"
                    show-overflow-tooltip>
                </el-table-column>
                <el-table-column
                    prop="level"
                    label="预警等级"
                    width="180">
                </el-table-column>
                <el-table-column
                    prop="status"
                    label="处理状态"
                    width="180">
                </el-table-column>
              </el-table>
            </template>
          </div>
        </div>
        <div class="panel-right" ref="videoPanel">
          <div class="right-video">
            <div class="video-title">
              <span>可见光视频</span>
              <div class="title-operating">
                <i :class="{'inspection':robotInfo.condition==='on-line'||robotInfo.condition==='off-line'}"
                   @click="openCloudControl"
                   @mouseenter="showPopover($event,'titlePopover','bottom',0,8,{flag:'titlePopoverFlag'})"
                   @mouseleave="titlePopoverFlag=false" data-text="云台控制"></i>
                <!--                              <i class="operating-screenshot"-->
                <!--                                 @mouseenter="showPopover($event,'titlePopover','bottom',0,8,{flag:'titlePopoverFlag'})"-->
                <!--                                 @mouseleave="titlePopoverFlag=false" data-text="截屏"></i>-->
              </div>
            </div>
            <div class="video-iframe">
              <div class="iframe-box">
                <div class="video-operating" v-if="!backtracking&&changeClarity&&robotInfo.condition!=='off-line'">
                  <div :class="['operation-quality',item.id===defaultVideoQuality?'active':'']"
                       v-for="item in videoQuality" :key="item.id" @click="changeVideoQuality('1',item.id)">
                    {{ item.name }}
                  </div>
                </div>
                <iframe ref="videoKJG" width="100%" height="100%"
                        allowfullscreen="allowfullscreen"
                        scrolling="no"
                        frameborder="0"></iframe>
              </div>
            </div>
          </div>
          <div class="right-video">
            <div class="video-title">
              <span>红外光成像</span>
              <!--              <div class="title-operating">-->
              <!--                <i @mouseenter="showPopover($event,'titlePopover','bottom',0,8,{flag:'titlePopoverFlag'})"-->
              <!--                   @mouseleave="titlePopoverFlag=false" data-text="截屏"></i>-->
              <!--              </div>-->
            </div>
            <div class="video-iframe">
              <div class="iframe-box">
                <!--                <div class="video-operating">-->
                <!--                  <div :class="['operation-quality',item.id===infraredVideoQuality?'active':'']"-->
                <!--                       v-for="item in videoQuality" :key="item.id" @click="changeVideoQuality('2',item.id)">-->
                <!--                    {{ item.name }}-->
                <!--                  </div>-->
                <!--                </div>-->
                <iframe ref="videoHWX" width="100%" height="100%"
                        allowfullscreen="allowfullscreen"
                        scrolling="no"
                        frameborder="0"></iframe>
              </div>
            </div>
          </div>
        </div>
        <div class="panel-cloud-control" ref="cloudControl" v-loading="cloudControlLoading">
          <div class="control-container">
            <myTitle value="云台控制"/>
            <div class="control-content">
              <div>
                <p>云台转动速度</p>
                <el-slider v-model="cloudParams.turnSpeed" :min="1" :max="45"></el-slider>
              </div>
              <div>
                <p>云台转向控制</p>
                <div class="control-direction">
                  <i v-for="item in 8" :key="item"
                     @mousedown="moveStart('方向',formatterDirection(item))"
                     @mouseup="moveEnd('方向','stop')"
                     :title="formatterDirection(item,'label')"></i>
                </div>
              </div>
            </div>
            <myTitle value="镜头控制"/>
            <div class="control-content">
              <div>
                <p>变倍控制</p>
                <el-button class="control"
                           @mousedown.native="moveStart('变倍','zoomOut')"
                           @mouseup.native="moveEnd('变倍','zoomOut')"
                           icon="el-icon-minus" circle></el-button>
                <el-button class="control" @mousedown.native="moveStart('变倍','zoomIn')"
                           @mouseup.native="moveEnd('变倍','zoomIn')" icon="el-icon-plus"
                           circle></el-button>
                <el-input v-model="cloudParams.magnification" type="number" :min="0"></el-input>
                <el-button plain @click="getCameraPanParam('zoom')">查询</el-button>
                <el-button plain @click="setCameraPanParam('zoom')">设置</el-button>
              </div>
              <div>
                <p>聚焦控制</p>
                <el-button class="control" @mousedown.native="moveStart('聚焦','focusFar')"
                           @mouseup.native="moveEnd('聚焦','focusFar')" icon="el-icon-minus"
                           circle></el-button>
                <el-button class="control" @mousedown.native="moveStart('聚焦','focusNear')"
                           @mouseup.native="moveEnd('聚焦','focusNear')" icon="el-icon-plus"
                           circle></el-button>
                <el-input v-model="cloudParams.focus" type="number"></el-input>
                <el-button plain @click="getCameraPanParam('focus')">查询</el-button>
                <el-button plain @click="setCameraPanParam('focus')">设置</el-button>
              </div>
              <div>
                <p>光圈控制</p>
                <el-button @mousedown.native="moveStart('光圈','aperture','sub')"
                           @mouseup.native="moveEnd('光圈','stop')" class="control" icon="el-icon-minus"
                           circle></el-button>
                <el-button @mousedown.native="moveStart('光圈','aperture','add')"
                           @mouseup.native="moveEnd('光圈','stop')" class="control" icon="el-icon-plus"
                           circle></el-button>
              </div>
            </div>
            <myTitle value="辅助功能"/>
            <div class="control-content control-switch">
              <div v-for="item in auxiliaryOptions" :key="item.name">
                <p>{{ item.name }}</p>
                <template v-if="item.name==='补光灯'">
                  <div>
                    <i :style="{'left':`${(32+20)*cloudParams.fillLight}px`}"></i>
                    <p v-for="flag in fillLightOptions" :key="flag.id"
                       @click="setAuxiliaryFunction('setLamp',flag.value)"
                       :class="{'active':cloudParams.fillLight===flag.id}">
                      {{ flag.name }}</p>
                  </div>
                </template>
                <template v-else>
                  <div>
                    <i :style="{'left':`${(32+20)*(!cloudParams[item.paramsName]?0:1)}px`}"></i>
                    <p v-for="flag in [false,true]" :key="flag"
                       @click="setAuxiliaryFunction(item.serviceName,flag?'open':'close')"
                       :class="{'active':cloudParams.wiper===flag}">
                      {{ item ? '开启' : '关闭' }}</p>
                  </div>
                </template>
              </div>
            </div>
            <myTitle value="充电房控制"/>
            <div class="control-content control-switch">
              <template v-for="item in chargingRoomOptions">
                <div :key="item.name" v-if="controlPermission(item.name)">
                  <p>{{ item.name }}</p>
                  <div>
                    <i :style="{'left':`${(32+20)*(!cloudParams[item.paramsName]?0:1)}px`}"></i>
                    <p v-for="flag in [false,true]" :key="flag"
                       @click="setChargingRoomFunction(item.serviceName,flag?'ON':'OFF',item.type)"
                       :class="{'active':cloudParams.wiper===flag}">
                      {{ flag ? '开启' : '关闭' }}</p>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!--  start：面包屑弹出层  -->
    <popover ref="breadcrumbPopover" customClass="breadcrumb-popover popover" :visible="breadcrumbPopoverFlag"
             @target="setPopperTarget('breadcrumbPopoverTarget',$event)"
             @leave="hidePopover('breadcrumbPopoverFlag','breadcrumbPopoverTarget')">
      <ul>
        <li v-for="item in breadcrumbPopoverData"
            :key="item.id"
            :class="{'active':item.name===navbar[currentBreadcrumbIndex].name}">
          <div v-if="currentBreadcrumbIndex===3&&!item.id">{{ item.name }}</div>
          <div v-else @click="changeBreadcrumbValue(item)">{{ item.name }}</div>
        </li>
      </ul>
    </popover>
    <!--  end：面包屑弹出层  -->
    <!--  start：自定义title  -->
    <popover ref="titlePopover" :visible="titlePopoverFlag" class="title-popover">
      <div></div>
    </popover>
    <!--  end：自定义title  -->
    <!--  start：机器人音频载体  -->
    <div id="mse" style="display: none"></div>
    <!--  end：机器人音频载体  -->
    <!--  start：预警列表对话框  -->
    <!--    <el-dialog custom-class="dialog-message" width="900px" :modal-append-to-body="false" :modal="false"-->
    <!--               :visible.sync="dialogWarning" @open="openWarningCenter">-->
    <!--      <div class="dialog-title" @click="filterPopoverFlag=false">-->
    <!--        <p class="title-text">预警信息</p>-->
    <!--        <div class="title-search">-->
    <!--          <input type="text" v-model="warningSearchValue" placeholder="输入标题、预警源或处理人">-->
    <!--          <button>搜索</button>-->
    <!--        </div>-->
    <!--      </div>-->
    <!--      <div class="dialog-content" @click="filterPopoverFlag=false">-->
    <!--        <div class="content-lists" ref="warningLists">-->
    <!--          <div class="list-filter">-->
    <!--            <div class="filter-box">-->
    <!--              <i class="filter-btn"-->
    <!--                 @click.stop="showPopover($event,'filterPopover','bottom-start',0,12,{flag:'filterPopoverFlag'})"></i>-->
    <!--              <div class="filter-item">-->
    <!--                <el-button type="text" :disabled="disabledLeftArrow" v-show="showScrollArrow"-->
    <!--                           @click="scrollHorizontally('left')"-->
    <!--                           icon="el-icon-arrow-left">-->
    <!--                </el-button>-->
    <!--                <div class="item-tag">-->
    <!--                  <div class="tag" ref="itemTags">-->
    <!--                    <el-tag-->
    <!--                        ref="tag"-->
    <!--                        disable-transitions-->
    <!--                        @close="closeFilterTag(index)"-->
    <!--                        v-for="(tag,index) in filtersItems"-->
    <!--                        :key="index"-->
    <!--                        closable>-->
    <!--                      <template v-if="tag.type==='title'">-->
    <!--                        预警标题：{{ tag.value }}-->
    <!--                      </template>-->
    <!--                      <template v-else-if="tag.type==='source'">-->
    <!--                        预警源：{{ tag.value }}-->
    <!--                      </template>-->
    <!--                      <template v-else-if="tag.type==='result'">-->
    <!--                        处理结果：{{ tag.value }}-->
    <!--                      </template>-->
    <!--                      <template v-else-if="tag.type==='level'">-->
    <!--                        {{ tag.value }}预警-->
    <!--                      </template>-->
    <!--                      <template v-else-if="tag.type==='personnel'">-->
    <!--                        处理人：{{ tag.value }}-->
    <!--                      </template>-->
    <!--                      <template v-else-if="tag.type==='warningDate'">-->
    <!--                        预警时间：{{ tag.value.start }}至{{ tag.value.end }}-->
    <!--                      </template>-->
    <!--                      <template v-else-if="tag.type==='processDate'">-->
    <!--                        处理时间：{{ tag.value.start }}至{{ tag.value.end }}-->
    <!--                      </template>-->
    <!--                      <template v-else>-->
    <!--                        {{ tag.value }}-->
    <!--                      </template>-->
    <!--                    </el-tag>-->
    <!--                  </div>-->
    <!--                </div>-->
    <!--                <el-button type="text" :disabled="disabledRightArrow" v-show="showScrollArrow"-->
    <!--                           @click="scrollHorizontally('right')"-->
    <!--                           icon="el-icon-arrow-right">-->
    <!--                </el-button>-->
    <!--              </div>-->
    <!--            </div>-->
    <!--            <div class="filter-operating" v-show="filtersItems.length">-->
    <!--              <p @click="messageFilterClickEmpty">清空筛选</p>-->
    <!--            </div>-->
    <!--          </div>-->
    <!--          <div v-show="!warningCenterListLoading" class="content-list">-->
    <!--            <template v-if="warningCenterList.length">-->
    <!--              <div class="list-item" v-for="(item,index) in warningCenterList" :key="index"-->
    <!--                   @click="getWarningDetails(item)">-->
    <!--                <div class="item-top">-->
    <!--                  <div class="top-status" :class="[item.status==='已处理'?'normal':'error']">-->
    <!--                    {{ item.status }}-->
    <!--                  </div>-->
    <!--                  <div class="top-info">-->
    <!--                    <p>预警源：{{ item.source }}</p>-->
    <!--                    <p>预警类型：{{ item.type }}</p>-->
    <!--                  </div>-->
    <!--                </div>-->
    <!--                <div class="item-bottom">-->
    <!--                  <div class="bottom-left">-->
    <!--                    <p>预警等级</p>-->
    <!--                    <p :class="[item.level===1?'error':item.level===2?'warning':'mild-warning']">{{ item.level }}</p>-->
    <!--                  </div>-->
    <!--                  <div class="bottom-right">-->
    <!--                    <div class="bottom-right-title">-->
    <!--                      <i :class="[item.type === 1 ? 'business' : item.type === 2 ? 'robot' : 'system']"></i>-->
    <!--                      <p>{{ item.type }}：{{-->
    <!--                          item.title-->
    <!--                        }}&ensp;<span>{{-->
    <!--                            item.warningDate-->
    <!--                          }}</span></p>-->
    <!--                    </div>-->
    <!--                    <p>{{ item.content }}</p>-->
    <!--                  </div>-->
    <!--                </div>-->
    <!--              </div>-->
    <!--            </template>-->
    <!--            <div class="empty" v-else>-->
    <!--              <p>暂无数据</p>-->
    <!--            </div>-->
    <!--          </div>-->
    <!--          <div v-show="warningCenterListLoading" class="content-skeleton">-->
    <!--            <el-skeleton v-for="item in 3" :key="item" animated/>-->
    <!--          </div>-->
    <!--          <div class="list-pagination">-->
    <!--            <el-pagination-->
    <!--                small-->
    <!--                :current-page.sync="warningPages.currentPage"-->
    <!--                :page-size="warningPages.pageSize"-->
    <!--                :total="warningPages.total"-->
    <!--                :pager-count="5"-->
    <!--                hide-on-single-page-->
    <!--                @current-change="getWarningCenterList"-->
    <!--                layout="prev, pager, next, jumper, total">-->
    <!--            </el-pagination>-->
    <!--          </div>-->
    <!--        </div>-->
    <!--        <div class="content-details" ref="warningDetails">-->
    <!--          <div class="details-title">-->
    <!--            <i class="el-icon-arrow-left" @click="backWarningList"></i>-->
    <!--            <i :class="[warningCenterDetails.type === 1 ? 'business' : warningCenterDetails.type === 2 ? 'robot' : 'system']"></i>-->
    <!--            <p class="detail-title">{{ warningCenterDetails.type }}：{{ warningCenterDetails.title }}</p>-->
    <!--            <p class="detail-status"-->
    <!--               :class="[warningCenterDetails.status===1?'normal':'error']">-->
    <!--              {{ warningCenterDetails.status === 2 ? '未处理' : '已处理' }}</p>-->
    <!--          </div>-->
    <!--          <div class="details-content">-->
    <!--            <div v-for="(value,key) in warningCenterDetails" :key="key" v-show="key!=='level'&&key!=='status'">-->
    <!--              <p>{{ key | filterWarningDetailsKeys }}</p>-->
    <!--              <p>{{ value }}</p>-->
    <!--            </div>-->
    <!--          </div>-->
    <!--        </div>-->
    <!--      </div>-->
    <!--      <popover ref="filterPopover" :visible="filterPopoverFlag">-->
    <!--        <div class="filter-popover" @click.stop>-->
    <!--          <div class="filter-checkbox">-->
    <!--            <p>预警类别</p>-->
    <!--            <el-checkbox-group v-model="filters.category">-->
    <!--              <el-checkbox v-for="item in warningCategoryOptions" :key="item.id" :label="item.name"/>-->
    <!--            </el-checkbox-group>-->
    <!--            <p class="selectAll" @click="checkALlType('category')">选择全部</p>-->
    <!--          </div>-->
    <!--          <div class="filter-select">-->
    <!--            <p>预警类型</p>-->
    <!--            <el-select v-model="filters.type" filterable-->
    <!--                       popper-class="filter-select-option"-->
    <!--                       @visible-change="scaleElPopover">-->
    <!--              <el-option-->
    <!--                  v-for="item in warningTypeOptions"-->
    <!--                  :key="item.projectId"-->
    <!--                  :label="item.name"-->
    <!--                  :value="item.projectId">-->
    <!--              </el-option>-->
    <!--            </el-select>-->
    <!--          </div>-->
    <!--          <div>-->
    <!--            <p>预警标题</p>-->
    <!--            <el-input v-model="filters.title"></el-input>-->
    <!--          </div>-->
    <!--          <div>-->
    <!--            <p>预警源</p>-->
    <!--            <el-input v-model="filters.source"></el-input>-->
    <!--          </div>-->
    <!--          <div class="filter-date">-->
    <!--            <p>预警时间</p>-->
    <!--            <el-date-picker-->
    <!--                v-model="filters.warningDate"-->
    <!--                type="datetimerange"-->
    <!--                popper-class="custom-date-popover"-->
    <!--                unlink-panels-->
    <!--                @focus="focusDateTime"-->
    <!--                :default-value="dateDefaultShow"-->
    <!--                :picker-options="pickerOptions"-->
    <!--                value-format="yyyy-MM-dd HH:mm:ss"-->
    <!--                :editable="false"-->
    <!--                range-separator="至"-->
    <!--                start-placeholder="开始日期"-->
    <!--                end-placeholder="结束日期">-->
    <!--            </el-date-picker>-->
    <!--          </div>-->
    <!--          <div class="filter-checkbox">-->
    <!--            <p>预警等级</p>-->
    <!--            <el-checkbox-group v-model="filters.level">-->
    <!--              <el-checkbox v-for="item in warningLevelOptions" :key="item.id" :label="item.name"/>-->
    <!--            </el-checkbox-group>-->
    <!--            <p class="selectAll" @click="checkALlType('level')">选择全部</p>-->
    <!--          </div>-->
    <!--          <div class="filter-radio">-->
    <!--            <p>处理状态</p>-->
    <!--            <el-radio-group v-model="filters.status">-->
    <!--              <el-radio v-for="item in warningStatusOptions" :key="item.id" :label="item.id">{{ item.name }}</el-radio>-->
    <!--            </el-radio-group>-->
    <!--          </div>-->
    <!--          <div>-->
    <!--            <p>处理人</p>-->
    <!--            <el-input v-model="filters.personnel" :disabled="filters.status===2"></el-input>-->
    <!--          </div>-->
    <!--          <div class="filter-radio">-->
    <!--            <p>处理结果</p>-->
    <!--            <el-radio-group v-model="filters.result" :disabled="filters.status===2">-->
    <!--              <el-radio v-for="item in warningResultOptions" :key="item.id" :label="item.id">{{ item.name }}</el-radio>-->
    <!--            </el-radio-group>-->
    <!--          </div>-->
    <!--          <div class="filter-date">-->
    <!--            <p>处理时间</p>-->
    <!--            <el-date-picker-->
    <!--                v-model="filters.processDate"-->
    <!--                type="datetimerange"-->
    <!--                popper-class="custom-date-popover"-->
    <!--                unlink-panels-->
    <!--                @focus="focusDateTime"-->
    <!--                :default-value="dateDefaultShow"-->
    <!--                :picker-options="pickerOptions"-->
    <!--                value-format="yyyy-MM-dd HH:mm:ss"-->
    <!--                :editable="false"-->
    <!--                :disabled="filters.status===2"-->
    <!--                range-separator="至"-->
    <!--                start-placeholder="开始日期"-->
    <!--                end-placeholder="结束日期">-->
    <!--            </el-date-picker>-->
    <!--          </div>-->
    <!--          <div class="filter-operating">-->
    <!--            <span>共24条结果</span>-->
    <!--            <el-button type="text" @click="messageFilterClickEmpty">清空</el-button>-->
    <!--            <el-button plain @click="messageFilterClickConfirm">确定</el-button>-->
    <!--          </div>-->
    <!--        </div>-->
    <!--      </popover>-->
    <!--    </el-dialog>-->
    <!--  end：预警列表对话框  -->
  </div>
</template>
<script>
import robotSituation from "./robotSituation.js";

export default robotSituation;
</script>
<style scoped lang="scss">
@import "robotSituation.scss";
</style>
