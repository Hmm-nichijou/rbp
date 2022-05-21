<template>
  <div class="panel-left-backtracking">
    <div class="backtracking-title" v-if="page!=='taskDetails'">历史任务</div>
    <div class="backtracking-top">
      <div class="top-date">
        <span class="date-title">选择日期：</span>
        <i></i>
        <el-date-picker
            v-model="taskBacktrackingDate"
            type="daterange"
            unlink-panels
            @focus="focusDateTime"
            range-separator="—"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            popper-class="custom-date-popover"
            value-format="yyyy-MM-dd"
            :editable="false"
            @change="changeDate"
            :default-value="dateDefaultShow"
            :picker-options="pickerOptions">
        </el-date-picker>
      </div>
      <p v-show="taskBacktrackingDate.length===2" @click="resetDate" class="top-reset-date">重置</p>
    </div>
    <div class="backtracking-list" v-if="backtrackingList.length&&!loading">
      <div class="list-filter">
        <div class="filter-item" :class="{'active':item.id===backtrackingFilterActive}"
             v-for="item in backtrackingFilter" :key="item.id">
          <p @click="changeBacktrackingFilter(item)">{{ item.name }}</p>
          <i :class="[item.filter==='2'?'el-icon-top':'el-icon-bottom']"></i>
        </div>
      </div>
      <div class="list-total">{{ backtrackingPages.total }}条</div>
      <div class="list-task">
        <div class="task-item" v-for="item in backtrackingList" :key="item.id"
             @click="clickTaskItem(item)" :class="{'active':item.taskId===id}">
          <i class="item-little-triangle"></i>
          <i class="item-triangle" :class="item.warningFrequency | filterBacktrackingItemClass"></i>
          <div class="item-info">
            <div class="info-warningFrequency">
              <p>预警次数</p>
              <p :class="['warningFrequency-number',formatWarningFrequency(item.emergencyInfoCount!=='' ? item.emergencyInfoCount : 0) ]">
                {{ item.emergencyInfoCount !== '' ? item.emergencyInfoCount : 0 }}</p>
            </div>
            <div class="info-item">
              <p>
                <span>{{ item.patrolTaskName }}</span>&ensp;
                <router-link @click.native.stop v-if="page!=='taskDetails'" target="_blank"
                             :to="{path:`/taskDetails/${item.taskId}`}">
                  巡检结果
                </router-link>
              </p>
              <p>
                <span>{{ item.date }}</span>
              </p>
              <p>
                        <span>
                          巡检点共{{
                            item.taskStatus === 'FINISHED' ? item.pointMap.pointSuccessCount : `${item.pointMap.pointSuccessCount}/${item.patrolPointTotal}`
                          }}个
                        </span>&ensp;
                <!--                        <span>-->
                <!--                          巡检项共{{-->
                <!--                            item.complete ? item.currentInspectionItems : `${item.currentInspectionItems}/${item.inspectionItemsTotal}`-->
                <!--                          }}个-->
                <!--                        </span>&ensp;-->
                <span v-if="item.taskStatus==='FINISHED'">全部完成</span>
                <span v-else-if="item.taskStatus==='STOPPED'">中断</span>
              </p>
            </div>
          </div>
          <div class="item-status">
            <p>待处理：{{ item.emerPendingCount !== '' ? item.emerPendingCount : '-' }}</p>
            <p>已处理：{{ item.emerProcessedCount !== '' ? item.emerProcessedCount : '-' }}</p>
            <p>预警点位：{{ item.emergencyInfoCount !== '' ? item.emergencyInfoCount : '-' }}</p>
          </div>
        </div>
      </div>
      <div class="list-pagination">
        <el-pagination
            small
            :current-page.sync="backtrackingPages.currentPage"
            :page-size="backtrackingPages.pageSize"
            :total="backtrackingPages.total"
            :pager-count="5"
            @current-change="changeCurrentPage"
            hide-on-single-page
            layout="prev, pager, next, jumper">
        </el-pagination>
      </div>
    </div>
    <empty v-else :current-theme="currentTheme"
           :message="loadingMsg"/>
  </div>
</template>
<script>
import backtrack from "./backtrack.js";

export default backtrack;
</script>
<style scoped lang="scss">
@import "backtrack";
</style>