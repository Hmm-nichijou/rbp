<template>
  <div class="task-details" ref="taskDetails">
    <div class="details-title">巡检任务结果</div>
    <div class="details-container">
      <backtrack :robot-id="robotId" :current-theme="currentTheme" page="taskDetails" :id="currentTaskId"
                 @changeTask="changeTask"/>
      <div class="details-right" v-loading="loading" element-loading-text="加载中...">
        <div class="details-name">
          {{ taskInfo[0].任务名称 }}
          <i title="导出为PDF" class="details-export" @click="getPdf($refs.taskDetails)"></i>
        </div>
        <div class="details-info">
          <el-row justify="space-between" v-for="(task,index) in taskInfo" :key="index">
            <el-col :span="6" v-for="(value,key) in task" :key="key">
              <p>{{ key }}</p>
              <p>{{ value !== '' ? value : '-' }}</p>
            </el-col>
          </el-row>
        </div>
        <el-collapse v-model="activeTable">
          <el-collapse-item v-if="meter.length" title="表计识别" :name="1">
            <el-table
                class="meter-table"
                :data="meter">
              <el-table-column
                  prop="pointName"
                  min-width="10%"
                  label="巡检点">
              </el-table-column>
              <el-table-column
                  prop="itemName"
                  min-width="10%"
                  label="巡检项">
              </el-table-column>
              <el-table-column
                  min-width="15%"
                  label="巡检图片">
                <template slot-scope="scope">
                  <el-image
                      :src="scope.row.img"
                      :preview-src-list="[scope.row.img]">
                    <div slot="error" class="img-slot">暂无图片</div>
                  </el-image>
                </template>
              </el-table-column>
              <el-table-column
                  min-width="15%"
                  label="分析后图片">
                <template slot-scope="scope">
                  <el-image
                      :src="scope.row.AiImg"
                      :preview-src-list="[scope.row.AiImg]">
                    <div slot="error" class="img-slot">暂无图片</div>
                  </el-image>
                </template>
              </el-table-column>
              <el-table-column
                  min-width="15%"
                  label="预置图片">
                <template slot-scope="scope">
                  <el-image
                      :src="scope.row.presetImg"
                      :preview-src-list="[scope.row.presetImg]">
                    <div slot="error" class="img-slot">暂无图片</div>
                  </el-image>
                </template>
              </el-table-column>
              <el-table-column
                  prop="value"
                  min-width="10%"
                  label="仪表值">
              </el-table-column>
              <el-table-column
                  prop="time"
                  min-width="10%"
                  label="耗时">
              </el-table-column>
              <el-table-column
                  min-width="10%"
                  label="结果状态">
                <template slot-scope="scope">{{ formatterStatus(scope.row.status) }}</template>
              </el-table-column>
            </el-table>
          </el-collapse-item>
          <el-collapse-item v-if="gas.length" title="气体识别" :name="2">
            <el-table
                :row-class-name="setStatus"
                :data="gas">
              <el-table-column
                  prop="pointName"
                  min-width="10%"
                  label="巡检点">
              </el-table-column>
              <el-table-column
                  prop="itemName"
                  min-width="25%"
                  label="巡检项">
              </el-table-column>
              <el-table-column
                  prop="type"
                  min-width="30%"
                  label="气体类型">
              </el-table-column>
              <el-table-column
                  prop="value"
                  min-width="20%"
                  label="浓度值">
              </el-table-column>
              <el-table-column
                  min-width="10%"
                  label="结果状态">
                <template slot-scope="scope">{{ formatterStatus(scope.row.status) }}</template>
              </el-table-column>
            </el-table>
          </el-collapse-item>
          <el-collapse-item v-if="environment.length" title="环境识别" :name="3">
            <el-table
                :row-class-name="setStatus"
                :data="environment">
              <el-table-column
                  prop="pointName"
                  min-width="10%"
                  label="巡检点">
              </el-table-column>
              <el-table-column
                  prop="itemName"
                  min-width="55%"
                  label="巡检项">
              </el-table-column>
              <!--              <el-table-column-->
              <!--                  prop="type"-->
              <!--                  min-width="30%"-->
              <!--                  label="环境数据类型">-->
              <!--              </el-table-column>-->
              <el-table-column
                  prop="temperature"
                  min-width="10%"
                  label="温度值">
              </el-table-column>
              <el-table-column
                  prop="humidity"
                  min-width="10%"
                  label="湿度值">
              </el-table-column>
              <el-table-column
                  min-width="10%"
                  label="结果状态">
                <template slot-scope="scope">{{ formatterStatus(scope.row.status) }}</template>
              </el-table-column>
            </el-table>
          </el-collapse-item>
          <el-collapse-item v-if="noise.length" title="噪音识别" :name="4">
            <el-table
                :row-class-name="setStatus"
                :data="noise">
              <el-table-column
                  prop="pointName"
                  min-width="10%"
                  label="巡检点">
              </el-table-column>
              <el-table-column
                  prop="itemName"
                  min-width="25%"
                  label="巡检项">
              </el-table-column>
              <el-table-column
                  prop="value"
                  min-width="50%"
                  label="噪音分贝">
              </el-table-column>
              <el-table-column
                  min-width="10%"
                  label="结果状态">
                <template slot-scope="scope">{{ formatterStatus(scope.row.status) }}</template>
              </el-table-column>
            </el-table>
          </el-collapse-item>
          <el-collapse-item v-if="paomao.length" title="跑冒识别" :name="5">
            <el-table
                :row-class-name="setStatus"
                :data="paomao">
              <el-table-column
                  prop="pointName"
                  min-width="10%"
                  label="巡检点">
              </el-table-column>
              <el-table-column
                  prop="itemName"
                  min-width="25%"
                  label="巡检项">
              </el-table-column>
              <el-table-column
                  min-width="60%"
                  label="结果状态">
                <template slot-scope="scope">{{ formatterStatus(scope.row.status) }}</template>
              </el-table-column>
            </el-table>
          </el-collapse-item>
          <el-collapse-item v-if="abnormal.length" title="异常识别" :name="6">
            <el-table
                :row-class-name="setStatus"
                :data="abnormal">
              <el-table-column
                  prop="pointName"
                  min-width="10%"
                  label="巡检点">
              </el-table-column>
              <el-table-column
                  prop="itemName"
                  min-width="25%"
                  label="巡检项">
              </el-table-column>
              <el-table-column
                  prop="value"
                  min-width="50%"
                  label="数据明细">
              </el-table-column>
              <el-table-column
                  min-width="10%"
                  label="结果状态">
                <template slot-scope="scope">{{ formatterStatus(scope.row.status) }}</template>
              </el-table-column>
            </el-table>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>
  </div>
</template>
<script>
import taskDetails from "./taskDetails.js";

export default taskDetails;
</script>
<style scoped lang="scss">
@import "taskDetails.scss";
</style>