<template>
  <div class="login" ref="login" @click="showThemeFlag=false">
    <video v-if="currentTheme.type==='video'" class="login-video" autoplay loop muted
           :src="require(`@/assets/video/${currentTheme.id===4?'factory':'robot'}.mp4`)"></video>
    <div @click.stop class="login-box">
      <div class="login-panel">
        <p class="login-panel-title">统一认证平台</p>
        <el-form :model="loginForm" :rules="loginRules" ref="loginForm" class="panel-form" @keyup.enter.native="login">
          <el-form-item prop="userName" :error="userNameErrorText">
            <div class="form-item">
              <el-input ref="userNameInput" placeholder="用户名" v-model="loginForm.userName">
                <i slot="prefix" class="input-icon icon-userName"></i>
              </el-input>
            </div>
          </el-form-item>
          <el-form-item prop="password" :error="passwordErrorText">
            <div class="form-item">
              <el-input placeholder="密码"
                        :type="showPassword?'text':'password'"
                        v-model="loginForm.password"
                        ref="passwordInput">
                <i slot="prefix" class="input-icon icon-password"></i>
                <i slot="suffix" ref="eye" @click="showPsw"
                   :class="[showPassword?'show':'','input-eye']"></i>
              </el-input>
            </div>
          </el-form-item>
          <el-form-item class="form-operating">
            <el-checkbox v-model="isAutoLogin"></el-checkbox>
            <el-select v-model="autoLoginValue" placeholder="自动登录期限" @change="changeAutoLoginOption">
              <el-option
                  v-for="item in options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
              </el-option>
            </el-select>
            <i class="icon-theme" :class="{'active':showThemeFlag}" @click="toggleTheme"></i>
          </el-form-item>
          <el-form-item>
            <el-button class="btn btn-login" type="primary" @click="login" :loading="logging">登&emsp;&emsp;录</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div ref="theme" class="login-select-theme">
        <div class="theme-item" :class="{'active':currentTheme.id===item.id}" v-for="item in themeList" :key="item.id"
             @click="changeTheme(item)">
          <img :src="require(`@/assets/images/theme/login/theme-bg-${item.id}.jpg`)" alt="">
          <p>{{ item.name }}</p>
          <div class="theme-tag">{{ item.type === 'video' ? '视频' : '图片' }}</div>
        </div>
      </div>
    </div>
    <footer class="login-footer">
      <img class="footer-logo" src="~@/assets/images/login/icon-logo.png" alt="七腾logo">
      <div class="footer-copyright">
        <p>版权所有：七腾科技有限公司&ensp;邮箱：service@sevnce.com</p>
        <p>联系电话：（023）62484059&ensp;（023）62319683</p>
        <p class="footer-beian">
          <span>渝ICP备11006432号</span>&ensp;
          <span>
          <img src="~@/assets/images/login/gong-an-bei-an.png" alt="">
          <a
              href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=50010802002707" target="_blank">渝公网安备 50010802002707号</a>
        </span>
        </p>
      </div>
    </footer>
  </div>
</template>
<script>
import login from "./login.js";

export default login;
</script>
<style scoped lang="scss">
@import "login.scss";
</style>
