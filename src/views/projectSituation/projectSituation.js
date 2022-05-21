// 组件：空状态
import empty from '@/components/empty/empty.vue';
// 组件；全局顶栏：搜索框、刷新、全屏、用户信息、通知消息、主题、设置
import topBar from '@/components/topBar/topBar.vue';
// 组件：弹出框
import popover from "@/components/popover/popover";
// 组件：顶部logo
import logo from "@/components/logo/logo.vue";
// 组件：数字滚动
import countTo from 'vue-count-to';
// 高德地图
import AMap from 'AMap';
// moment.js
import moment from "moment";
// API
import sevnceApi from "@/request/api/sevnce";
// echarts.js
import * as echarts from 'echarts';
// mixin
import mixins from "@/assets/js/mixins";

export default {
    name: 'ProjectSituation',
    mixins: [mixins],
    data() {
        return {
            projectId: '',
            // 面包屑选项卡
            tabs: [
                {
                    id: 1,
                    name: '巡检态势'
                },
                {
                    id: 2,
                    name: '安全态势'
                }
            ],
            // 当前展示环境信息
            currentEnvironment: {
                '温度': '',
                '湿度': '',
                '风速': '',
                '风向': '',
                '气压': '',
            },
            // 高德地图相关数据
            mapOptions: {
                // 地图载体
                map: '',
                // 地图中心点
                mapCenter: [116.397428, 39.90923],
            },
            // 地区列表
            provinceList: '',
            // 机器人列表
            robotList: [],
            // 机器人全部状态 fault：有故障 on-line：巡检中 off-line：已离线 charging：充电中 standby：待机中
            robotStatus: {
                all: '',
                'on-line': '',
                'off-line': '',
                fault: '',
                charging: '',
                standby: ''
            },
            // 当前选中状态
            currentRobotStatus: 'all',
            // 机器人列表筛选项
            robotsFilters: [
                {
                    id: 'inspection',
                    name: '巡检次数',
                    filter: ''
                },
            ],
            // 机器人列表筛选项-激活项
            robotsFilterActive: '',
            // 态势中部数据
            situationCenterData: {
                // 巡检态势
                inspection: [
                    {
                        title: '机器人台数',
                        value: 0,
                        bgImg: 'robot'
                    },
                    {
                        title: '安全巡检天数',
                        value: 0,
                        bgImg: 'days'
                    },
                    {
                        title: '隐患预警次数',
                        value: 0,
                        bgImg: 'warning'
                    },
                    {
                        title: '巡检完成率',
                        value: 0,
                        unit: '%',
                        bgImg: 'ratio'
                    },
                    {
                        title: '识别成功率',
                        value: 0,
                        unit: '%',
                        bgImg: 'ratio'
                    }
                ],
                // 安全态势
                security: [
                    {
                        title: '安全巡检天数',
                        value: 100,
                        bgImg: 'days'
                    },
                    {
                        title: '巡检任务次数',
                        value: 1800,
                        bgImg: 'task'
                    },
                    {
                        title: '安全预警次数',
                        value: 120,
                        bgImg: 'warning'
                    },
                    {
                        title: '保障设施数',
                        value: 12000,
                        bgImg: 'list'
                    },
                    {
                        title: '巡检数据条数',
                        value: 12.2,
                        unit: 'w',
                        bgImg: 'ratio'
                    },
                ],
            },
            // 图表操作数据
            chartOperatingData: {
                // 任务次数图表
                numberOfTasks: {
                    // 单选项
                    radio: 'line',
                    yearValue: '',
                    yearOptions: [],
                    monthValue: '',
                    monthOptions: [
                        {
                            label: '全年',
                            value: '',
                        },
                        {
                            label: '1月',
                            value: 1
                        },
                        {
                            label: '2月',
                            value: 2
                        },
                        {
                            label: '3月',
                            value: 3
                        },
                        {
                            label: '4月',
                            value: 4
                        },
                        {
                            label: '5月',
                            value: 5
                        },
                        {
                            label: '6月',
                            value: 6
                        },
                        {
                            label: '7月',
                            value: 7
                        },
                        {
                            label: '8月',
                            value: 8
                        },
                        {
                            label: '9月',
                            value: 9
                        },
                        {
                            label: '10月',
                            value: 10
                        },
                        {
                            label: '11月',
                            value: 11
                        },
                        {
                            label: '12月',
                            value: 12
                        },
                    ],
                    xNumber: 12,
                },
                // 预警趋势
                EWT: {
                    yearValue: '',
                    yearOptions: [],
                    monthValue: '',
                    monthOptions: [
                        {
                            label: '全年',
                            value: '',
                        },
                        {
                            label: '1月',
                            value: 1
                        },
                        {
                            label: '2月',
                            value: 2
                        },
                        {
                            label: '3月',
                            value: 3
                        },
                        {
                            label: '4月',
                            value: 4
                        },
                        {
                            label: '5月',
                            value: 5
                        },
                        {
                            label: '6月',
                            value: 6
                        },
                        {
                            label: '7月',
                            value: 7
                        },
                        {
                            label: '8月',
                            value: 8
                        },
                        {
                            label: '9月',
                            value: 9
                        },
                        {
                            label: '10月',
                            value: 10
                        },
                        {
                            label: '11月',
                            value: 11
                        },
                        {
                            label: '12月',
                            value: 12
                        },
                    ],
                    xNumber: 12,
                }
            },
            // 图表载体
            charts: {},
            // 左侧-安全态势-分区数据
            areaList: [
                {
                    id: 1,
                    name: '乙二醇区'
                },
                {
                    id: 2,
                    name: '存储区'
                },
                {
                    id: 3,
                    name: '乙醇区'
                },
                {
                    id: 4,
                    name: 'xxx区'
                }
            ],
            // 左侧-安全态势-预警处理
            warningProcess: [
                {
                    name: '预警总数',
                    value: 120
                },
                {
                    name: '未处理预警',
                    value: 24
                },
                {
                    name: '处理率',
                    value: ''
                },
                // {
                //     name: '平均处理时常',
                //     value: "0h38'20''"
                // },
            ],
            // 左侧-搜索框
            search: {
                inspection: '',
                security: ''
            },
            // 安全态势-左侧列表筛选
            warningFilters: [
                {
                    id: 'emerSort',
                    name: '预警次数',
                    filter: 2
                },
                {
                    id: 'patrolSort',
                    name: '巡检次数',
                    filter: 1
                },
                {
                    id: 'emerPendingSort',
                    name: '未处理次数',
                    filter: 1
                },
            ],
            // 安全态势-左侧列表激活项
            warningFilterActive: 'emerSort',
            // 左侧-安全态势-预警列表
            warningList: [],
            // 列表分页
            page: {
                inspection: {
                    currentPage: 1,
                    pageSize: 6,
                    total: 0
                },
                security: {
                    currentPage: 1,
                    pageSize: 6,
                    total: 0
                },
            },
            // 信息窗口数据
            infoWindowData: '',
            // 点击marker延时器载体
            clickMarkerTimeout: '',
            // 切换信息窗口延时器载体
            toggleInfoWindowTimeOut: '',
            // 图表颜色配置
            chartColorOptions: {},
            // 加载中/无数据文字信息
            loadingMsg: '加载中',
            // 安全态势-台账数据加载中/无数据文字
            assetsLoadingMsg: '加载中',
            // 列表加载状态
            listLoading: false,
            // 安全态势-台账数据加载状态
            assetsLoading: false,
            // 所有状态下机器人id
            robotStatusIds: [],
            // 机器人状态数量、项目整体数据定时器载体
            statusTimeInterval: '',
            // 所有在线机器人列表
            onLineRobotList: [],
            // 巡检态势-任务次数数据
            NOTData: {
                origin: '',
                ratio: []
            },
            // 巡检态势-完成率分析数据
            CRData: '',
            // 安全态势-预警趋势数据
            EWTData: {
                origin: '',
                data: []
            },
            // 预警设备占比数据
            POWEData: {
                count: 0,
                data: []
            }
        }
    },
    mounted() {
        this.initMap();
        this.getProvinceList();
        this.initAllCharts();
    },
    destroyed() {
        clearInterval(this.statusTimeInterval);
    },
    methods: {
        // 获取仓库中的provinceList数据
        getProvinceList() {
            this.provinceList = this.$store.state.provinceList;
            let timeInterval = setInterval(() => {
                if (!this.provinceList.length) {
                    this.provinceList = this.$store.state.provinceList;
                } else {
                    clearInterval(timeInterval);
                    this.setProject();
                }
            }, 30);
        },
        // 设置当前区域、项目
        setProject() {
            if (this.provinceList.length) {
                let {projectId, areaId} = this.$route.query,
                    currentArea = '',
                    currentProject = '';
                if (areaId) {
                    this.provinceList.map(i => {
                        if (i.code === areaId) {
                            currentArea = i;
                            currentProject = i.projects[0];
                        }
                    })
                } else {
                    if (projectId) {
                        this.provinceList.map(i => {
                            i.projects.map(j => {
                                if (j.sysPorjectId === projectId) {
                                    currentArea = i;
                                    currentProject = j;
                                }
                            });
                        });
                    } else {
                        currentArea = this.provinceList[0];
                        currentProject = this.provinceList[0].projects[0];
                    }
                }
                let {latitude, longitude, sysPorjectId} = currentProject;
                this.projectId = sysPorjectId;
                this.navbar = [{id: 0, name: '全国'}, currentArea, currentProject];
                this.mapOptions.map.setCenter([Number(longitude), Number(latitude)]);
                this.getProjectRobotList();
                this.getSituationCenter();
                this.getAssetsInfo();
                // 每5分钟更新一次数据
                this.statusTimeInterval = setInterval(() => {
                    this.getProjectRobotList();
                    this.getSituationCenter();
                }, 1000 * 60 * 5);
                this.getWeather([`{'projectId':'${sysPorjectId}'}`]);
            }
        },
        // 根据项目id查机器人台数、安全巡检天数、预警次数、巡检完成率、识别成功率
        getSituationCenter() {
            let {projectId, token} = this,
                data = {
                    method: "selectRobotDetailBySysProjectId",
                    params: [`{'projectId':${projectId}}`],
                },
                safetyData = {
                    method: "getStatisticsAssetsManagement",
                    params: [`{'projectId':${projectId}}`],
                }
            sevnceApi.getRbp(data, token).then(res => {
                let result = JSON.parse(res.result),
                    {
                        emergencyNum,
                        securityOnDays,
                        taskSuccessRate,
                        distinguishRate,
                        taskResultCreateDate
                    } = result,
                    firstYear = '',
                    currentYear = '';
                this.chartOperatingData.numberOfTasks.yearOptions = [];
                this.chartOperatingData.EWT.yearOptions = [];
                this.situationCenterData.inspection.map(i => {
                    if (i.title === '安全巡检天数') {
                        i.value = securityOnDays;
                    } else if (i.title === '隐患预警次数') {
                        i.value = emergencyNum;
                    } else if (i.title === '巡检完成率') {
                        i.value = taskSuccessRate && taskSuccessRate !== '0' ? Number(taskSuccessRate.replace('%', '')) : 0;
                    } else if (i.title === '识别成功率') {
                        i.value = distinguishRate && distinguishRate !== '0' ? Number(distinguishRate.replace('%', '')) : 0;
                    }
                });
                // 格式化该项目第一条巡检任务日期
                firstYear = Number(moment(moment(taskResultCreateDate).valueOf()).format('YYYY'));
                // 获取当前年份
                currentYear = Number(moment().format('YYYY'));
                // 给年份选择器赋值
                if (firstYear) {
                    for (let i = firstYear; i <= currentYear; i++) {
                        this.chartOperatingData.numberOfTasks.yearOptions.push({
                            label: `${i}年`,
                            value: i
                        });
                        this.chartOperatingData.EWT.yearOptions.push({
                            label: `${i}年`,
                            value: i
                        });
                    }
                } else {
                    this.chartOperatingData.numberOfTasks.yearOptions.push({
                        label: `${currentYear}年`,
                        value: currentYear
                    });
                    this.chartOperatingData.EWT.yearOptions.push({
                        label: `${currentYear}年`,
                        value: currentYear
                    });
                }
                // 默认选中当前年份
                this.chartOperatingData.numberOfTasks.yearValue = currentYear;
                this.chartOperatingData.EWT.yearValue = currentYear;
                // 获取图表数据
                this.getNOTChartsData();
                this.getCRCChartData();
                this.getEWTChartData();
                this.getPOEWEChartData();
            });
            sevnceApi.getRbp(safetyData, token).then(res => {
                let {mes} = res.result,
                    {assetsCount, emerCount, itemCount, pendingCount, securityDays, taskCount} = mes;
                this.situationCenterData.security.map(i => {
                    if (i.title === '安全巡检天数') {
                        i.value = securityDays
                    } else if (i.title === '巡检任务次数') {
                        i.value = taskCount
                    } else if (i.title === '安全预警次数') {
                        i.value = emerCount
                    } else if (i.title === '保障设施数') {
                        i.value = assetsCount
                    } else if (i.title === '巡检数据条数') {
                        i.value = itemCount < 10000 ? itemCount : (itemCount / 10000).toFixed(2);
                    }
                });
                // 预警总数
                this.warningProcess[0].value = emerCount;
                // 未处理预警
                this.warningProcess[1].value = emerCount - pendingCount
                // 处理率
                this.warningProcess[2].value = emerCount ? `${(pendingCount / emerCount * 100).toFixed(0)}%` : '0%';
            })
        },
        // 根据项目id获取机器人列表
        getProjectRobotList() {
            this.listLoading = true;
            this.loadingMsg = '加载中';
            let {pageSize, currentPage} = this.page.inspection,
                {projectId, robotStatusIds, currentRobotStatus} = this,
                {inspection} = this.search,
                {filter} = this.robotsFilters[0],
                deviceId = [];
            if (robotStatusIds.length) {
                robotStatusIds.map(i => {
                    if (i.status === currentRobotStatus && currentRobotStatus) {
                        deviceId = i.list
                    }
                });
            }
            let data = {
                method: "selectStatisticsRobotInfo",
                params: [`{'projectId':${projectId},'pageSize':${pageSize},'pageNo':${currentPage},'deviceName':'${inspection}','sort':'${filter}','deviceIdList':${JSON.stringify(deviceId)}}`],
            }
            sevnceApi.getRbp(data, this.token).then(res => {
                this.mapOptions.map.clearMap();
                this.clearAllTimeout();
                let {
                    deviceCount,
                    list,
                    robotCount,
                    patrolRobotCount,
                    robotOffLineCount,
                    faultRobotCount,
                    chargingRobotCount,
                    standbyRobotCount,
                    chargingRobotIdList,
                    faultRobotIdList,
                    robotOffLineIdList,
                    standbyRobotIdList,
                    robotOnLineCount,
                    robotOnLineIdList,
                    patrolRobotIdList,
                } = res.result.mes;
                console.log(res.result.mes)
                this.robotStatus = {
                    all: Number(robotCount),
                    'on-line': patrolRobotCount,
                    'off-line': robotOffLineCount,
                    fault: faultRobotCount,
                    charging: chargingRobotCount,
                    standby: standbyRobotCount
                };
                this.robotStatusIds = [
                    {
                        status: 'charging',
                        list: chargingRobotIdList,
                    },
                    {
                        status: 'fault',
                        list: faultRobotIdList,
                    },
                    {
                        status: 'off-line',
                        list: robotOffLineIdList,
                    },
                    {
                        status: 'on-line',
                        list: patrolRobotIdList
                    },
                    {
                        status: 'standby',
                        list: standbyRobotIdList
                    }
                ];
                this.situationCenterData.inspection[0].value = robotOnLineCount;
                this.page.inspection.total = deviceCount;
                if (list.length) {
                    let array = [];
                    list.map(i => {
                        i.resultStatus = this.formatterRobotStatus(i.robotStatus);
                        let {
                            deviceName,
                            deviceId,
                            hours,
                            completionRate,
                            itemCount,
                            electric,
                            mileage,
                            patrolCount,
                            resultStatus,
                            longitude,
                            latitude,
                            itemSuccessRate
                        } = i;
                        array.push({
                            // 机器人id
                            id: deviceId,
                            // 机器人名称
                            name: deviceName,
                            // 巡检次数
                            inspection: patrolCount,
                            // 机器人状态
                            status: resultStatus,
                            // 总识别次数
                            allDiscern: itemCount,
                            // 识别成功率
                            discernRate: itemSuccessRate,
                            // 总运行时间
                            allRun: hours,
                            // 巡检完成率
                            inspectionRate: completionRate,
                            // 当前电量
                            battery: Number(electric),
                            // 行驶里程
                            allMileage: mileage ? (Number(mileage) / 1000).toFixed(2) : '',
                            // 经度
                            lng: longitude,
                            // 纬度
                            lat: latitude
                        });
                    });
                    this.robotList = array;
                    this.getRobotStatus(robotOnLineIdList);
                } else {
                    this.loadingMsg = '无数据'
                    // this.$message.error('该公司暂无机器人列表数据');
                }
            }).catch(() => {
                this.loadingMsg = '无数据'
                // this.$message.error('获取机器人列表失败');
            }).finally(() => {
                this.listLoading = false;
            })
        },
        // 查询指定机器人详细信息
        getRobotStatus(ids) {
            let {projectId} = this, data = {
                method: "selectRobotCurrentStatusDetail",
                params: [`{'projectId':'${projectId}','deviceId':'${JSON.stringify(ids)}'}`],
            }
            sevnceApi.getRbp(data, this.token).then(res => {
                let {mes} = res.result, {activeTabs} = this;
                if (mes.length) {
                    this.onLineRobotList = mes;
                    mes.map(i => {
                        i.lng = i.longitude;
                        i.lat = i.latitude;
                        i.id = i.deviceId;
                        i.name = i.deviceName;
                        i.battery = i.bmsBattery === '' ? 0 : i.bmsBattery;
                        if (i.robotStatus === 'robotOffLine') {
                            i.status = 'off-line';
                        } else if (i.robotStatus === 'faultRobot') {
                            i.status = 'fault';
                        } else if (i.robotStatus === 'chargingRobot') {
                            i.status = 'charging';
                        } else if (i.robotStatus === 'patrolRobot') {
                            i.status = 'on-line';
                        } else if (i.robotStatus === 'standbyRobot') {
                            i.status = 'standby';
                        } else if (i.robotStatus === 'meetRobot') {
                            i.status = 'meet';
                            i.title = '前方障碍';
                            i.desc = '机器人无法移动'
                        }
                    })
                }
                if (activeTabs === 1) {
                    // 初始化机器人点位
                    this.initRobotPoint();
                    // 轮询切换信息窗口
                    this.toggleInfoWindow();
                }
            });
        },
        // 初始化机器人点位
        initRobotPoint() {
            let markerList = [],
                // 创建 AMap.Icon 实例：
                icon = new AMap.Icon({
                    // 图标尺寸
                    size: new AMap.Size(40, 32.1),
                    // Icon的图像
                    image: require('@/assets/images/common/icon-robot.png'),
                    // 根据所设置的大小拉伸或压缩图片
                    imageSize: new AMap.Size(40, 32.1)
                });
            this.onLineRobotList.map(i => {
                // 创建一个 Marker 实例：
                let marker = new AMap.Marker({
                    // 经纬度对象，也可以是经纬度构成的一维数组，如：[116.39, 39.9]
                    position: new AMap.LngLat(i.lng, i.lat),
                    // 点标记显示内容，可以是HTML要素字符串或者HTML DOM对象。content有效时，icon属性将被覆盖
                    // content,
                    icon,
                    // 点标记显示位置偏移量
                    offset: new AMap.Pixel(-20.28, -37.88)
                });
                // 将机器人数据绑定到marker上
                marker.setExtData({'data': i});
                marker.on('click', e => {
                    let data = e.target.getExtData().data;
                    // 打开当前点击marker的信息窗口
                    this.initRobotInfoWindow(data);
                    // 如果已经存在marker延时器时 把上一个marker延时器清除
                    if (this.clickMarkerTimeout) {
                        for (let i = 1; i <= this.clickMarkerTimeout; i++) {
                            clearTimeout(i);
                        }
                    }
                    // 清除切换信息窗口延时器
                    this.clearAllTimeout();
                    // 当点击marker 10s 内无再次点击；则继续轮询切换信息窗口
                    this.clickMarkerTimeout = setTimeout(() => {
                        this.toggleInfoWindow();
                    }, 10000)
                })
                markerList.push(marker);
            });
            // 将创建的点标记添加到已有的地图实例：
            this.mapOptions.map.add(markerList);
            this.mapOptions.map.setFitView();
        },
        // 初始化巡检点预警点位
        initWarningPoint() {
            let markerList = [],
                // 创建 AMap.Icon 实例：
                icon = new AMap.Icon({
                    // 图标尺寸
                    size: new AMap.Size(16, 16),
                    // Icon的图像
                    image: require('@/assets/images/common/icon-marker-security.png'),
                    // 根据所设置的大小拉伸或压缩图片
                    imageSize: new AMap.Size(16, 16)
                });
            this.warningList.map(i => {
                // 创建一个 Marker 实例：
                let marker = new AMap.Marker({
                    // 经纬度对象，也可以是经纬度构成的一维数组，如：[116.39, 39.9]
                    position: new AMap.LngLat(i.lng, i.lat),
                    // 点标记显示内容，可以是HTML要素字符串或者HTML DOM对象。content有效时，icon属性将被覆盖
                    // content,
                    icon,
                    // 点标记显示位置偏移量
                    offset: new AMap.Pixel(-8, -16)
                });
                // 将机器人数据绑定到marker上
                marker.setExtData({'data': i});
                marker.on('click', e => {
                    let data = e.target.getExtData().data;
                    // 打开当前点击marker的信息窗口
                    this.initWarningInfoWindow(data);
                    // 如果已经存在marker延时器时 把上一个marker延时器清除
                    if (this.clickMarkerTimeout) {
                        clearTimeout(this.clickMarkerTimeout)
                    }
                    // 清除切换信息窗口延时器
                    this.clearAllTimeout();
                    // 当点击marker 10s 内无再次点击；则继续轮询切换信息窗口
                    this.clickMarkerTimeout = setTimeout(() => {
                        this.toggleInfoWindow();
                    }, 10000)
                })
                markerList.push(marker);
            });
            // 将创建的点标记添加到已有的地图实例：
            this.mapOptions.map.add(markerList);
            this.mapOptions.map.setFitView();
        },
        // 轮询切换信息窗口
        toggleInfoWindow() {
            let {onLineRobotList, activeTabs} = this,
                infoWindowFn = '',
                list = [];
            if (activeTabs === 1) {
                infoWindowFn = 'initRobotInfoWindow';
                onLineRobotList.map(i => {
                    if (i.status !== 'off-line') {
                        list.push(i);
                    }
                });
            } else {
                // infoWindowFn = 'initWarningInfoWindow'
                // list = [...warningList]
            }
            if (list.length) {
                for (let i = 0; i < list.length; i++) {
                    this.toggleInfoWindowTimeOut = setTimeout(() => {
                        this[infoWindowFn](list[i]);
                        // 当前索引为最后一个元素时且机器人列表个数大于一个时；从头执行toggleInfoWindow()
                        if (i + 1 === list.length && list.length > 1) {
                            setTimeout(() => {
                                this.toggleInfoWindow();
                            }, 10000);
                        }
                    }, 10000 * i);
                }
            }
        },
        // 初始化机器人信息窗口
        initRobotInfoWindow(robotInfo) {
            let {id, name, status, battery, lng, lat, taskName, taskStartTime, pointCurrentNum, pointTotal} = robotInfo,
                // 信息窗口类名-根据机器人当前状态区别
                infoWindowClass = '';
            if (status === 'charging' || status === 'standby') {
                infoWindowClass = 'infoWindow-warning'
            } else if (status === 'fault' || status === 'meet') {
                infoWindowClass = 'infoWindow-error'
            }
            // 信息窗口基础信息
            this.infoWindowData = {
                id,
                name,
                status,
                class: infoWindowClass,
                battery
            }
            // 不同状态不同信息
            if (status === 'on-line') {
                this.infoWindowData.taskName = taskName;
                this.infoWindowData.schedule = `${pointCurrentNum}/${pointTotal}`;
            } else if (status === 'standby') {
                this.infoWindowData.taskName = taskName;
                this.infoWindowData.startTime = taskStartTime;
            } else if (status === 'meet') {
                this.infoWindowData.taskName = taskName;
                this.infoWindowData.startTime = taskStartTime;
                let {title, desc} = robotInfo;
                this.infoWindowData.warning = {};
                this.infoWindowData.warning.name = title;
                this.infoWindowData.warning.desc = desc;
            } else if (status === 'charging') {
                let {bmsCurrent, bmsVoltage} = robotInfo;
                this.infoWindowData.outputCurrent = bmsCurrent;
                this.infoWindowData.outputVoltage = bmsVoltage;
            }
            let content = this.$refs.infoWindowContent;
            let infoWindow = new AMap.InfoWindow({
                isCustom: true,
                content,
                offset: new AMap.Pixel(0, -50)
            });
            infoWindow.open(this.mapOptions.map, [lng, lat]);
            this.mapOptions.map.setCenter([lng, lat]);
        },
        // 初始化巡检点预警信息窗口
        initWarningInfoWindow(warningInfo) {
            let {name, lng, lat} = warningInfo;
            // 信息窗口基础信息
            this.infoWindowData = {
                name,
                class: 'infoWindow-error infoWindow-security',
            }
            let content = this.$refs.infoWindowContent;
            let infoWindow = new AMap.InfoWindow({
                isCustom: true,
                content,
                offset: new AMap.Pixel(0, -20)
            });
            infoWindow.open(this.mapOptions.map, [lng, lat]);
            this.mapOptions.map.setCenter([lng, lat]);
        },
        /*
        * topBar组件事件：改变主题
        * value：主题名称
        * */
        changeTheme(value) {
            this.currentTheme = value;
            setTimeout(() => {
                this.setNOTChartOption();
                this.setCRCChartOption();
                this.setEWTChartOption();
                this.setPOWEChartOption();
                this.charts.map(i => {
                    i.resize()
                })
            }, 30);
        },
        /*
        * 切换面包屑选项卡
        * id：选项卡项i
        * 通过选项卡id来显示激活项
        * 切换至任务回溯时 调用获取getHistoryTask();获取历史任务
        * */
        toggleTab(id) {
            if (this.activeTabs !== id) {
                this.activeTabs = id;
                this.mapOptions.map && this.mapOptions.map.clearMap();
                this.clearAllTimeout();
                if (id === 1) {
                    this.initRobotPoint()
                } else {
                    // this.initWarningPoint();
                }
                this.toggleInfoWindow();
            }
            // 左侧态势信息
            this.$refs.inspection.style.left = id === 1 ? 0 : '-410px';
            this.$refs.security.style.left = id === 1 ? '-410px' : 0;
            // 中间数据概览
            this.$refs.contentCenter.style.transform = id === 1 ? '' : 'rotateX(90deg)';
            // 右侧图表
            this.$refs.rightInspection.style.right = id === 1 ? 0 : '-480px';
            this.$refs.rightSecurity.style.right = id === 1 ? '-480px' : 0;
        },
        // 清除所有延时器
        clearAllTimeout() {
            let {toggleInfoWindowTimeOut} = this;
            if (toggleInfoWindowTimeOut) {
                for (let i = 1; i <= toggleInfoWindowTimeOut; i++) {
                    clearTimeout(i);
                }
            }
        },
        // 初始化地图
        initMap() {
            this.mapOptions.map = new AMap.Map('map', {
                // 地图中心点
                center: this.mapOptions.mapCenter,
                // 自适应大小
                resizeEnable: true,
                // 扩大缩放范围
                expandZoomRange: true,
                // 当前缩放等级
                zoom: 18,
                // 缩放范围
                zooms: [3, 20],
                // 视图模式
                viewMode: '3D',
                // 倾斜角度
                pitch: 40,
                // 旋转角度
                rotation: -55,
                // 地图样式
                mapStyle: ''
            });
            let currentTheme = localStorage.getItem('theme'),
                mapStyleName = '';
            switch (currentTheme) {
                case 'default' || false: {
                    mapStyleName = 'amap://styles/5d8cdf46b2f501f196504e13b2fb1248';
                    break;
                }
                case 'minimalism': {
                    mapStyleName = 'amap://styles/4383178f2ccbc6b9a7abdbe5bb2bc249';
                    break;
                }
                case 'prime': {
                    mapStyleName = 'amap://styles/ad95136087d05288882f49de8dd7752a';
                    break;
                }
            }
            this.mapOptions.map.setMapStyle(mapStyleName);
        },
        // 改变机器人概况筛选条件
        changeFilter(item) {
            let {activeTabs, warningFilterActive} = this,
                {id, filter} = item;
            // 机器人概况
            if (activeTabs === 1) {
                if (filter === '') {
                    item.filter = 1;
                    this.robotsFilterActive = item.id;
                } else if (filter === 1) {
                    item.filter = 2;
                    this.robotsFilterActive = item.id;
                } else {
                    item.filter = '';
                    this.robotsFilterActive = '';
                }
                this.getProjectRobotList();
            } else {
                if (warningFilterActive !== id) {
                    this.warningFilterActive = id;
                } else {
                    item.filter = filter === 2 ? 1 : 2
                }
                this.getAssetsInfo();
            }
        },
        // 组件事件：改变任务次数图表单选项
        changeNOTRadio() {
            if (this.charts.NOTChart) {
                this.charts.NOTChart.dispose();
            }
            this.initNOTTrendCharts();
            this.setNOTChartOption();
        },
        /*
        * 组件事件：改变任务次数图表选择器选项
        * type：年/月
        * event：值
        * */
        changeNOTSelect(type, event) {
            let {activeTabs} = this, yearValue, monthValue, key;
            key = activeTabs === 1 ? 'numberOfTasks' : 'EWT';
            yearValue = this.chartOperatingData[key].yearValue;
            monthValue = this.chartOperatingData[key].monthValue;
            if (type === 'month') {
                if (event) {
                    // 获取当前选择月份有多少天
                    this.chartOperatingData[key].xNumber = moment(`${yearValue}-${monthValue}`, 'YYYY-MM').daysInMonth();
                } else {
                    this.chartOperatingData[key].xNumber = 12;
                }
            }
            if (activeTabs === 1) {
                this.getNOTChartsData();
            } else {
                this.getEWTChartData();
            }
        },
        // 任务次数图表
        initNOTTrendCharts() {
            this.charts.NOTChart = echarts.init(this.$refs.NOT);
        },
        // 完成率分析饼图图表
        initCRCharts() {
            for (let i = 1; i <= 4; i++) {
                this.charts[`CRChart${i}`] = echarts.init(this.$refs[`CR${i}`]);
            }
        },
        // 预警趋势折线图
        initEWTChart() {
            this.charts.EWTChart = echarts.init(this.$refs.EWT);
        },
        // 预警设备占比饼图
        initPOEWEChart() {
            this.charts.POEWEChart = echarts.init(this.$refs.POEWE);
        },
        // 初始化所有图表
        initAllCharts() {
            setTimeout(() => {
                // 右侧任务次数图表-默认为完成率趋势表（折线图）
                this.initNOTTrendCharts();
                // 右侧完成率分析饼图
                this.initCRCharts();
                // 右侧预警趋势折线图
                this.initEWTChart();
                // 右侧预警设备占比饼图
                this.initPOEWEChart();
            }, 30)
        },
        // 跳转至机器人态势
        toRobotSituation(id) {
            this.$router.push({
                path: `/robot/${id}`
            });
        },
        // 搜索机器人名称
        searchRobotName() {
            this.getProjectRobotList();
        },
        // 组件事件：改变机器人列表页码
        changeRobotListPage() {
            this.getProjectRobotList();
        },
        /*
        * 改变筛选状态
        * key：状态
        * */
        changeFilterStatus(key) {
            if (this.robotStatus.all) {
                this.currentRobotStatus = key;
                this.getProjectRobotList();
            }
        },
        /*
        * 调用echarts loading事件
        * chart：图表载体
        * */
        chartLoading(chart) {
            let {maskBackgroundColor} = this.chartColorOptions;
            if (this.charts[chart]) {
                this.charts[chart].showLoading({
                    text: '',
                    maskColor: maskBackgroundColor
                });
            }
        },
        // 获取右侧折线/柱状图表数据
        getNOTChartsData() {
            let {projectId, token} = this,
                {yearValue, monthValue, xNumber} = this.chartOperatingData.numberOfTasks,
                data = {
                    method: "selectPatrolTaskCount",
                    params: [`{'projectId':'${projectId}','year':'${yearValue}','month':'${monthValue}'}`],
                }
            this.chartLoading('NOTChart');
            sevnceApi.getRbp(data, token).then(res => {
                this.charts.NOTChart.hideLoading();
                let {mes} = res.result,
                    daysRatio = []
                this.NOTData.origin = '';
                this.NOTData.ratio = [];
                for (let i = 1; i <= xNumber; i++) {
                    daysRatio.push({
                        index: i,
                        partolCount: 0,
                        successCount: 0
                    });
                }
                // 当为天数时
                if (monthValue) {
                    daysRatio.map(i => {
                        mes.map(j => {
                            if (i.index === j.startDay) {
                                i.partolCount = j.partolCount;
                                i.successCount = j.successCount;
                            }
                        });
                    });
                    this.NOTData.origin = daysRatio;
                    daysRatio.map(i => {
                        if (i.partolCount) {
                            this.NOTData.ratio.push(Number((i.successCount / i.partolCount * 100).toFixed(0)))
                        } else {
                            this.NOTData.ratio.push(0)
                        }
                    });
                } else {
                    daysRatio.map(i => {
                        mes.map(j => {
                            if (i.index === j.startTime) {
                                i.partolCount = j.partolCount;
                                i.successCount = j.successCount;
                            }
                        });
                    });
                    this.NOTData.origin = daysRatio;
                    daysRatio.map(i => {
                        if (i.partolCount) {
                            this.NOTData.ratio.push((i.successCount / i.partolCount * 100).toFixed(0));
                        } else {
                            this.NOTData.ratio.push(0)
                        }
                    })
                }
                this.setNOTChartOption();
            });
        },
        // 获取数据后统一设置任务次数图表的配置
        setNOTChartOption() {
            let {
                    color,
                    tipBorderColor,
                    tipBackgroundColor,
                    symbol,
                    allTaskBarColor,
                    completeTaskBarColor,
                    splitAreaBackgroundColor
                } = this.chartColorOptions,
                {origin, ratio} = this.NOTData,
                {yearValue, monthValue, xNumber, radio} = this.chartOperatingData.numberOfTasks,
                barWidth = 10,
                options = '',
                months = [],
                xInterval = null;
            if (xNumber > 12) {
                xInterval = 4;
            }
            for (let i = 1; i <= xNumber; i++) {
                if (xNumber > 12) {
                    months.push(i)
                } else {
                    months.push(`${i}月`)
                }
            }
            // 折线图
            if (radio === 'line') {
                options = {
                    // 全局颜色
                    color: [color],
                    // 悬浮框
                    tooltip: {
                        trigger: 'axis',
                        // 边框颜色
                        borderColor: tipBorderColor,
                        // 背景色
                        backgroundColor: tipBackgroundColor,
                        // 文字样式
                        textStyle: {
                            // 颜色
                            color,
                            // 字体
                            fontFamily: 'Microsoft YaHei,PingFang SC'
                        },
                        // 格式化文本数据
                        formatter: params => {
                            if (monthValue) {
                                let success = origin[params[0].dataIndex].successCount,
                                    total = origin[params[0].dataIndex].partolCount
                                return `${yearValue}年${monthValue}月${params[0].axisValueLabel}<br/>完成任务次数：${success}/${total}<br/>完成率：${params[0].value}%`
                            } else {
                                let success = origin[params[0].dataIndex].successCount,
                                    total = origin[params[0].dataIndex].partolCount
                                return `${yearValue}年${params[0].axisValueLabel}<br/>完成任务次数：${success}/${total}<br/>完成率：${params[0].value}%`
                            }
                        },
                    },
                    // 图例
                    legend: {
                        // 图例数据-对应series中的name
                        data: ['任务完成率'],
                        bottom: '5%',
                        // 文字样式
                        textStyle: {
                            // 颜色
                            color
                        }
                    },
                    grid: {
                        top: '15%',
                        left: '3%',
                        right: '4%',
                        bottom: '20%',
                        containLabel: true
                    },
                    xAxis: {
                        type: 'category',
                        boundaryGap: false,
                        data: months,
                        // 标题
                        axisLabel: {
                            // 文字颜色
                            color,
                            interval: xInterval
                        },
                        // 坐标轴线
                        axisLine: {
                            // 是否显示
                            show: true,
                            // 线段样式
                            lineStyle: {
                                // 线段颜色
                                color,
                            }
                        }
                    },
                    yAxis: {
                        name: '频率（%）',
                        type: 'value',
                        // 分割线
                        splitLine: {
                            // 是否显示
                            show: false
                        },
                        // 分割区域
                        splitArea: {
                            // 是否显示
                            show: true,
                            // 分割区域样式
                            areaStyle: {
                                // 颜色 依此循环
                                color: ['transparent', `${splitAreaBackgroundColor}`]
                            }
                        },
                        // 标题
                        axisLabel: {
                            // 文字颜色
                            color
                        },
                        // 坐标轴线
                        axisLine: {
                            // 是否显示
                            show: true,
                            // 线段样式
                            lineStyle: {
                                // 线段颜色
                                color,
                            }
                        }
                    },
                    series: [
                        {
                            name: '任务完成率',
                            data: ratio,
                            type: 'line',
                            // 区域样式
                            areaStyle: {
                                // 背景色
                                color,
                                // 透明度
                                opacity: 0.1
                            },
                            // 是否显示线段中的圆点
                            showSymbol: false,
                            // 自定义圆点标记样式
                            symbol,
                            // 圆点标记大小
                            symbolSize: 12,
                        }
                    ]
                }
            }
            // 柱状图
            else {
                let all = [],
                    complete = [];
                if (xNumber > 12) {
                    barWidth = 8;
                }
                origin.map(i => {
                    all.push(i.partolCount);
                    complete.push(i.successCount)
                });
                options = {
                    // 全局颜色
                    color: [color],
                    // 悬浮框
                    tooltip: {
                        trigger: 'axis',
                        // 边框颜色
                        borderColor: tipBorderColor,
                        // 背景色
                        backgroundColor: tipBackgroundColor,
                        // 文字样式
                        textStyle: {
                            // 颜色
                            color,
                            // 字体
                            fontFamily: 'Microsoft YaHei,PingFang SC'
                        },
                        // 格式化文本数据
                        formatter: params => {
                            let success = origin[params[0].dataIndex].successCount,
                                total = origin[params[0].dataIndex].partolCount,
                                ratio = 0;
                            if (total) {
                                ratio = (success / total * 100).toFixed(0)
                            }
                            if (monthValue) {
                                return `${yearValue}年${monthValue}月${params[0].axisValueLabel}<br/>完成任务次数：${success}/${total}<br/>完成率：${ratio}%`
                            } else {
                                return `${yearValue}年${params[0].axisValueLabel}<br/>完成任务次数：${success}/${total}<br/>完成率：${ratio}%`
                            }
                        },
                    },
                    // 图例
                    legend: {
                        // 图例数据-对应series中的name
                        data: ['任务次数', '完成任务次数'],
                        bottom: '5%',
                        // 文字样式
                        textStyle: {
                            // 颜色
                            color
                        },
                    },
                    grid: {
                        top: '15%',
                        left: '3%',
                        right: '4%',
                        bottom: '20%',
                        containLabel: true
                    },
                    xAxis: {
                        type: 'category',
                        data: months,
                        // 标题
                        axisLabel: {
                            // 文字颜色
                            color,
                            interval: xInterval
                        },
                        // 坐标轴线
                        axisLine: {
                            // 是否显示
                            show: true,
                            // 线段样式
                            lineStyle: {
                                // 线段颜色
                                color,
                            }
                        }
                    },
                    yAxis: {
                        name: '次数（次）',
                        type: 'value',
                        // 分割线
                        splitLine: {
                            // 是否显示
                            show: false
                        },
                        // 分割区域
                        splitArea: {
                            // 是否显示
                            show: true,
                            // 分割区域样式
                            areaStyle: {
                                // 颜色 依此循环
                                color: ['transparent', `${splitAreaBackgroundColor}`]
                            }
                        },
                        // 标题
                        axisLabel: {
                            // 文字颜色
                            color
                        },
                        // 坐标轴线
                        axisLine: {
                            // 是否显示
                            show: true,
                            // 线段样式
                            lineStyle: {
                                // 线段颜色
                                color,
                            }
                        }
                    },
                    series: [
                        {
                            name: '任务次数',
                            barWidth: barWidth,
                            data: all,
                            type: 'bar',
                            itemStyle: {
                                color: allTaskBarColor
                            }
                        },
                        {
                            name: '完成任务次数',
                            barGap: '-100%',
                            barWidth: barWidth,
                            data: complete,
                            type: 'bar',
                            itemStyle: {
                                color: completeTaskBarColor
                            }
                        }
                    ]
                }
            }
            this.charts.NOTChart.setOption(options);
        },
        // 获取右侧完成率分析图表数据
        getCRCChartData() {
            let {projectId, token} = this,
                data = {
                    method: "selectPatrolTaskAndPatrolItemRate",
                    params: [`{'projectId':'${projectId}'}`],
                }
            for (let i = 1; i <= 4; i++) {
                this.chartLoading(`CRChart${i}`);
            }
            sevnceApi.getRbp(data, token).then(res => {
                for (let i = 1; i <= 4; i++) {
                    this.charts[`CRChart${i}`].hideLoading();
                }
                let {mes} = res.result;
                mes.taskMapList.map(i => {
                    i.name = i.label;
                    i.value = i.taskFailTypeCount;
                });
                mes.itemMapList.map(i => {
                    i.name = i.label;
                    i.value = i.itemFailTypeCount;
                });
                this.CRData = mes;
                this.setCRCChartOption();
            });
        },
        // 设置完成率分析并图的数据
        setCRCChartOption() {
            let {color, labelColor, chartsColor, tipBorderColor, tipBackgroundColor} = this.chartColorOptions,
                {list1, list2} = chartsColor,
                array = [...list1],
                colors1Reverse = array.reverse(),
                {CRData} = this;
            this.charts.CRChart1.setOption({
                legend: {
                    top: '5%',
                    left: '10%',
                    itemWidth: 8,
                    itemHeight: 8,
                    icon: "circle",
                    textStyle: {
                        color: color
                    }
                },
                graphic: {
                    type: "text",
                    left: "center",
                    top: "46%",
                    style: {
                        text: '巡检\n情况',
                        textAlign: "center",
                        fill: color,
                        fontSize: 16,
                    }
                },
                // 悬浮框
                tooltip: {
                    trigger: 'item',
                    // 边框颜色
                    borderColor: tipBorderColor,
                    // 背景色
                    backgroundColor: tipBackgroundColor,
                    // 文字样式
                    textStyle: {
                        // 颜色
                        color,
                        // 字体
                        fontFamily: 'Microsoft YaHei,PingFang SC'
                    },
                    // 格式化文本数据
                    formatter: params => {
                        let {name, value, percent, marker} = params;
                        return `巡检情况<br/>${marker}${name}<br/>频率：${value}次<br/>占比：${percent}%`
                    },
                },
                series: [
                    {
                        type: 'pie',
                        radius: ['38%', '66%'],
                        center: ['50%', '55%'],
                        datasetIndex: 1,
                        label: {
                            position: 'inner',
                            formatter: '{d}%',
                            color: labelColor
                        },
                        itemStyle: {
                            color: params => {
                                return new echarts.graphic.LinearGradient(
                                    list1[params.dataIndex].l,
                                    list1[params.dataIndex].b,
                                    list1[params.dataIndex].r,
                                    list1[params.dataIndex].t,
                                    [
                                        {
                                            //颜色渐变函数 前四个参数分别表示四个位置依次为左、下、右、上
                                            offset: 0,
                                            color: list1[params.dataIndex].c1
                                        },
                                        {
                                            offset: 1,
                                            color: list1[params.dataIndex].c2
                                        }
                                    ]);
                            }
                        },
                        data: [
                            {
                                name: '未完成',
                                value: CRData.failTaskCount
                            },
                            {
                                name: '完成',
                                value: CRData.taskSuccessCount
                            }
                        ]
                    },
                ],
            });
            this.charts.CRChart2.setOption({
                graphic: {
                    type: "text",
                    left: "center",
                    top: "middle",
                    style: {
                        text: '未完成\n原因',
                        textAlign: "center",
                        fill: color,
                        fontSize: 16,
                    }
                },
                // 悬浮框
                tooltip: {
                    show: !!CRData.taskMapList.length,
                    trigger: 'item',
                    // 边框颜色
                    borderColor: tipBorderColor,
                    // 背景色
                    backgroundColor: tipBackgroundColor,
                    // 文字样式
                    textStyle: {
                        // 颜色
                        color,
                        // 字体
                        fontFamily: 'Microsoft YaHei,PingFang SC'
                    },
                    // 格式化文本数据
                    formatter: params => {
                        let {name, value, percent, marker} = params;
                        return `未完成原因<br/>${marker}${name}<br/>频率：${value}次<br/>占比：${percent}%`
                    },
                },
                series: [
                    {
                        type: 'pie',
                        radius: ['38%', '88%'],
                        datasetIndex: 1,
                        label: {
                            position: 'inner',
                            formatter: '{d}%',
                            color: labelColor
                        },
                        itemStyle: {
                            color: params => {
                                return new echarts.graphic.LinearGradient(
                                    list2[params.dataIndex].l,
                                    list2[params.dataIndex].b,
                                    list2[params.dataIndex].r,
                                    list2[params.dataIndex].t,
                                    [
                                        {
                                            //颜色渐变函数 前四个参数分别表示四个位置依次为左、下、右、上
                                            offset: 0,
                                            color: list2[params.dataIndex].c1
                                        },
                                        {
                                            offset: 1,
                                            color: list2[params.dataIndex].c2
                                        }
                                    ]);
                            }
                        },
                        data: CRData.taskMapList.length ? CRData.taskMapList : [{name: '', value: 0}]
                    },
                ],
            });
            this.charts.CRChart3.setOption({
                graphic: {
                    type: "text",
                    left: "center",
                    top: "middle",
                    style: {
                        text: '未成功\n原因',
                        textAlign: "center",
                        fill: color,
                        fontSize: 16,
                    }
                },
                // 悬浮框
                tooltip: {
                    show: !!CRData.itemMapList.length,
                    trigger: 'item',
                    // 边框颜色
                    borderColor: tipBorderColor,
                    // 背景色
                    backgroundColor: tipBackgroundColor,
                    // 文字样式
                    textStyle: {
                        // 颜色
                        color,
                        // 字体
                        fontFamily: 'Microsoft YaHei,PingFang SC'
                    },
                    // 格式化文本数据
                    formatter: params => {
                        let {name, value, percent, marker} = params;
                        return `未成功原因<br/>${marker}${name}<br/>频率：${value}次<br/>占比：${percent}%`
                    },
                },
                series: [
                    {
                        type: 'pie',
                        radius: ['38%', '88%'],
                        datasetIndex: 1,
                        label: {
                            position: 'inner',
                            formatter: '{d}%',
                            color: labelColor
                        },
                        itemStyle: {
                            color: (params) => {
                                return new echarts.graphic.LinearGradient(
                                    list2[params.dataIndex].l,
                                    list2[params.dataIndex].b,
                                    list2[params.dataIndex].r,
                                    list2[params.dataIndex].t,
                                    [
                                        {
                                            //颜色渐变函数 前四个参数分别表示四个位置依次为左、下、右、上
                                            offset: 0,
                                            color: list2[params.dataIndex].c1
                                        },
                                        {
                                            offset: 1,
                                            color: list2[params.dataIndex].c2
                                        }
                                    ]);
                            }
                        },
                        data: CRData.itemMapList.length ? CRData.itemMapList : [{name: '', value: 0}]
                    },
                ],
            });
            this.charts.CRChart4.setOption({
                legend: {
                    top: '5%',
                    left: '40%',
                    itemWidth: 8,
                    itemHeight: 8,
                    icon: "circle",
                    textStyle: {
                        color
                    }
                },
                graphic: {
                    type: "text",
                    right: "center",
                    top: "46%",
                    style: {
                        text: '识别\n情况',
                        textAlign: "center",
                        fill: color,
                        fontSize: 16,
                    }
                },
                // 悬浮框
                tooltip: {
                    trigger: 'item',
                    // 边框颜色
                    borderColor: tipBorderColor,
                    // 背景色
                    backgroundColor: tipBackgroundColor,
                    // 文字样式
                    textStyle: {
                        // 颜色
                        color,
                        // 字体
                        fontFamily: 'Microsoft YaHei,PingFang SC'
                    },
                    // 格式化文本数据
                    formatter: params => {
                        let {name, value, percent, marker} = params;
                        return `识别情况<br/>${marker}${name}<br/>频率：${value}次<br/>占比：${percent}%`
                    },
                },
                series: [
                    {
                        type: 'pie',
                        radius: ['38%', '66%'],
                        center: ['50%', '55%'],
                        datasetIndex: 1,
                        label: {
                            position: 'inner',
                            formatter: '{d}%',
                            color: labelColor
                        },
                        itemStyle: {
                            color: params => {
                                return new echarts.graphic.LinearGradient(
                                    list1[params.dataIndex].l,
                                    list1[params.dataIndex].b,
                                    list1[params.dataIndex].r,
                                    list1[params.dataIndex].t,
                                    [
                                        {
                                            //颜色渐变函数 前四个参数分别表示四个位置依次为左、下、右、上
                                            offset: 0,
                                            color: colors1Reverse[params.dataIndex].c1
                                        },
                                        {
                                            offset: 1,
                                            color: colors1Reverse[params.dataIndex].c2
                                        }
                                    ]);
                            }
                        },
                        data: [
                            {
                                name: '成功',
                                value: CRData.itemSuccessCount
                            },
                            {
                                name: '未成功',
                                value: CRData.itemFailCount
                            }
                        ]
                    },
                ],
            });
        },
        // 获取预警趋势折线图数据
        getEWTChartData() {
            let {projectId, token} = this,
                {yearValue, monthValue, xNumber} = this.chartOperatingData.EWT,
                data = {
                    method: "selectEmergencyInfoTrend",
                    params: [`{'projectId':'${projectId}','year':'${yearValue}','month':'${monthValue}'}`],
                };
            this.chartLoading('EWTChart');
            sevnceApi.getRbp(data, token).then(res => {
                this.charts.EWTChart.hideLoading();
                this.EWTData.data = [];
                let {mes} = res.result,
                    allData = [],
                    filterYear = []
                for (let i = 1; i <= xNumber; i++) {
                    allData.push({
                        index: i,
                        value: 0
                    });
                    let obj = {
                        year: yearValue,
                        count: 0,
                        lastCount: 0
                    }
                    obj.index = i
                    filterYear.push(obj)
                }
                mes.map(i => {
                    if (i.createYear === yearValue) {
                        filterYear.map(j => {
                            if (i[monthValue ? 'createDay' : 'createMonth'] === j.index) {
                                j.count = i.emerCount
                            }
                        });
                        allData.map(j => {
                            if (i[monthValue ? 'createDay' : 'createMonth'] === j.index) {
                                j.value = i.emerCount;
                            }
                        })
                    }
                });
                mes.map(i => {
                    filterYear.map(j => {
                        if (i.createYear + 1 === j.year && i[monthValue ? 'createDay' : 'createMonth'] === j.index) {
                            j.lastCount = i.emerCount;
                        }
                    })
                });
                allData.map(i => {
                    this.EWTData.data.push(i.value);
                });
                this.EWTData.origin = filterYear;
                this.setEWTChartOption();
            })
        },
        // 设置预警趋势折线图配置
        setEWTChartOption() {
            let months = [],
                {color, tipBorderColor, tipBackgroundColor, splitAreaBackgroundColor, symbol} = this.chartColorOptions,
                {yearValue, monthValue, xNumber} = this.chartOperatingData.EWT,
                xInterval = null,
                {origin, data} = this.EWTData;
            if (xNumber > 12) {
                xInterval = 4;
            }
            for (let i = 1; i <= xNumber; i++) {
                if (xNumber > 12) {
                    months.push(i)
                } else {
                    months.push(`${i}月`)
                }
            }
            this.charts.EWTChart.setOption({
                // 全局颜色
                color: [color],
                // 悬浮框
                tooltip: {
                    trigger: 'axis',
                    // 边框颜色
                    borderColor: tipBorderColor,
                    // 背景色
                    backgroundColor: tipBackgroundColor,
                    // 文字样式
                    textStyle: {
                        // 颜色
                        color,
                        // 字体
                        fontFamily: 'Microsoft YaHei,PingFang SC'
                    },
                    // 格式化文本数据
                    formatter: params => {
                        let {dataIndex, value, axisValueLabel} = params[0],
                            ratio = 0,
                            {count, lastCount} = origin[dataIndex];
                        if (count && lastCount) {
                            ratio = (count - lastCount) / lastCount * 100
                        } else if (count && !lastCount) {
                            ratio = 100
                        }
                        if (xNumber > 12) {
                            return `${yearValue}年${monthValue}月${axisValueLabel}<br/>预警次数：${value}<br/>同比增长：${ratio}%`
                        } else {
                            return `${yearValue}年${axisValueLabel}<br/>预警次数：${value}<br/>同比增长：${ratio}%`
                        }
                    },
                },
                // 图例
                legend: {
                    // 图例数据-对应series中的name
                    data: ['预警次数'],
                    bottom: '10%',
                    // 文字样式
                    textStyle: {
                        // 颜色
                        color
                    }
                },
                grid: {
                    top: '15%',
                    left: '3%',
                    right: '4%',
                    bottom: '20%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: months,
                    // 标题
                    axisLabel: {
                        // 文字颜色
                        color,
                        interval: xInterval
                    },
                    // 坐标轴线
                    axisLine: {
                        // 是否显示
                        show: true,
                        // 线段样式
                        lineStyle: {
                            // 线段颜色
                            color,
                        }
                    }
                },
                yAxis: {
                    name: '次数',
                    type: 'value',
                    // 分割线
                    splitLine: {
                        // 是否显示
                        show: false
                    },
                    // 分割区域
                    splitArea: {
                        // 是否显示
                        show: true,
                        // 分割区域样式
                        areaStyle: {
                            // 颜色 依此循环
                            color: ['transparent', `${splitAreaBackgroundColor}`]
                        }
                    },
                    // 标题
                    axisLabel: {
                        // 文字颜色
                        color
                    },
                    // 坐标轴线
                    axisLine: {
                        // 是否显示
                        show: true,
                        // 线段样式
                        lineStyle: {
                            // 线段颜色
                            color,
                        }
                    }
                },
                series: [
                    {
                        name: '预警次数',
                        data: data,
                        type: 'line',
                        // 区域样式
                        areaStyle: {
                            // 背景色
                            color,
                            // 透明度
                            opacity: 0.1
                        },
                        // 是否显示线段中的圆点
                        showSymbol: false,
                        // 自定义圆点标记样式
                        symbol,
                        // 圆点标记大小
                        symbolSize: 12,
                    }
                ]
            });
        },
        // 获取预警设备占比数据
        getPOEWEChartData() {
            let {projectId, token} = this,
                data = {
                    method: "selectDeviceEmergencyCount",
                    params: [`{'projectId':'${projectId}'}`],
                }
            sevnceApi.getRbp(data, token).then(res => {
                let {mes} = res.result,
                    {emerCount, list} = mes;
                if (list.length) {
                    this.POWEData.count = emerCount
                    list.map(i => {
                        this.POWEData.data.push({
                            name: i.deviceName,
                            value: i.emerCount
                        });
                    });
                }
                this.setPOWEChartOption();
            })
        },
        // 设置预警设备占比配置
        setPOWEChartOption() {
            let {color, chartsColor, tipBorderColor, tipBackgroundColor} = this.chartColorOptions,
                {list2} = chartsColor, {count, data} = this.POWEData;
            this.charts.POEWEChart.setOption({
                // 悬浮框
                tooltip: {
                    show: !!data.length,
                    trigger: 'item',
                    // 边框颜色
                    borderColor: tipBorderColor,
                    // 背景色
                    backgroundColor: tipBackgroundColor,
                    // 文字样式
                    textStyle: {
                        // 颜色
                        color,
                        // 字体
                        fontFamily: 'Microsoft YaHei,PingFang SC'
                    },
                    // 格式化文本数据
                    formatter: params => {
                        let {name, value, percent, marker} = params;
                        return `预警设备<br/>${marker}${name}<br/>频率：${value}次<br/>占比：${percent}%`
                    },
                },
                legend: {
                    show: !!data.length,
                    top: 'center',
                    right: '50px',
                    itemWidth: 8,
                    itemHeight: 8,
                    icon: "circle",
                    textStyle: {
                        color: color
                    },
                    orient: "vertical",
                    formatter: name => {
                        let item = data.filter(i => i.name === name);
                        return `${name}   ${(item[0].value / count * 100).toFixed(2)}%`
                    }
                },
                graphic: {
                    type: "text",
                    left: data.length ? "26%" : "center",
                    top: "center",
                    style: {
                        text: '预警\n设备',
                        textAlign: "center",
                        fill: color,
                        fontSize: 16,
                    }
                },
                series: [
                    {
                        type: 'pie',
                        radius: ['28%', '64%'],
                        center: [data.length ? '30%' : '50%', '50%'],
                        datasetIndex: 1,
                        label: {
                            show: false
                        },
                        itemStyle: {
                            color: params => {
                                return new echarts.graphic.LinearGradient(
                                    list2[params.dataIndex].l,
                                    list2[params.dataIndex].b,
                                    list2[params.dataIndex].r,
                                    list2[params.dataIndex].t,
                                    [
                                        {
                                            //颜色渐变函数 前四个参数分别表示四个位置依次为左、下、右、上
                                            offset: 0,
                                            color: list2[params.dataIndex].c1
                                        },
                                        {
                                            offset: 1,
                                            color: list2[params.dataIndex].c2
                                        }
                                    ]);
                            }
                        },
                        data: data.length ? data : [{name: '', value: 0}]
                    },
                ],
            });
        },
        // 获取安全态势-左侧台账列表数据
        getAssetsInfo() {
            this.assetsLoading = true;
            let {token, projectId, warningFilterActive, warningFilters} = this,
                {currentPage, pageSize} = this.page.security,
                {security} = this.search,
                filter = {
                    name: '',
                    value: ''
                };
            warningFilters.map(i => {
                if (i.id === warningFilterActive) {
                    filter.name = i.id;
                    filter.value = i.filter;
                }
            });
            let data = {
                "method": "countStatisticsAssetsInfo",
                "params": [`{'projectId':'${projectId}','pageNo':'${currentPage}','pageSize':'${pageSize}','${filter.name}':'${filter.value}','assetsName':'${security}'}`]
            };
            sevnceApi.getRbp(data, token).then(res => {
                this.assetsLoading = false;
                let {countAssets, resultList} = res.result.mes;
                this.page.security.total = countAssets;
                if (resultList.length) {
                    let list = [];
                    resultList.map(i => {
                        let {
                                assetsId,
                                patrolCount,
                                emerCount,
                                distinguishRate,
                                patrolRate,
                                pendingEmerCount,
                                className,
                                assetsName
                            } = i,
                            obj = {
                                id: assetsId,
                                // 预警名称
                                name: assetsName,
                                type: className,
                                // 巡检次数
                                INOT: patrolCount,
                                // 预警次数
                                WNOT: emerCount,
                                // 识别成功率
                                discernRate: distinguishRate,
                                // 已处理
                                processed: emerCount - pendingEmerCount,
                                // 巡检完成率
                                inspectionRate: patrolRate,
                                // 未处理
                                notProcessed: pendingEmerCount,
                            }
                        list.push(obj);
                    });
                    this.warningList = list;
                } else {
                    this.assetsLoadingMsg = '无数据'
                }
            }).catch(() => {
                this.assetsLoadingMsg = '失败'
            })
        },
    },
    watch: {
        currentTheme(newValue) {
            let mapStyleName = '';
            switch (newValue) {
                case 'default' || false: {
                    mapStyleName = 'amap://styles/5d8cdf46b2f501f196504e13b2fb1248';
                    this.chartColorOptions = {
                        // 主题色
                        color: '#31E2F4',
                        // 悬浮框边框颜色
                        tipBorderColor: '#1F36A1',
                        // 悬浮框背景色
                        tipBackgroundColor: 'rgba(15,21,74,0.9)',
                        // 分割区域背景色
                        splitAreaBackgroundColor: 'rgba(33,59,175,0.1)',
                        // 折线图 标记形状
                        symbol: `image://${require('../../assets/images/theme/default/projectSituation/icon-charts-symbol.png')}`,
                        // 全部任务柱子颜色
                        allTaskBarColor: '#1C4B8A',
                        // 已完成任务柱子颜色
                        completeTaskBarColor: '#22BFAE',
                        // label颜色
                        labelColor: '#D2E0FA',
                        labelColor2: '#31E2F4',
                        // 图表颜色列表
                        chartsColor: {
                            list1: [
                                {c1: '#C27500', c2: '#FFE19A', l: 0, b: 0, r: 0.1, t: 1},
                                {c1: '#23DCB8', c2: '#1373C7', l: 0, b: 0, r: 0.5, t: 1}
                            ],
                            list2: [
                                {c1: '#86C1EE', c2: '#150FC5', l: 0, b: 0, r: 0, t: 1},
                                {c1: '#6DCAE6', c2: '#2F4EB1', l: 0, b: 0, r: 0, t: 1},
                                {c1: '#C14242', c2: '#C4944E', l: 1, b: 1, r: 0, t: 0},
                                {c1: '#4F15BB', c2: '#921781', l: 0, b: 0, r: 0, t: 1},
                                {c1: '#3A48E3', c2: '#8219B4', l: 0, b: 0, r: 0, t: 1},
                                {c1: '#8A0963', c2: '#950833', l: 0, b: 0, r: 0, t: 1},
                            ]
                        },
                        // loading 蒙层背景色
                        maskBackgroundColor: 'rgba(15, 21, 74, 0.8)'
                    }
                    break;
                }
                case 'minimalism': {
                    mapStyleName = 'amap://styles/4383178f2ccbc6b9a7abdbe5bb2bc249';
                    this.chartColorOptions = {
                        // 主题色
                        color: '#1E2088',
                        // 悬浮框边框颜色
                        tipBorderColor: '#1F36A1',
                        // 悬浮框背景色
                        tipBackgroundColor: 'rgba(242,242,242,0.9)',
                        // 分割区域背景色
                        splitAreaBackgroundColor: 'rgba(210,224,250,0.3)',
                        // 折线图 标记形状
                        symbol: 'circle',
                        // 全部任务柱子颜色
                        allTaskBarColor: '#1E2088',
                        // 已完成任务柱子颜色
                        completeTaskBarColor: '#ADC5EE',
                        // label颜色
                        labelColor: '#f2f2f2',
                        labelColor2: '#1E2088',
                        // 图表颜色列表
                        chartsColor: {
                            list1: [
                                {c1: '#E3AB11', c2: '#E3AB11', l: 0, b: 0, r: 0, t: 1},
                                {c1: '#06AED5', c2: '#06AED5', l: 0, b: 0, r: 0, t: 1}
                            ],
                            list2: [
                                {c1: '#2680EB', c2: '#2680EB', l: 0, b: 0, r: 0, t: 1},
                                {c1: '#6768AB', c2: '#6768AB', l: 0, b: 0, r: 0, t: 1},
                                {c1: '#BB7C91', c2: '#BB7C91', l: 0, b: 0, r: 0, t: 1},
                                {c1: '#23DCB8', c2: '#23DCB8', l: 0, b: 0, r: 0, t: 1},
                                {c1: '#AEC4EF', c2: '#AEC4EF', l: 0, b: 0, r: 0, t: 1},
                                {c1: '#BCBFA2', c2: '#BCBFA2', l: 0, b: 0, r: 0, t: 1},
                            ]
                        },
                        // loading 蒙层背景色
                        maskBackgroundColor: 'rgba(242, 242, 242, 0.8)'
                    }
                    break;
                }
                case 'prime': {
                    mapStyleName = 'amap://styles/ad95136087d05288882f49de8dd7752a';
                    this.chartColorOptions = {
                        // 主题色
                        color: '#D4B87F',
                        // 悬浮框边框颜色
                        tipBorderColor: '#3B3152',
                        // 悬浮框背景色
                        tipBackgroundColor: 'rgba(41,27,59,0.9)',
                        // 分割区域背景色
                        splitAreaBackgroundColor: 'rgba(117,110,142,0.1)',
                        // 折线图 标记形状
                        symbol: `image://${require('../../assets/images/theme/prime/projectSituation/icon-charts-symbol.png')}`,
                        // 全部任务柱子颜色
                        allTaskBarColor: '#D4B87F',
                        // 已完成任务柱子颜色
                        completeTaskBarColor: '#DFD9FF',
                        // label颜色
                        labelColor: '#3B3152',
                        labelColor2: '#D4B87F',
                        // 图表颜色列表
                        chartsColor: {
                            list1: [
                                {c1: '#EAAFC8', c2: '#654EA3', l: 0, b: 0, r: 0, t: 1},
                                {c1: '#91EAE4', c2: '#7F7FD5', l: 0, b: 0, r: 0, t: 1}
                            ],
                            list2: [
                                {c1: '#FFFBD5', c2: '#B20A2C', l: 0, b: 0, r: 0, t: 1},
                                {c1: '#EE9CA7', c2: '#FFDDE1', l: 1, b: 1, r: 0, t: 0},
                                {c1: '#005AA7', c2: '#FFFDE4', l: 0, b: 0, r: 0, t: 1},
                                {c1: '#3B3B6F', c2: '#7576DE', l: 0, b: 0, r: 0, t: 1},
                                {c1: '#7F6E62', c2: '#D4B87F', l: 0, b: 0, r: 0, t: 1},
                                {c1: '#2EBF91', c2: '#8360C3', l: 0, b: 0, r: 0, t: 1},
                            ]
                        },
                        // loading 蒙层背景色
                        maskBackgroundColor: 'rgba(0, 0, 0, 0.8)'
                    }
                    break;
                }
            }
            if (this.mapOptions.map) {
                this.mapOptions.map.setMapStyle(mapStyleName);
            }
        },
    },
    components: {
        empty,
        topBar,
        popover,
        countTo,
        logo
    },
    filters: {
        // 格式化巡检次数
        formatterInspectionNumber(value) {
            return `${(value / 1000).toFixed(1)}`;
        },
    }
}