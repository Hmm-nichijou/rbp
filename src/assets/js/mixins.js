// 第三方组件：popover.js
import {createPopper} from "@popperjs/core";
// 公共js库
import commonJs from "@/assets/js/common";
// vuex
import store from '../../store'
// 公司接口
import sevnceApi from "@/request/api/sevnce";

const mixins = {
    data() {
        return {
            // 用户token
            token: '',
            // 当前主题
            currentTheme: '',
            // 选项卡激活项
            activeTabs: 1,
            // 面包屑 导航栏
            navbar: [],
            // 面包屑弹出框
            breadcrumbPopoverFlag: false,
            /*
            * 面包屑弹出框dom节点
            * 用于检测鼠标移出面包屑后是否移入弹出框
            * */
            breadcrumbPopoverTarget: '',
            // 面包屑弹出框列表数据
            breadcrumbPopoverData: [],
            // 鼠标移出事件延时器载体
            mouseleaveTimeout: '',
            // 当前鼠标移入面包屑索引
            currentBreadcrumbIndex: '',
            // 全部字典数据
            allDictionary: [],
        }
    },
    mounted() {
        // 获取当前主题
        this.currentTheme = localStorage.getItem('theme');
        // 获取当前用户token
        this.token = store.state.userInfo.token;
        // 页面缩放
        this.setScale();
        // 监听窗口大小变化
        window.addEventListener('resize', () => {
            this.setScale();
            this.scaleElPopover();
        });
        this.getDictInformation();
    },
    destroyed() {
        // 销毁时间定时器
        clearInterval(this.timeInterval);
    },
    methods: {
        // 设置缩放比例-用于屏幕适配
        setScale() {
            this.$nextTick(() => {
                if (this.$refs.scale) {
                    commonJs.transformCompatible.map(i => {
                        this.$refs.scale.style[i] = `scale(${commonJs.getScale()})`;
                    });
                }
            })
        },
        // 缩放所有element组件中的popoverDOM
        scaleElPopover() {
            this.$nextTick(() => {
                // 选择器弹出框DOM节点数组
                let popperDOM = [...document.getElementsByClassName('el-popper')];
                commonJs.transformCompatible.map(i => {
                    if (popperDOM.length) {
                        popperDOM.map(j => {
                            j.style[i] = `scale(${commonJs.getScale()})`;
                        });
                    }
                });
            });
        },
        /*
        * 显示弹出框
        * event：浏览器默认事件-用于获取当前dom节点
        * ref：this.$refs-用于获取弹出框dom节点
        * placement：弹出框放置位置-参考popover.js文档
        * x：x轴偏移-默认0
        * y：y轴偏移-默认8
        * params：其他参数-弹出框不同，带的额外参数不同-默认为null
        * */
        showPopover(event, ref, placement, x, y, params) {
            if (ref === 'themePopover') {
                this[params.flag] = !this[params.flag];
            } else {
                this[params.flag] = true;
            }
            let element = event.target,
                popoverDom = this.$refs[ref].$el;
            // 类似原生title的弹出框
            if (ref === 'titlePopover') {
                popoverDom.innerHTML = element.dataset.text;
            }
            // 面包屑弹出框
            else if (ref === 'breadcrumbPopover') {
                let {index} = params,
                    {provinceList} = this.$store.state;
                this.currentBreadcrumbIndex = index;
                if (index) {
                    switch (index) {
                        case 1: {
                            this.breadcrumbPopoverData = provinceList;
                            break;
                        }
                        case 2: {
                            provinceList.map(i => {
                                if (i.name === this.navbar[1].name) {
                                    this.breadcrumbPopoverData = i.projects;
                                }
                            })
                            break;
                        }
                        case 3: {
                            if (this.robotList.length) {
                                this.breadcrumbPopoverData = this.robotList;
                            } else {
                                this.breadcrumbPopoverData = [{
                                    name: '暂无机器人列表'
                                }]
                            }
                            break;
                        }
                    }
                }
            }
            if (this.mouseleaveTimeout) {
                clearInterval(this.mouseleaveTimeout);
            }
            // 根据当前dom节点和弹出框dom节点创建弹出框
            createPopper(element, popoverDom, {
                placement,
                modifiers: [
                    {
                        name: 'offset',
                        options: {
                            offset: [x, y],
                        },
                    },
                ],
            });
        },
        /*
        * 组件事件：鼠标移入组件时；将组件dom节点数据储存；保持弹出框的显示
        * target：this中的变量；判断鼠标是否在弹出框内
        * value：组件返回的节点popover信息
        * */
        setPopperTarget(target, value) {
            this[target] = value;
        },
        /*
        * 组件事件：鼠标移出时；将弹出框隐藏；并清空弹出框dom节点数据
        * flag：this中的变量；控制popover的显示/隐藏
        * target：this中的变量；判断鼠标是否在弹出框内
        * */
        hidePopover(flag, target) {
            if (this.mouseleaveTimeout) {
                clearInterval(this.mouseleaveTimeout);
            }
            this.mouseleaveTimeout = setTimeout(() => {
                this[flag] = false;
            }, 200);
            this[target] = '';
        },
        // 隐藏所有弹出框
        hideAllPopover() {
            this.$refs.topBar.searchPopoverFlag = false;
            this.$refs.topBar.themePopoverFlag = false;
            this.$refs.topBar.messagePopoverFlag = false;
            this.$refs.topBar.businessPopoverFlag = false;
            this.allStatusFlag = false;
            this.allEnvironmentFlag = false;
        },
        // 改变面包屑
        changeBreadcrumbValue(item, index) {
            if (index) {
                this.currentBreadcrumbIndex = index;
            }
            let {currentBreadcrumbIndex} = this;
            switch (currentBreadcrumbIndex) {
                // case 1: {
                //     this.$router.push({
                //         path: '/',
                //         query: {
                //             areaId: item.code
                //         }
                //     });
                //     break;
                // }
                // case 2: {
                //     this.$router.push({
                //         path: '/',
                //         query: {
                //             projectId: item.sysPorjectId
                //         }
                //     });
                //     break;
                // }
                case 3: {
                    let {id: currentId} = this.robotInfo,
                        {id: changeId} = item;
                    if (currentId !== changeId) {
                        this.$router.push({
                            path: `/robot/${changeId}`
                        });
                    }
                }
            }
            this.breadcrumbPopoverFlag = false;
        },
        // 格式化预警次数并设置类名
        formatWarningFrequency(warningFrequency) {
            if (warningFrequency > 0 && warningFrequency < 10) {
                return 'warning';
            } else if (warningFrequency >= 10) {
                return 'error';
            }
        },
        // 获取环境信息
        getWeather(params, isSwitch = false) {
            let data = {
                method: 'getWeatherInfo',
                params,
            }
            sevnceApi.getRbp(data, this.token).then(res => {
                console.log('天气', res)
                let {humidity, pressure, rainfall, temperature, wind_direction, wind_speed} = res.result.mes,
                    variable = isSwitch ? this.allEnvironment[0] : this.currentEnvironment;
                variable.温度 = temperature;
                variable.湿度 = humidity;
                variable.风速 = wind_speed;
                variable.风向 = wind_direction;
                variable.气压 = Number(pressure).toFixed(1);
                if (isSwitch) {
                    this.allEnvironment[2].降水 = rainfall;
                    if (this.switchEnvironmentInterval) {
                        clearInterval(this.switchEnvironmentInterval);
                    }
                    this.switchEnvironmentInterval = setInterval(() => {
                        this.currentEnvironmentIndex++;
                        if (this.currentEnvironmentIndex > this.allEnvironment.length - 1) {
                            this.currentEnvironmentIndex = 0
                        }
                        this.currentEnvironment = this.allEnvironment[this.currentEnvironmentIndex];
                    }, 10000);
                    this.currentEnvironment = this.allEnvironment[0];
                }
            }).catch(() => {
                // this.$message.error('获取环境信息失败')
            })
        },
        // 格式化省名称
        formatterProvinceName(name) {
            if (name.indexOf('新疆') !== -1) {
                return '新疆'
            } else if (name.indexOf('内蒙') !== -1) {
                return '内蒙'
            } else if (name.indexOf('宁夏') !== -1) {
                return '宁夏'
            } else if (name.indexOf('广西') !== -1) {
                return '广西'
            } else if (name === '中华人民共和国') {
                return '全国'
            } else {
                return name.replace(/(省|市|自治区|自治州|县|区|特别行政区)/g, '');// 省/市名称
            }
        },
        // 获取字典对应翻译
        getDictInformation() {
            let params = {
                    typeList: ['EMERGENCY_RESULT', 'EMERGENCY_STATUS', 'WARN_LEVEL', 'PATROL_TASK_STATUS', 'TASK_EXECUTE_TYPE', 'TASK_EXECUTE_UNIT', 'PATROL_TASK_TAKE_EFFECT']
                },
                data = {
                    method: "selectDictByType",
                    params: [JSON.stringify(params)]
                };
            sevnceApi.getRbp(data, this.token).then(res => {
                let {mes} = res.result;
                mes.map(i => {
                    this.allDictionary.push({
                        label: i.label,
                        value: i.value
                    });
                });
            });
        },
        // 翻译字段
        translationKey(key) {
            if (!this.allDictionary.length) {
                return key;
            }
            let value = '';
            this.allDictionary.map(i => {
                if (i.value === key) {
                    value = i.label;
                }
            });
            return value;
        },
        // 格式化后端返回的机器人状态
        formatterRobotStatus(status) {
            switch (status) {
                case 'robotOffLine': {
                    return 'off-line'
                }
                case 'faultRobot': {
                    return 'fault'
                }
                case 'chargingRobot': {
                    return 'charging'
                }
                case 'patrolRobot': {
                    return 'on-line'
                }
                case 'standbyRobot': {
                    return 'standby'
                }
                case 'meetRobot': {
                    return 'meet'
                }
            }
        }
    },
    // 向各个子级提供数据/方法
    provide() {
        return {
            all: this
        }
    },
    watch: {
        // 监听是否存在popover节点
        breadcrumbPopoverTarget() {
            clearInterval(this.mouseleaveTimeout);
            this.breadcrumbPopoverFlag = true;
            this.breadcrumbPopoverTarget = '';
        },
    },
    filters: {
        /*
        * 根据预警数加载图标
        * warningFrequency：预警数
        * */
        filterBacktrackingItemClass(warningFrequency) {
            if (warningFrequency > 0 && warningFrequency < 10) {
                return 'warning';
            } else if (warningFrequency >= 10) {
                return 'error';
            } else if (warningFrequency === 0) {
                return '';
            }
        },
        /*
        * 格式化机器人信息中value值
        * value：robotInfo中value值
        * */
        filterRobotStatusName(status) {
            switch (status) {
                case 'fault': {
                    return '有故障';
                }
                case 'on-line': {
                    return '巡检中';
                }
                case 'off-line': {
                    return '已离线';
                }
                case 'charging': {
                    return '充电中';
                }
                case 'standby': {
                    return '待机中';
                }
                case 'meet': {
                    return '遇障'
                }
                case 'all': {
                    return '全部'
                }
            }
        },
        /*
        * 设置中部板块背景图
        * bgImg：背景图名称
        * value：数值
        * */
        filterCenterItemBgImg(bgImg, value, unit, currentTheme) {
            if (currentTheme === 'default' || currentTheme === 'prime') {
                if (bgImg === 'robot' || bgImg === 'days' || bgImg === 'warning' || bgImg === 'list' || unit !== '%') {
                    return {backgroundImage: 'url(' + require(`../../assets/images/theme/${currentTheme}/common/bg-center-${bgImg}.png`) + ')'};
                } else {
                    if (value < 90) {
                        return {backgroundImage: 'url(' + require(`../../assets/images/theme/${currentTheme}/projectSituation/bg-center-${bgImg}-warning.png`) + ')'};
                    } else {
                        return {backgroundImage: 'url(' + require(`../../assets/images/theme/${currentTheme}/projectSituation/bg-center-${bgImg}-success.png`) + ')'};
                    }
                }
            }
        },
    }
}
export default mixins;