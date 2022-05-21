import loginApi from "@/request/api/login";
import sevnceApi from "@/request/api/sevnce";

export default {
    name: 'Login',
    data() {
        return {
            loginForm: {
                userName: '',
                password: '',
            },// 登录表单
            loginRules: {
                userName: [
                    {required: true, message: '请输入用户名', trigger: 'blur'},
                ],
                password: [
                    {required: true, message: '请输入密码', trigger: 'blur'},
                ],
            },// 登录验证
            showPassword: false,// 是否显示密码
            isAutoLogin: false,// 是否自动登录
            options: [
                {
                    label: '三天内自动登录',
                    value: 3
                },
                {
                    label: '一周内自动登录',
                    value: 7
                },
                {
                    label: '一个月内自动登录',
                    value: 30
                },
            ],// 自动登录选项
            autoLoginValue: 3,// 自动登录项
            themeList: [
                {
                    id: 1,
                    name: '迎风远眺',
                    type: 'picture'
                },
                {
                    id: 2,
                    name: '工业氤氲',
                    type: 'picture'
                },
                {
                    id: 3,
                    name: '夕阳霞光',
                    type: 'picture'
                },
                {
                    id: 4,
                    name: '凌云之曦',
                    type: 'video'
                },
                {
                    id: 5,
                    name: '智能时代',
                    type: 'video'
                },
            ],// 主题背景列表
            currentTheme: '',// 当前主题背景id
            showThemeFlag: false,// 显示/隐藏选择主题背景
            logging: false,// 登陆中
            userNameErrorText: '',
            passwordErrorText: '',
        }
    },
    mounted() {
        this.setLoginBg();
    },
    methods: {
        // 设置登录主题背景
        setLoginBg() {
            let item = JSON.parse(localStorage.getItem('loginTheme'));
            this.setTheme(item);
        },
        // 显示密码
        showPsw() {
            this.showPassword = !this.showPassword;
            setTimeout(() => {
                this.$refs.passwordInput.focus();
            }, 50);
        },
        // 登录
        login() {
            this.$refs.loginForm.validate(valid => {
                if (valid) {
                    this.logging = true;
                    this.userNameErrorText = '';// 重置用户名错误信息
                    this.passwordErrorText = '';// 重置密码错误信息
                    let {userName, password} = this.loginForm,
                        {autoLoginValue, isAutoLogin} = this,
                        data = {
                            userType: '1',// 用户登录类型（1管理用户，2公众用户）
                            loginMode: '0',// 登陆模式（0用户名，1微信公众号，2微信小程序，3QQ，4微信，5微博）
                            loginName: userName,// 用户名
                            password,// 密码
                            client: 'PC',// 客户端：app，微信小程序(wxamp)、微信公众号(wxcms)、PC
                            clientVersion: '0',// 客户端版本号
                            versionCode: '0',// 版本代码
                        };
                    if (isAutoLogin) {
                        data.validTime = autoLoginValue * 24 * 60;// 计算分钟数
                    }
                    loginApi.login(data).then(res => {
                        let {ok} = res;
                        if (ok) {
                            let {token, userInfo} = res.result,
                                userToken = {
                                    token,
                                    id: userInfo.id,
                                    expirationTime: userInfo.expirationTime
                                };
                            localStorage.removeItem('userToken');
                            localStorage.setItem('userToken', JSON.stringify(userToken));// 储存用户token
                            userInfo.token = token;
                            this.$store.commit('setData', {variable: 'userInfo', data: userInfo});
                            // 登录成功 跳转页面
                            let {path} = this.$route.params;
                            // 默认前往三级页面并判断有没有带机器人ID参数
                            if (!path) {
                                let data = {
                                    method: "selectOnRobotIdList",
                                    params: [`{'id':'${userInfo.id}'}`],
                                }
                                sevnceApi.getRbp(data, token).then(res => {
                                    let {mes} = res.result;
                                    path = `/robot/${mes}`;
                                    this.$message({
                                        type: 'success',
                                        message: '登录成功'
                                    });
                                    this.$router.push({path});
                                }).finally(() => {
                                    this.logging = false;
                                });
                            } else {
                                this.logging = false;
                                this.$message({
                                    type: 'success',
                                    message: '登录成功'
                                })
                                this.$router.push({path});
                            }
                        } else {
                            this.logging = false;
                            if (res.errcode === 'JWT_USERNAME_NOTEXIST') {
                                this.userNameErrorText = res.errmsg;
                                this.$refs.userNameInput.focus();
                            } else if (res.errcode === 'JWT_PWD_ERROR') {
                                this.passwordErrorText = res.errmsg;
                                this.$refs.passwordInput.focus();
                            }
                        }
                    }).catch(err => {
                        this.logging = false;
                        console.log('登录失败：', err);
                        // this.$message.error('登录失败')
                    });
                } else {
                    return false;
                }
            });
        },
        /*
        * 切换主题背景
        * id：主题背景id
        * */
        changeTheme(item) {
            let {id} = item;
            if (this.currentTheme.id !== id) {
                localStorage.setItem('loginTheme', JSON.stringify(item));
                this.setTheme(item);
            }
        },
        // 统一设置主题背景
        setTheme(item) {
            if (item) {
                let {id, type} = item;
                this.currentTheme = item;
                if (type === 'picture') {
                    this.$refs.login.style.backgroundImage = `url(${require(`@/assets/images/theme/login/theme-bg-${id}.jpg`)})`;
                } else {
                    this.$refs.login.style.backgroundImage = '';
                }
            } else {
                this.currentTheme = {
                    id: 5,
                    name: '智能时代',
                    type: 'video'
                }
            }
        },
        // 改变选择器选项
        changeAutoLoginOption() {
            this.isAutoLogin = true;
        },
        // 切换显示/隐藏主题选择弹出框
        toggleTheme() {
            this.showThemeFlag = !this.showThemeFlag;
        },
    },
    watch: {
        showThemeFlag(newVlaue) {
            if (newVlaue) {
                let height = this.$refs.theme.clientHeight,
                    bottom = height - 54;
                this.$refs.theme.style.bottom = `-${bottom}px`;
            } else {
                this.$refs.theme.style.bottom = 0;
            }
        },
    }
}
