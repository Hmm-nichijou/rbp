// mixin
import mixins from "@/assets/js/mixins";
// 组件：空状态
import empty from '@/components/empty/empty.vue';
// 组件：全局顶栏：搜索框、刷新、全屏、用户信息、通知消息、主题、设置
import topBar from '@/components/topBar/topBar.vue';
// 组件：顶部logo
import logo from "@/components/logo/logo.vue";
// 组件：数字滚动
import countTo from 'vue-count-to';
// 组件：标题
import myTitle from "@/components/title/title.vue";
// 高德地图
import AMap from 'AMap';
// echarts.js
import * as echarts from 'echarts';
import moment from "moment";
import sevnceApi from "@/request/api/sevnce";

export default {
    name: 'countrySituation',
    mixins: [mixins],
    data() {
        return {
            // 地图载体
            map: '',
            // 地图省市图层
            disProvince: '',
            // 该用户下拥有项目的省市图层载体
            allProjectProvince: [],
            // 地图图表载体
            mapChart: '',
            // 图表颜色配置
            chartColorOptions: {},
            // 地区列表
            provinceList: '',
            // 信息窗口数据
            infoWindowData: '',
            // 项目地区数据总览
            projectOverview: {
                // 项目
                projectNo: '-',
                // 机器人
                robotNo: '-',
                // 安全巡检
                inspectionDay: '-',
                warning: '-',
                // 设备保障
                guarantee: '-',
                // 巡检数据
                inspectionData: '-'
            },
            // 机器人全部状态 fault：有故障 on-line：巡检中 off-line：已离线 charging：充电中 standby：待机中
            robotStatus: [
                {
                    id: 0,
                    status: 'all',
                    quantity: 0
                },
                {
                    id: 1,
                    status: 'on-line',
                    quantity: 0
                },
                {
                    id: 2,
                    status: 'off-line',
                    quantity: 0
                },
                {
                    id: 3,
                    status: 'fault',
                    quantity: 0
                },
                {
                    id: 4,
                    status: 'charging',
                    quantity: 0
                },
                {
                    id: 5,
                    status: 'standby',
                    quantity: 0
                }
            ],
            // 当前激活筛选机器人状态 默认为 全部
            currentFilterRobotStatus: 'all',
            // 选中地区-项目列表
            projectList: [],
            // 数据概览
            overview: [
                {
                    title: '项目个数',
                    value: 0,
                    bgImg: 'project'
                },
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
                    title: '保障设施数',
                    value: 0,
                    bgImg: 'ratio'
                },
                {
                    title: '巡检数据条数',
                    value: 0,
                    unit: 'w',
                    bgImg: 'ratio'
                }
            ],
            // 右侧图表DOM
            rightCharts: [
                {
                    name: '机器人数量',
                    ref: 'robotQuantityChart',
                },
                {
                    name: '任务执行次数',
                    ref: 'numberOfTaskChart'
                },
                {
                    name: '巡检数据量',
                    ref: 'inspectionDataChart',
                },
                {
                    name: '隐患预警数量',
                    ref: 'warningQuantityChart'
                },
            ],
            // 全部图表载体
            allCharts: {},
            // 地区机器人总数排行
            provinceRank: [],
            // 图表操作数据
            chartOperatingData: {
                // 年
                yearValue: '',
                yearOptions: [],
                // 月
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
                // chart x轴
                xNumber: 12,
                data: [33, 43, 52, 50, 68, 60, 50, 63, 52, 43, 50, 50],
            },
            // 信息窗口
            infoWindow: '',
            // 地图默认中心点
            defaultCenter: [106.504962, 29.533155],
            // 图表数据
            chartData: {},
            // 当前点击的省/直辖市编码
            areaCode: '',
            // 项目实况加载状态
            projectListLoading: false,
            // 项目实况加载状态文本
            projectListLoadingText: '加载中',
            // 项目实况全部机器人数据
            allRobot: []
        }
    },
    mounted() {
        this.initAllCharts();
        this.getProvinceList();
        this.initMap();
        this.getOverviewData();
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
                    this.renderProvinceMap('100000');
                    this.renderProjectProvince();
                    this.statisticsAllProject();
                    this.statisticsRank();
                }
            }, 30);
        },
        // 获取全国/地区概览数据
        getOverviewData() {
            this.chartOperatingData.yearOptions = [];
            let {areaCode} = this,
                {id, token} = this.$store.state.userInfo,
                data = {
                    method: "getRobotAndProjectDetailByArea",
                    params: [`{'userId':'${id}','areaCode':'${areaCode}'}`]
                };
            // 切换省份/直辖市时清空之前的数据
            if (areaCode) {
                this.projectOverview.projectNo = '-';
                this.projectOverview.robotNo = '-';
                this.projectOverview.inspectionDay = '-';
                this.projectOverview.warning = '-';
                this.projectOverview.guarantee = '-';
                this.projectOverview.inspectionData = '-';
            }
            sevnceApi.getRbp(data, token).then(res => {
                let {mes} = res.result,
                    {assetsCount, days, emerCount, itemCount, taskResultCreateDate} = mes,
                    firstYear = Number(moment(moment(taskResultCreateDate).valueOf()).format('YYYY')),
                    currentYear = Number(moment().format('YYYY'));
                // 给年份选择器赋值
                if (firstYear) {
                    for (let i = firstYear; i <= currentYear; i++) {
                        this.chartOperatingData.yearOptions.push({
                            label: `${i}年`,
                            value: i
                        });
                    }
                } else {
                    this.chartOperatingData.yearOptions.push({
                        label: `${currentYear}年`,
                        value: currentYear
                    });
                }
                this.chartOperatingData.yearValue = currentYear;
                if (areaCode) {
                    this.areaCode = areaCode;
                    this.statisticsProvinceProject();
                    this.projectOverview.inspectionDay = days;
                    this.projectOverview.warning = emerCount;
                    this.projectOverview.guarantee = assetsCount;
                    this.projectOverview.inspectionData = itemCount;
                } else {
                    this.projectOverview.inspectionDay = days;
                    this.projectOverview.warning = emerCount;
                    this.projectOverview.guarantee = assetsCount;
                    this.projectOverview.inspectionData = itemCount;
                    this.projectOverview.projectNo = this.overview[0].value;
                    this.projectOverview.robotNo = this.overview[1].value;
                    this.overview[2].value = days;
                    this.overview[3].value = emerCount;
                    this.overview[4].value = assetsCount;
                    this.overview[5].value = itemCount;
                }
                this.getChartData();
                this.getProjectOverviewData();
            })
        },
        // 组件事件：切换主题
        changeTheme(value) {
            this.currentTheme = value;
            setTimeout(() => {
                this.setChartOption();
            }, 30)
            this.resetProvinceMap();
            this.resetProjectProvince();
        },
        // 初始化地图
        initMap() {
            this.map = new AMap.Map('map', {
                // 中心点
                center: this.defaultCenter,
                // 自适应大小
                resizeEnable: true,
                // 扩大缩放范围
                expandZoomRange: true,
                // 当前缩放等级
                zoom: 4.4,
                // 缩放范围
                zooms: [3, 20],
                // 视图模式
                viewMode: '2D',
                // 地图样式
                mapStyle: '',
                // 是否启用缩放
                zoomEnable: false,
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
            this.map.setMapStyle(mapStyleName);
            let oldAdcode = '';
            this.map.on('click', e => {
                let {lng, lat} = e.lnglat;
                AMap.plugin('AMap.Geocoder', () => {
                    let geocoder = new AMap.Geocoder({
                        // city 指定进行编码查询的城市，支持传入城市名、adcode 和 citycode
                        city: '全国'
                    })
                    let lnglat = [lng, lat]
                    geocoder.getAddress(lnglat, (status, result) => {
                        if (status === 'complete' && result.info === 'OK') {
                            // result为对应的地理位置详细信息
                            let {province} = result.regeocode.addressComponent,
                                {color} = this.chartColorOptions;
                            geocoder.getLocation(province, (status, result) => {
                                if (status === 'complete' && result.info === 'OK') {
                                    let {adcode, location, formattedAddress} = result.geocodes[0],
                                        {lng, lat} = location;
                                    if (adcode !== '0' && oldAdcode !== adcode) {
                                        if (this.provinceList.some(i => i.code === adcode)) {
                                            // 清空地图上所有的的区域高亮
                                            this.disProvince && this.disProvince.setMap(null);
                                            oldAdcode = adcode;
                                            this.areaCode = adcode;
                                            this.disProvince = new AMap.DistrictLayer.Province({
                                                zIndex: 12,
                                                adcode,
                                                depth: '0',
                                                styles: {
                                                    'fill': color,
                                                    'province-stroke': 'cornflowerblue',
                                                    'city-stroke': 'white', // 中国地级市边界
                                                    'county-stroke': 'rgba(255,255,255,0.5)' // 中国区县边界
                                                }
                                            });
                                            this.disProvince.setMap(this.map);
                                            this.renderProvinceMap();
                                            this.getOverviewData();
                                            this.initInfoWindow({adcode, lng, lat, formattedAddress});
                                            this.getProvinceTrend();
                                        } else {
                                            this.getCacheOverviewData();
                                            this.resetProvince();
                                            oldAdcode = '';
                                        }
                                    }
                                }
                            });
                        } else {
                            this.getCacheOverviewData();
                            this.resetProvince();
                            oldAdcode = '';
                        }
                    });
                });
            });
        },
        // 清空地图区域高亮、关闭信息窗口、展示全国数据
        resetProvince() {
            this.disProvince && this.disProvince.setMap(null);
            this.infoWindow && this.infoWindow.close();
            this.map.setCenter(this.defaultCenter);
            this.infoWindowData = '';
            if (this.areaCode) {
                this.areaCode = '';
                this.getChartData();
                this.getProjectOverviewData();
            }
            this.renderProvinceMap();
        },
        /*
        * 渲染省级地图
        * adcode：省级编码
        * */
        renderProvinceMap() {
            let {areaCode} = this;
            this.mapChart && this.mapChart.dispose();
            let GeoJson = require(`@/assets/map/${areaCode ? areaCode : 100000}.json`),
                {color} = this.chartColorOptions;
            echarts.registerMap('geo', GeoJson);
            this.mapChart = echarts.init(this.$refs.mapChart);
            this.mapChart.setOption({
                geo: {
                    map: 'geo', // 上面引入的数据名
                    show: true,
                    roam: false, // 是否拖拽
                    label: {
                        show: true,
                        color: '#2680EB',
                        fontSize: 40,
                        fontWeight: 'bold',
                        formatter: params => this.formatterProvinceName(params.name)
                    },
                    itemStyle: {
                        areaColor: color, // 地图区域的颜色(没有数据时会按照这个颜色显示)
                        borderColor: '', // 地图区域的边框
                        borderWidth: 0
                    },
                    // 高亮的显示设置
                    emphasis: {
                        label: {
                            color: '#2680EB'
                        },
                        itemStyle: {
                            areaColor: color
                        }
                    },
                    // 选中显示设置
                    select: {
                        label: {
                            color: '#2680EB'
                        },
                        itemStyle: {
                            areaColor: color
                        }
                    }
                },
                series: [
                    // 配置数据的显示
                    {
                        type: 'map', // 类型map
                        geoIndex: 0, // 指定geo属性后，series-map.map 属性，以及 series-map.itemStyle 等样式配置不再起作用，而是采用 geo 中的相应属性。
                    },
                ]
            });
        },
        // 切换皮肤-重置省级地图
        resetProvinceMap() {
            this.mapChart && this.mapChart.dispose();
            setTimeout(() => this.renderProvinceMap(this.infoWindowData.adcode || '100000'), 30);
        },
        // 重置当前账户拥有的项目地区分布
        resetProjectProvince() {
            this.allProjectProvince.map(i => {
                i.setMap(null);
            });
            this.renderProjectProvince();
        },
        // 渲染当前账户拥有的项目地区分布
        renderProjectProvince() {
            let {provinceList} = this;
            AMap.plugin('AMap.Geocoder', () => {
                let geocoder = new AMap.Geocoder({
                    // city 指定进行编码查询的城市，支持传入城市名、adcode 和 citycode
                    city: '全国'
                });
                provinceList.map(i => {
                    let {name} = i,
                        number = 0,
                        {currentTheme} = this,
                        fill = '';
                    i.projects.map(j => {
                        number += j.robotCount;
                    });
                    if (currentTheme === 'default') {
                        fill = `rgba(49, 226, 244, ${this.setColorOpacity(number)})`
                    } else if (currentTheme === 'minimalism') {
                        fill = `rgba(30, 32, 136, ${this.setColorOpacity(number)})`
                    } else {
                        fill = `rgba(212, 184, 127, ${this.setColorOpacity(number)})`
                    }
                    geocoder.getLocation(name, (status, result) => {
                        if (status === 'complete' && result.info === 'OK') {
                            let {adcode} = result.geocodes[0];
                            let disProvince = new AMap.DistrictLayer.Province({
                                zIndex: 12,
                                adcode,
                                depth: 0,
                                styles: {
                                    fill,
                                    'province-stroke': 'cornflowerblue',
                                    'city-stroke': 'white', // 中国地级市边界
                                    'county-stroke': 'transparent' // 中国区县边界
                                }
                            });
                            disProvince.setMap(this.map);
                            this.allProjectProvince.push(disProvince)
                        }
                    });
                });
            });
        },
        /*
        * 根据地区机器人总数设置地区透明度
        * number：地区机器人总数
        * */
        setColorOpacity(number) {
            if (number >= 1 && number <= 5) {
                return 0.2
            } else if (number >= 6 && number <= 10) {
                return 0.4
            } else if (number >= 11 && number <= 20) {
                return 0.6
            } else if (number >= 21) {
                return 0.8
            }
        },
        /*
        * 信息窗口
        * item：地区信息
        * */
        initInfoWindow(item) {
            // 信息窗口类名-根据机器人当前状态区别
            let {adcode, lng, lat, formattedAddress} = item, infoWindowClass = '';
            if (status === 'charging' || status === 'standby') {
                infoWindowClass = 'infoWindow-warning'
            } else if (status === 'fault') {
                infoWindowClass = 'infoWindow-error'
            }
            // 信息窗口基础信息
            this.infoWindowData = {
                adcode,
                name: this.formatterProvinceName(formattedAddress),
                class: infoWindowClass,
            }
            let content = this.$refs.infoWindowContent;
            this.infoWindow = new AMap.InfoWindow({
                isCustom: true,
                content,
                offset: new AMap.Pixel(0, -50)
            });
            this.infoWindow.open(this.map, [lng, lat]);
            this.map.setCenter([lng, lat]);
        },
        // 初始化全部图表
        initAllCharts() {
            this.initRobotQuantityCharts();
            // this.initProjectTypeChart();
            this.initNumberOfTaskChart();
            this.initInspectionDataChart();
            this.initWarningQuantityChart();
        },
        // 机器人数量柱状图
        initRobotQuantityCharts() {
            this.allCharts.robotQuantityChart = echarts.init(this.$refs.robotQuantityChart[0]);
        },
        // 安全巡检天数
        initNumberOfTaskChart() {
            this.allCharts.numberOfTaskChart = echarts.init(this.$refs.numberOfTaskChart[0]);
        },
        // 巡检数据量
        initInspectionDataChart() {
            this.allCharts.inspectionDataChart = echarts.init(this.$refs.inspectionDataChart[0]);
        },
        // 隐患预警数量
        initWarningQuantityChart() {
            this.allCharts.warningQuantityChart = echarts.init(this.$refs.warningQuantityChart[0]);
        },
        // 预警设备占比饼图
        initProjectTypeChart() {
            let {color, labelColor, chartsColor, tipBorderColor, tipBackgroundColor} = this.chartColorOptions,
                data = [];
            this.allCharts.projectTypeChart = echarts.init(this.$refs.projectType);
            for (let i = 1; i <= 6; i++) {
                data.push({
                    name: `设备${i}`,
                    quantity: i,
                    value: (Math.random() * i).toFixed(2)
                });
            }
            this.allCharts.projectTypeChart.setOption({
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
                        let {name, data, percent} = params,
                            {quantity} = data;
                        return `${name}<br/>项目数量：${quantity}<br/>占比：${percent}%`
                    }
                },
                series: [
                    {
                        type: 'pie',
                        radius: '75%',
                        datasetIndex: 1,
                        label: {
                            position: 'inner',
                            color: labelColor,
                            formatter: '{b}'
                        },
                        labelLine: {
                            show: false
                        },
                        itemStyle: {
                            color: params => {
                                return new echarts.graphic.LinearGradient(
                                    chartsColor[params.dataIndex].l,
                                    chartsColor[params.dataIndex].b,
                                    chartsColor[params.dataIndex].r,
                                    chartsColor[params.dataIndex].t,
                                    [
                                        {
                                            //颜色渐变函数 前四个参数分别表示四个位置依次为左、下、右、上
                                            offset: 0,
                                            color: chartsColor[params.dataIndex].c1
                                        },
                                        {
                                            offset: 1,
                                            color: chartsColor[params.dataIndex].c2
                                        }
                                    ]);
                            }
                        },
                        data
                    },
                ],
            });
        },
        // 统计地区机器人总数排行
        statisticsRank() {
            let {provinceList} = this,
                array = [];
            provinceList.map(i => {
                let number = 0;
                i.projects.map(j => {
                    number += j.robotCount;
                });
                array.push({
                    name: this.formatterProvinceName(i.name),
                    value: number
                });
            });
            this.provinceRank = array.sort((a, b) => b.value - a.value).slice(0, 5);
        },
        /*
        * 组件事件：改变任务次数图表选择器选项
        * type：年/月
        * event：值
        * */
        changeSelect(type, event) {
            this.chartOperatingData[`${type}Value`] = event;
            let {yearValue, monthValue} = this.chartOperatingData;
            if (type === 'month') {
                if (event) {
                    // 获取当前选择月份有多少天
                    this.chartOperatingData.xNumber = moment(`${yearValue}-${monthValue}`, 'YYYY-MM').daysInMonth();
                } else {
                    this.chartOperatingData.xNumber = 12;
                }
            }
            this.getChartData();
        },
        // 统计数据概览-项目个数、机器人台数
        statisticsAllProject() {
            let {provinceList} = this,
                projectCount = 0,
                robotCount = 0;
            provinceList.map(i => {
                projectCount += i.projects.length;
                i.projects.map(j => {
                    robotCount += j.robotCount;
                });
            });
            // 项目个数
            this.overview[0].value = projectCount;
            // 机器人台数
            this.overview[1].value = robotCount;
        },
        // 统计指定省份/直辖市项目数据
        statisticsProvinceProject() {
            let {provinceList, areaCode} = this,
                projectCount = 0,
                robotCount = 0;
            provinceList.map(i => {
                if (i.code === areaCode) {
                    projectCount += i.projects.length;
                    i.projects.map(j => {
                        robotCount += j.robotCount;
                    });
                }
            });
            this.infoWindowData.projectNo = projectCount;
            this.infoWindowData.robotNo = robotCount;
            this.projectOverview.projectNo = projectCount;
            this.projectOverview.robotNo = robotCount;
        },
        // 点击地图其他区域，左上角数据获取缓存全国概览数据
        getCacheOverviewData() {
            this.projectOverview.projectNo = this.overview[0].value;
            this.projectOverview.robotNo = this.overview[1].value;
            this.projectOverview.inspectionDay = this.overview[2].value;
            this.projectOverview.warning = this.overview[3].value;
            this.projectOverview.guarantee = this.overview[4].value;
            this.projectOverview.inspectionData = this.overview[5].value;
        },
        // 获取右侧全部图表数据
        getChartData() {
            let {areaCode} = this,
                {id, token} = this.$store.state.userInfo,
                {yearValue, monthValue} = this.chartOperatingData,
                data = {
                    method: "selectStatisticsRobotDetails",
                    params: [`{'userId':'${id}','areaCode':'${areaCode}','year':'${yearValue}','month':'${monthValue}'}`]
                },
                {maskBackgroundColor} = this.chartColorOptions;
            for (let i in this.allCharts) {
                this.allCharts[i].showLoading({
                    text: '',
                    maskColor: maskBackgroundColor
                });
            }
            sevnceApi.getRbp(data, token).then(res => {
                /*
                    * deviceList：机器人数量
                    * itemResultList：巡检数据量
                    * emerList：隐患预警数量
                    * */
                let {mes} = res.result;
                for (let i in mes) {
                    this.formatterChartList(i, mes[i]);
                }
                this.setChartOption();
            }).finally(() => {
                for (let i in this.allCharts) {
                    this.allCharts[i].hideLoading();
                }
            });
        },
        // 组装机器人数量数据
        formatterChartList(key, data) {
            let {yearValue, monthValue, xNumber} = this.chartOperatingData,
                // 根据月/日赋值数据
                filterData = [],
                // 用于echarts展示
                allData = [],
                countKey;
            if (key === 'deviceList') {
                countKey = 'deviceCount'
            } else if (key === 'itemResultList') {
                countKey = 'itemCount'
            } else if (key === 'emerList') {
                countKey = 'emerCount'
            } else if (key === 'taskResultList') {
                countKey = 'taskCount'
            }
            for (let i = 1; i <= xNumber; i++) {
                filterData.push({
                    index: i,
                    value: 0,
                });
            }
            data.map(i => {
                filterData.map(j => {
                    if (i.createYear === yearValue && i[monthValue ? 'createDay' : 'createMonth'] === j.index) {
                        j.value = i[countKey];
                    }
                });
            });
            filterData.map(i => {
                allData.push(i.value);
            });
            this.chartData[key] = allData;
        },
        // 设置右侧所有图表配置
        setChartOption() {
            let months = [],
                {
                    color,
                    tipBorderColor,
                    tipBackgroundColor,
                    splitAreaBackgroundColor,
                    barColor,
                    symbol
                } = this.chartColorOptions,
                {yearValue, monthValue, xNumber} = this.chartOperatingData,
                {deviceList, itemResultList, emerList, taskResultList} = this.chartData,
                xInterval = null,
                barWidth = 10,
                // 图表公共配置项
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
                    },
                    grid: {
                        top: '3%',
                        left: '3%',
                        right: '3%',
                        bottom: '3%',
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
                    series: ''
                }
            if (xNumber > 12) {
                xInterval = 4;
                barWidth = 8;
            }
            for (let i = 1; i <= xNumber; i++) {
                if (xNumber > 12) {
                    months.push(i)
                } else {
                    months.push(`${i}月`)
                }
            }
            // 循环全部图表，根据不同图表配置图表
            for (let i in this.allCharts) {
                let seriesObj, list;
                if (i === 'robotQuantityChart' || i === 'numberOfTaskChart') {
                    seriesObj = {
                        name: '机器人数量',
                        barWidth: barWidth,
                        type: 'bar',
                        itemStyle: {
                            color: barColor
                        }
                    }
                    if (i === 'robotQuantityChart') {
                        list = deviceList;
                    } else {
                        list = taskResultList;
                    }
                } else {
                    options.xAxis.boundaryGap = false;
                    seriesObj = {
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
                    if (i === 'inspectionDataChart') {
                        seriesObj.name = '巡检数据条数';
                        list = itemResultList;
                    } else if (i === 'warningQuantityChart') {
                        seriesObj.name = '预警次数';
                        list = emerList;
                    }
                }
                seriesObj.data = list;
                options.tooltip.formatter = params => {
                    let [data] = params,
                        {seriesName, value, axisValueLabel, dataIndex} = data,
                        lastValue = dataIndex ? list[dataIndex - 1] : 0,
                        growth = value ? Number((value - lastValue) / value * 100).toFixed(1) : 0,
                        flag = ''
                    if (dataIndex) {
                        flag = `本${monthValue ? '日' : '月'}增量：${growth}%`
                    }
                    return `${yearValue}年${monthValue ? monthValue : axisValueLabel}${monthValue ? '月' : ''}${monthValue ? axisValueLabel : ''}<br/>${seriesName}：${value}<br/>${flag}`
                }
                options.series = [seriesObj];
                this.allCharts[i].setOption(options);
            }
        },
        // 获取左侧项目实况数据
        getProjectOverviewData() {
            this.projectListLoading = true;
            let {areaCode} = this,
                {id, token} = this.$store.state.userInfo,
                data = {
                    method: "selectRobotDetailsAndStatus",
                    params: [`{'userId':'${id}','areaCode':'${areaCode}'}`]
                }
            sevnceApi.getRbp(data, token).then(res => {
                this.projectListLoading = false;
                let {listData} = res.result.mes;
                if (listData.length) {
                    // 全部机器人
                    this.robotStatus[0].quantity = listData.length;
                    this.allRobot = listData;
                    this.filterRobotStatus('all');
                } else {
                    this.projectListLoadingText = '无数据'
                }
            }).catch(() => {
                this.projectListLoadingText = '加载失败';
            })
        },
        // 跳转至机器人态势页面
        toRobot(deviceId) {
            this.$router.push({
                path: `/robot/${deviceId}`,
            });
        },
        // 筛选机器人状态
        filterRobotStatus(status) {
            this.currentFilterRobotStatus = status;
            let {allRobot} = this,
                projectList = [],
                filterRobotList = [],
                onlineCount = 0,
                offlineCount = 0,
                faultCount = 0,
                chargingCount = 0,
                standbyCount = 0;
            // 将项目添加到 projectList 中
            allRobot.map(i => {
                i.condition = this.formatterRobotStatus(i.robotStatus);
                if (status !== 'all') {
                    if (i.condition === status) {
                        filterRobotList.push(i)
                    }
                } else {
                    filterRobotList.push(i)
                }
                // 统计机器人状态
                if (i.condition === 'on-line') {
                    onlineCount += 1
                } else if (i.condition === 'off-line') {
                    offlineCount += 1
                } else if (i.condition === 'fault') {
                    faultCount += 1
                } else if (i.condition === 'charging') {
                    chargingCount += 1
                } else if (i.condition === 'standby') {
                    standbyCount += 1
                }
            });
            filterRobotList.map(i => {
                // 不能存在相同id的项目
                if (!projectList.some(j => i.projectId === j.projectId)) {
                    projectList.push({
                        projectId: i.projectId,
                        projectName: i.projectName,
                        robotList: []
                    });
                }
                // 将相同projectId的机器人添加到同一个项目下
                projectList.map(j => {
                    if (i.projectId === j.projectId) {
                        if (i.condition !== 'off-line') {
                            j.robotList.unshift(i);
                        } else {
                            j.robotList.push(i);
                        }
                    }
                });
            })
            this.robotStatus[1].quantity = onlineCount;
            this.robotStatus[2].quantity = offlineCount;
            this.robotStatus[3].quantity = faultCount;
            this.robotStatus[4].quantity = chargingCount;
            this.robotStatus[5].quantity = standbyCount;
            this.projectList = projectList;
        },
        // 获取地区本月趋势
        getProvinceTrend() {
            let {areaCode} = this,
                {id, token} = this.$store.state.userInfo,
                year = moment().format('YYYY'),
                month = moment().format('M'),
                data = {
                    method: "selectProjectAndRobotTrend",
                    params: [`{'userId':'${id}','areaCode':'${areaCode}','year':'${year}','month':'${month}'}`]
                }
            sevnceApi.getRbp(data, token).then(res => {
                let {projectTrendNum, robotTrendNum} = res.result.mes;
                this.infoWindowData.projectTrendNum = projectTrendNum;
                this.infoWindowData.robotTrendNum = robotTrendNum;
            })
        },
        // 格式化趋势图标类名
        formatterTrendIcon(number) {
            if (number > 0) {
                return 'el-icon-top'
            } else if (number < 0) {
                return 'el-icon-bottom'
            } else {
                return 'el-icon-minus'
            }
        }
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
                        // 柱子颜色
                        barColor: '#31E2F4',
                        // label颜色
                        labelColor: '#D2E0FA',
                        // 图表颜色列表
                        chartsColor: [
                            {c1: '#C27500', c2: '#FFE19A', l: 0, b: 0, r: 0.1, t: 1},
                            {c1: '#23DCB8', c2: '#1373C7', l: 0, b: 0, r: 0.5, t: 1},
                            {c1: '#86C1EE', c2: '#150FC5', l: 0, b: 0, r: 0, t: 1},
                            {c1: '#6DCAE6', c2: '#2F4EB1', l: 0, b: 0, r: 0, t: 1},
                            {c1: '#C14242', c2: '#C4944E', l: 1, b: 1, r: 0, t: 0},
                            {c1: '#4F15BB', c2: '#921781', l: 0, b: 0, r: 0, t: 1},
                            {c1: '#3A48E3', c2: '#8219B4', l: 0, b: 0, r: 0, t: 1},
                            {c1: '#8A0963', c2: '#950833', l: 0, b: 0, r: 0, t: 1},
                        ],
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
                        // 柱子颜色
                        barColor: '#1E2088',
                        // label颜色
                        labelColor: '#f2f2f2',
                        // 图表颜色列表
                        chartsColor: [
                            {c1: '#E3AB11', c2: '#E3AB11', l: 0, b: 0, r: 0, t: 1},
                            {c1: '#06AED5', c2: '#06AED5', l: 0, b: 0, r: 0, t: 1},
                            {c1: '#2680EB', c2: '#2680EB', l: 0, b: 0, r: 0, t: 1},
                            {c1: '#6768AB', c2: '#6768AB', l: 0, b: 0, r: 0, t: 1},
                            {c1: '#BB7C91', c2: '#BB7C91', l: 0, b: 0, r: 0, t: 1},
                            {c1: '#23DCB8', c2: '#23DCB8', l: 0, b: 0, r: 0, t: 1},
                            {c1: '#AEC4EF', c2: '#AEC4EF', l: 0, b: 0, r: 0, t: 1},
                            {c1: '#BCBFA2', c2: '#BCBFA2', l: 0, b: 0, r: 0, t: 1},
                        ],
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
                        barColor: '#D4B87F',
                        // label颜色
                        labelColor: '#3B3152',
                        // 图表颜色列表
                        chartsColor: [
                            {c1: '#EAAFC8', c2: '#654EA3', l: 0, b: 0, r: 0, t: 1},
                            {c1: '#91EAE4', c2: '#7F7FD5', l: 0, b: 0, r: 0, t: 1},
                            {c1: '#FFFBD5', c2: '#B20A2C', l: 0, b: 0, r: 0, t: 1},
                            {c1: '#EE9CA7', c2: '#FFDDE1', l: 1, b: 1, r: 0, t: 0},
                            {c1: '#005AA7', c2: '#FFFDE4', l: 0, b: 0, r: 0, t: 1},
                            {c1: '#3B3B6F', c2: '#7576DE', l: 0, b: 0, r: 0, t: 1},
                            {c1: '#7F6E62', c2: '#D4B87F', l: 0, b: 0, r: 0, t: 1},
                            {c1: '#2EBF91', c2: '#8360C3', l: 0, b: 0, r: 0, t: 1},
                        ],
                        // loading 蒙层背景色
                        maskBackgroundColor: 'rgba(0, 0, 0, 0.8)'
                    }
                    break;
                }
            }
            if (this.map) {
                this.map.setMapStyle(mapStyleName);
            }
        },
    },
    filters: {
        // 将大于等于1w的数值格式化为保留两位小数的数值
        filterGreaterTenThousand(value) {
            return Number((value / 10000).toFixed(2));
        },
        // 绝对值
        abs(number) {
            if (number) {
                return Math.abs(number)
            } else {
                return '-'
            }
        },
    },
    components: {
        empty,
        topBar,
        logo,
        countTo,
        myTitle
    }
}