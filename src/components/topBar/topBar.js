// 第三方组件：popover.js
import {createPopper} from "@popperjs/core";
// 全屏插件
import screenfull from "screenfull";
// 弹出框组件
import popover from "@/components/popover/popover";
// 空状态组件
import empty from "@/components/empty/empty";
// 公共js库
import commonJs from "@/assets/js/common";
// 公司接口
import sevnceApi from "@/request/api/sevnce";
// 登陆接口
import loginApi from "@/request/api/login";
// 拼音匹配
import PinyinMatch from 'pinyin-match';
// 时间js库
import moment from "moment";
import store from "@/store";

export default {
    name: 'topBar',
    props: {
        type: {
            type: String
        },
        id: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            userInfo: '',// 用户信息
            searchValue: '',// 搜索内容
            fullScreenFlag: false,// 是否全屏
            titlePopoverFlag: false,// 自定义title弹出框
            searchPopoverFlag: false,// 搜索弹出框
            userInfoPopoverFlag: false,// 是否显示用户选项弹出框
            themePopoverFlag: false,// 是否显示主题列表弹出框
            userInfoPopoverTarget: '',// 用户选项弹出框节点
            themes: [
                {
                    id: 'default',
                    name: '经典风格'
                },
                {
                    id: 'minimalism',
                    name: '极简风格'
                },
                {
                    id: 'prime',
                    name: '尊享风格'
                }
            ],// 主题列表
            currentTheme: '',// 当前主题
            provinceList: [],// 省市列表
            // 业务管理弹出框
            businessPopoverFlag: false,
            // 业务树型数据
            businessTreeData: [
                {
                    label: '预警管理',
                    children: [
                        {
                            label: '预警类别配置'
                        },
                        {
                            label: '预警等级配置'
                        },
                        {
                            label: '预警白名单'
                        },
                    ]
                },
                {
                    label: '台账管理',
                    children: [
                        {
                            label: '台账管理'
                        },
                        {
                            label: '区域管理'
                        }
                    ]
                },
                {
                    label: '巡检管理',
                    children: [
                        {
                            label: '巡检点'
                        },
                        {
                            label: '巡检任务',
                            path: '/business/inspection/task'
                        },
                        {
                            label: '巡检策略'
                        },
                    ]
                },
                {
                    label: '固定设备巡检管理',
                    children: [
                        {
                            label: '巡检点'
                        },
                        {
                            label: '巡检计划'
                        },
                        {
                            label: '巡检结果'
                        },
                    ]
                },
            ],
            messagePopoverFlag: false,// 是否显示消息通知小弹出框
            messageTabs: [
                {
                    id: 1,
                    type: 'EMERGENCY_TYPE_ALARM',
                    name: '业务',
                    message: 0
                },
                {
                    id: 2,
                    type: 'EMERGENCY_TYPE_FAULT',
                    name: '机器人',
                    message: 0
                },
                {
                    id: 3,
                    type: 'EMERGENCY_TYPE_EARLYWARN',
                    name: '系统',
                    message: 0
                },
            ],// 消息标签栏数据
            currentTab: '',// 当前tabID 默认为1
            currentMessageType: '',
            messageList: [],// 消息小弹出框列表数据
            messageCenterList: [],// 消息中心对话框列表数据
            dialogMessage: false,// 消息通知大弹出框
            messageSearchValue: '',// 消息中心大弹出框-搜索框值
            messagePages: {
                currentPage: 1,
                pageSize: 5,
                total: 0
            },// 消息中心分页
            filterPopoverFlag: false,// 是否显示消息中心对话框-筛选弹出框
            filters: {
                projectValue: '', // 项目
                robotValue: '',// 机器人
                warningTypeList: [],// 预警类型
                status: 0,// 处理状态 0：全部 1：已处理 2：待处理
                warningDate: [],// 预警日期
                processDate: [],// 处理日期
            },// 筛选条件参数
            robotList: [],
            filtersItems: [],// 确定筛选项后的筛选项列表
            warningTypeOptions: [
                {
                    id: 1,
                    name: '气体识别',
                },
                {
                    id: 2,
                    name: '跑冒滴漏',
                },
            ],// 筛选-预警类型
            typeOptions: [
                {
                    id: 0,
                    name: '全部',
                },
                {
                    id: 1,
                    name: '已处理',
                    code: 'EMERGENCY_STATUS_OFF'
                },
                {
                    id: 2,
                    name: '未处理',
                    code: 'EMERGENCY_STATUS_ON'
                },
            ],// 筛选-处理状态
            dateDefaultShow: '',// 日期选择器默认值，默认为上一月
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
            },// 日期选择器配置
            showScrollArrow: false,// 是否显示筛选项左右滚动箭头
            disabledLeftArrow: true,// 是否禁用左边箭头
            disabledRightArrow: false,// 是否禁用右边箭头
            offsetX: 0,// 筛选项X轴偏移值
            allTagWidth: 0,// 所有tag宽度
            resetSearchList: [],
            // 当前日期
            currentDate: '',
            // 当前时间
            currentTime: '',
            // 时间定时器载体
            timeInterval: '',
            // 状态文字
            statusMessage: '',
            // 消息中心对话框列表数据加载中
            messageCenterListLoading: false,
            // 预警消息详情-预警信息板块
            messageDetails: {
                title: {
                    name: '',
                    level: '',
                    date: ''
                },
                info: {
                    '预警编号': '',
                    '集成设备': '',
                    '预警源': '',
                    '预警类型': '',
                    // '经度': '经度经度',
                    // '纬度': '纬度纬度',
                    '所属项目': '',
                    '预警信息': '',
                    img: [
                        {
                            name: '巡检图片',
                            value: ''
                        },
                        {
                            name: '分析后图片',
                            value: ''
                        },
                        {
                            name: '预置图片',
                            value: ''
                        },

                    ]
                },
                ledger: {
                    '台账分类': '',
                    '台账名称': '',
                    '巡检类型': '',
                    '识别类型': '',
                    '单位': '',
                    '量程值': '',
                },
                handle: {
                    status: 'EMERGENCY_STATUS_OFF',
                    '处理时间': '',
                    '处理结果': '',
                    '受理内容': ''
                },
                others: {}
            },
            // 是否处于消息详情
            messageDetailsFlag: false,
            // 图片资源ip地址
            resourceIp: `http://${process.env.VUE_APP_OTHER_URL}/ftp`,
            // 消息中心-消息详情-处理结果选项
            dealResultOption: '',
            // 消息中心-消息详情-加载状态
            warningDetailsLoading: false,
            // 搜索-地区列表加载状态
            provinceLoading: false,
            // 搜索-地区列表加载状态文本
            provinceLoadingText: '加载中'
        }
    },
    mounted() {
        this.currentTheme = localStorage.getItem('theme');// 获取当前设置皮肤
        this.userInfo = this.$store.state.userInfo;
        this.getProjectAreaList();// 获取项目地区列表
        this.listenerFullScreen();// 监听全屏状态
        this.getUntreatedMessageQuantity();
        this.dateDefaultShow = new Date();
        this.dateDefaultShow.setMonth(new Date().getMonth() - 1);
        // 获取当前日期
        this.currentDate = moment().format('YYYY-MM-DD');
        // 获取当前时间
        this.currentTime = moment().format('HH:mm:ss');
        // 当前时间每秒刷新
        this.timeInterval = setInterval(() => {
            this.currentTime = moment().format('HH:mm:ss');
        }, 1000);
    },
    methods: {
        /*
        * 切换主题
        * id：主题id
        * */
        changeTheme(id) {
            if (this.currentTheme !== id) {
                this.currentTheme = id;
                commonJs.setTheme(id);
                this.$store.commit('setData', {variable: 'currentTheme', data: id});
                this.$emit('changeTheme', id);
            }
        },
        // el-select组件事件：项目选择器获得焦点时
        visibleChangeSelect(value) {
            if (value) {
                this.$nextTick(() => {
                    let dom = document.getElementsByClassName('filter-project-option');
                    if (dom.length) {
                        commonJs.transformCompatible.map(i => {
                            dom[0].style[i] = `scale(${commonJs.getScale()})`;
                        });
                    }
                });
            }
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
            // 当点击其他弹出框出现时 隐藏其他点击弹出框
            let clickPopoverList = ['themePopoverFlag', 'messagePopoverFlag', 'searchPopoverFlag', 'businessPopoverFlag'];
            if (ref !== 'titlePopover') {
                clickPopoverList.map(i => {
                    if (params.flag !== i) {
                        this[i] = false;
                    }
                });
            }
            if (ref === 'themePopover' || ref === 'messagePopover' || ref === 'filterPopover' || ref === 'businessPopover') {
                this[params.flag] = !this[params.flag];
                this.titlePopoverFlag = false;
                if (ref === 'messagePopover' && !this.currentTab) {
                    this.currentTab = 1;
                    this.currentMessageType = 'EMERGENCY_TYPE_ALARM';
                    this.getMessageList();
                }
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
                let {index} = params;
                this.currentBreadcrumbIndex = index;
                if (index) {
                    switch (index) {
                        case 1: {
                            this.breadcrumbPopoverData = this.provinceList;
                            break;
                        }
                        case 2: {
                            this.provinceList.map(i => {
                                if (i.name === this.navbar[1]) {
                                    this.breadcrumbPopoverData = i.projects
                                }
                            })
                            break;
                        }
                        case 3: {
                            this.breadcrumbPopoverData = this.robotList;
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
        // 监听全屏状态
        listenerFullScreen() {
            window.onresize = () => {
                this.fullScreenFlag = screenfull.isFullscreen;
            }
        },
        // 切换全屏
        toggleFullScreen() {
            screenfull.toggle();
        },
        // 刷新
        refresh() {
            window.location.reload();
        },
        // 获取项目地区列表
        getProjectAreaList() {
            this.provinceLoading = true;
            let {id, token} = this.userInfo,
                data = {
                    method: "selectRobotStatus",
                    params: [`{'id':'${id}'}`]
                };
            sevnceApi.getRbp(data, token).then(res => {
                let {mes} = res.result;
                if (mes.length) {
                    let list = [],
                        codeList = [];
                    mes.map(i => {
                        if (codeList.indexOf(i.code) === -1) {
                            list.push({
                                code: i.code,
                                name: i.areaName,
                                projects: [],
                            });
                            codeList.push(i.code)
                        }
                        list.map(j => {
                            if (i.code === j.code) {
                                j.projects.push(i)
                            }
                        })
                    });
                    this.provinceList = list;
                    store.commit('setData', {variable: 'provinceList', data: list});
                    this.resetSearch()
                } else {
                    this.provinceLoadingText = '无数据';
                }
            }).catch(() => {
                this.provinceLoadingText = '失败';
            }).finally(() => {
                this.provinceLoading = false;
            })
        },
        // 退出登录
        logOut() {
            let {id, loginName} = this.userInfo;
            loginApi.logOut({
                userId: id,
                systemCode: '1001',
                userName: loginName,
                client: 'PC',
                clientSys: '0'
            }).then(res => {
                if (res.ok) {
                    this.$message({
                        type: 'success',
                        message: '用户退出成功'
                    });
                    setTimeout(() => {
                        localStorage.removeItem('userToken');
                        this.$router.replace('/login');
                    });
                }
            }).catch(err => {
                console.log(err);
            })
        },
        /*
        * 显示搜索弹出框机器人信息部分
        * item：当前点击搜索项内容
        * */
        showRobotInfo(item) {
            item.show = !item.show;
        },
        changeTab(id, type) {
            this.currentTab = id;
            this.currentMessageType = type;
            this.messageDetailsFlag = false;
            if (this.dialogMessage) {
                this.messageCenterList = [];
                this.getMessageCenterList();
            } else {
                this.messageList = [];
                this.getMessageList();
            }
        },
        // 打开消息中心对话框
        openAllMessage() {
            this.messagePopoverFlag = false;
            this.dialogMessage = true;
            this.getMessageCenterList();
        },
        // el-dialog组件事件：打开消息中心对话框时的回调
        openDialogMessage() {
            this.$nextTick(() => {
                let top = ((this.currentTab - 1) * 54);
                this.$refs.dialogTabSlider.style.top = `${top}px`;
            })
        },
        // el-dialog组件事件：关闭消息中心对话框动画结束后
        closedDialogMessage() {
            this.messageFilterClickEmpty(false);
            this.searchValue = '';
            this.messageDetailsFlag = false;
            this.filterPopoverFlag = false;
        },
        // 鼠标移入tab项时 移动滑块
        mouseenterTab(event, id) {
            // 删除当前激活项样式
            this.$refs.contentTabs.children[this.currentTab - 1].classList.remove('active');
            // 给移入dom添加样式
            let target = event.target;
            target.classList.add('hover');
            let top = ((id - 1) * 54);
            this.$refs.dialogTabSlider.style.top = `${top}px`;
        },
        // 移出tab项时 滑块回到激活项
        mouseleaveTab(event) {
            // 给移出dom删除样式
            let target = event.target;
            target.classList.remove('hover');
            // 给当前激活项添加样式
            this.$refs.contentTabs.children[this.currentTab - 1].classList.add('active');
            // 还原滑块位置
            this.openDialogMessage();
        },
        /*
        * 消息中心对话框-筛选-清空按钮
        * flag：是否查询列表
        * */
        messageFilterClickEmpty(flag = false) {
            // 重置filters参数
            this.filters.projectValue = '';
            this.filters.warningTypeList = [];
            this.filters.status = 0;
            this.filters.warningDate = [];
            this.filters.processDate = [];
            this.filtersItems = [];
            // 初始化筛选项滚动dom
            this.showScrollArrow = false;
            this.offsetX = 0;
            this.$refs.itemTags.style.transform = `translateX(${this.offsetX}px)`;
            this.disabledLeftArrow = true;
            this.disabledRightArrow = false;
            // 重置页码
            this.messagePages.currentPage = 1;
            if (flag) {
                this.filterPopoverFlag = false;// 隐藏筛选弹出框
                this.getMessageCenterList();
            }
        },
        // 消息中心对话框-筛选-确定按钮
        messageFilterClickConfirm() {
            this.filtersItems = [];
            this.filterPopoverFlag = false;
            let {projectValue, robotValue, warningTypeList, status, warningDate, processDate} = this.filters,
                [warningDateStart, warningDateEnd] = warningDate,
                [processDateStart, processDateEnd] = processDate;
            if (projectValue) {
                this.resetSearchList.map(i => {
                    if (i.projectId === projectValue) {
                        this.filtersItems.push({
                            type: 'project',
                            value: i.name,
                            id: i.projectId
                        });
                    }
                });
            }
            if (robotValue) {
                this.robotList.map(i => {
                    if (i.id === robotValue) {
                        this.filtersItems.push({
                            type: 'robot',
                            value: i.name,
                            id: i.id
                        });
                    }
                });
            }
            if (warningTypeList.length) {
                warningTypeList.map(i => {
                    this.filtersItems.push({
                        type: 'type',
                        value: i
                    });
                });
            }
            if (status) {
                this.typeOptions.filter(i => i.id === status).map(j => {
                    this.filtersItems.push({
                        type: 'status',
                        value: j.name,
                        code: j.code
                    });
                });
            }
            if (warningDate.length) {
                this.filtersItems.push({
                    type: 'warning',
                    value: {
                        start: warningDateStart,
                        end: warningDateEnd,
                    }
                });
            }
            if (status !== 2) {
                if (processDate.length) {
                    this.filtersItems.push({
                        type: 'process',
                        value: {
                            start: processDateStart,
                            end: processDateEnd,
                        }
                    });
                }
            }
            this.offsetX = 0;
            setTimeout(() => {
                this.showFilterScrollArrow();// 判断当前tagDOM是否超过实际tagDOM宽度
            }, 50);
            this.getMessageCenterList();
        },
        /*
        * 删除筛选项
        * type：当前删除的筛选项类型，用于同步重制筛选框项
        * index：筛选项索引
        * value：筛选项值（用于warningTypeList删除指定值）
        * */
        closeFilterTag(type, index, value) {
            this.filtersItems.splice(index, 1);
            if (type === 'project') {
                this.filters.projectValue = '';
                this.filters.robotValue = '';
            } else if (type === 'robot') {
                this.filters.robotValue = '';
            } else if (type === 'type') {
                this.filters.warningTypeList.map((i, index) => {
                    if (i === value) {
                        this.filters.warningTypeList.splice(index, 1);
                    }
                });
            } else if (type === 'status') {
                this.filters.status = 0;
            } else if (type === 'warning') {
                this.filters.warningDate = [];
            } else if (type === 'process') {
                this.filters.processDate = [];
            }
            setTimeout(() => {
                let dom = this.$refs.itemTags,
                    maxX = dom.clientWidth - dom.scrollWidth,
                    {offsetX} = this;
                if (offsetX < maxX) {
                    this.offsetX = maxX;
                    this.disabledRightArrow = false;
                }
                dom.style.transform = `translateX(${this.offsetX}px)`;
                this.getMessageCenterList();
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
        // 搜索框输入时
        changeSearchValue() {
            this.resetSearch();
        },
        // 重置searchList数据；项数据中添加show字段；默认为false
        resetSearch() {
            let cacheProvinceList = [...this.provinceList],
                list = [],
                {searchValue} = this;
            // 组装数据
            cacheProvinceList.map(i => {
                i.projects.map(j => {
                    list.push({
                        name: j.name,// 公司名称
                        topparent: j.code,// 父级区号/省号
                        projectId: j.sysPorjectId,// 项目id
                        show: false,
                        robotnum: j.robotCount,
                        robotStatus: {
                            'on-line': j.robotOnLineCount,
                            'off-line': j.robotOffLineCount,
                        },
                    });
                });
                list.map(k => {
                    if (i.code === k.topparent) {
                        k.tag = i.name.replace(/(省|市|自治区|自治州|县|区)/g, '');// 省/市名称
                        if (k.tag.indexOf('新疆') !== -1) {
                            k.tag = '新疆'
                        } else if (k.tag.indexOf('内蒙') !== -1) {
                            k.tag = '内蒙'
                        }
                    }
                });
            });
            // 输入框模糊查询
            // 判断搜索内容是否为英文
            let flag = /[A-Za-z]+/.test(searchValue);
            // pinyin模糊搜索
            if (flag) {
                let resetList = [];
                list.map(i => {
                    let flag = PinyinMatch.match(i.name, searchValue) || PinyinMatch.match(i.tag, searchValue);
                    if (flag) {
                        resetList.push(i)
                    }
                });
                this.resetSearchList = resetList;
            }
            // 汉字模糊搜索
            else {
                this.resetSearchList = list.filter(i => {
                    return i.name.indexOf(searchValue) !== -1 || i.tag.indexOf(searchValue) !== -1
                });
            }

        },
        // 消息中心-选择全部预警类型
        checkALlType() {
            let {warningTypeOptions, filters} = this,
                options = [];
            if (warningTypeOptions.length !== filters.warningTypeList.length) {
                this.warningTypeOptions.map(i => {
                    options.push(i.name);
                });
                this.filters.warningTypeList = options;
            } else {
                this.filters.warningTypeList = [];
            }
        },
        // 消息中心-筛选-切换项目
        changeProject(value) {
            this.filters.robotValue = '';
            this.robotList = [];
            let data = {
                method: "getRobotData",
                params: [`{'projectId':${value}}`],
            };
            sevnceApi.getRbp(data, this.userInfo.token).then(res => {
                let {mes} = res.result;
                if (mes.length) {
                    mes.unshift({
                        id: '',
                        name: '全部'
                    })
                    this.robotList = mes;
                } else {
                    // this.$message.error('该公司暂无机器人列表数据');
                }
            }).catch(() => {
                // this.$message.error('获取机器人列表失败');
            });
        },
        /*
        * 获取消息详情
        * id：消息id
        * */
        getMessageDetails(id) {
            // 处理结果选项是否已存在
            if (!this.dealResultOption.length) {
                this.getDictInformation();
            }
            // 消息中心是否已打开
            if (!this.dialogMessage) {
                this.openAllMessage();
            }
            // 当从消息列表小弹出框进入详情时；列表dom还未渲染完成
            this.$nextTick(() => {
                this.warningDetailsLoading = true;
                this.messageDetailsFlag = true;
            });
            let data = {
                method: "getEmergencyInfoByEmergencyInfoId",
                params: [`{'emergencyInfoId':'${id}'}`],
            };
            sevnceApi.getRbp(data, this.userInfo.token).then(res => {
                let {
                    createDate,
                    emerName,
                    emergencyGrade,
                    emerAppNo,
                    deviceName,
                    emerSource,
                    emerType,
                    content,
                    projectName,
                    itemRemark1,
                    itemRemark2,
                    assetsType,
                    assetsName,
                    patrolType,
                    identificationType,
                    assetsUnit,
                    status
                } = res.result.mes;
                this.messageDetails.title.date = moment(createDate).format('YYYY-MM-DD HH:mm:ss');
                this.messageDetails.title.name = emerName;
                this.messageDetails.title.level = this.all.translationKey(emergencyGrade);
                this.messageDetails.info.预警编号 = emerAppNo;
                this.messageDetails.info.集成设备 = deviceName;
                this.messageDetails.info.预警源 = emerSource;
                this.messageDetails.info.预警类型 = emerType;
                this.messageDetails.info.所属项目 = projectName;
                this.messageDetails.info.预警信息 = content;
                this.messageDetails.info.img[0].value = itemRemark1;
                this.messageDetails.info.img[1].value = itemRemark2;
                this.messageDetails.info.img[2].value = itemRemark1;
                this.messageDetails.ledger.台账分类 = assetsType;
                this.messageDetails.ledger.台账名称 = assetsName;
                this.messageDetails.ledger.巡检类型 = patrolType;
                this.messageDetails.ledger.巡检类型 = patrolType;
                this.messageDetails.ledger.识别类型 = identificationType;
                this.messageDetails.ledger.单位 = assetsUnit;
                this.messageDetails.handle.status = status;
                this.messageDetails.others.id = id;
                if (status === 'EMERGENCY_STATUS_OFF') {
                    let {dealDate, dealResult, emerRemark1} = res.result.mes;
                    this.messageDetails.handle.处理时间 = moment(dealDate).format('YYYY-MM-DD HH:mm:ss');
                    let interval = setInterval(() => {
                        if (this.dealResultOption.length) {
                            clearInterval(interval);
                            this.messageDetails.handle.处理结果 = this.dealResultOption.filter(i => i.value === dealResult)[0].label;
                        }
                    });
                    this.messageDetails.handle.受理内容 = emerRemark1;
                }
            }).finally(() => {
                this.warningDetailsLoading = false;
            })
            this.messageDetails.handle.处理时间 = moment().format("YYYY-MM-DD HH:mm:ss");
        },
        // 前往AI展示平台
        toAI() {
            window.open('/AI', '_blank')
        },
        // 获取预警信息列表
        getMessageList() {
            let {type, id, currentMessageType} = this,
                params = {
                    pageNum: 1,
                    pageSize: 5,
                    type: currentMessageType
                }
            if (type === 'robot') {
                params.deviceId = id;
            } else if (type === 'project') {
                params.projectId = id;
            } else if (type === 'country') {
                params.usreId = id;
            }
            this.statusMessage = '加载中';
            let data = {
                method: "getRobotEmergencyInfo",
                params: [JSON.stringify(params)],
            };
            sevnceApi.getRbp(data, this.userInfo.token).then(res => {
                if (res.result.ok) {
                    let {mes} = res.result,
                        {page} = mes,
                        {list} = page,
                        messageList = [];
                    if (list && list.length) {
                        list.map(i => {
                            messageList.push({
                                //id
                                id: i.id,
                                // 标题名称
                                name: i.name,
                                // 日期
                                date: i.createDate,
                                // 处理状态
                                status: i.status
                            });
                        });
                        this.messageList = messageList;
                    } else {
                        this.messageList = [];
                        this.statusMessage = '无消息'
                    }
                }
            }).catch(() => {
                this.statusMessage = '失败';
            });
        },
        // 获取预警信息列表-消息中心对话框
        getMessageCenterList() {
            this.messageCenterListLoading = true;
            let {currentPage, pageSize} = this.messagePages,
                {messageSearchValue, id, type} = this,
                projectId = '',
                status = '',
                deviceId = '',
                createStartDate = '',
                createEndDate = '',
                dealStartDate = '',
                dealEndDate = '',
                userId = '';
            if (this.filtersItems.length) {
                this.filtersItems.map(i => {
                    if (i.type === 'project') {
                        projectId = i.id
                    }
                    if (i.type === 'status') {
                        status = i.code;
                    } else if (i.type === 'robot') {
                        deviceId = i.id
                    } else if (i.type === 'warning') {
                        createStartDate = i.value.start;
                        createEndDate = i.value.end;
                    } else if (i.type === 'process') {
                        dealStartDate = i.value.start;
                        dealEndDate = i.value.end;
                    }
                });
            }
            // 当三级页面没有选中机器人时 默认查询当前查看的机器人
            if (!deviceId && type === 'robot') {
                deviceId = id
            }
            if (!projectId && type === 'project') {
                projectId = id;
                this.filters.projectValue = id;
            }
            if (type === 'country') {
                userId = id;
            }
            let data = {
                method: "getRobotEmergencyInfo",
                params: [`{'deviceId':'${deviceId}','projectId':'${projectId}','userId':'${userId}','pageNum':'${currentPage}','pageSize':'${pageSize}',type:'${this.currentMessageType}','status':'${status}','createStartDate':'${createStartDate}','createEndDate':'${createEndDate}','dealStartDate':'${dealStartDate}','dealEndDate':'${dealEndDate}','emerInfoName':'${messageSearchValue}'}`],
            };
            sevnceApi.getRbp(data, this.userInfo.token).then(res => {
                this.messageCenterList = [];
                if (res.result.ok) {
                    let {mes} = res.result,
                        {page} = mes,
                        {list, count} = page,
                        messageList = [];
                    if (list && list.length) {
                        list.map(i => {
                            messageList.push({
                                // id
                                id: i.id,
                                // 标题名称
                                name: i.name,
                                // 日期
                                date: i.createDate,
                                // 内容
                                content: i.content,
                                // 预警等级
                                level: this.all.translationKey(i.emergencyGrande),
                                // 处理状态
                                status: i.status
                            });
                        });
                        this.messageCenterList = messageList;
                        this.messagePages.total = count;
                    } else {
                        this.messagePages.total = 0;
                    }
                }
            }).catch(() => {
                this.messagePages.total = 0;
            }).finally(() => {
                this.messageCenterListLoading = false;
            });
        },
        // 格式化预警等级背景色
        formatterLevel(level) {
            switch (level) {
                case '一级': {
                    return 'var(--color-error)'
                }
                case '二级': {
                    return 'var(--color-warning)'
                }
                case '三级': {
                    return 'var(--color-mild-warning)'
                }
                case '四级': {
                    return 'var(--color-normal)'
                }
            }
        },
        // 获取业务、机器人、系统未处理预警数量
        getUntreatedMessageQuantity() {
            let id = '',
                interval = setInterval(() => {
                    id = this.id;
                    if (!id) {
                        id = this.id;
                    } else {
                        clearInterval(interval);
                        let params = {},
                            {type} = this;
                        if (type === 'robot') {
                            params.deviceId = id;
                        } else if (type === 'project') {
                            params.projectId = id;
                        } else if (type === 'country') {
                            params.userId = id;
                        }
                        let data = {
                            method: "getEmergencyInfoUntreated",
                            params: [JSON.stringify(params)],
                        };
                        sevnceApi.getRbp(data, this.userInfo.token).then(res => {
                            let {mes} = res.result,
                                allCount = 0;
                            if (mes.length) {
                                this.messageTabs.map(i => {
                                    mes.map(j => {
                                        if (i.type === j.type) {
                                            i.message = j.count
                                        }
                                    });
                                });
                                mes.map(i => {
                                    allCount += i.count;
                                });
                                this.userInfo.message = allCount;
                            }
                        });
                    }
                }, 50);
        },
        // 切换消息中心页码
        changeMessageCenterListPage() {
            this.getMessageCenterList();
        },
        // 获取字典对应翻译
        getDictInformation() {
            let data = {
                method: "selectSysDictInformation",
                params: [`{'type':'EMERGENCY_RESULT'}`]
            };
            sevnceApi.getRbp(data, this.userInfo.token).then(res => {
                let {mes} = res.result;
                this.dealResultOption = mes;
            });
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
        // 提交预警处理
        submitWarningHandling() {
            this.warningDetailsLoading = true;
            let {id} = this.messageDetails.others,
                {处理时间, 处理结果, 受理内容} = this.messageDetails.handle,
                data = {
                    method: "updateEarlyWarningProcessing",
                    params: [`{'emergencyId':'${id}','dealResult':'${处理结果}','dealDate':'${处理时间}','content':'${受理内容}'}`]
                }
            sevnceApi.getRbp(data, this.userInfo.token).then(res => {
                let {result} = res.result.mes;
                if (result) {
                    // 清空输入项
                    this.messageDetails.handle.处理时间 = '';
                    this.messageDetails.handle.处理结果 = '';
                    this.messageDetails.handle.受理内容 = '';
                    // 更新数据
                    this.getUntreatedMessageQuantity();
                    this.getMessageList();
                    this.getMessageCenterList();
                    this.getMessageDetails(id);
                }
            }).finally(() => {
                this.warningDetailsLoading = false;
            })
        },
        // 跳转至二级页面
        toProject(projectId) {
            this.$router.push({
                path: '/',
                query: {
                    projectId: projectId
                }
            });
        },
        /*
        * el组件事件：点击tree节点-跳转至业务管理页码
        * 共三个参数，依次为：传递给 data 属性的数组中该节点所对应的对象、节点对应的 Node、节点组件本身。
        * */
        toBusiness(data, node) {
            let {level} = node,
                {path} = data,
                {id} = this;
            if (level === 2) {
                let query = {};
                if (this.type === 'project') {
                    query.projectId = id;
                } else if (this.type === 'robot') {
                    query.deviceId = id;
                }
                let routeData = this.$router.resolve({path, query});
                window.open(routeData.href, "_blank");
            }
        },
    },
    // 调用父级的数据/方法
    inject: ['all'],
    watch: {
        // 监听鼠标是否在用户弹出框内
        userInfoPopoverTarget() {
            clearInterval(this.mouseleaveTimeout);
            this.userInfoPopoverFlag = true;
            this.userInfoPopoverTarget = '';
        },
        // 监听当前tab的变化
        currentTab(newValue) {
            this.$nextTick(() => {
                if (this.dialogMessage) {
                    let top = ((newValue - 1) * 54);
                    this.$refs.dialogTabSlider.style.top = `${top}px`;
                }
                let left = ((newValue - 1) * 61) + 2;
                this.$refs.tabSlider.style.left = `${left}px`;
            })
        },
        // 监听是否查看消息详情-改变list/details元素的left值
        messageDetailsFlag(newValue) {
            let list = this.$refs.messageList,
                details = this.$refs.messageDetails;
            list.style.left = newValue ? '-100%' : 0;
            details.style.left = newValue ? 0 : '100%';
            if (!newValue) {
                this.messageDetails.handle.处理时间 = '';
                this.messageDetails.handle.处理结果 = '';
                this.messageDetails.handle.受理内容 = '';
            }
        }
    },
    components: {
        popover,
        empty
    },
    filters: {
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
                    return '在线';
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
                case 'all': {
                    return '全部'
                }
            }
        },
    },

}
