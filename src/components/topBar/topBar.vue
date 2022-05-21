<template>
  <div class="top-bar">
    <div class="top-bar-left">
      <div class="top-bar-search">
        <div class="search-btn">
          <i class="btn-icon"></i>
        </div>
        <input @click.stop="showPopover($event,'searchPopover','bottom-start',0,8,{flag:'searchPopoverFlag'})"
               class="search-input" type="text" v-model="searchValue"
               placeholder="请输入城市/项目名"
               @input="changeSearchValue">
      </div>
      <i @mouseenter="showPopover($event,'titlePopover','bottom',0,8,{flag:'titlePopoverFlag'})"
         @mouseleave="titlePopoverFlag=false" data-text="刷新"
         class="top-bar-refresh" @click="refresh"></i>
      <i @mouseenter="showPopover($event,'titlePopover','bottom',0,8,{flag:'titlePopoverFlag'})"
         @mouseleave="titlePopoverFlag=false" :data-text="fullScreenFlag?'退出全屏':'全屏'"
         class="top-bar-full-screen" :class="[fullScreenFlag?'':'not']" @click="toggleFullScreen"></i>
      <div class="top-bar-dateTime">
        <div class="dateTime-date">
          <i></i>
          <p>{{ currentDate }}</p>
        </div>
        <div class="dateTime-time">
          <i></i>
          <p>{{ currentTime }}</p>
        </div>
      </div>
    </div>
    <div class="top-bar-right">
      <div class="top-bar-right-user">
        <img @mouseenter="showPopover($event,'userInfoPopover','bottom-start',0,8,{flag:'userInfoPopoverFlag'})"
             @mouseleave="hidePopover('userInfoPopoverFlag','userInfoPopoverTarget')" class="user-avatar"
             :src="userInfo.photo?`http://robot.7tyun.com/ftp/${userInfo.photo}`:require('../../assets/images/common/avatar.png')"
             alt="">
        <p class="user-name">{{ userInfo.name }}</p>
      </div>
      <i @mouseenter="showPopover($event,'titlePopover','bottom',0,8,{flag:'titlePopoverFlag'})"
         @mouseleave="titlePopoverFlag=false"
         @click.stop="showPopover($event,'businessPopover','bottom-start',0,8,{flag:'businessPopoverFlag'})"
         data-text="业务管理"
         class="top-bar-business"></i>
      <i @mouseenter="showPopover($event,'titlePopover','bottom',0,8,{flag:'titlePopoverFlag'})"
         @mouseleave="titlePopoverFlag=false"
         @click.stop="showPopover($event,'messagePopover','bottom',0,8,{flag:'messagePopoverFlag'})"
         :data-text="userInfo.message?`消息通知：${userInfo.message}`:'消息通知'"
         class="top-bar-message">
        <span v-if="userInfo.message" class="message-tag"
              data-text="消息通知">{{ userInfo.message > 99 ? '99+' : userInfo.message }}</span>
      </i>
      <i @mouseenter="showPopover($event,'titlePopover','bottom',0,8,{flag:'titlePopoverFlag'})"
         @mouseleave="titlePopoverFlag=false"
         @click.stop="showPopover($event,'themePopover','bottom-end',0,8,{flag:'themePopoverFlag'})"
         data-text="切换主题"
         class="top-bar-theme"></i>
      <i @mouseenter="showPopover($event,'titlePopover','bottom',0,8,{flag:'titlePopoverFlag'})"
         @mouseleave="titlePopoverFlag=false" data-text="AI展示平台"
         class="top-bar-ai" @click="toAI"></i>
      <i @mouseenter="showPopover($event,'titlePopover','bottom',0,8,{flag:'titlePopoverFlag'})"
         @mouseleave="titlePopoverFlag=false" data-text="设置"
         class="top-bar-setting"></i>
    </div>
    <!--  start：自定义title  -->
    <popover ref="titlePopover" :visible="titlePopoverFlag" class="title-popover">
      <div></div>
    </popover>
    <!--  end：自定义title  -->
    <!--  start：搜索弹出框  -->
    <popover ref="searchPopover" :visible="searchPopoverFlag" class="search-popover">
      <ul v-if="resetSearchList.length&&!provinceLoading">
        <li class="search-item" v-for="item in resetSearchList"
            :key="item.projectId">
          <div class="search-item-title" @click.stop="showRobotInfo(item)">
            <p class="title-tag">{{ item.tag }}</p>
            <p class="title-name">{{ item.name }}
              <span
                  :class="[item.robotStatus['on-line']===item.robotnum?'normal':'warning']">
                            [{{ item.robotStatus['on-line'] }}/{{ item.robotnum }}]
                            </span>
            </p>
            <!--            <p class="title-enter" @click.stop="toProject(item.projectId)">进入</p>-->
          </div>
          <el-collapse-transition>
            <div @click.stop v-show="item.show">
              <div class="robot-info-padding">
                <p>机器人总数&emsp;{{ item.robotnum }}</p>
                <div class="robot-info-box">
                  <div class="info-box-item" v-for="(value,key) in item.robotStatus" :key="key" v-show="value">
                    <i :class="`robot-status-${key}`"></i>
                    <p>
                      <span>{{ key | filterRobotStatusName }}</span>
                      <span>{{ value }}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </el-collapse-transition>
        </li>
      </ul>
      <empty v-else :message="provinceLoadingText" type="small"/>
    </popover>
    <!--  end：搜索弹出框  -->
    <!--  start：用户弹出框  -->
    <popover ref="userInfoPopover" :visible="userInfoPopoverFlag" customClass="userInfo-popover popover"
             @target="setPopperTarget('userInfoPopoverTarget',$event)"
             @leave="hidePopover('userInfoPopoverFlag','userInfoPopoverTarget')">
      <ul>
        <li>
          <div @click="logOut">退出登录</div>
        </li>
      </ul>
    </popover>
    <!--  end：用户弹出框  -->
    <!--  start：主题列表  -->
    <popover ref="themePopover" :visible="themePopoverFlag" class="theme-popover">
      <div @click.stop class="themes">
        <div class="themes-item" v-for="item in themes" :key="item.id" :class="{'active':currentTheme===item.id}"
             @click="changeTheme(item.id)">
          <img :src="require(`../../assets/images/common/bg-theme-${item.id}.png`)" alt="">
          <p class="item-name">{{ item.name }}</p>
        </div>
      </div>
    </popover>
    <!--  end：主题列表  -->
    <!--  start：消息通知  -->
    <popover ref="messagePopover" :visible="messagePopoverFlag" class="message-popover">
      <div @click.stop class="message">
        <div class="message-operating">
          <p>故障消息</p>
          <!--          <p>全部已读</p>-->
        </div>
        <div class="message-tabs">
          <div class="tabs-item" v-for="item in messageTabs" :key="item.id" @click="changeTab(item.id,item.type)"
               :class="{'active':item.id===currentTab}">
            <p class="item-name">{{ item.name }}</p>
            <span v-if="item.message" class="item-badge">{{ item.message }}</span>
          </div>
          <div class="tab-slider" ref="tabSlider">
            <div></div>
          </div>
        </div>
        <div class="message-list" v-if="messageList.length">
          <ul>
            <!--            <li class="list-item" v-for="item in messageList" :key="item.id">-->
            <li class="list-item" v-for="item in messageList" :key="item.id" @click="getMessageDetails(item.id)">
              <p class="item-name">{{ item.name }}</p>
              <p class="item-date-time">
                <span class="">{{ item.date }}</span>&emsp;
              </p>
              <p class="item-badge" v-if="item.status==='EMERGENCY_STATUS_ON'"></p>
            </li>
          </ul>
          <div class="list-more">
            <p @click="openAllMessage">查看更多</p>
          </div>
        </div>
        <empty v-else :message="statusMessage" :current-theme="currentTheme" type="small"/>
      </div>
    </popover>
    <!--  end：消息通知  -->
    <!--  start：消息中心对话框  -->
    <el-dialog :visible.sync="dialogMessage" :modal-append-to-body="false" custom-class="dialog-message" width="900px"
               :modal="false" @open="openDialogMessage" @closed="closedDialogMessage">
      <div class="dialog-title" @click="filterPopoverFlag=false">
        <p class="title-text">消息中心</p>
        <div class="title-search">
          <input type="text" v-model="messageSearchValue" placeholder="输入故障编号或名称">
          <button @click="getMessageCenterList">搜索</button>
        </div>
      </div>
      <div class="dialog-content" @click="filterPopoverFlag=false">
        <div class="content-tabs" ref="contentTabs">
          <div class="tabs-item" v-for="item in messageTabs" :key="item.id" :class="{'active':item.id===currentTab}"
               @click="changeTab(item.id,item.type)" @mouseenter="mouseenterTab($event,item.id)"
               @mouseleave="mouseleaveTab">
            <i></i>
            <p>{{ item.name }}故障</p>
            <span class="item-badge" v-show="item.message">{{ item.message }}</span>
          </div>
          <div class="tabs-slider" ref="dialogTabSlider"></div>
        </div>
        <div class="content-container">
          <div class="content-list" ref="messageList">
            <div class="list-filter">
              <p>消息通知</p>
              <div class="filter-box">
                <i class="filter-btn"
                   @click.stop="showPopover($event,'filterPopover','bottom-start',-79,8,{flag:'filterPopoverFlag'})"></i>
                <div class="filter-item">
                  <el-button type="text" :disabled="disabledLeftArrow" v-show="showScrollArrow"
                             @click="scrollHorizontally('left')"
                             icon="el-icon-arrow-left">
                  </el-button>
                  <div class="item-tag">
                    <div class="tag" ref="itemTags">
                      <el-tag
                          ref="tag"
                          disable-transitions
                          @close="closeFilterTag(tag.type,index,tag.value)"
                          v-for="(tag,index) in filtersItems"
                          :key="index"
                          closable>
                        <template v-if="tag.type==='project'">
                          所属项目：{{ tag.value }}
                        </template>
                        <template v-else-if="tag.type==='robot'">
                          机器人：{{ tag.value }}
                        </template>
                        <template v-else-if="tag.type==='warning'">
                          预警时间：{{ tag.value.start }}至{{ tag.value.end }}
                        </template>
                        <template v-else-if="tag.type==='process'">
                          处理时间：{{ tag.value.start }}至{{ tag.value.end }}
                        </template>
                        <template v-else>
                          {{ tag.value }}
                        </template>
                      </el-tag>
                    </div>
                  </div>
                  <el-button type="text" :disabled="disabledRightArrow" v-show="showScrollArrow"
                             @click="scrollHorizontally('right')"
                             icon="el-icon-arrow-right">
                  </el-button>
                </div>
              </div>
              <div class="filter-operating">
                <p v-show="filtersItems.length" @click="messageFilterClickEmpty(true)">清空筛选</p>
                <!--                <p>批量处理</p>-->
              </div>
            </div>
            <div class="list-box">
              <ul v-show="messageCenterList.length&&!messageCenterListLoading">
                <!--                <li class="list-item" v-for="item in messageCenterList" :key="item.id">-->
                <li class="list-item" v-for="item in messageCenterList" :key="item.id"
                    @click="getMessageDetails(item.id)">
                  <div class="list-title">
                    <p class="title-name">{{ item.name }}</p>
                    <p class="title-level" :style="{'backgroundColor':formatterLevel(item.level)}">{{
                        item.level
                      }}预警</p>
                    <p class="title-date">{{ item.date }}</p>
                  </div>
                  <div class="list-content">{{ item.content }}</div>
                  <p class="list-badge" v-if="item.status==='EMERGENCY_STATUS_ON'"></p>
                </li>
              </ul>
              <empty v-show="!messageCenterList.length&&!messageCenterListLoading" message="暂无消息"
                     :current-theme="currentTheme"/>
              <div v-show="messageCenterListLoading" class="content-skeleton" style="width: 100%;">
                <el-skeleton v-for="item in 3" :key="item" animated/>
              </div>
            </div>
            <div class="list-pagination" v-show="!messageCenterListLoading">
              <el-pagination
                  small
                  hide-on-single-page
                  :current-page.sync="messagePages.currentPage"
                  :page-size="messagePages.pageSize"
                  :total="messagePages.total"
                  :pager-count="5"
                  @current-change="changeMessageCenterListPage"
                  layout="prev, pager, next, jumper, total">
              </el-pagination>
            </div>
          </div>
          <div class="content-details" ref="messageDetails" v-loading="warningDetailsLoading">
            <div class="details-title">
              <i class="el-icon-arrow-left" @click="messageDetailsFlag=false"></i>
              <p class="title-text">{{ messageDetails.title.name }}</p>
              <p class="title-level" :style="{'backgroundColor':formatterLevel(messageDetails.title.level)}">
                {{ messageDetails.title.level }}预警</p>
              <p class="title-date">{{ messageDetails.title.date }}</p>
            </div>
            <div class="details-container">
              <!--      预警信息        -->
              <div class="container-divider">
                <div class="divider-decoration">
                  <i v-for="item in 3" :key=item></i>
                </div>
                <span>预警信息</span>
                <div class="divider-decoration">
                  <i v-for="item in 3" :key=item></i>
                </div>
              </div>
              <div class="container-item">
                <template v-for="(value,key) in messageDetails.info">
                  <template v-if="key==='img'">
                    <div class="se-form-item se-form-img" :key="key">
                      <div v-for="img in value" :key="img.name">
                        <p>{{ img.name }}</p>
                        <el-image
                            style="width: 100%;height: 100%;"
                            :src="`${resourceIp}/${img.value}`"
                            :preview-src-list="[`${resourceIp}/${img.value}`]">
                          <div slot="error" class="img-slot">暂无图片</div>
                        </el-image>
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <div class="se-form-item" :key="key"
                         :class="{'se-form-full':key==='预警信息'||key==='所属项目','se-form-ellipsis--l2':key==='预警信息'}">
                      <p class="se-form__name">{{ key }}</p>
                      <p class="se-form__value">{{ value }}</p>
                    </div>
                  </template>
                </template>
              </div>
              <!--      台账信息        -->
              <template v-if="messageDetails.ledger.台账名称">
                <div class="container-divider">
                  <div class="divider-decoration">
                    <i v-for="item in 3" :key=item></i>
                  </div>
                  <span>台账信息</span>
                  <div class="divider-decoration">
                    <i v-for="item in 3" :key=item></i>
                  </div>
                </div>
                <div class="container-item">
                  <div class="se-form-item" v-for="(value,key) in messageDetails.ledger" :key="key">
                    <p class="se-form__name">{{ key }}</p>
                    <p class="se-form__value">{{ value }}</p>
                  </div>
                </div>
              </template>
              <!--      预警处理        -->
              <div class="container-divider">
                <div class="divider-decoration">
                  <i v-for="item in 3" :key=item></i>
                </div>
                <span>预警处理</span>
                <div class="divider-decoration">
                  <i v-for="item in 3" :key=item></i>
                </div>
              </div>
              <div class="container-item">
                <template v-for="(value,key) in messageDetails.handle">
                  <div v-if="key!=='status'" class="se-form-item"
                       :class="{'se-form-textarea se-form-full':key==='受理内容','se-form-select':key==='处理结果','se-form-select-readonly':messageDetails.handle.status==='EMERGENCY_STATUS_OFF'}"
                       :key="key">
                    <p class="se-form__name">{{ key }}</p>
                    <div class="se-form__input">
                      <i v-for="item in 4" :key="item"></i>
                      <template v-if="key==='处理时间'">
                        <p class="se-form__value not-full">{{ value }}</p>
                      </template>
                      <template v-else-if="key==='处理结果'">
                        <template v-if="messageDetails.handle.status==='EMERGENCY_STATUS_ON'">
                          <el-select v-model="messageDetails.handle.处理结果" placeholder="请选择"
                                     @visible-change="scaleElPopover"
                                     popper-class="chartSelectPopper">
                            <el-option
                                v-for="item in dealResultOption"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value">
                            </el-option>
                          </el-select>
                        </template>
                        <template v-else>
                          <p class="se-form__value">{{ value }}</p>
                        </template>
                      </template>
                      <template v-else-if="key==='受理内容'">
                        <el-input
                            type="textarea"
                            :rows="2"
                            resize="none"
                            :disabled="messageDetails.handle.status==='EMERGENCY_STATUS_OFF'"
                            placeholder="已到现场进行甄别，预警情况已处理。"
                            v-model="messageDetails.handle.受理内容">
                        </el-input>
                      </template>
                    </div>
                  </div>
                </template>
              </div>
              <!--       按钮       -->
              <div class="container-btn" v-if="messageDetails.handle.status==='EMERGENCY_STATUS_ON'">
                <button class="btn-submission" @click="submitWarningHandling">提交</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <popover ref="filterPopover" :visible="filterPopoverFlag">
        <div class="filter-popover" @click.stop>
          <div class="filter-select">
            <p>所属项目</p>
            <el-select v-model="filters.projectValue" filterable
                       placeholder="请选择项目"
                       @change="changeProject"
                       @visible-change="visibleChangeSelect"
                       popper-class="filter-select-option">
              <el-option
                  v-for="item in resetSearchList"
                  :key="item.projectId"
                  :label="item.name"
                  :value="item.projectId">
              </el-option>
            </el-select>
          </div>
          <div class="filter-select" v-if="filters.projectValue&&robotList.length">
            <p>机器人</p>
            <el-select v-model="filters.robotValue" filterable
                       placeholder="请选择机器人"
                       @visible-change="visibleChangeSelect"
                       popper-class="filter-select-option">
              <el-option
                  v-for="item in robotList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id">
              </el-option>
            </el-select>
          </div>
          <div class="filter-checkbox">
            <p>预警类型</p>
            <el-checkbox-group v-model="filters.warningTypeList">
              <el-checkbox v-for="item in warningTypeOptions" :key="item.id" :label="item.name"/>
            </el-checkbox-group>
            <p class="selectAll" @click="checkALlType">
              {{ filters.warningTypeList.length === warningTypeOptions.length ? '取消选择全部' : '选择全部' }}</p>
          </div>
          <div class="filter-radio">
            <p>处理状态</p>
            <el-radio-group v-model="filters.status">
              <el-radio v-for="item in typeOptions" :key="item.id" :label="item.id">{{ item.name }}</el-radio>
            </el-radio-group>
          </div>
          <div class="filter-date">
            <p>预警时间</p>
            <el-date-picker
                v-model="filters.warningDate"
                type="datetimerange"
                popper-class="custom-date-popover"
                unlink-panels
                @focus="focusDateTime"
                :default-value="dateDefaultShow"
                :picker-options="pickerOptions"
                value-format="yyyy-MM-dd HH:mm:ss"
                :editable="false"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期">
            </el-date-picker>
          </div>
          <div class="filter-date">
            <p>处理时间</p>
            <el-date-picker
                v-model="filters.processDate"
                type="datetimerange"
                popper-class="custom-date-popover"
                unlink-panels
                @focus="focusDateTime"
                :default-value="dateDefaultShow"
                :picker-options="pickerOptions"
                value-format="yyyy-MM-dd HH:mm:ss"
                :editable="false"
                :disabled="filters.status===2"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期">
            </el-date-picker>
          </div>
          <div class="filter-operating">
            <el-button type="text" @click="messageFilterClickEmpty">清空</el-button>
            <el-button plain @click="messageFilterClickConfirm">确定</el-button>
          </div>
        </div>
      </popover>
    </el-dialog>
    <!--  end：消息中心对话框  -->
    <!--  start：业务管理  -->
    <popover ref="businessPopover" :visible="businessPopoverFlag" class="business-popover popover">
      <div class="business">
        <el-tree :data="businessTreeData" accordion render-after-expand @node-click="toBusiness"></el-tree>
      </div>
    </popover>
    <!--  end：业务管理  -->
  </div>
</template>
<script>
import topBar from "./topBar";

export default topBar;
</script>
<style scoped lang="scss">
@import "topBar.scss";
</style>
