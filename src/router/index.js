import Vue from 'vue';
import VueRouter from 'vue-router';
import RobotSituation from '@/views/robotSituation/robotSituation.vue';
import loginApi from "@/request/api/login";
import store from '@/store';
import sevnceApi from "@/request/api/sevnce";

Vue.use(VueRouter)

const routes = [
    // 一级页面：全国态势
    {
        path: '/country',//路由地址
        name: 'Country',//路由名称 通过router-link to传参时需要；区分渲染路由
        component: () => import('@/views/countrySituation/countrySituation.vue'),//路由指向的组件文件
        meta: {requiresAuth: true, title: '全国态势'}//元数据 通过$route.meta获取；
    },
    // 二级页面：项目态势
    {
        path: '/',
        name: 'Project',
        component: () => import('@/views/projectSituation/projectSituation.vue'),
        meta: {requiresAuth: true, title: '项目态势'}
    },
    // 三级页面：机器人态势
    {
        path: '/robot/:id',
        name: 'RobotSituation',
        component: RobotSituation,
        meta: {requiresAuth: true, title: '机器人态势'},
    },
    // 三级页面：机器人态势-任务详情
    {
        path: '/taskDetails/:id',
        name: 'TaskDetails',
        component: () => import('@/views/robotSituation/subpage/taskDetails/taskDetails.vue'),
        meta: {requiresAuth: true, title: '巡检任务详情'},
    },
    // 独立页面：登录
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/login/login.vue'),
        meta: {requiresAuth: false, title: '登陆'},
    },
    // 业务管理-巡检管理-巡检任务
    {
        path: '/business/inspection/task',
        name: 'InspectionTask',
        component: () => import('@/views/businessManagement/inspectionManagement/inspectionTask/inspectionTask.vue'),
        meta: {requiresAuth: true, title: '巡检任务'},
    }
]
const router = new VueRouter({
    mode: 'history',
    base: process.env.VUE_APP_PROJECT_PATH,
    routes
})
/*路由守卫*/
router.beforeEach((to, from, next) => {
    console.log(to);
    console.log(from);
    document.title = `${to.meta.title} - 智能机器人巡检平台`;

    let userInfo = localStorage.getItem('userToken');
    // 当访问三级页面且没有传机器人ID时，通过守卫前往登录页面获取该用户下第一个项目下在线当某一个机器人ID
    if ((to.path === '/robot' || to.path === '/robot/') && !to.params.id && !userInfo) {
        next({name: 'Login'});
    } else if ((to.path === '/robot' || to.path === '/robot/') && !to.params.id && userInfo) {
        userInfo = JSON.parse(userInfo)
        let data = {
            method: "selectOnRobotIdList",
            params: [`{'id':'${userInfo.id}'}`],
        }
        sevnceApi.getRbp(data, userInfo.token).then(res => {
            let {mes} = res.result;
            next({
                path: '/robot',
                params: {
                    id: mes
                }
            })
        });
    }

    function toLogin() {
        next({
            name: 'Login', params: {
                path: to.path
            }
        });
    }

    function checkTokenFn(token, callBackFn) {
        return loginApi.checkToken({token}).then(res => {
            let {ok, result} = res;
            if (ok) {
                let userInfo = result;
                userInfo.token = token;
                store.commit('setData', {variable: 'userInfo', data: userInfo});
                if (callBackFn) {
                    callBackFn();
                }
                next();
            } else {
                // Message.error(res.errmsg)
                localStorage.removeItem('userToken');
                toLogin();
            }
        }).catch(err => {
            // Message.error('调用验证token接口失败')
            console.log('调用验证token接口失败：', err);
            localStorage.removeItem('userToken');
            toLogin();
        });
    }

    // 判断前往页面不是登录页且必须验证登录；
    if (to.name !== 'Login' && to.meta.requiresAuth) {
        // 判断是否来自登录页
        if (from.name === 'Login') {
            next();
        } else {
            let {userName, password, token, expirationTime} = to.query;
            if ((userName && password) || (token && expirationTime)) {
                // 判断是否在url中带上了用户名和密码
                if (userName && password) {
                    let {userName, password} = to.query;
                    let data = {
                        userType: '1',// 用户登录类型（1管理用户，2公众用户）
                        loginMode: '0',// 登陆模式（0用户名，1微信公众号，2微信小程序，3QQ，4微信，5微博）
                        loginName: userName,// 用户名
                        password,// 密码
                        client: 'PC',// 客户端：app，微信小程序(wxamp)、微信公众号(wxcms)、PC
                        clientVersion: '0',// 客户端版本号
                        versionCode: '0',// 版本代码
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
                            store.commit('setData', {variable: 'userInfo', data: userInfo});
                            next();
                        } else {
                            // Message.error(res.errmsg);
                            toLogin();
                        }
                    }).catch(err => {
                        console.log('登录失败：', err)
                    });
                }
                // 判断是否在url中带上用户token和token过期时间
                else if (token && expirationTime) {
                    checkTokenFn(token, () => {
                        let userToken = {
                            expirationTime,
                            token,
                        }
                        localStorage.setItem('userToken', JSON.stringify(userToken));
                    });
                } else {
                    toLogin();
                }
            } else {
                let localStorageToken = localStorage.getItem('userToken');
                // 判断是否存在用户token
                if (localStorageToken) {
                    let userToken = JSON.parse(localStorage.getItem('userToken')),
                        token = userToken.token,// 用户token
                        expirationTime = Number(userToken.expirationTime),// 用户过期时间（毫秒时间戳）
                        currentTimestamp = Date.parse(new Date()),// 当前时间戳
                        expirationFlag = currentTimestamp > expirationTime;// token是否过期 true：过期 false：未过期
                    // 判断用户token是否过期
                    if (!expirationFlag) {
                        checkTokenFn(token);
                    } else {
                        // Message.error('登录过期，请重新登录');
                        toLogin();
                    }
                } else {
                    toLogin();
                }
            }
        }
    } else {
        next();
    }
});
export default router;
