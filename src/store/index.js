import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        // 用户信息
        userInfo: {},
        // 地区列表
        provinceList: [],
        // 当前主题
        currentTheme: '',
        // 项目信息
        projectInfo: '',
    },
    mutations: {
        /*
        * 储存vuex数据
        * state：库
        * params：对象{variable:变量名,data:数据}
        * */
        setData(state, params) {
            let {variable, data} = params;
            state[variable] = data
        }
    },
    actions: {},
    modules: {}
})
