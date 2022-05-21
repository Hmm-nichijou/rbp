// 日期插件
import moment from "moment";
// 组件：弹出框
import popover from "@/components/popover/popover.vue";
// 组件：全局顶栏：搜索框、刷新、全屏、用户信息、通知消息、主题、设置
import topBar from '@/components/topBar/topBar.vue';
// 组件：顶部logo
import logo from "@/components/logo/logo.vue";
// 组件：格式化机器人状态
import info from "./components/info/info.vue";
// 组件：标题
import myTitle from "@/components/title/title.vue";
// 组件：任务回溯
import backtrack from "./components/backtrack/backtrack.vue";
// 组件：空状态
import empty from "@/components/empty/empty.vue";
// 组件：气体数据
import gas from "./components/gas/gas.vue";
// 组件：拍照数据
import myMeter from "./components/meter/meter.vue";
import meterForBacktracking from "./components/meterForBacktracking/meterForBacktracking.vue";
// 组件：环境数据
import environment from "./components/environment/environment.vue";
// 地图接口
import mapApi from "@/request/api/map";
import 'ol/ol.css';
import {Map, View} from 'ol';
import Projection from 'ol/proj/Projection';
import Feature from 'ol/Feature';
import GeoJSON from 'ol/format/GeoJSON';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import SrcXYZ from 'ol/source/XYZ';
import {Vector as VectorSource} from 'ol/source';
import {defaults as InteractionDefaults, DragRotateAndZoom} from 'ol/interaction';
import {Fill, Icon, Stroke, Style, Text} from 'ol/style';
import Point from 'ol/geom/Point';
import {LineString} from "ol/geom";
// 公司接口
import sevnceApi from "@/request/api/sevnce";
// 公共js库
import commonJs from "@/assets/js/common";
// 西瓜视频flv插件
import FlvJsPlayer from "xgplayer-flv.js";
// mixin
import mixins from "@/assets/js/mixins";

export default {
    name: 'RobotSituation',
    mixins: [mixins],
    data() {
        return {
            // 机器人信息
            robotInfo: {
                // 机器人id
                id: '',
                // 状态 fault：有故障 on-line：巡检中 off-line：已离线 charging：充电中 standby：待机中
                condition: 'off-line',
                // 电量
                battery: '',
                // 信号
                signal: '5/5',
                // 速度
                speed: '',
                // 机器人麦克风状态 0：禁用 1：开启 2：关闭
                microphoneStatus: '2',
                // 机器人扬声器状态 0：禁用 1：开启 2：关闭
                speakerStatus: '2',
            },
            // 当前展示状态
            currentStatus: {
                '机器人编号': '',
                '当前电量': '',
                '行进速度': '',
                '导航状态': '',
                // '自检状态': '',
                '本次运行时长': '',
            },
            // 是否展示全部状态
            allStatusFlag: false,
            // 机器人全部状态
            allStatus: [
                {
                    '机器人编号': '',
                    '当前电量': '',
                    '行进速度': '',
                    '导航状态': '',
                    // '自检状态': '',
                    '本次运行时长': '',
                },
                {
                    '前防撞条': '',
                    '后防撞条': '',
                    '总里程': '',
                    '急停': ''
                    // '云台状态': '',
                    // '高清摄像头': '',
                    // '红外摄像头': '',
                    // '接近开关': '',
                },
                // {
                //     '机器人编号': '',
                //     '当前电量': '',
                //     '行进速度': '',
                //     '导航状态': '',
                //     '自检状态': '',
                // },
                // {
                //     '本次运行时长': '',
                //     '云台状态': '',
                //     '高清摄像头': '',
                //     '红外摄像头': '',
                //     '接近开关': '',
                // },
                // {
                //     '气体传感器': '',
                //     '导航服务器': '',
                //     '前防撞条': '',
                //     '后防撞条': '',
                //     '扬声器': '',
                // },
                // {
                //     '拾音器': '',
                //     // '回复公共机': '',
                //     // '下位机连接': '',
                //     '激光雷达': '',
                //     '总里程': '',
                //     '电源管理系统': '',
                //     '路由器': '',
                // },
                // {'急停': ''}
            ],
            // 当前展示状态索引
            currentStatusIndex: 0,
            // 切换当前展示状态定时器载体
            switchStatusInterval: '',
            // 当前展示环境信息
            currentEnvironment: {
                '温度': '',
                '湿度': '',
                '风速': '',
                '风向': '',
                '气压': '',
            },
            // 是否展示全部环境状态
            allEnvironmentFlag: false,
            // 全部环境状态
            allEnvironment: [
                {
                    '温度': '',
                    '湿度': '',
                    '风速': '',
                    '风向': '',
                    '气压': '',
                },
                {
                    '输入电流': '',
                    '输出电压': '',
                    '充电频率': '',
                    '充电房温度': '',
                    '充电桩': ''
                },
                {
                    '降水': '',
                    '充电房': '',
                    '输入电压': '',
                    '充电房房门': ''
                }
            ],
            // 当前展示环境索引
            currentEnvironmentIndex: 0,
            // 切换当前展示环境定时器载体
            switchEnvironmentInterval: '',
            // 当前日期
            currentDate: '',
            // 面包屑选项卡
            tabs: [
                {
                    id: 1,
                    name: '当前任务'
                },
                {
                    id: 2,
                    name: '任务回溯'
                }
            ],
            // 当前公司项目下所有机器人列表
            robotList: [],
            // 当前星期
            currentWeek: '',
            // 当前任务信息
            currentTask: {
                // 是否告警
                warning: false,
                // 日期
                date: '',
                // 任务名称
                name: '',
                // 巡检点名称
                pointName: '',
                // 巡检项名称
                itemsName: '',
                // 当前巡检点
                currentPoint: '',
                // 全部巡检点
                totalPoint: '',
                // 当前巡检项
                currentItems: '',
                // 巡检项
                totalItems: '',
                // 起止时间
                // startAndEndTime: '09:00-12:30',
                // 预计时长
                // estimatedDuration: '210min (3.5h)',
            },
            // 下一任务信息
            nextTask: {},
            // 当前识别
            currentDiscern: '',
            // 温度和湿度数据
            TAHData: [
                {
                    name: '温度',
                    flag: false,
                    value: -102.3,
                    unit: '℃'
                },
                {
                    name: '湿度',
                    flag: false,
                    value: -52.6,
                    unit: '%rh'
                }
            ],
            // 各项气体数据
            gasData: [
                {
                    // 气体名称
                    name: 'O2',
                    // 当前是否识别
                    flag: false,
                    // 当前识别值
                    value: 0,
                    // 单位
                    unit: '%Vol',
                    // 一级预警
                    level1: '',
                    // 二级预警
                    level2: '',
                    // 三级预警
                    level3: '',
                },
                {
                    name: 'CO',
                    flag: false,
                    value: 0,
                    unit: 'ppm',
                    level1: '',
                    level2: '',
                    level3: '',
                },
                {
                    name: 'H2S',
                    flag: false,
                    value: 20.58,
                    unit: 'ppm',
                    level1: '',
                    level2: '',
                    level3: '',
                },
                {
                    name: 'EX',
                    flag: false,
                    value: 0,
                    unit: '%LEL',
                    level1: '',
                    level2: '',
                    level3: '',
                },
            ],
            // 告警信息
            warningData: [],
            // 是否title弹出框
            titlePopoverFlag: false,
            // 日期选择器配置
            pickerOptions: {
                shortcuts: [
                    {
                        text: '最近三天',
                        onClick(picker) {
                            let end = new Date(), start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 3);
                            picker.$emit('pick', [start, end]);
                        }
                    },
                    {
                        text: '最近一周',
                        onClick(picker) {
                            let end = new Date(), start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                            picker.$emit('pick', [start, end]);
                        }
                    },
                    {
                        text: '最近一个月',
                        onClick(picker) {
                            const end = new Date(), start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                            picker.$emit('pick', [start, end]);
                        }
                    }
                ],// 快捷日期
                disabledDate(time) {
                    return time.getTime() > Date.now(); //今天之后禁用
                }
            },
            // 日期选择器默认值，默认为上一月
            dateDefaultShow: '',
            // 地图接口ip地址
            ip: `https://${process.env.VUE_APP_BASE_URL}/RBPWEB`,
            // 图片资源ip地址
            resourceIp: `http://${process.env.VUE_APP_FTP_URL ? process.env.VUE_APP_FTP_URL : process.env.VUE_APP_OTHER_URL}/ftp`,
            // 地图载体
            map: '',
            // VectorSource载体
            robotSrc: '',
            // websocket载体
            websocket: '',
            // websocket载体是否重连中
            reconnectionFlag: false,
            // 萤石视频token
            Ys7Token: '',
            // 巡检点是否正在执行
            executingPointTask: false,
            // 巡检项是否正在执行
            executingItemsTask: false,
            // 当前巡检项拍照数据
            currentItemsData: {},
            // 是否已经重新定位到机器人
            initRobotLocation: false,
            // 机器人扬声器载体
            robotSpeaker: '',
            // 机器人麦克风服务参数
            microphoneOptions: {
                // webSocket服务载体
                ws: '',
                // 多媒体对象，用来处理音频
                record: '',
                // 定时器
                timeInterval: '',
            },
            // 镜头是否启用机器人跟随-需要机器人在巡检中
            isLocation: true,
            // 视频清晰度
            videoQuality: [
                {
                    id: 'SD',
                    name: '标清'
                },
                {
                    id: 'HD',
                    name: '高清'
                }
            ],
            // 可见光当前清晰度
            defaultVideoQuality: 'SD',
            // 红外线当前清晰度
            infraredVideoQuality: 'HD',
            // 识别视频延时器载体 10s
            discernVideoTimeOut: '',
            // 预警信息¬列表
            warningList: [],
            // 预警信息-总数
            warningListCount: 0,
            // 预警信息对话框
            dialogWarning: false,
            // 预警信息对话框-搜索内容
            warningSearchValue: '',
            // 是否显示筛选项左右滚动箭头
            showScrollArrow: false,
            // 是否禁用左边箭头
            disabledLeftArrow: true,
            // 是否禁用右边箭头
            disabledRightArrow: false,
            // 预警信息对话框筛选
            filterPopoverFlag: false,
            // 筛选项X轴偏移值
            offsetX: 0,
            // 所有tag宽度
            allTagWidth: 0,
            // 预警信息对话框筛选条件参数
            filters: {
                // 预警类别
                category: [],
                // 预警类型
                type: '',
                // 预警标题
                title: '',
                // 预警源
                source: '',
                // 处理状态 0：全部 1：已处理 2：待处理 3：系统自动处理
                status: 0,
                // 预警日期
                warningDate: [],
                // 处理日期
                processDate: [],
                // 预警等级
                level: [],
                // 处理人
                personnel: '',
                // 处理结果 0：全部 1：忽略 2：受理
                result: 0,
            },
            // 预警信息对话框确定筛选项后的筛选项列表
            filtersItems: [],
            // 预警信息对话框筛选-预警类别
            warningCategoryOptions: [
                {
                    id: 1,
                    name: '业务预警',
                },
                {
                    id: 2,
                    name: '机器人预警',
                },
                {
                    id: 3,
                    name: '附属设施预警',
                },
            ],
            // 预警信息对话框筛选-预警类型
            warningTypeOptions: [],
            // 预警信息对话框筛选-预警等级
            warningLevelOptions: [
                {
                    id: 1,
                    name: '一级'
                },
                {
                    id: 2,
                    name: '二级'
                },
                {
                    id: 3,
                    name: '三级'
                },
            ],
            // 预警信息对话框筛选-预警处理状态
            warningStatusOptions: [
                {
                    id: 0,
                    name: '全部'
                },
                {
                    id: 1,
                    name: '已处理'
                },
                {
                    id: 2,
                    name: '未处理'
                },
                {
                    id: 3,
                    name: '系统自动处理'
                },
            ],
            // 预警信息对话框筛选-预警处理结果
            warningResultOptions: [
                {
                    id: 0,
                    name: '全部'
                },
                {
                    id: 1,
                    name: '忽略'
                },
                {
                    id: 2,
                    name: '受理'
                }
            ],
            // 预警信息中心分页
            warningPages: {
                currentPage: 1,
                pageSize: 4,
                total: 0
            },
            // 预警信息中心数据列表
            warningCenterList: [],
            // 预警信息中心数据加载骨架
            warningCenterListLoading: false,
            // 预警信息中心数据当前查看数据
            warningCenterDetails: '',
            // 云台控制
            cloudControlFlag: false,
            // 云台参数
            cloudParams: {
                // 转速
                turnSpeed: 15,
                // 变倍
                magnification: '',
                // 聚焦
                focus: '',
                // 补光灯
                fillLight: 0,
                // 雨刷
                wiper: false,
                // 透雾
                penetration: false,
                // 防冻
                antifreeze: false,
                // 卷帘门
                door: false,
                // 充电桩
                chargingPile: false,
                // 风扇
                fan: false,
                // 照明灯
                lightingLamp: false,
                // 加热器
                heater: false,
                // 空调
                airConditioning: false,
            },
            // 控制面板-辅助功能项
            auxiliaryOptions: [
                {
                    // 标题名称
                    name: '补光灯',
                    // 对应 cloudParams 中变量名称
                    paramsName: 'fillLight',
                    // 请求参数 serviceName 名称
                    serviceName: 'setLamp'
                },
                {
                    name: '雨刷',
                    paramsName: 'wiper',
                    serviceName: 'setRainClear'
                },
                {
                    name: '透雾',
                    paramsName: 'penetration',
                    serviceName: 'setDenseFog'
                },
                {
                    name: '防冻',
                    paramsName: 'antifreeze',
                    serviceName: 'setAntifreeze'
                },
            ],
            // 控制面板-充电房控制项
            chargingRoomOptions: [
                {
                    // 标题名称
                    name: '卷帘门',
                    // 对应 cloudParams 中变量名称
                    paramsName: 'door',
                    // 请求参数 serviceName 名称
                    serviceName: 'chargeRoomControl'
                },
                {
                    name: '充电桩',
                    paramsName: 'chargingPile',
                    serviceName: 'deviceControl',
                    // 请求参数 serviceParams 中type值
                    type: 'CHARGING_PILE'
                },
                {
                    name: '风扇',
                    paramsName: 'fan',
                    serviceName: 'deviceControl',
                    type: 'FANS'
                },
                {
                    name: '照明灯',
                    paramsName: 'lightingLamp',
                    serviceName: 'deviceControl',
                    type: 'LIGHT'
                },
                {
                    name: '加热器',
                    paramsName: 'heater',
                    serviceName: 'deviceControl',
                    type: 'HEATER'
                },
                {
                    name: '空调',
                    paramsName: 'airConditioning',
                    serviceName: 'deviceControl',
                    type: 'AIR_CONDITIONING'
                },
            ],
            // 云台控制-辅助功能-补光灯选项
            fillLightOptions: [
                {
                    id: 0,
                    name: '关闭',
                    value: 'close'
                },
                {
                    id: 1,
                    name: '低亮',
                    value: 'low'
                },
                {
                    id: 2,
                    name: '中亮',
                    value: 'middle'
                },
                {
                    id: 3,
                    name: '高亮',
                    value: 'high'
                },
            ],
            // 路网点位数据
            pointList: [],
            // 路网点位渲染数据
            featurePointList: [],
            // 上一个点位
            lastPoint: '',
            // 心跳轮询定时器载体
            heartbeatInterval: '',
            // 是否处于回溯
            backtracking: false,
            // 储存机器人features
            robotFeature: '',
            // 当前地图上的所有点位
            currentPointFeatureList: [],
            // 回溯中的点位数据
            backtrackingPoints: [],
            // 查看当前点击的巡检点的巡检项
            inspectionItemsFlag: false,
            // 回溯中-点击巡检点获取到的巡检项数据
            inspectionItemsDataForBacktracking: [],
            // 回溯中-点击巡检任务/巡检点获取的预警信息数据
            inspectionWarningDataForBacktracking: [],
            // 回溯中-点击巡检任务/巡检点获取的预警信息总条数
            inspectionWarningCountForBacktracking: 0,
            // 回溯中-巡检项激活tab
            inspectionItemsActiveTab: 'all',
            // 巡检点筛选框-展开/收起筛选框
            pointFilterBoxFlag: true,
            // 巡检点筛选框-显示/隐藏所有巡检点
            pointVisibleFlag: true,
            // 巡检点筛选框-筛选项
            pointFilters: [
                {
                    type: 'situation',
                    label: '按完成情况',
                    filters: [
                        {
                            label: '充电房',
                            value: 'chargingRoom',
                            icon: 'icon-chargingRoom'
                        },
                        {
                            label: '已完成',
                            value: 'FINISHED',
                            icon: 'icon-complete'
                        },
                        {
                            label: '中断',
                            value: 'STOPPED',
                            icon: 'icon-point'
                        },
                        {
                            label: '预警点',
                            value: 'emergencyPoint',
                            icon: 'icon-error'
                        },
                    ]
                },
                {
                    type: 'ability',
                    label: '按能力',
                    filters: [
                        {
                            label: '气体识别',
                            value: 'ROBOT_ABILITY_TYPE_GASS'
                        },
                        {
                            label: '环境识别',
                            value: 'ROBOT_ABILITY_TYPE_ENVIR'
                        },
                        {
                            label: '表计识别',
                            value: 'ROBOT_ABILITY_TYPE_METER'
                        },
                    ]
                }
            ],
            // 巡检点筛选框-当前选中筛选项（充电房、预警点单独传参）
            pointFilterItems: {
                chargingRoom: 'charge',
                emergencyPoint: 'emergencyPoint',
                statusList: ['FINISHED', 'STOPPED'],
                abilityTypeList: ['ROBOT_ABILITY_TYPE_GASS', 'ROBOT_ABILITY_TYPE_ENVIR', 'ROBOT_ABILITY_TYPE_METER']
            },
            // 回溯任务id
            backtrackingTaskId: '',
            // 路网图层
            roadmapLayer: '',
            // 机器人图层
            robotLayer: '',
            // 巡检项数据加载状态文字
            inspectionItemDataEmptyMsg: '该巡检点没有巡检项',
            // 巡检项数据加载状态
            inspectionItemDataLoading: false,
            // 是否手动关闭ws（不触发重连）
            handleCloseWS: false,
            // 是否为老机器人-老机器人只有5个状态
            isOldRobot: false,
            // 老机器人全部状态
            oldRobotAllStatus: {
                '机器人编号': '',
                '当前电量': '',
                '重启次数': '',
                '本次运行时长': '',
                '行进速度': '',
            },
            // 是否可以改变老机器人的充电状态（老机器人每5分钟改变充电状态）初始为可以改变
            isChangeOldRobotChargingStatus: true,
            // 是否有权限查看该机器人
            isPermission: false,
            // 地图加载状态
            mapLoading: false,
            // 地图加载中文本
            mapLoadingText: '地图加载中',
            // 右侧视频是否允许切换清晰度
            changeClarity: true,
            // 控制面板加载状态
            cloudControlLoading: false,
        }
    },
    created() {
        this.getUrlRobotId();
    },
    mounted() {
        this.permission();
    },
    destroyed() {
        clearInterval(this.switchStatusInterval);
        clearInterval(this.switchEnvironmentInterval);
        clearInterval(this.heartbeatInterval);
        this.handleCloseWS = true
        this.websocket.close();
    },
    methods: {
        // 当前用户是否有权限查看该机器人
        permission() {
            let {id} = this.$route.params;
            if (id) {
                let {id: userId} = this.$store.state.userInfo,
                    data = {
                        method: "getUserPermission",
                        params: [`{'deviceId':'${id}','userId':'${userId}'}`],
                    };
                sevnceApi.getRbp(data, this.token).then(res => {
                    let {mes, ok} = res.result;
                    if (ok) {
                        let {flag} = mes;
                        this.isPermission = flag;
                        if (flag) {
                            this.getRobotData();
                            this.getTask();
                            this.getRobotStatus();
                            this.initWebsocket();
                            this.getDateTime();
                            this.initMap();
                            // 每5分钟更新一次机器人心跳状态
                            this.heartbeatInterval = setInterval(() => {
                                this.getRobotStatus();
                            }, 1000 * 60 * 5);
                            this.getWarningList();
                            window.onresize = () => {
                                if (this.map) {
                                    this.map.updateSize();
                                }
                            }
                        } else {
                            this.$message({
                                type: 'error',
                                message: '当前用户没有权限查看该机器人',
                                duration: 0,
                                showClose: true
                            });
                        }
                    }
                })
            }
        },
        /*
        * topBar组件事件：改变主题
        * value：主题名称
        * */
        changeTheme(value) {
            this.currentTheme = value;
        },
        /*
        * el-date-picker组件事件：日期时间选择器获取焦点时
        * instance：组件实例
        * instance.popperElm：组件popover弹出框DOM节点
        * */
        focusDateTime(instance) {
            commonJs.transformCompatible.map(i => {
                this.$nextTick(() => {
                    instance.popperElm.style[i] = `scale(${commonJs.getScale()})`;
                });
            });
        },
        // 判断当前页面是否有robotId参数
        getUrlRobotId() {
            let {id} = this.$route.params;
            if (id) {
                this.robotInfo.id = id;
            }
        },
        /*
        * 切换面包屑选项卡
        * id：选项卡项i
        * 通过选项卡id来显示激活项
        * */
        toggleTab(id) {
            if (this.isPermission) {
                // 当前任务dom
                let currentTask = this.$refs.currentTask,
                    // 任务回溯dom
                    taskBacktracking = this.$refs.taskBacktracking.$el;
                if (this.activeTabs !== id) {
                    this.activeTabs = id;
                    if (id === 1) {
                        currentTask.style.left = '0';
                        currentTask.style.opacity = 1;
                        taskBacktracking.style.left = '-410px';
                        taskBacktracking.style.opacity = 0;
                        if (this.backtracking) {
                            this.backtracking = false;
                            this.resetPoint();
                            this.inspectionItemsFlag = false;
                            this.backtrackingTaskId = '';
                            // 可见光
                            this.getVideo('1', 'SD');
                            // 红外线
                            this.getVideo('2', 'HD');

                        }
                    } else {
                        currentTask.style.left = '-410px';
                        currentTask.style.opacity = 0;
                        taskBacktracking.style.left = '0';
                        taskBacktracking.style.opacity = 1;
                    }
                }
            }
        },
        // 获取日期时间
        getDateTime() {
            let week = moment().day();
            switch (week) {
                case 1: {
                    this.currentWeek = '星期一';
                    break;
                }
                case 2: {
                    this.currentWeek = '星期二';
                    break;
                }
                case 3: {
                    this.currentWeek = '星期三';
                    break;
                }
                case 4: {
                    this.currentWeek = '星期四';
                    break;
                }
                case 5: {
                    this.currentWeek = '星期五';
                    break;
                }
                case 6: {
                    this.currentWeek = '星期六';
                    break;
                }
                case 0: {
                    this.currentWeek = '星期日';
                    break;
                }
            }
            // 获取当前日期
            this.currentDate = moment().format('YYYY-MM-DD');
            this.dateDefaultShow = new Date();
            this.dateDefaultShow.setMonth(new Date().getMonth() - 1);
        },
        /*
        * 过滤机器人状态
        * */
        filterRobotStatus(robot) {
            let status = [];
            robot.map(i => {
                status.push(i.status);
            });
            return Array.from(new Set(status));
        },
        // 改变媒体（麦克风/扬声器）状态
        changeMediaStatus(type) {
            let {microphoneStatus, speakerStatus} = this.robotInfo;
            if (type === 'microphone') {
                if (microphoneStatus !== '0') {
                    if (microphoneStatus === '1') {
                        this.robotInfo.microphoneStatus = '2';
                        this.microphoneOptions.ws.close();
                        this.microphoneOptions.record.stop();
                        clearInterval(this.microphoneOptions.timeInterval);
                    } else {
                        // 启用麦克风服务
                        this.playMicrophone();
                    }
                }
            } else {
                if (speakerStatus !== '0') {
                    if (speakerStatus === '1') {
                        this.robotInfo.speakerStatus = '2';
                        this.robotSpeaker.destroy(true);
                    } else {
                        this.robotInfo.speakerStatus = '1';
                        // 开启扬声器
                        this.playAudio();
                    }
                }
            }
        },
        // 初始化地图
        initMap() {
            this.map = new Map({
                target: 'map',
                layers: [],
                view: null,
                interactions: InteractionDefaults().extend([
                    new DragRotateAndZoom()
                ])
            });
            this.$nextTick(() => {
                let controlDOM = document.getElementsByClassName('ol-zoom')[0],
                    locationDOM = document.createElement('button'),
                    svgDOM = this.$refs.locationSVG,
                    {robotInfo, isLocation} = this;
                locationDOM.classList.add('ol-zoom-in');
                if (robotInfo.condition === 'on-line' && isLocation) {
                    locationDOM.title = '关闭定位锁定'
                } else {
                    locationDOM.title = '开启定位锁定'
                }
                locationDOM.append(svgDOM);
                controlDOM.append(locationDOM);
            });
            this.map.on("singleclick", e => {
                let pointFeature = '';
                if (this.map.forEachFeatureAtPixel(e.pixel, feature => {
                    if (feature.getGeometry().getType() === 'Point') {
                        pointFeature = feature;
                        return feature
                    }
                })) {
                    let id = pointFeature.getProperties().id;
                    if (this.backtracking) {
                        this.inspectionItemsFlag = true;
                        this.inspectionItemDataEmptyMsg = '加载中';
                        this.inspectionItemDataLoading = true;
                        let {backtrackingTaskId} = this,
                            {
                                appno,
                                patrolPointId,
                                startTime,
                                endTime,
                                pointResultId
                            } = pointFeature,
                            date = {startTime, endTime},
                            params = {
                                patrolPointResultAppNo: appno,
                                patrolPointId: patrolPointId,
                                taskResultId: backtrackingTaskId,
                                deviceId: this.robotInfo.id,
                                pointResultId: pointResultId,
                            };
                        this.replayVideo(date);
                        this.getWarningForBacktracking('point', params);
                    } else {
                        this.pointList.map(i => {
                            if (i.id === id) {
                                let featureStyle = pointFeature.getStyle();
                                // 当前点击点位是否展示了完整信息
                                if (!i.flag) {
                                    featureStyle.getText().setText(`${i.pointName}#${i.pointOtherName}`);
                                } else {
                                    featureStyle.getText().setText(`${i.pointName}`);
                                }
                                // 取反
                                i.flag = !i.flag;
                                pointFeature.changed();
                            }
                        });
                    }
                } else {
                    this.inspectionItemsFlag = false;
                }
            });
        },
        /*
        * customizedStyle实现bu dui
        * openlayers在渲染点、线、面feature的时候，会调用此函数，传入feature对象，返回style实例对象
        * */
        customizedStyle(feature) {
            // 根据不同的类型，返回不同的style
            switch (feature.getGeometry().getType()) {
                case 'Point':
                    return this.styleForPoint(feature);
                case 'LineString':
                    return this.styleForLine(feature);
                case 'Polygon':
                    return this.styleForPolygon(feature);
                default:
                    return null;
            }
        },
        // 点样式设置
        styleForPoint(feature) {
            // 普通点位图标
            let icon = require('@/assets/images/robotSituation/icon-point.png'),
                text = feature.getProperties().name ? feature.getProperties().name : feature.getProperties().id.substring(2),
                backgroundStroke = '#E6A23C',
                backgroundFill = 'rgba(61,50,44,0.8)',
                fill = '#D2E0FA',
                id = feature.getProperties().id;
            this.pointList.map(i => {
                // 充电房
                if (i.pointType === '1' && id === i.id) {
                    feature.type = 'chargingRoom';
                    icon = require('@/assets/images/robotSituation/icon-chargingRoom.png');
                    backgroundStroke = '#2680EB';
                    backgroundFill = 'rgba(22,43,80,0.8)';
                    fill = '#D2E0FA'
                }
                if (id === i.id) {
                    feature.pointType = i.pointType;
                    feature.pointName = i.pointOtherName;
                }
            });
            feature.setStyle(new Style({
                // 用图片(气泡)表示一个点
                image: new Icon({
                    src: icon,
                    anchor: [0.5, 0.5],
                    scale: 0.8
                }),
                text: new Text({
                    text,
                    fill: new Fill({color: fill}),
                    backgroundFill: new Fill({color: backgroundFill}),
                    backgroundStroke: new Stroke({color: backgroundStroke}),
                    stroke: new Stroke({
                        color: 'transparent',
                        width: 0
                    }),
                    padding: [5, 10, 5, 10],
                    font: '12px 微软雅黑 serif',
                    offsetY: -35,
                })
            }));
        },
        // 线段样式设置
        styleForLine(feature) {
            // 在线上贴上方向箭头，显示路线方向
            let direct = feature.getProperties().direct - 100;
            let s2e = (direct & 12) > 0; // end to start
            let e2s = (direct & 3) > 0; // start to end
            // 根据道路方向匹配响应的箭头图标
            let url = '';
            if (s2e && !e2s) // 起点到终点单向道
                url = require('@/assets/images/robotSituation/dir_forward.png');
            else if (!s2e && e2s) // 终点到起点单向道
                url = require('@/assets/images/robotSituation/dir_backward.png');
            else // 双向道
                url = require('@/assets/images/robotSituation/dir_two_way.png');
            // 箭头图标需要贴到整条线段的最中间位置，且方向指向和该点的切线方向
            let coords = feature.getGeometry().getCoordinates();
            // 找到整条线段最中间的两个点
            let startIdx = Math.floor(coords.length / 2) - 1;
            let endIdx = Math.ceil(coords.length / 2);
            let start = coords[startIdx];
            let end = coords[endIdx];
            // 根据这两个点算出在该位置的切线方向，这个方向就是箭头需要对准的方向
            let dx = end[0] - start[0];
            let dy = end[1] - start[1];
            let rotation = Math.atan2(dy, dx);
            return [
                new Style({
                    stroke: new Stroke({
                        color: '#f7e2b1', // 在这里改线条颜色
                        width: 8 // 这里改线条宽度
                    })
                }),
                // 方向图标样式
                new Style({
                    geometry: new Point([end[0] - dx / 2, end[1] - dy / 2]), // 显示在线条中心位置
                    // 贴图
                    image: new Icon({
                        src: url,
                        anchor: [0.75, 0.5],
                        rotateWithView: true,
                        rotation: -rotation, // 箭头朝向
                    })
                })
            ]
        },
        // 区域样式设置
        styleForPolygon(feature) {
            // 从feature的颜色属性中获取颜色值
            let color = feature.getProperties().color;
            // 获取透明度属性
            let transparentHexStr = feature.getProperties().transparent.substring(16);
            if (transparentHexStr.length === 1) {
                transparentHexStr = '0' + transparentHexStr;
            }
            // 根据颜色和透明度拼接出带透明度的颜色
            color = color + transparentHexStr
            return [
                new Style({
                    // 区域颜色填充
                    fill: new Fill({
                        color: color
                    }),
                    // 区域name展示
                    text: new Text({
                        text: feature.getProperties().id,
                        font: '16px serif'
                    })
                })
            ]
        },
        // 标签样式设置
        targetStyle(feature) {
            return [
                new Style({
                    image: new Icon({
                        src: require('@/assets/images/robotSituation/target_filled.png'),
                        anchor: [0.5, 1.0],
                        rotateWithView: false
                    }),
                    text: new Text({
                        text: feature.getId().toString(),
                        fill: new Fill({color: 'white'}),
                        font: '12px 黑体 serif',
                        offsetY: -20
                    })
                })
            ]
        },
        // 以下两个方法为计算贝塞尔曲线函数
        factorial(num) {
            if (num <= 1)
                return 1;
            else
                return num * this.factorial(num - 1);
        },
        genBezierPointsByControlPoints(controlPoints, step = 0.05) {
            let bezierPoints = [];
            let n = controlPoints.length - 1;
            let x = 0, y = 0;
            for (let i = 0; i < 1; i += step) {
                x = 0;
                y = 0;
                controlPoints.forEach((coord, idx) => {
                    if (!idx) {
                        x += coord[0] * Math.pow((1 - i), n - idx) * Math.pow(i, idx);
                        y += coord[1] * Math.pow((1 - i), n - idx) * Math.pow(i, idx);
                    } else {
                        x += this.factorial(n) / this.factorial(idx) / this.factorial(n - idx) * coord[0] * Math.pow((1 - i), n - idx) * Math.pow(i, idx);
                        y += this.factorial(n) / this.factorial(idx) / this.factorial(n - idx) * coord[1] * Math.pow((1 - i), n - idx) * Math.pow(i, idx);
                    }
                });
                bezierPoints.push([x, y]);
            }
            bezierPoints.push(controlPoints[n]);
            return bezierPoints;
        },
        // 渲染地图瓦片/路网
        renderTiles() {
            this.mapLoading = true;
            let {id, mapName} = this.robotInfo,
                {token} = this;
            // 获取瓦片地图数据
            mapApi.getTilemapDetails({
                robotId: id,
                mapName,
                token
            }).then(res => {
                let {result} = res;
                if (result) {
                    this.mapLoading = false;
                    this.renderRobotCoordinate();// 渲染机器人坐标
                    let {layer_cnt, min_zoom} = result,
                        projection = new Projection({extent: result.projection.extent});
                    this.map.setView(new View({
                        projection,
                        center: [0, 0],
                        zoom: 1,
                        minZoom: min_zoom,
                        maxZoom: min_zoom + layer_cnt
                    }))
                    this.map.addLayer(new TileLayer({
                        source: new SrcXYZ({
                            url: `${this.ip}/getTilemapTile/${this.robotInfo.id}/${mapName}/{z}/{x}/{y}.png?token=${this.token}`,
                            wrapX: true,
                            projection
                        }),
                        zIndex: 1,
                    }));
                    // 渲染路网数据
                    let roadmap_src = new VectorSource();
                    // 调用获取geojson的接口获取地图路网
                    mapApi.getRoadmapGeojson({
                        robotId: id,
                        mapName,
                        token
                    }).then(res => {
                        this.currentPointFeatureList = [];
                        res.pointList.map(i => {
                            i.flag = false;
                            i.id = `p_${i.pointName}`;
                        });
                        this.pointList = res.pointList;
                        let {result} = res;
                        this.roadmapLayer = new VectorLayer({
                            source: roadmap_src,
                            zIndex: 2,
                            style: this.customizedStyle,
                            className: 'roadmap'
                        })
                        this.map.addLayer(this.roadmapLayer);
                        setTimeout(() => {
                            if (this.robotInfo.condition === 'on-line') {
                                this.currentTask.pointStatus = 'EXECUTING';
                                this.setInspectionPoint();
                            }
                        }, 30);
                        // 将geojson_data转换成openlayers的features
                        let features = new GeoJSON().readFeatures(result);
                        // let pointFeature = new Feature({
                        //     geometry: new Point([props.targets[i].x, props.targets[i].y])
                        // });
                        // 清除自动生成的框线和背景色
                        features = features.filter(i => i.getProperties().id !== 's_auto');
                        // 实际上这里还有一些工作需要做，比如根据贝塞尔曲线控制点生成贝塞尔曲线，可参考《GeoJSON路网数据结构说明》
                        features.map(i => {
                            if (i.getGeometry().getType() === 'MultiPoint' && i.getProperties().id.startsWith('b_')) {
                                let newBezierPoints = this.genBezierPointsByControlPoints(i.getGeometry().getCoordinates(), 0.01);
                                i.setGeometry(new LineString(newBezierPoints));
                            }
                            // 保存所有点位feature
                            if (i.getGeometry().getType() === 'Point') {
                                this.featurePointList.push(i);
                                this.currentPointFeatureList.push(i);
                            }
                        });
                        // 将features添加到图层
                        roadmap_src.addFeatures(features);
                        // 监听图层资源加载完成
                        let listener = () => {
                            // 当资源准备完成时
                            if (this.roadmapLayer.getSource().getState() === 'ready') {
                                // 自适应zoom
                                this.setLayerFit(this.roadmapLayer);
                                // 设置延时器且时间少于自适应zoom过渡时间，防止点位操作阻碍自适应zoom
                                let mapView = this.map.getView(),
                                    maxZoom = mapView.getMaxZoom(),
                                    // currentZoom > maxZoom * 0.7
                                    inBig = false,
                                    // currentZoom < maxZoom * 0.7
                                    inSmall = false;
                                // 监听zoom缩放
                                mapView.on("change:resolution", () => {
                                    let currentZoom = mapView.getZoom();
                                    // 设置两个范围的flag 防止多次更新feature
                                    if (currentZoom > maxZoom * 0.7) {
                                        if (!inBig) {
                                            // 点位是否展示了完整信息-将所有点位重置为展示完整信息
                                            this.pointList.map(i => {
                                                i.flag = true;
                                            });
                                            // 回溯
                                            if (this.backtracking) {
                                                this.backtrackingPoints.map(i => {
                                                    this.currentPointFeatureList.map(j => {
                                                        let name = j.getProperties().id.substring(2);
                                                        if (name === i.patrolPointName) {
                                                            let {
                                                                patrolPointName,
                                                                currentNum,
                                                                patrolItemTotal,
                                                                totalPoint,
                                                                status,
                                                                executeResult
                                                            } = i;
                                                            if (j.pointType === '1') {
                                                                j.getStyle().getText().setText(`${patrolPointName}#${j.pointName}（${currentNum}/${totalPoint}）`);
                                                                j.getStyle().getText().setOffsetY(-35);
                                                            } else {
                                                                if (status === 'FINISHED') {
                                                                    j.getStyle().getText().setText(`${patrolPointName}#${j.pointName}（${currentNum}/${totalPoint}）\n巡检项（${patrolItemTotal}/${patrolItemTotal}）\n已完成`);
                                                                } else if (status === 'STOPPED') {
                                                                    j.getStyle().getText().setText(`${patrolPointName}#${j.pointName}（${currentNum}/${totalPoint}）\n中断\n中断原因：${executeResult}`);
                                                                }
                                                                j.getStyle().getText().setOffsetY(-50);
                                                            }
                                                        }
                                                    });
                                                });
                                            }
                                            // 巡检
                                            else if (this.robotInfo.condition === 'on-line') {
                                                console.log('巡检中')
                                            }
                                            // 其他
                                            else {
                                                this.currentPointFeatureList.map(i => {
                                                    let name = i.getProperties().id.substring(2);
                                                    if (i.pointType === '1' || i.pointType === '2') {
                                                        i.getStyle().getText().setText(`${name}#${i.pointName}`);
                                                    } else {
                                                        i.getStyle().getText().setText(`${name}`);
                                                    }
                                                });
                                            }
                                            inBig = true;
                                        }
                                        inSmall = false;
                                    } else {
                                        if (!inSmall) {
                                            // 点位是否展示了完整信息-将所有点位重置为没有展示完整信息
                                            this.pointList.map(i => {
                                                i.flag = false;
                                            });
                                            if (this.robotInfo.condition === 'on-line' && !this.backtracking) {
                                                console.log('巡检中')
                                            } else {
                                                this.currentPointFeatureList.map(i => {
                                                    i.getStyle().getText().setText(i.getProperties().id.substring(2));
                                                    i.getStyle().getText().setOffsetY(-35)
                                                });
                                            }
                                            inSmall = true;
                                        }
                                        inBig = false
                                    }
                                });
                                // 只执行一次就解绑事件
                                this.roadmapLayer.getSource().un('change', listener);
                            }
                        }
                        // 图层绑定事件
                        this.roadmapLayer.getSource().on('change', listener);
                    }).catch(() => {
                        // this.$message.error('获取地图路网失败');
                    });
                } else {
                    this.mapLoadingText = '地图加载失败';
                }
            }).catch(() => {
                this.mapLoadingText = '地图加载失败';
            });
        },
        // 切换镜头是否跟随机器人
        switchLocation() {
            this.isLocation = !this.isLocation;
            let controlDOM = document.getElementsByClassName('ol-zoom')[0],
                locationDOM = controlDOM.children[2];
            locationDOM.title = this.isLocation ? '关闭定位锁定' : '开启定位锁定';
        },
        // 初始化机器人坐标
        renderRobotCoordinate() {
            let robot_feature = new Feature({
                geometry: new Point([0, 0])
            });
            robot_feature.setStyle(new Style({
                image: new Icon({
                    src: require('@/assets/images/robotSituation/robot.png'),
                    rotateWithView: false,
                    rotation: 0
                })
            }));
            // 给feature设置一个id，后面搜索会用到
            robot_feature.setId('robot');
            // 创建source，并将生成好的机器人feature添加进来
            this.robotSrc = new VectorSource({});
            this.robotSrc.addFeature(robot_feature);
            this.robotLayer = new VectorLayer({
                source: this.robotSrc,
                zIndex: 3,
                className: 'robot'
            })
            // 将source添加到layer
            this.map.addLayer(this.robotLayer);
        },
        // 更新机器人坐标
        robotPoseUpdate(location, yaw) {
            if (this.robotSrc) {
                let robot_feature = this.robotSrc.getFeatureById('robot');
                if (robot_feature === null) {
                    return false
                }
                // 更新航向角
                robot_feature.getStyle().getImage().setRotation(Math.PI - yaw);
                // 更新位置
                robot_feature.getGeometry().setCoordinates(location);
                // 更新map视图中心点
                if (this.robotInfo.condition === 'on-line' && this.isLocation) {
                    this.map.getView().setCenter(location);
                }
                // 是否初始化机器人位置
                if (!this.initRobotLocation) {
                    this.map.getView().setCenter(location);
                    setTimeout(() => {
                        this.initRobotLocation = true;
                    }, 500)
                }
            }
        },
        /*
        * start：websocket服务
        * */
        // 初始化ws
        initWebsocket: function () {
            let timestamp = Date.parse(new Date),
                number = [],
                {id} = this.robotInfo,
                time = `${timestamp}${number.join('')}`;
            for (let i = 0; i < 5; i++) {
                number[i] = Math.floor(Math.random() * 9) + 1;
                for (let j = 0; j < i; j++) {
                    if (number[i] === number[j]) {
                        i--
                    }
                }
            }
            if (id) {
                let url = `wss://${process.env.VUE_APP_BASE_URL}/RBPAPI/RBP/websocket/${id}/${time}`;
                this.websocket = new WebSocket(url);
                this.websocket.onopen = this.websocketOpen;
                this.websocket.onerror = this.websocketError;
                this.websocket.onmessage = this.websocketMessage;
                this.websocket.onclose = this.websocketClose;
            }
        },
        // ws连接成功
        websocketOpen: function () {
            console.log('websocket连接成功');
            this.reconnectionFlag = false;
            this.websocketSend(`{'token':'${this.token}'}`);
        },
        // ws链接失败
        websocketError: function () {
            console.log('websocket连接失败');
            this.reconnection();
        },
        // 接收ws消息
        websocketMessage: function (event) {
            if (event) {
                let data, msg;
                try {
                    data = eval(`(${event.data})`);
                    msg = eval(`(${data.msg})`);
                } catch (err) {
                    console.log()
                }
                // 机器人电量/充电状态
                if (data.dataType === 'ROBOT_BATTERY') {
                    let batteryData = JSON.parse(msg.battery),
                        {capacity, charging} = batteryData,
                        battery = String((capacity * 100).toFixed(0));
                    if (this.isOldRobot) {
                        this.oldRobotAllStatus.当前电量 = `${Number(battery)}`;
                    } else {
                        this.allStatus[0].当前电量 = `${Number(battery)}`;
                    }
                    if (charging) {
                        if (this.isOldRobot) {
                            if (this.isChangeOldRobotChargingStatus) {
                                this.robotInfo.condition = 'charging';
                                this.isChangeOldRobotChargingStatus = false;
                                setTimeout(() => {
                                    this.isChangeOldRobotChargingStatus = true;
                                }, 1000 * 60 * 5);
                            }
                        }
                        this.executingPointTask = false;
                        this.executingItemsTask = false;
                    } else {
                        if (this.robotInfo.condition === 'charging') {
                            // 如果是老机器人
                            if (this.isOldRobot) {
                                // 如果可以改变老机器人充电状态
                                if (this.isChangeOldRobotChargingStatus) {
                                    this.robotInfo.condition = 'standby';
                                }
                            }
                        }
                    }
                }
                // 机器人位置
                else if (data.dataType === 'ROBOT_LOCATION') {
                    let {pose, vel} = msg.args[0]
                    this.allStatus[0].行进速度 = `${vel.heading.toFixed(0)}m/s`;
                    this.oldRobotAllStatus.行进速度 = `${vel.heading.toFixed(0)}m/s`;
                    // 不处于回溯中时 更新机器人位置信息
                    if (!this.backtracking) {
                        this.robotPoseUpdate(pose.xyz, pose.rpy[2]);
                    }
                }
                // 巡检任务
                else if (data.dataType === 'PATROL_TASK') {
                    let {taskName, patrolPointTotal, status, startTime} = msg;
                    this.currentTask.name = taskName;
                    this.currentTask.date = moment(startTime).format('YYYY-MM-DD');
                    this.currentTask.totalPoint = patrolPointTotal;// 总点数
                    if (status === 'EXECUTING') {
                        // 巡检任务开始 将巡检点归零
                        this.currentTask.currentPoint = 0;
                        // 巡检任务开始 将巡检项归零
                        this.currentTask.currentItems = 0;
                        // 当开始巡检任务且没有处于回溯的时候 重置地图上的所有巡检点状态
                        if (!this.backtracking) {
                            let features = this.roadmapLayer.getSource().getFeatures();
                            features.map(i => {
                                if (i.getGeometry().getType() === 'Point' && i.pointStatus === 1) {
                                    i.pointStatus = '';
                                    this.styleForPoint(i);
                                }
                            });
                        }
                    }
                }
                // 巡检点
                else if (data.dataType === 'PATROL_TASK_POINT') {
                    let {pointName, currentNum, patrolItemTotal, status} = msg;
                    this.currentTask.pointName = pointName;// 当前巡检点名称
                    this.currentTask.currentPoint = currentNum;// 当前巡检点数
                    this.currentTask.totalItems = patrolItemTotal;// 总巡检项数
                    // 巡检点执行中
                    this.currentTask.pointStatus = status;
                    this.executingPointTask = !(status === 'STOPPED' || status === 'FINISHED');
                    if (status === 'EXECUTING') {
                        this.currentTask.currentItems = 0;// 巡检点开始 将巡检项归零
                    }
                    if (!this.backtracking) {
                        if (status === 'FINISHED') {
                            let data = {
                                currentNum,
                                patrolItemTotal,
                                totalPoint: this.currentTask.totalPoint,
                                pointOtherName: ''
                            }
                            this.pointList.map(i => {
                                if (i.pointName === pointName) {
                                    data.pointOtherName = i.pointOtherName;
                                }
                            });
                            this.setFinishPoint(pointName, data);
                        } else if (status === 'STOPPED') {
                            this.setStoppedPoint(pointName);
                        }
                    }
                }
                // 巡检项
                else if (data.dataType === 'PATROL_TASK_POINT_ITEM') {
                    let {abilityType, executeResult, status, itemName, currentNum} = msg;
                    this.currentTask.itemsName = itemName;// 巡检项名称
                    this.currentTask.currentItems = currentNum;// 当前巡检项
                    if (!this.backtracking) {
                        if (this.currentTask.pointStatus === 'EXECUTING') {
                            this.setInspectionPoint();
                        }
                    }
                    // 巡检项执行中
                    this.executingItemsTask = !(status === 'STOPPED' || status === 'FINISHED');
                    if (status === 'FINISHED') {
                        if (this.discernVideoTimeOut) {
                            clearTimeout(this.discernVideoTimeOut)
                        }
                        /*
                        * 巡检点拍照
                        * 优先展示ai图片；如果ai图片为空则显示imgFtpPath
                        * 图片域名：http://robot.7tyun.com/ftp/aiImgFtpPath
                        * 结果值：calcValue
                        * */
                        if (abilityType === 'ROBOT_ABILITY_TYPE_METER') {
                            let result;
                            try {
                                result = eval(`(${executeResult})`);
                            } catch (e) {
                                console.log()
                            }
                            if (result && status) {
                                console.log('巡检点拍照识别结束：', result);
                                this.currentDiscern = 'AI识别';
                                let {
                                        aiImgFtpPath,
                                        imgFtpPath,
                                        calcValue,
                                        aiCost,
                                        calcSuccess,
                                        calcUnit,
                                        // calcMsg,
                                        mes,
                                        calcResultArray
                                    } = result,
                                    {resourceIp} = this;
                                this.gasData.map(i => {
                                    i.flag = false;
                                });// 隐藏气体数据
                                this.TAHData.map(i => {
                                    i.flag = false;
                                });// 隐藏温湿度数据
                                setTimeout(() => {
                                    // 识别失败-渲染识别样式
                                    this.currentItemsData.error = !calcSuccess;
                                    // 是否识别成功
                                    this.currentItemsData.calcSuccess = calcSuccess ? '正常' : '异常';
                                    // 识别失败原因
                                    this.currentItemsData.mes = !calcSuccess ? mes : '';
                                    // AI图片
                                    this.currentItemsData.aiImgFtpPath = aiImgFtpPath ? `${resourceIp}/${aiImgFtpPath}` : '';
                                    // 普通图片
                                    this.currentItemsData.imgFtpPath = imgFtpPath ? `${resourceIp}/${imgFtpPath}` : '';
                                    // 识别值
                                    this.currentItemsData.calcValue = calcValue ? Number(calcValue).toFixed(6) : '-';
                                    // 单位
                                    this.currentItemsData.calcUnit = calcUnit ? calcUnit : '-';
                                    // 识别耗时
                                    this.currentItemsData.aiCost = aiCost ? `${Number(aiCost).toFixed(2)}s` : '-';
                                    // 油位识别结果
                                    // this.currentItemsData.calcMsg = calcMsg ? calcMsg : '';
                                    // 识别结果-数组
                                    this.currentItemsData.calcResultArray = calcResultArray;
                                    // 巡检项名称
                                    this.currentItemsData.itemName = itemName;
                                }, 100);
                            }
                        }
                        /*
                        * 获取巡检点温湿度
                        * humidity：湿度
                        * temperature：温度
                        * 需判断是否为空
                        * */
                        else if (abilityType === 'ROBOT_ABILITY_TYPE_ENVIR') {
                            let result;
                            try {
                                result = eval(`(${executeResult})`);
                            } catch (e) {
                                console.log()
                            }
                            if (result) {
                                let res;
                                try {
                                    res = eval(`(${result.result})`);
                                } catch (e) {
                                    console.log()
                                }
                                if (res) {
                                    let mes;
                                    try {
                                        mes = eval(`(${res.mes})`);
                                    } catch (e) {
                                        console.log()
                                    }
                                    if (mes) {
                                        console.log('获取巡检点温湿度：', mes);
                                        // 隐藏当前拍照数据、气体数据
                                        this.currentItemsData = {};// 情况拍照数据
                                        this.gasData.map(i => {
                                            i.flag = false;
                                        });// 隐藏气体数据
                                        this.currentDiscern = '温湿度识别';
                                        if (mes.temperature) {
                                            this.TAHData[0].value = mes.temperature;
                                            this.TAHData[0].flag = true;
                                        }
                                        if (mes.humidity) {
                                            this.TAHData[1].value = mes.humidity;
                                            this.TAHData[1].flag = true;
                                        }
                                    }
                                }
                            }
                        }
                        /*
                        * 获取巡检点各气体
                        * result.mes[0].gasType：气体类型
                        * result.mes[0].gasConcentration：气体浓度
                        * */
                        else if (abilityType === 'ROBOT_ABILITY_TYPE_GASS') {
                            let result;
                            try {
                                result = eval(`(${executeResult})`);
                            } catch (e) {
                                console.log()
                            }
                            if (result) {
                                let res;
                                try {
                                    res = eval(`(${result.result})`);
                                } catch (e) {
                                    console.log()
                                }
                                if (res) {
                                    let mes;
                                    try {
                                        mes = eval(`(${res.mes})`);
                                        console.log('巡检点气体数据：', mes)
                                    } catch (e) {
                                        console.log()
                                    }
                                    if (mes) {
                                        this.currentDiscern = '气体识别';
                                        this.currentItemsData = {};// 清空拍照数据
                                        this.TAHData.map(i => {
                                            i.flag = false;
                                        });// 隐藏温湿度数据
                                        if (mes.length) {
                                            mes.map(i => {
                                                this.gasData.map(j => {
                                                    if (i.gasType === j.name) {
                                                        j.flag = true;
                                                        j.value = i.gasConcentration
                                                    }
                                                });
                                            });
                                        }
                                    }
                                }
                            }
                        }
                        // 10s后展示AI识别视频
                        // this.discernVideoTimeOut = setTimeout(() => {
                        //     this.currentItemsData = {};// 情况拍照数据
                        //     this.gasData.map(i => {
                        //         i.flag = false;
                        //     });// 隐藏气体数据
                        //     this.TAHData.map(i => {
                        //         i.flag = false;
                        //     });// 隐藏温湿度数据
                        //     this.currentDiscern = '';// 清空当前识别类型
                        // }, 10000);
                    }
                }
            }
        },
        // ws关闭时
        websocketClose: function (event) {
            if (!this.handleCloseWS) {
                console.log('websocket非正常关闭：', event);
                this.reconnection();
            }
        },
        // 连接成功时给服务器发送消息
        websocketSend: function (msg) {
            try {
                this.websocket.send(msg);
            } catch (err) {
                console.log(`发送消息失败：${err.code}`);
            }
        },
        // 连接失败/连接非正常关闭时重新连接
        reconnection: function () {
            this.reconnectionFlag = true;
            if (this.reconnectionFlag) {
                setTimeout(() => {
                    console.log('websocket重连中...');
                    this.initWebsocket();
                }, 5000);
            }
        },
        /*
        * end：websocket服务
        * */
        // 获取当前任务
        getTask() {
            let {id} = this.robotInfo;
            if (id) {
                let data = {
                    method: "getRuningTaskInfo",
                    params: [`{'deviceId':'${id}'}`],
                };
                sevnceApi.getRbp(data, this.token).then(res => {
                    let {mes} = res.result,
                        {
                            taskName,
                            taskStartTime,
                            pointName,
                            itemName,
                            itemCurrentNum,
                            itemTotal,
                            pointCurrentNum,
                            pointTotal,
                        } = mes;
                    this.currentTask.name = taskName;
                    this.currentTask.date = taskStartTime;
                    this.currentTask.pointName = pointName;
                    this.currentTask.itemsName = itemName;
                    this.currentTask.currentPoint = pointCurrentNum;
                    this.currentTask.totalPoint = pointTotal;
                    this.currentTask.currentItems = itemCurrentNum;
                    this.currentTask.totalItems = itemTotal;
                }).catch(() => {
                    // this.$message.error('获取当前任务失败');
                });
            }
        },
        // 获取机器人数据
        getRobotData() {
            let {id} = this.robotInfo;
            if (id) {
                let data = {
                    method: "getRobotData",
                    params: [`{'deviceId':${id}}`],
                };
                sevnceApi.getRbp(data, this.token).then(res => {
                    let {mes} = res.result,
                        area, project;
                    if (mes.length) {
                        let {
                                // 机器人id
                                id,
                                // 地图id
                                mapId,
                                // 地图名称-获取瓦片数据时
                                mapName,
                                // 机器人名称
                                name,
                                // 机器人类型
                                type,
                                // 用于请求萤石云token
                                nvrId,
                                nvrid,
                                // 机器人所属地区名称
                                province,
                                // 机器人所属公司名称
                                company,
                                // 项目id-用于查询该项目下有多少机器人
                                projectId,
                                // 麦克风、扬声器服务参数
                                voiceIpPort,
                                // 内网专属字段（用于播放项目内置视频控件）
                                localVideoHost
                            } = mes[0],
                            {host, listenPort, speakPort} = JSON.parse(voiceIpPort),
                            {provinceList} = this.$store.state,
                            areaId = '';
                        provinceList.map(i => {
                            if (i.name === province) {
                                areaId = i.code
                            }
                        })
                        this.robotInfo.id = id;
                        this.robotInfo.mapId = mapId;
                        this.robotInfo.mapName = mapName;
                        this.robotInfo.name = name;
                        this.robotInfo.type = type;
                        this.robotInfo.nvrId = nvrId ? nvrId : nvrid;
                        this.robotInfo.projectId = projectId;
                        if (host) {
                            this.robotInfo.host = host;
                        }
                        listenPort ? this.robotInfo.listenPort = listenPort : this.robotInfo.speakerStatus = '0';
                        speakPort ? this.robotInfo.speakPort = speakPort : this.robotInfo.microphoneStatus = '0';
                        area = {code: areaId, name: province,}
                        project = {sysPorjectId: projectId, name: company}
                        this.navbar = [{id: 0, name: '全国'}, area, project, this.robotInfo];
                        // 判断localVideoHost是否有值
                        if (!localVideoHost) {
                            this.getYs7Token();
                        } else {
                            this.playLocalVideo(localVideoHost);
                        }
                        this.renderTiles();
                        this.getProjectRobotList();
                        this.getWeather([`{'projectId':'${projectId}'}`], true);
                    } else {
                        // this.$message.error('暂无该机器人数据')
                    }
                }).catch(() => {
                    // this.$message.error('获取机器人数据失败');
                });
            }
        },
        // 获取机器人状态
        getRobotStatus() {
            let {id} = this.robotInfo;
            if (id) {
                let data = {
                    method: "getStatusByDeviceId",
                    params: [`{'deviceId':${id}}`],
                };
                sevnceApi.getRbp(data, this.token).then(res => {
                    let {mes} = res.result;
                    console.log(mes)
                    if (mes.ok) {
                        let {heartTime, robotStatus} = mes.mes;
                        // 重新赋值状态
                        mes.mes.condition = this.formatterRobotStatus(robotStatus);
                        // 老机器人
                        if (mes.mes.oldRobot) {
                            this.isOldRobot = true;
                            let {restartCount, startTimeDuration, robotNumber} = mes.mes;
                            this.oldRobotAllStatus.机器人编号 = robotNumber;
                            this.oldRobotAllStatus.重启次数 = restartCount;
                            this.oldRobotAllStatus.本次运行时长 = Number(startTimeDuration.replace('s', '')) / 60;
                            this.robotInfo.condition = mes.mes.condition;
                        }
                        // 新机器人
                        else {
                            let {
                                afterBumperStrip,
                                amplifierStatus,
                                bmsCurrent,
                                cameraPanInfoStatus,
                                chargerVoltage,
                                currentBattery,
                                currentTaskTime,
                                frontBumperStrip,
                                gasInfoStatus,
                                infraeredInfoStatus,
                                lidarNetwork,
                                navigationInfoStatus,
                                navigationStatus,
                                odometer,
                                pickupStatus,
                                proximitySwitch,
                                robotNumber,
                                routerInfoStatus,
                                softSelfStatus,
                                softSelfCheckFailMes,
                                visibleCameraInfoStatus,
                                condition,
                                isEmergencyStop
                            } = mes.mes;
                            this.robotInfo.condition = condition;
                            this.allStatus[0].机器人编号 = robotNumber;
                            this.allStatus[0].当前电量 = currentBattery;
                            this.allStatus[0].导航状态 = navigationStatus;
                            // this.allStatus[0].自检状态 = softSelfStatus;
                            this.allStatus[0].本次运行时长 = currentTaskTime;
                            // this.allStatus[1].云台状态 = cameraPanInfoStatus;
                            // this.allStatus[1].高清摄像头 = visibleCameraInfoStatus;
                            // this.allStatus[1].红外摄像头 = infraeredInfoStatus;
                            // this.allStatus[1].接近开关 = proximitySwitch;
                            // this.allStatus[2].气体传感器 = gasInfoStatus;
                            // this.allStatus[2].导航服务器 = navigationInfoStatus;
                            this.allStatus[1].前防撞条 = frontBumperStrip;
                            this.allStatus[1].后防撞条 = afterBumperStrip;
                            // this.allStatus[2].扬声器 = amplifierStatus;
                            // this.allStatus[3].拾音器 = pickupStatus;
                            // this.allStatus[3].激光雷达 = lidarNetwork;
                            this.allStatus[1].总里程 = odometer;
                            // this.allStatus[3].电源管理系统 = `${chargerVoltage ? chargerVoltage : '-'}V/${bmsCurrent ? bmsCurrent : '-'}A`;
                            // this.allStatus[3].路由器 = routerInfoStatus;
                            this.allStatus[1].急停 = isEmergencyStop;
                            if (this.switchStatusInterval) {
                                clearInterval(this.switchStatusInterval);
                            }
                            this.switchStatusInterval = setInterval(() => {
                                this.currentStatusIndex++;
                                if (this.currentStatusIndex > this.allStatus.length - 1) {
                                    this.currentStatusIndex = 0
                                }
                                this.currentStatus = this.allStatus[this.currentStatusIndex];
                            }, 10000);
                            this.currentStatus = this.allStatus[0];
                            console.log('*********机器人心跳开始**********');
                            // 控制台输出自检错误信息
                            if (softSelfCheckFailMes && softSelfCheckFailMes.length) {
                                softSelfCheckFailMes.map((i, index) => {
                                    console.log(`自检错误信息（第${index + 1}条/共${softSelfCheckFailMes.length}条）：设备：${i.device},错误信息：${i.errorMes}`)
                                })
                            } else {
                                console.log('自检异常，但没有异常信息')
                            }
                            console.log('自检状态：', this.formatterHeart(softSelfStatus));
                            console.log('云台状态：', this.formatterHeart(cameraPanInfoStatus));
                            console.log('高清摄像头：', this.formatterHeart(visibleCameraInfoStatus));
                            console.log('红外摄像头：', this.formatterHeart(infraeredInfoStatus));
                            console.log('接近开关：', this.formatterHeart(proximitySwitch), '接近开关');
                            console.log('气体传感器：', this.formatterHeart(gasInfoStatus));
                            console.log('导航服务器：', this.formatterHeart(navigationInfoStatus));
                            console.log('扬声器：', this.formatterHeart(amplifierStatus));
                            console.log('拾音器：', this.formatterHeart(pickupStatus));
                            console.log('激光雷达：', this.formatterHeart(lidarNetwork));
                            console.log('电源管理系统：', `${chargerVoltage ? chargerVoltage : '-'}V/${bmsCurrent ? bmsCurrent : '-'}A`);
                            console.log('路由器：', this.formatterHeart(routerInfoStatus));
                        }
                        console.log('机器人心跳状态（4秒内算正常）：', ((Date.parse(new Date()) - heartTime) / 1000 / 60).toFixed(0) + 's')
                        console.log('*********机器人心跳结束**********');
                    } else {
                        this.robotInfo.condition = 'off-line';
                        console.log(`机器人心跳：${mes.mes}`);
                    }
                }).catch(() => {
                    // this.$message.error('获取机器人状态失败');
                });
            }
        },
        // 格式化心跳
        formatterHeart(value, key = '') {
            if (key === '接近开关') {
                return value === 1 ? '触发' : value === 2 ? '未触发' : '未能调通服务';
            } else {
                return value === 1 ? '异常' : value === 2 ? '正常' : '未能调通服务';
            }
        },
        // 切换视频清晰度
        changeVideoQuality(videoType, quality) {
            if (videoType === '1') {
                if (this.defaultVideoQuality === quality) {
                    return false;
                }
                this.defaultVideoQuality = quality;
            } else {
                if (this.infraredVideoQuality === quality) {
                    return false;
                }
                this.infraredVideoQuality = quality;
            }
            this.getVideo(videoType, quality);
        },
        // 获取萤石视频token
        getYs7Token() {
            let {id, nvrId} = this.robotInfo;
            if (id) {
                let data = {
                    method: "getYs7Token",
                    params: [`{'deviceId':'${id}','nvrId':'${nvrId}'}`],
                };
                sevnceApi.getRbp(data, this.token).then(res => {
                    let {result} = res;
                    if (result.mes) {
                        this.Ys7Token = result.mes;
                        // 可见光
                        this.getVideo('1', 'SD');
                        // 红外线
                        this.getVideo('2', 'HD');
                    } else {
                        // this.$message.error('获取萤石视频token失败');
                    }
                }).catch(() => {
                    console.log('获取萤石视频token失败');
                });
            }
        },
        /*
        * 获取可见光/红外线视频地址
        * videoType：视频类型
        * quality：清晰度
        * */
        getVideo(videoType, quality) {
            let ysUrl = `ezopen://open.ys7.com/${this.robotInfo.nvrId}/${videoType}`,
                iframeRef = videoType === '1' ? 'videoKJG' : 'videoHWX';
            ysUrl = `${ysUrl}${quality === 'SD' ? '' : '.hd'}.live`
            this.$refs[iframeRef].src = `https://${process.env.VUE_APP_BASE_URL}/RBPAPI/RBP/static/ys7/video.html?url=${ysUrl}&token=${this.Ys7Token}`;
        },
        /*
        * 任务回溯-视频回放功能
        * date：回溯日期 包含开始时间戳和结束时间戳
        * */
        replayVideo(date) {
            let iframeRefs = ['videoKJG', 'videoHWX'],
                {startTime, endTime} = date;
            iframeRefs.map(i => {
                let reYSUrl = `ezopen://open.ys7.com/${this.robotInfo.nvrId}/${i === 'videoKJG' ? '1' : '2'}.rec`
                this.$refs[i].src = `https://${process.env.VUE_APP_BASE_URL}/RBPAPI/RBP/static/ys7/video.html?token=${this.Ys7Token}&url=${reYSUrl}?begin=${startTime}&end=${endTime}`;
            })
        },
        // 使用本地视频控件播放视频
        playLocalVideo(params) {
            let localVideoHost = JSON.parse(params);
            if (localVideoHost.host) {
                let {host, user, password, login, play, streamtype} = localVideoHost,
                    {visiblelight: loginVisiblelight, infrared: loginInfrared} = login,
                    {visiblelight: playVisiblelight, infrared: playInfrared} = play,
                    {visiblelight: streamtypeVisiblelight, infrared: streamtypeInfrared} = streamtype;
                this.$refs.videoKJG.src = `../hikplay/play.html?host=${host}&port=${loginVisiblelight}&user=${user}&password=${password}&streamtype=${streamtypeVisiblelight}&playport=${playVisiblelight}`;
                this.$refs.videoHWX.src = `../hikplay/play.html?host=${host}&port=${loginInfrared}&user=${user}&password=${password}&streamtype=${streamtypeInfrared}&playport=${playInfrared}`;
            } else {
                this.changeClarity = false;
                let {wvp_host, request_path, deviceid, channelid} = localVideoHost, {token} = this, {
                    visiblelight,
                    infrared
                } = channelid;
                this.$refs.videoKJG.src = `../rtcplay/rtcplay.html?token=${token}&deviceid=${deviceid}&wvp_host=${wvp_host}&request_path=${request_path}&channelid=${visiblelight}`;
                this.$refs.videoHWX.src = `../rtcplay/rtcplay.html?token=${token}&deviceid=${deviceid}&wvp_host=${wvp_host}&request_path=${request_path}&channelid=${infrared}`;
            }
        },
        // 根据项目id获取机器人列表
        getProjectRobotList() {
            let data = {
                method: "getRobotData",
                params: [`{'projectId':${this.robotInfo.projectId}}`],
            };
            sevnceApi.getRbp(data, this.token).then(res => {
                let {mes} = res.result;
                if (mes.length) {
                    this.robotList = mes;
                } else {
                    // this.$message.error('该公司暂无机器人列表数据');
                }
            }).catch(() => {
                // this.$message.error('获取机器人列表失败');
            });
        },
        // 开启扬声器
        playAudio() {
            let {host, listenPort} = this.robotInfo,
                url = `wss://${host}/listen/${listenPort}/live/voice?user=admin&password=voice@pwd`;
            this.robotSpeaker = new FlvJsPlayer({
                // 对应DOM节点id
                id: "mse",
                // 链接地址
                url,
                // 是否流媒体
                fluid: true,
                // 是否自动播放
                autoplay: true,
                // 自动播放是否静音
                autoplayMuted: false,
                // 是否直播
                isLive: true,
                playsinline: false,
                // 截屏
                screenShot: false,
                // 白名单
                whitelist: [""],
                ignores: ["time"],
                closeVideoClick: true,
                // 控制条
                controls: false,
                customConfig: {
                    isClickPlayBack: false,
                },
                flvOptionalConfig: {
                    enableWorker: true,
                    enableStashBuffer: false,
                    stashInitialSize: 2048,
                    lazyLoad: false,
                    lazyLoadMaxDuration: 2400,
                    autoCleanupSourceBuffer: true,
                    autoCleanupMaxBackwardDuration: 2100,
                    autoCleanupMinBackwardDuration: 1800,
                },
            });
            // xgplayer 错误事件
            this.robotSpeaker.on('error', () => {
                // this.$message.error('扬声器加载失败');
                this.robotInfo.speakerStatus = '2';
            });
        },
        // 建立websocket
        useWebSocket() {
            let {host, speakPort} = this.robotInfo;
            this.microphoneOptions.ws = new WebSocket(`wss://${host}/speak/${speakPort}/websocket/voice/123456`);
            this.microphoneOptions.ws.binaryType = "arraybuffer"; //传输的是 ArrayBuffer 类型的数据
            this.microphoneOptions.ws.onopen = () => {
                this.microphoneOptions.timeInterval = setInterval(() => {
                    this.microphoneOptions.record.start();
                }, 180);
            }
            this.microphoneOptions.ws.onmessage = msg => {
                console.info(msg);
            };
            this.microphoneOptions.ws.onerror = err => {
                console.info(err);
            };
        },
        // 启用麦克风
        playMicrophone() {
            let self = this

            //录音对象
            function Recorder(stream) {
                //输出采样数位 8, 16
                let sampleBits = 16,
                    //输出采样率
                    sampleRate = 16000,
                    context = new AudioContext(),
                    audioInput = context.createMediaStreamSource(stream),
                    recorder = context.createScriptProcessor(4096, 1, 1),
                    audioData = {
                        size: 0, //录音文件长度
                        buffer: [], //录音缓存
                        inputSampleRate: 48000, //输入采样率,网页默认的采样率即为48000
                        inputSampleBits: 16, //输入采样数位 8, 16
                        outputSampleRate: sampleRate, //输出采样数位
                        oututSampleBits: sampleBits, //输出采样率
                        clear: function () {
                            this.buffer = [];
                            this.size = 0;
                        },
                        input: function (data) {
                            this.buffer.push(new Float32Array(data));
                            this.size += data.length;
                        },
                        compress: function () {
                            //合并压缩
                            //合并
                            let data = new Float32Array(this.size);
                            let offset = 0;
                            for (let i = 0; i < this.buffer.length; i++) {
                                data.set(this.buffer[i], offset);
                                offset += this.buffer[i].length;
                            }
                            //压缩
                            let compression = parseInt(
                                this.inputSampleRate / this.outputSampleRate
                            );
                            let length = data.length / compression;
                            let result = new Float32Array(length);
                            let index = 0,
                                j = 0;
                            while (index < length) {
                                result[index] = data[j];
                                j += compression;
                                index++;
                            }
                            return result;
                        },
                        encodePCM: function () {
                            //这里不对采集到的数据进行其他格式处理，如有需要均交给服务器端处理。
                            sampleRate = Math.min(
                                this.inputSampleRate,
                                this.outputSampleRate
                            );
                            sampleBits = Math.min(
                                this.inputSampleBits,
                                this.oututSampleBits
                            );
                            let bytes = this.compress();
                            let dataLength = bytes.length * (sampleBits / 8);
                            let buffer = new ArrayBuffer(dataLength);
                            let data = new DataView(buffer);
                            let offset = 0;
                            for (let i = 0; i < bytes.length; i++, offset += 2) {
                                let s = Math.max(-1, Math.min(1, bytes[i]));
                                data.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
                            }
                            return new Blob([data]);
                        },
                    },
                    sendData = function () {
                        //对以获取的数据进行处理(分包)
                        let reader = new FileReader();
                        reader.onload = e => {
                            let outbuffer = e.target.result;
                            let arr = new Int8Array(outbuffer);
                            if (arr.length > 0) {
                                let tmparr = new Int8Array(1024);
                                let j = 0;
                                for (let i = 0; i < arr.byteLength; i++) {
                                    tmparr[j++] = arr[i];
                                    if ((i + 1) % 1024 === 0) {
                                        self.microphoneOptions.ws.send(tmparr);
                                        if (arr.byteLength - i - 1 >= 1024) {
                                            tmparr = new Int8Array(1024);
                                        } else {
                                            tmparr = new Int8Array(arr.byteLength - i - 1);
                                        }
                                        j = 0;
                                    }
                                    if (i + 1 === arr.byteLength && (i + 1) % 1024 !== 0) {
                                        self.microphoneOptions.ws.send(tmparr);
                                    }
                                }
                            }
                        };
                        reader.readAsArrayBuffer(audioData.encodePCM());
                        audioData.clear(); //每次发送完成则清理掉旧数据
                    };

                this.start = function () {
                    audioInput.connect(recorder);
                    recorder.connect(context.destination);
                };

                this.stop = function () {
                    recorder.disconnect();
                };

                this.getBlob = function () {
                    return audioData.encodePCM();
                };

                this.clear = function () {
                    audioData.clear();
                };

                recorder.onaudioprocess = function (e) {
                    let inputBuffer = e.inputBuffer.getChannelData(0);
                    audioData.input(inputBuffer);
                    sendData();
                };
            }

            navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
            if (!navigator.getUserMedia) {
                alert('浏览器不支持音频输入');
            } else {
                this.robotInfo.microphoneStatus = '1';
                navigator.getUserMedia({
                        audio: true
                    },
                    mediaStream => {
                        this.microphoneOptions.record = new Recorder(mediaStream);
                        this.useWebSocket();
                    },
                    error => {
                        this.robotInfo.microphoneStatus = '2'
                        switch (error.message || error.name) {
                            case 'PERMISSION_DENIED':
                            case 'PermissionDeniedError':
                                // this.$message.error('用户拒绝提供信息');
                                break;
                            case 'NOT_SUPPORTED_ERROR':
                            case 'NotSupportedError':
                                // this.$message.error('浏览器不支持硬件设备');
                                break;
                            case 'MANDATORY_UNSATISFIED_ERROR':
                            case 'MandatoryUnsatisfiedError':
                                // this.$message.error('无法发现指定的硬件设备');
                                break;
                            case 'Requested device not found':
                                // this.$message.error('当前设备未发现麦克风');
                                break;
                            default:
                                // this.$message.error('无法打开麦克风');
                                break;
                        }
                    }
                )
            }
        },
        /*el-table 行类名 回调函数
        * data：行数据
        * */
        notProcessed(data) {
            let {status} = data.row;
            return status === '待处理' || status === 'EMERGENCY_STATUS_ON' ? 'notProcessed' : '';
        },
        // 消息中心对话框-筛选-清空按钮
        messageFilterClickEmpty() {
            // 重置filters参数
            this.filters.category = [];
            this.filters.type = '';
            this.filters.title = '';
            this.filters.source = '';
            this.filters.warningDate = [];
            this.filters.level = [];
            this.filters.status = 0;
            this.filters.personnel = '';
            this.filters.processDate = [];
            this.filters.result = 0;
            this.filtersItems = [];
            // 初始化筛选项滚动dom
            this.showScrollArrow = false;
            this.offsetX = 0;
            this.$refs.itemTags.style.transform = `translateX(${this.offsetX}px)`;
            this.disabledLeftArrow = true;
            this.disabledRightArrow = false;
            // 重置页码
            this.warningPages.currentPage = 1;
        },
        // 预警信息对话框-筛选-确定按钮
        messageFilterClickConfirm() {
            this.filtersItems = [];
            this.filterPopoverFlag = false;
            let {filters} = this;
            for (let i in filters) {
                if (filters[i].length || typeof filters[i] === 'number') {
                    if (i === 'category' || i === 'level') {
                        filters[i].map(j => {
                            this.filtersItems.push({
                                type: i,
                                value: j
                            })
                        })
                    }
                    if (i === 'status' || i === 'result') {
                        let key = ''
                        if (i === 'status') {
                            key = 'Status'
                        } else {
                            key = 'Result'
                        }
                        // 当值为 '全部' 时 不显示 但纳入筛选中
                        if (filters[i] === 0) {
                            return false
                        }
                        // 当值为 '未处理' 时 不将 result 纳入筛选中
                        else if (filters[i] === 2 && i === 'status') {
                            this.filtersItems.push({
                                type: i,
                                value: '未处理'
                            });
                            return false
                        }
                        this[`warning${key}Options`].filter(j => j.id === filters[i]).map(k => {
                            this.filtersItems.push({
                                type: i,
                                value: k.name
                            });
                        });
                    }
                    if (i === 'warningDate' || i === 'processDate') {
                        if (filters.status === 2 && i === 'processDate') {
                            return false
                        }
                        this.filtersItems.push({
                            type: i,
                            value: {
                                start: filters[i][0],
                                end: filters[i][1],
                            }
                        });
                    }
                    if (i === 'title' || i === 'source' || i === 'personnel') {
                        if (filters.status === 2 && i === 'personnel') {
                            return false
                        }
                        this.filtersItems.push({
                            type: i,
                            value: filters[i]
                        })
                    }
                }
            }
            this.offsetX = 0;
            setTimeout(() => {
                this.showFilterScrollArrow();// 判断当前tagDOM是否超过实际tagDOM宽度
            }, 50);
        },
        /*
        * 删除筛选项
        * index：筛选项索引
        * */
        closeFilterTag(index) {
            this.filtersItems.splice(index, 1);
            setTimeout(() => {
                let dom = this.$refs.itemTags,
                    maxX = dom.clientWidth - dom.scrollWidth,
                    {offsetX} = this;
                if (offsetX < maxX) {
                    this.offsetX = maxX;
                    this.disabledRightArrow = true;
                }
                dom.style.transform = `translateX(${this.offsetX}px)`;
                this.showFilterScrollArrow();// 判断当前tagDOM是否超过实际tagDOM宽度
            }, 50);
        },
        // 判断当前tagDOM是否超过实际tagDOM宽度
        showFilterScrollArrow() {
            let dom = this.$refs.itemTags,
                domClientWidth = dom.clientWidth,// dom规定宽度 不包括内外边距
                domScrollWidth = dom.scrollWidth;// dom实际宽度
            this.showScrollArrow = domScrollWidth > domClientWidth;
        },
        /*
        * 横向滚动
        * direction：方向
        * */
        scrollHorizontally(direction) {
            let dom = this.$refs.itemTags,
                step = 100,
                maxX = dom.clientWidth - dom.scrollWidth;
            this.showFilterScrollArrow();
            if (direction === 'left') {
                this.disabledRightArrow = false
                this.offsetX += step;
                if (this.offsetX >= 0) {
                    this.offsetX = 0;
                    this.disabledLeftArrow = true;
                }
            } else {
                this.disabledLeftArrow = false;
                this.offsetX -= step;
                if (this.offsetX < maxX) {
                    this.offsetX = maxX;
                    this.disabledRightArrow = true;
                }
            }
            dom.style.transform = `translateX(${this.offsetX}px)`;
        },
        // 获取预警信息列表
        getWarningList() {
            let data = {
                method: "getRobotEmergencyInfo",
                params: [`{'deviceId':'${this.robotInfo.id}','pageNum':'1','pageSize':'7'}`],
            };
            sevnceApi.getRbp(data, this.token).then(res => {
                if (res.result.ok) {
                    let {mes} = res.result,
                        {page} = mes,
                        {list, count} = page;
                    if (list && list.length) {
                        list.map(i => {
                            this.warningList.push({
                                // 日期
                                date: i.createDate,
                                // 预警源
                                source: i.dict.label,
                                // 预警类型
                                category: i.categoryName,
                                // 预警内容
                                content: i.content,
                                // 预警等级
                                level: this.translationKey(i.emergencyGrande) || i.emergencyGrande,
                                // 处理状态
                                status: this.translationKey(i.status) || i.status
                            });
                        });
                        this.warningListCount = count;
                    }
                }
            });
        },
        // 获取预警信息中心数据
        getWarningCenterList() {
            this.warningCenterListLoading = true;
            let {id} = this.robotInfo,
                {currentPage, pageSize} = this.warningPages,
                data = {
                    method: "getRobotEmergencyInfoByDeviceId",
                    params: [`{'deviceId':'${id}','pageNum':'${currentPage}','pageSize':'${pageSize}'}`],
                };
            sevnceApi.getRbp(data, this.token).then(res => {
                this.warningCenterList = [];
                let mes = res.result,
                    {page} = mes,
                    {list, count, pageNo} = page;
                if (list && list.length) {
                    list.map(i => {
                        this.warningCenterList.push({
                            // 预警编号
                            appno: i.appno,
                            // 预警标题
                            title: i.name,
                            // 所属项目
                            project: i.sysProject.name,
                            // 集成设备
                            device: i.deviceInfo.name,
                            // 组成设备
                            deviceCompose: i.deviceCompose,
                            // 预警类型
                            type: this.translationKey(i.category),
                            // 预警日期
                            warningDate: i.createDate,
                            // 预警源
                            source: i.emergencySource,
                            // 经度
                            lng: i.longitude,
                            // 纬度
                            lat: i.latitude,
                            // 更新者
                            updateBy: i.updateBy.name,
                            // 更新日期
                            updateDate: i.updateDate,
                            // 处理人
                            dealUser: i.dealUser,
                            // 受理内容
                            dealContent: i.content,
                            // 处理时间
                            dealDate: i.dealDate,
                            // 处理结果
                            dealResult: i.dealResult,
                            // 完结时间
                            finishDate: i.finishDate,
                            // 跟进部门
                            followDept: i.followDept,
                            // 预警等级
                            level: this.translationKey(i.emergencyGrande),
                            // 处理状态
                            status: this.translationKey(i.status),
                            // 预警内容
                            content: i.remarks,
                        });
                    });
                }
                this.warningCenterListLoading = false;
                this.warningPages.currentPage = pageNo;
                this.warningPages.total = count;
            })
        },
        // 预警信息对话框-筛选-复选框-选择全部
        checkALlType(type) {
            console.log(type)
        },
        // 获取预警信息详情
        getWarningDetails(item) {
            this.warningCenterDetails = item;
            let lists = this.$refs.warningLists,
                details = this.$refs.warningDetails;
            lists.style.left = '-100%';
            details.style.left = 0;
        },
        // 返回预警信息中心列表
        backWarningList() {
            let lists = this.$refs.warningLists,
                details = this.$refs.warningDetails;
            lists.style.left = 0;
            details.style.left = '100%';
        },
        // 组件事件-打开预警消息中心对话框时
        openWarningCenter() {
            let {warningCenterList} = this;
            if (!warningCenterList.length) {
                this.getWarningCenterList();
            }
        },
        // 打开设备控制面板，当机器人处于巡检中状态时，不可打开控制面板
        openCloudControl() {
            let {condition} = this.robotInfo;
            if (condition === 'on-line' || condition === 'off-line') {
                return;
            }
            this.cloudControlFlag = !this.cloudControlFlag;
        },
        /*
        * 设备通用控制接口
        * deviceType：设备类型
        * serviceName：需要调用的服务名称（例如云台右转，则值为right）
        * notStop：设备是否停止（true：不停/false：停）
        * serviceParams：服务参数（例如云台转向，则参数为转向速度）
        * loading：是否启用加载蒙层
        * */
        cloudControl(deviceType, serviceName, notStop, serviceParams, loading) {
            if (loading) {
                this.cloudControlLoading = true;
            }
            let {mapName, id: deviceInfoId} = this.robotInfo,
                params = {
                    deviceInfoId,
                    deviceType,
                    mapName
                }
            serviceName ? params.serviceName = serviceName : false;
            notStop ? params.notStop = notStop : false;
            serviceParams ? params.serviceParams = serviceParams : false;
            let data = {
                method: "operDevice",
                params: [JSON.stringify(params)],
            };
            sevnceApi.getRbp(data, this.token).then(res => {
                let {ok, result} = res.result.mes;
                // 接口调用成功后，改变为设置的值
                if (ok) {
                    let {type, controlType} = serviceParams;
                    // 变倍/聚焦值查询、设置后赋值
                    if (serviceName === 'getCameraPanParam' || serviceName === 'setCameraPanParam') {
                        let {type, value} = result.mes;
                        if (type === 'zoom') {
                            this.cloudParams.magnification = Number(value);
                        } else if (type === 'focus') {
                            this.cloudParams.focus = Number(value);
                        }
                    }
                    // 补光灯
                    else if (serviceName === 'setLamp') {
                        this.cloudParams.fillLight = this.fillLightOptions.filter(i => i.value === type)[0].id;
                    }
                    // 雨刷
                    else if (serviceName === 'setRainClear') {
                        this.cloudParams.wiper = type === 'open';
                    }
                    // 透雾
                    else if (serviceName === 'setDenseFog') {
                        this.cloudParams.penetration = type === 'open';
                    }
                    // 防冻
                    else if (serviceName === 'setAntifreeze') {
                        this.cloudParams.antifreeze = type === 'open';
                    }
                    // 充电房卷帘门
                    else if (serviceName === 'chargeRoomControl') {
                        this.cloudParams.door = type === 'ROOM_OPEN';
                    }
                    // 充电房其他
                    else if (serviceName === 'deviceControl') {
                        // 风扇
                        if (type === 'FANS') {
                            this.cloudParams.fan = controlType === 'ON';
                        }
                        // 照明灯
                        else if (type === 'LIGHT') {
                            this.cloudParams.lightingLamp = controlType === 'ON'
                        }
                        // 充电桩
                        else if (type === 'CHARGING_PILE') {
                            this.cloudParams.chargingPile = controlType === 'ON';
                        }
                        // 加热器
                        else if (type === 'HEATER') {
                            this.cloudParams.heater = controlType === 'ON';
                        }
                        // 空调
                        else if (type === 'AIR_CONDITIONING') {
                            this.cloudParams.airConditioning = controlType === 'ON';
                        }
                    }
                } else {
                    this.$message.error('操作失败');
                }
            }).catch(() => {
                this.$message.error('操作失败');
            }).finally(() => {
                this.cloudControlLoading = false;
            })
        },
        /*
        * 格式化方向
        * direction：方向编码
        * type：有值则为中文，用于title，无值则为英文，用于请求参数serviceName
        * */
        formatterDirection(direction, type) {
            switch (direction) {
                case 1: {
                    return type ? '左上' : 'leftUp';
                }
                case 2: {
                    return type ? '上' : 'up';
                }
                case 3: {
                    return type ? '右上' : 'rightUp';
                }
                case 4: {
                    return type ? '右' : 'right';
                }
                case 5: {
                    return type ? '右下' : 'rightDown';
                }
                case 6: {
                    return type ? '下' : 'down';
                }
                case 7: {
                    return type ? '左下' : 'leftDown';
                }
                case 8: {
                    return type ? '左' : 'left';
                }
            }
        },
        /*
        * 按下鼠标，开始改变云台方向、变倍、聚焦、光圈
        * type：控制类型
        * serviceName：需要调用的服务名称（例如云台右转，则值为right）
        * addSub：当为光圈控制当时候，add加/sub减
        * */
        moveStart(type, serviceName, addSub) {
            let serviceParams = '',
                speed = '',
                deviceType = '',
                {turnSpeed,} = this.cloudParams;
            if (type === '方向' || type === '光圈') {
                deviceType = 'CAMERA_PAN';
                if (type === '方向') {
                    speed = turnSpeed;
                    serviceParams = {speed};
                } else {
                    serviceParams = {type: addSub}
                }
            } else if (type === '变倍' || type === '聚焦') {
                speed = 4;
                serviceParams = {speed};
                deviceType = 'VISIBLE_CAMERA';
            }
            this.cloudControl(deviceType, serviceName, true, serviceParams, false);
        },
        /*
        * 松开鼠标，停止云台转动、变倍、聚焦、光圈
        * type：控制类型
        * serviceName：需要调用的服务名称（例如云台右转，则值为right）
        * */
        moveEnd(type, serviceName) {
            let serviceParams = '',
                deviceType = '';
            if (type === '方向' || type === '光圈') {
                deviceType = 'CAMERA_PAN';
                if (type === '方向') {
                    let {turnSpeed} = this.cloudParams;
                    serviceParams = {speed: turnSpeed}
                }
            } else if (type === '变倍' || type === '聚焦') {
                serviceParams = {stop: true}
                deviceType = 'VISIBLE_CAMERA';
            }
            this.cloudControl(deviceType, serviceName, false, serviceParams, false)
        },
        /*
        * 查询变倍/聚焦值
        * type：查询类型
        * */
        getCameraPanParam(type) {
            this.cloudControl('CAMERA_PAN', 'getCameraPanParam', true, {type}, true);
        },
        /*
        * 设置变倍/聚焦值
        * type：设置类型
        * */
        setCameraPanParam(type) {
            let value = '',
                {magnification, focus} = this.cloudParams;
            type === 'zoom' ? value = magnification : value = focus;
            if (value === '') {
                this.$message.error('数值不能为空');
                return;
            } else if (value === 0 || value === '0') {
                this.$message.error('数值最小不能为0');
                return;
            }
            this.cloudControl('CAMERA_PAN', 'setCameraPanParam', true, {type, value}, true);
        },
        /*
        * 设置控制面板开关项
        * serviceName：需要调用的服务名称（例如云台右转，则值为right）
        * value：控制值（open/close）
        * */
        setAuxiliaryFunction(serviceName, value) {
            this.cloudControl('CAMERA_PAN', serviceName, false, {type: value}, true);
        },
        /*
        * 设置充电房功能
        * serviceName：需要调用的服务名称（例如云台右转，则值为right）
        * value：控制值（ON/OFF）
        * type：区分除开卷帘门控制的其他控制
        * */
        setChargingRoomFunction(serviceName, value, type) {
            let chargeRoomControlType = '',
                chargeRoomControlControlType = '';
            // 充电房 serviceParams中type,controlType特殊处理
            if (serviceName === 'chargeRoomControl') {
                chargeRoomControlType = value === 'ON' ? 'ROOM_OPEN' : 'ROOM_CLOSE';
                chargeRoomControlControlType = 'ON';
            }
            this.cloudControl('CHARGE_ROOM', serviceName, false, {
                model: 'output',
                type: chargeRoomControlType ? chargeRoomControlType : type,
                controlType: chargeRoomControlControlType ? chargeRoomControlControlType : value
            }, true);
        },
        // 通过巡检点id统一设置点位样式（充电点位除外）
        setPointStyle(data) {
            let {pointName, icon, text, fill, backgroundFill, backgroundStroke, zIndex} = data;
            this.featurePointList.map(i => {
                let id = i.getProperties().id.substring(2);
                if (pointName === id && i.pointType !== '1') {
                    i.pointStatus = 1;
                    i.setStyle(new Style({
                        // 用图片(气泡)表示一个点
                        image: new Icon({
                            src: icon,
                            anchor: [0.5, 0.5],
                            scale: 0.8
                        }),
                        text: new Text({
                            text,
                            fill: new Fill({color: fill}),
                            backgroundFill: new Fill({color: backgroundFill}),
                            backgroundStroke: new Stroke({color: backgroundStroke}),
                            stroke: new Stroke({
                                color: 'transparent',
                                width: 0
                            }),
                            padding: [5, 10, 5, 10],
                            font: '12px 微软雅黑 serif',
                            offsetY: -50,
                        }),
                        zIndex
                    }));
                }
            });
        },
        // 设置正在巡检中的点位
        setInspectionPoint() {
            let {pointName, currentItems, totalItems, currentPoint, totalPoint, itemsName} = this.currentTask,
                icon = require('@/assets/images/robotSituation/icon-current.png'),
                text = `${pointName}（${currentPoint}/${totalPoint}）\n巡检项（${currentItems}/${totalItems}）\n正在进行：${itemsName}`,
                fill = '#23DCB8',
                backgroundFill = '#163E46',
                backgroundStroke = '#23DCB8',
                zIndex = 1;
            this.setPointStyle({pointName, icon, text, fill, backgroundFill, backgroundStroke, zIndex});
        },
        // 设置已经完成的点位
        setFinishPoint(pointName, params) {
            let {currentNum, patrolItemTotal, totalPoint, pointType, pointOtherName} = params,
                icon = require('@/assets/images/robotSituation/icon-complete.png'),
                text = `${pointName}#${pointType ? pointType : pointOtherName}（${currentNum}/${totalPoint}）\n巡检项（${patrolItemTotal}/${patrolItemTotal}）\n已完成`,
                fill = '#D2E0FA',
                backgroundFill = '#163E46',
                backgroundStroke = '#23DCB8',
                zIndex = 0;
            this.setPointStyle({pointName, icon, text, fill, backgroundFill, backgroundStroke, zIndex});
        },
        // 设置中断的点位
        setStoppedPoint(pointName, params) {
            let currentItems = '', totalItems = '', currentPoint = '', totalPoint = '', text = '', executeResult = '',
                pointType = '';
            if (params) {
                currentPoint = params.currentNum;
                totalPoint = params.totalPoint;
                executeResult = params.executeResult ? params.executeResult : '-';
                pointType = params.pointType ? params.pointType : '-';
                text = `${pointName}#${pointType}（${currentPoint}/${totalPoint}）\n中断\n中断原因：${executeResult}`
            } else {
                currentItems = this.currentTask.currentItems;
                totalItems = this.currentTask.totalItems;
                currentPoint = this.currentTask.currentPoint;
                totalPoint = this.currentTask.totalPoint;
                text = `${pointName}（${currentPoint}/${totalPoint}）\n巡检项（${currentItems}/${totalItems})\n中断`;
            }
            let icon = require('@/assets/images/robotSituation/icon-point.png'),
                fill = '#E6A23C',
                backgroundFill = 'rgba(61,50,44,0.8)',
                backgroundStroke = '#E6A23C',
                zIndex = 0;
            this.setPointStyle({pointName, icon, text, fill, backgroundFill, backgroundStroke, zIndex});
        },
        // 将路网图层置于可是范围内
        setLayerFit(layer) {
            this.map.getView().fit(layer.getSource().getExtent(), {duration: 300});
        },
        // 重置地图点位
        resetPoint() {
            this.pointFilterItems = {
                chargingRoom: 'charge',
                emergencyPoint: 'emergencyPoint',
                statusList: ['FINISHED', 'STOPPED'],
                abilityTypeList: ['ROBOT_ABILITY_TYPE_GASS', 'ROBOT_ABILITY_TYPE_ENVIR', 'ROBOT_ABILITY_TYPE_METER']
            }
            this.currentPointFeatureList = [];
            let {roadmapLayer, robotLayer} = this;
            this.setLayerFit(roadmapLayer);
            let features = roadmapLayer.getSource().getFeatures();
            features.map(j => {
                if (j.getGeometry().getType() === 'Point') {
                    roadmapLayer.getSource().removeFeature(j);
                }
            });
            this.featurePointList.map(j => {
                this.currentPointFeatureList.push(j);
                // 设置点位默认样式
                this.styleForPoint(j);
                // 将所有点位重新添加到图层中
                roadmapLayer.getSource().addFeature(j);
            });
            // 添加机器人图层
            robotLayer.getSource().addFeature(this.robotFeature);
        },
        // 切换回溯任务
        changeTask(data) {
            if (!this.roadmapLayer) {
                console.log('路网未加载');
                return false
            }
            let {startTime, endTime, taskId} = data,
                date = {startTime, endTime}
            this.backtrackingTaskId = taskId;
            this.getBacktrackingTaskPoint();
            this.replayVideo(date)
        },
        // 获取回溯任务巡检点
        getBacktrackingTaskPoint() {
            let data = {
                    method: "selectToFlashBackPointResult",
                    params: [
                        `{'taskResultId':'${this.backtrackingTaskId}','deviceId':'${this.robotInfo.id}'}`,
                    ],
                },
                {token} = this.$store.state.userInfo;
            sevnceApi.getRbp(data, token).then(res => {
                let {mes} = res.result;
                if (mes.length) {
                    let {roadmapLayer, robotLayer} = this;
                    this.setLayerFit(roadmapLayer);
                    // 获取路网所有features
                    let features = roadmapLayer.getSource().getFeatures();
                    features.map(j => {
                        if (j.getGeometry().getType() === 'Point') {
                            roadmapLayer.getSource().removeFeature(j);
                        }
                    });
                    // 获取机器人feature并储存并从地图上删除
                    if (!this.robotFeature) {
                        this.robotFeature = this.robotSrc.getFeatures()[0];
                    }
                    // 判断地图上是否还存在机器人元素
                    if (robotLayer.getSource().getFeatures().length) {
                        robotLayer.getSource().removeFeature(this.robotFeature);
                    }
                    this.pointFilterItems = {
                        chargingRoom: 'charge',
                        emergencyPoint: 'emergencyPoint',
                        statusList: ['FINISHED', 'STOPPED'],
                        abilityTypeList: ['ROBOT_ABILITY_TYPE_GASS', 'ROBOT_ABILITY_TYPE_ENVIR', 'ROBOT_ABILITY_TYPE_METER']
                    }
                    this.currentPointFeatureList = [];
                    this.backtrackingPoints = mes;
                    // 处于回溯中
                    this.backtracking = true;
                    this.inspectionItemsFlag = false;
                    // 设置本次巡检任务的巡检点状态
                    mes.map(i => {
                        i.appno = i.pointResultAppNo;
                        i.totalPoint = mes.length;
                        if (i.patrolPointName.indexOf('p_') !== -1) {
                            i.pointId = i.patrolPointName
                        } else {
                            i.pointId = `p_${i.patrolPointName}`
                        }
                        this.pointList.map(j => {
                            if (i.pointId === j.id) {
                                i.pointOtherName = j.pointOtherName;
                            }
                        });
                        if (i.status === 'FINISHED') {
                            this.setFinishPoint(i.patrolPointName, i);
                        } else if (i.status === 'STOPPED') {
                            this.setStoppedPoint(i.patrolPointName, i);
                        }
                        this.featurePointList.map(j => {
                            let id = j.getProperties().id;
                            if (id === i.pointId) {
                                j.patrolPointId = i.patrolPointId;
                                j.patrolTaskId = i.patrolTaskId;
                                j.appno = i.appno;
                                j.status = i.status;
                                j.itemList = i.itemList;
                                j.startTime = i.startTime;
                                j.endTime = i.endTime;
                                j.pointResultId = i.pointResultId;
                                this.currentPointFeatureList.push(j);
                                roadmapLayer.getSource().addFeature(j);
                            }
                        });
                    });
                    let params = {
                        patrolPointResultAppNo: mes[0].appno,
                        taskResultId: this.backtrackingTaskId,
                        deviceId: this.robotInfo.id
                    }
                    this.getWarningForBacktracking('task', params);
                }
            });
        },
        // 数组去重
        arrayNoRepeat(array) {
            let arr = array
            for (let i = 0; i < arr.length; i++) {
                for (let j = i + 1; j < arr.length; j++) {
                    if (arr[i] === arr[j]) {
                        arr.splice(j, 1);
                        j--
                    }
                }
            }
            return arr
        },
        // 筛选地图巡检点-添加/删除
        filterMapPoint(type, value) {
            if (value === 'chargingRoom') {
                if (this.pointFilterItems.chargingRoom) {
                    this.pointFilterItems.chargingRoom = ''
                } else {
                    this.pointFilterItems.chargingRoom = value;
                }
            } else if (value === 'emergencyPoint') {
                if (this.pointFilterItems.emergencyPoint) {
                    this.pointFilterItems.emergencyPoint = '';
                } else {
                    this.pointFilterItems.emergencyPoint = value;
                }
            } else {
                if (type === 'situation') {
                    if (this.pointFilterItems.statusList.indexOf(value) !== -1) {
                        this.pointFilterItems.statusList.map((i, index) => {
                            if (i === value) {
                                this.pointFilterItems.statusList.splice(index, 1);
                            }
                        })
                    } else {
                        this.pointFilterItems.statusList.push(value);
                    }
                } else {
                    if (this.pointFilterItems.abilityTypeList.indexOf(value) !== -1) {
                        this.pointFilterItems.abilityTypeList.map((i, index) => {
                            if (i === value) {
                                this.pointFilterItems.abilityTypeList.splice(index, 1);
                            }
                        })
                    } else {
                        this.pointFilterItems.abilityTypeList.push(value);
                    }
                }
            }
            let chargingIds = [],
                interruptIds = [],
                statusIds = [],
                abilityIds = [],
                showPointIds = [],
                showPoints = [],
                {chargingRoom, statusList, emergencyPoint, abilityTypeList} = this.pointFilterItems,
                {roadmapLayer} = this;
            // 充电房条件
            if (chargingRoom) {
                this.currentPointFeatureList.map(i => {
                    if (i.pointType === '1') {
                        chargingIds.push(i.patrolPointId)
                    }
                });
            }
            // 预警点条件
            if (emergencyPoint) {
                this.currentPointFeatureList.map(i => {
                    if (i.pointType !== '1' && i.EmergencyPoint === 'Y') {
                        statusIds.push(i.patrolPointId)
                    }
                });
            }
            // 已完成、中断状态条件
            if (statusList.length) {
                statusList.map(i => {
                    this.currentPointFeatureList.map(j => {
                        if (j.pointType !== '1' && i === j.status) {
                            if (i === 'FINISHED') {
                                statusIds.push(j.patrolPointId)
                            } else if (i === 'STOPPED') {
                                interruptIds.push(j.patrolPointId)
                            }
                        }
                    });
                });
            }
            // 给 statusIds 去重
            statusIds = this.arrayNoRepeat(statusIds);
            // 能力条件
            if (abilityTypeList.length) {
                abilityTypeList.map(i => {
                    this.currentPointFeatureList.map(j => {
                        j.itemList.map(k => {
                            if (i === k.abilityType) {
                                abilityIds.push(j.patrolPointId)
                            }
                        });
                    });
                });
                abilityIds = this.arrayNoRepeat(abilityIds);
            }
            // 获取完成情况和能力相同的id
            if (!statusIds.length || !abilityIds.length) {
                showPointIds = []
            } else {
                statusIds.map(i => {
                    abilityIds.map(j => {
                        if (i === j) {
                            showPointIds.push(i)
                        }
                    })
                })
            }
            // 获取符合条件的features
            showPointIds.map(i => {
                this.currentPointFeatureList.map(j => {
                    if (i === j.patrolPointId) {
                        showPoints.push(j);
                    }
                });
            });
            chargingIds.map(i => {
                this.currentPointFeatureList.map(j => {
                    if (i === j.patrolPointId) {
                        showPoints.push(j);
                    }
                });
            });
            interruptIds.map(i => {
                this.currentPointFeatureList.map(j => {
                    if (i === j.patrolPointId) {
                        showPoints.push(j);
                    }
                });
            });
            // 获取路网图层当前所有feature并删除
            let features = roadmapLayer.getSource().getFeatures();
            features.map(j => {
                if (j.getGeometry().getType() === 'Point') {
                    roadmapLayer.getSource().removeFeature(j);
                }
            });
            // 将符合筛选条件的features重新渲染到路网图层
            showPoints.map(i => {
                roadmapLayer.getSource().addFeature(i);
            });
        },
        // 格式化巡检点筛选项class
        formatterPointFiltersClass(type, value) {
            let {pointFilterItems} = this;
            if (value === 'chargingRoom' && pointFilterItems.chargingRoom) {
                return 'active'
            } else if (value === 'emergencyPoint' && pointFilterItems.emergencyPoint) {
                return 'active'
            } else {
                if (type === 'situation' && pointFilterItems.statusList.indexOf(value) !== -1) {
                    return 'active'
                } else if (type === 'ability' && pointFilterItems.abilityTypeList.indexOf(value) !== -1) {
                    return 'active'
                }
            }
        },
        // 点位筛选框-隐藏所有巡检点
        hideAllPoint() {
            this.pointVisibleFlag = !this.pointVisibleFlag;
            let {roadmapLayer} = this
            if (this.pointVisibleFlag) {
                this.backtrackingPoints.map(i => {
                    i.totalPoint = this.backtrackingPoints.length;
                    if (i.patrolPointName.indexOf('p_') !== -1) {
                        i.pointId = i.patrolPointName
                    } else {
                        i.pointId = `p_${i.patrolPointName}`
                    }
                    if (i.status === 'FINISHED') {
                        this.setFinishPoint(i.patrolPointName, i);
                    } else if (i.status === 'STOPPED') {
                        this.setStoppedPoint(i.patrolPointName, i);
                    }
                    this.featurePointList.map(j => {
                        let id = j.getProperties().id;
                        if (id === i.pointId) {
                            j.patrolPointId = i.patrolPointId;
                            j.patrolTaskId = i.patrolTaskId;
                            j.appno = i.appno;
                            this.currentPointFeatureList.push(j)
                            roadmapLayer.getSource().addFeature(j);
                        }
                    });
                });
            } else {
                let features = roadmapLayer.getSource().getFeatures();
                features.map(i => {
                    if (i.getGeometry().getType() === 'Point') {
                        roadmapLayer.getSource().removeFeature(i);
                        this.currentPointFeatureList = [];
                    }
                });
            }
        },
        // 渲染下一任务
        setNextTask(data) {
            if (!this.nextTask.patrolTaskName) {
                this.nextTask = data;
            }
        },
        /*
        * 回溯中-获取该任务的预警信息或该巡检点的预警信息和巡检项数据
        * type：task/point（为task时不渲染巡检项数据）
        * params：请求参数
        * */
        getWarningForBacktracking(type, params) {
            let data = {
                    method: "selectPatrolItemAndEmergencyInfoDetail",
                    params: [JSON.stringify(params)],
                },
                {token} = this;
            sevnceApi.getRbp(data, token).then(res => {
                let {pointListMap, emerListMap, emercount} = res.result.mes,
                    warningList = [];
                if (type === 'point') {
                    this.inspectionItemDataLoading = false;
                    let meterData = {
                            type: 'meter',
                            name: '表计识别',
                            result: []
                        },
                        gasData = {
                            type: 'gas',
                            name: '气体识别',
                            result: []
                        },
                        envirData = {
                            type: 'envir',
                            name: '环境识别',
                            result: []
                        };
                    this.inspectionItemsDataForBacktracking = [];
                    if (pointListMap.length) {
                        pointListMap.map(i => {
                            i.startTime = moment(i.itemStartTime).format('HH:mm:ss');
                            i.endTime = moment(i.itemEndTime).format('HH:mm:ss');
                            gasData.startTime = i.startTime;
                            gasData.endTime = i.endTime;
                            envirData.startTime = i.startTime;
                            envirData.endTime = i.endTime;
                            if (i.ability_type === 'ROBOT_ABILITY_TYPE_METER') {
                                let obj = {
                                    startTime: i.startTime,
                                    endTime: i.endTime,
                                }
                                if (i.status === 'FINISHED') {
                                    obj.result = JSON.parse(i.execute_result);
                                } else if (i.status === 'STOPPED') {
                                    obj.result = i.execute_result;
                                }
                                meterData.result.push(obj);
                            } else if (i.ability_type === 'ROBOT_ABILITY_TYPE_GASS') {
                                this.gasData.map(j => {
                                    if (j.name === i.code) {
                                        gasData.result.push({
                                            name: i.code,
                                            value: i.executeResultDeatil,
                                            unit: j.unit
                                        });
                                    }
                                })
                            } else if (i.ability_type === 'ROBOT_ABILITY_TYPE_ENVIR') {
                                this.TAHData.map(j => {
                                    if (j.name === i.code) {
                                        envirData.result.push({
                                            name: i.code === 'TEMPERATURE' ? '湿度' : '温度',
                                            value: i.executeResultDeatil,
                                            unit: j.unit
                                        });
                                    }
                                })
                            }
                        });
                        if (meterData.result.length) {
                            this.inspectionItemsDataForBacktracking.push(meterData);
                        }
                        if (gasData.result.length) {
                            this.inspectionItemsDataForBacktracking.push(gasData);
                        }
                        if (envirData.result.length) {
                            this.inspectionItemsDataForBacktracking.push(envirData);
                        }
                        // this.randomRotateSpeed();
                    } else {
                        this.inspectionItemDataEmptyMsg = '该巡检点没有巡检项';
                    }
                }
                this.inspectionWarningDataForBacktracking = [];
                if (emerListMap.length) {
                    emerListMap.map(i => {
                        i.executeResult = JSON.parse(i.executeResult);
                        if (i.abilityType === 'ROBOT_ABILITY_TYPE_ENVIR' || i.abilityType === 'ROBOT_ABILITY_TYPE_GASS') {
                            if (i.executeResult.ok) {
                                i.executeResult.result = JSON.parse(i.executeResult.result);
                                i.executeResult.result.mes = JSON.parse(i.executeResult.result.mes)
                            }
                        }
                        let obj = {},
                            {
                                pointResultName,
                                abilityType,
                                emergencyInfoStatus,
                                emergencyGrade,
                                executeResult
                            } = i;
                        if (abilityType === 'ROBOT_ABILITY_TYPE_METER') {
                            let {calcValue, calcUnit, calcSuccess, mes} = executeResult;
                            obj.type = '表计识别';
                            if (calcSuccess) {
                                obj.value = calcValue;
                                obj.unit = calcUnit;
                            } else {
                                obj.errorMsg = mes
                            }
                        } else if (abilityType === 'ROBOT_ABILITY_TYPE_GASS') {
                            let {mes} = executeResult.result;
                            obj.type = '气体识别';
                            obj.gass = [];
                            this.gasData.map(i => {
                                mes.map(j => {
                                    if (i.name === j.gasType) {
                                        obj.gass.push({
                                            name: j.gasType,
                                            value: j.gasConcentration,
                                            unit: i.unit
                                        });
                                    }
                                });
                            });
                        } else if (abilityType === 'ROBOT_ABILITY_TYPE_ENVIR') {
                            let {humidity, temperature} = executeResult.result.mes;
                            obj.type = '环境识别';
                            obj.humidity = humidity
                            obj.temperature = temperature
                        }
                        this.pointList.map(j => {
                            if (pointResultName === j.pointName) {
                                obj.pointName = j.pointOtherName || pointResultName
                            }
                        });
                        obj.time = `${moment(i.itemStartTime).format('HH:mm:ss')}-${moment(i.itemEndTime).format('HH:mm:ss')}`;
                        obj.pointCurrentNum = i.pointCurrentNum;
                        obj.pointTotal = i.pointTotal;
                        obj.itemName = i.itemName;
                        obj.status = this.translationKey(emergencyInfoStatus);
                        obj.level = `${this.translationKey(emergencyGrade)}预警`;
                        warningList.push(obj);
                    });
                    this.inspectionWarningDataForBacktracking = warningList;
                }
                this.inspectionWarningCountForBacktracking = emercount;
            }).catch(() => {
                if (type === 'point') {
                    this.inspectionItemDataLoading = false;
                    this.inspectionItemDataEmptyMsg = '加载失败';
                }
            });
        },
        // 控制权限判断，只有sysadmin才有权限控制卷帘门和充电桩
        controlPermission(name) {
            if (name === '卷帘门' || name === '充电桩') {
                return this.$store.state.userInfo.id === 'sysadmin'
            } else {
                return true
            }
        },
        // 获取充电房信息
        // getChargingRoomInfo() {
        //     let {id} = this.robotInfo,
        //         params = {},
        //         data = {
        //             method: "getChargingRoomInfo",
        //             params: [JSON.stringify(params)],
        //         },
        //         {token} = this;
        //     sevnceApi.getRbp(data, token).then(res => {
        //     })
        // },
    },
    filters: {
        /*
        * 格式化天气信息中key值
        * name：weatherInfo中key值
        * */
        filterWeatherInfoKey(name) {
            switch (name) {
                case 'lastUpdate': {
                    return '气象信息';
                }
                case 'weather': {
                    return '天气';
                }
                case 'temperature': {
                    return '温度';
                }
                case 'humidity': {
                    return '湿度';
                }
                case 'atmosphericPressure': {
                    return '气压';
                }
                case 'precipitation': {
                    return '降水';
                }
                case 'windDirection': {
                    return '风力风向';
                }
            }
        },
        /*
        * 格式化油位值
        * calcMsg：值
        * */
        filterOilLevel(calcMsg) {
            switch (calcMsg) {
                case '0': {
                    return '无水迹'
                }
                case '1': {
                    return '有水迹'
                }
                case '2': {
                    return '未戴安全帽'
                }
                case '3': {
                    return '佩戴安全帽'
                }
                case '4': {
                    return '场景正常'
                }
                case '5': {
                    return '场景异常'
                }
                case '6': {
                    return '无原油泄露'
                }
                case '7': {
                    return '有原油泄漏'
                }
            }
        },
        // 格式化预警信息详情名称
        filterWarningDetailsKeys(key) {
            switch (key) {
                case 'appno': {
                    return '预警编号'
                }
                case 'project': {
                    return '所属项目'
                }
                case 'lng': {
                    return '经度'
                }
                case 'lat': {
                    return '纬度'
                }
                case 'updateDate': {
                    return '更新时间'
                }
                case 'updateBy': {
                    return '更新者'
                }
                case 'warningDate': {
                    return '预警时间'
                }
                case 'source': {
                    return '预警源'
                }
                case 'type': {
                    return '预警类型'
                }
                case 'title': {
                    return '预警名称'
                }
                case 'content': {
                    return '预警内容'
                }
                case 'dealUser': {
                    return '处理人'
                }
                case 'dealContent': {
                    return '受理内容'
                }
                case 'dealDate': {
                    return '处理时间'
                }
                case 'dealResult': {
                    return '处理结果'
                }
                case 'followDept': {
                    return '跟进部门'
                }
                case 'finishDate': {
                    return '完结时间'
                }
                case 'device': {
                    return '集成设备'
                }
                case 'deviceCompose': {
                    return '组成设备'
                }
                default : {
                    return key
                }
            }
        },
    },
    watch: {
        // 监听云台面板状态
        cloudControlFlag(newValue) {
            let video = this.$refs.videoPanel,
                cloudControl = this.$refs.cloudControl;
            if (newValue) {
                video.style.right = '455px';
                cloudControl.style.right = 0
            } else {
                video.style.right = 0;
                cloudControl.style.right = '-480px'
            }
        },
        // 监听机器人状态，如果切换为巡检中，则关闭云台控制面板
        'robotInfo.condition': {
            handler(newValue) {
                if (newValue === 'on-line') {
                    this.cloudControlFlag = false;
                }
            }
        },
    },
    components: {
        popover,
        topBar,
        logo,
        info,
        myTitle,
        backtrack,
        empty,
        gas,
        myMeter,
        meterForBacktracking,
        environment
    }
}
