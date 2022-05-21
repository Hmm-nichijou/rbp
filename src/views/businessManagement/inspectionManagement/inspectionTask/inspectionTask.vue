<template>
  <div class="inspection-task common" ref="scale" @click="hideAllPopover">
    <logo/>
    <div class="task-content common-content">
      <top-bar ref="topBar" @changeTheme="changeTheme" :id="$store.state.userInfo.id" type="country"/>
      <div class="content-info">
        <div class="info-breadcrumbs">
          <div class="breadcrumb-tabs">
            <div class="tabs-navbar">
              <div class="navbar-item" v-for="(item,index) in navbar" :key="item.name">
                <p class="navbar-item-name navbar-item-country">{{ item.name }}</p>
                <i class="el-icon-arrow-right" v-if="index!==navbar.length-1"></i>
              </div>
            </div>
          </div>
        </div>
        <p class="info-company">{{ $store.state.projectInfo.name }}</p>
      </div>
      <div class="content-panel">
        <div class="panel-left">
          <div class="panel-header">
            <p>巡检任务列表</p>
          </div>
          <div class="panel-container">
            <div class="panel-filters">
              <i class="filter-btn"
                 @click.stop="showPopover($event,'filterPopover','bottom-start',-79,8,{flag:'filterPopoverFlag'})"></i>
            </div>
            <div class="panel-list" v-loading="taskListLoading">
              <div class="panel-list__header">
                <div class="list-item__column" v-for="item in listTIle" :key="item">{{ item }}</div>
              </div>
              <div class="panel-list__content">
                <div class="list-content__item add-task" @click="addTask">
                  <i class="el-icon-plus"></i>
                  <span>添加任务</span>
                </div>
                <div class="list-content__item" :class="{'active':item.id===taskForm.id}" v-for="item in taskList"
                     :key="item.id"
                     @click="getTaskDetails(item.id)">
                  <p class="list-item__column active" :title="item.name">{{ item.name }}</p>
                  <p class="list-item__column">{{ translationKey(item.type) }}</p>
                  <p class="list-item__column" :title="item.robot">{{ item.robot }}</p>
                  <p class="list-item__column">{{ item.startDate }}</p>
                  <p class="list-item__column">{{ item.cycle }}{{ translationKey(item.cycleUnit) }}</p>
                  <p class="list-item__column" :class="{'active':item.executionStatus==='EXECUTING'}">{{
                      translationKey(item.executionStatus)
                    }}</p>
                  <p class="list-item__column" :class="{'active':item.taskStatus==='TAKE_EFFECT'}">{{
                      translationKey(item.taskStatus)
                    }}</p>
                  <p class="list-item__column">{{ item.update }}</p>
                </div>
              </div>
              <div class="list-pagination">
                <el-pagination
                    small
                    :current-page.sync="taskListPage.currentPage"
                    :page-size="taskListPage.pageSize"
                    :total="taskListPage.total"
                    @current-change="changeCurrentPage"
                    hide-on-single-page
                    layout="prev, pager, next, jumper">
                </el-pagination>
              </div>
            </div>
          </div>
        </div>
        <div class="panel-right" v-loading="taskDetailsLoading">
          <div class="panel-edit__header">
            <p class="edit-header__name">{{ taskForm.id ? taskForm.name : '新任务' }}</p>
            <div class="edit-header__btn" v-if="taskForm.id">
              <button class="btn btn-icon icon-execution">执行</button>
              <button class="btn btn-icon icon-stop">停止</button>
            </div>
          </div>
          <div class="panel-edit__content">
            <template v-for="(value,key) in taskForm">
              <div class="se-form-item"
                   :class="{'se-form-full':key==='status','se-form-textarea se-form-full':key==='remarks','se-form-adaptiveHeight se-form-full':key==='pointList','se-form-dialog':key==='robot','se-form-select':key==='map'||key==='type'||key==='cycle'}"
                   :key="key" v-if="key!=='cycleUnit'&&key!=='id'">
                <p class="se-form__name">{{ key | formatterKeyName }}</p>
                <div class="se-form__input"
                     :class="{'se-form__decoration':key!=='status','se-form__input-notFull':key!=='pointList'&&key!=='remarks'&&key!=='status'}">
                  <template v-if="key!=='status'">
                    <i v-for="item in 4" :key="item"></i>
                  </template>
                  <!--        机器人        -->
                  <template v-if="key==='robot'">
                    <input readonly class="se-form__value" v-model="taskForm.robot.label" type="text" placeholder="请选择">
                    <button class="btn btn-icon icon-search btn-square" @click="dialogSelectRobot=true"></button>
                  </template>
                  <!--        下拉框选择器：巡检地图、任务类型        -->
                  <template v-else-if="key==='map'||key==='type'">
                    <el-select :disabled="(key==='map'||key==='type')&&!taskForm.robot.id" v-model="taskForm[key]"
                               placeholder="请选择"
                               @visible-change="scaleElPopover"
                               @change="changeOption($event,key)"
                               popper-class="chartSelectPopper">
                      <el-option
                          v-for="item in getOptions(key)"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value">
                      </el-option>
                    </el-select>
                  </template>
                  <!--        开始时间        -->
                  <template v-else-if="key==='startDate'">
                    <el-date-picker
                        v-model="taskForm[key]"
                        type="datetime"
                        :disabled="taskForm.type==='IMMEDIATELY'||taskForm.type==='CYCLE'"
                        popper-class="custom-date-popover"
                        value-format="yyyy-MM-dd HH:mm:ss"
                        :editable="false"
                        prefix-icon="-"
                        :clearable="false"
                        placeholder="选择开始时间">
                    </el-date-picker>
                  </template>
                  <!--        状态        -->
                  <template v-else-if="key==='status'">
                    <div class="se-form__input-switch">
                      <div class="input-switch__item" :class="{'active':taskForm[key]===item.value}"
                           v-for="item in statusOption" :key="item.value" @click="changeStatus(item)">{{
                          item.label
                        }}
                      </div>
                      <div class="input-switch__slider"
                           :style="{'left':`${taskForm[key]==='TAKE_EFFECT'?'50%':0}`}"></div>
                    </div>
                  </template>
                  <!--        检测点列表        -->
                  <template v-else-if="key==='pointList'">
                    <multi-items-input
                        v-model="taskForm[key]"
                        placeholder="选择巡检点"
                        separator=";"
                        :fetch="search"
                        @select="selectPoint"
                        @delete="deletePoint"
                        :selection-only="false"/>
                  </template>
                  <!--        备注        -->
                  <template v-else-if="key==='remarks'">
                    <el-input
                        type="textarea"
                        :rows="2"
                        resize="none"
                        placeholder="已到现场进行甄别，预警情况已处理。"
                        v-model="taskForm.remarks">
                    </el-input>
                  </template>
                  <!--        循环间隔        -->
                  <template v-else-if="key==='cycle'">
                    <input
                        :disabled="!taskForm.robot.id&&(taskForm.type==='IMMEDIATELY'||taskForm.type==='TIMING'||taskForm.type==='')"
                        type="number"
                        v-model="taskForm[key]" placeholder="请输入">
                    <el-select style="width: 50%"
                               :disabled="taskForm.robot.id&&(taskForm.type==='IMMEDIATELY'||taskForm.type==='TIMING'||taskForm.type==='')"
                               v-model="taskForm.cycleUnit"
                               placeholder="请选择"
                               @visible-change="scaleElPopover"
                               popper-class="chartSelectPopper">
                      <el-option
                          v-for="item in getOptions(key)"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value">
                      </el-option>
                    </el-select>
                  </template>
                  <!--        其他：输入框        -->
                  <template v-else>
                    <input type="text" v-model="taskForm[key]" placeholder="请输入">
                  </template>
                </div>
              </div>
            </template>
            <div class="edit-content-btn">
              <button class="btn btn-face" @click="saveTask">保存</button>
              <button v-if="taskForm.id" class="btn" @click="deleteTask">删除任务</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!--  start：选择机器人对话框  -->
    <el-dialog custom-class="dialog-select" title="选择机器人" width="340px" :visible.sync="dialogSelectRobot" v-drag
               :modal="false" @open="openDialog" @closed="closedDialog">
      <div class="dialog-wrapper" v-loading="robotListLoading">
        <div class="dialog_search">
          <div class="dialog__search-icon"></div>
          <div class="dialog__search-input">
            <i v-for="item in 4" :key="item"></i>
            <input v-model="searchRobotValue" type="text" placeholder="输入机器人名称/项目名称">
          </div>
        </div>
        <el-tree v-if="this.robotList.length" ref="tree" :data="robotList" render-after-expand
                 :filter-node-method="filterNode"
                 @node-click="confirmRobot"></el-tree>
      </div>
    </el-dialog>
    <!--  end：选择机器人对话框  -->
  </div>
</template>
<script>
import inspectionTask from "./inspectionTask.js";

export default inspectionTask;
</script>
<style scoped lang="scss">
@import "inspectionTask.scss";
</style>