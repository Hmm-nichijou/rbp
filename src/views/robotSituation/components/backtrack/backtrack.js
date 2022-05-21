import sevnceApi from "@/request/api/sevnce";
import commonJs from "@/assets/js/common";
import moment from "moment";

// 组件：空状态
import empty from '@/components/empty/empty.vue';

export default {
    props: {
        robotId: {
            type: String,
            default: ''
        },
        currentTheme: {
            type: String,
            default: 'default'
        },
        page: {
            type: String,
            default: ''
        },
        id: {
            type: String,
            default: ''
        },
        filters: {
            type: Object
        }
    },
    data() {
        return {
            // 任务回溯日期范围，默认为[昨天,今天]
            taskBacktrackingDate: [],
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
            // 任务回溯列表筛选项
            backtrackingFilter: [
                {
                    id: 'createSort',
                    name: '日期',
                    filter: '2'
                },
                {
                    id: 'emerCount',
                    name: '预警次数',
                    filter: '1'
                },
                {
                    id: 'pending',
                    name: '待处理',
                    filter: '1'
                }
            ],
            // 任务回溯列表筛选项激活项
            backtrackingFilterActive: 'createSort',
            // 任务回溯列表数据
            backtrackingList: [],
            // 任务回溯列表分页
            backtrackingPages: {
                total: 0,
                pageSize: this.page ? 7 : 6,
                currentPage: 1
            },
            // 历史任务列表加载状态
            loading: false,
            loadingMsg: '无数据'
        }
    },
    mounted() {
        this.dateDefaultShow = new Date();
        this.dateDefaultShow.setMonth(new Date().getMonth() - 1);
        this.getHistoryTask();
    },
    methods: {
        // 获取历史任务
        getHistoryTask() {
            this.loading = true;
            this.loadingMsg = '加载中'
            let id = '',
                interval = setInterval(() => {
                    id = this.robotId;
                    if (id) {
                        clearInterval(interval);
                        let [first, second] = this.taskBacktrackingDate,
                            startTime = first ? first : '',
                            endTime = second ? second : '',
                            {currentPage, pageSize} = this.backtrackingPages,
                            {token} = this.$store.state.userInfo,
                            {backtrackingFilterActive, backtrackingFilter} = this,
                            filter = {
                                name: '',
                                value: ''
                            }
                        backtrackingFilter.map(i => {
                            if (i.id === backtrackingFilterActive) {
                                filter.name = i.id;
                                filter.value = i.filter
                            }
                        })
                        let data = {
                            method: "selectHistoryTaskResultDetail",
                            params: [
                                `{'deviceId':'${id}','pageNo':'${currentPage}','pageSize':'${pageSize}','createDate':'${startTime}','endDate':'${endTime}','${filter.name}':'${filter.value}'}`,
                            ],
                        };
                        sevnceApi.getRbp(data, token).then(res => {
                            let {resultMap, taskResultCount} = res.result.mes
                            if (resultMap.length) {
                                resultMap.map(i => {
                                    i.date = `${moment(i.startTime).format('YYYY-MM-DD HH:mm:ss')}-${moment(i.endTime).format('HH:mm:ss')}`
                                });
                                this.backtrackingList = resultMap;
                                // 总条数
                                this.backtrackingPages.total = taskResultCount;
                                this.$emit('nextTask', resultMap[0]);
                            } else {
                                this.backtrackingList = [];
                                this.loadingMsg = '无数据'
                            }
                        }).catch(() => {
                            this.loadingMsg = '查询失败'
                            // this.$message.error('获取历史任务失败');
                        }).finally(() => {
                            this.loading = false;
                        })
                    }
                }, 30);
        },
        // 改变开始日期和结束日期-查询范围内的历史任务
        changeDate() {
            // 重置当前页
            this.backtrackingPages.currentPage = 1;
            this.getHistoryTask();
        },
        // 改变历史回溯当前页时
        changeCurrentPage() {
            this.getHistoryTask();
        },
        // 重置日期
        resetDate() {
            this.taskBacktrackingDate = [];
            this.getHistoryTask();
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
        // 格式化预警次数并设置类名
        formatWarningFrequency(warningFrequency) {
            if (warningFrequency > 0 && warningFrequency < 10) {
                return 'warning';
            } else if (warningFrequency >= 10) {
                return 'error';
            }
        },
        /*
        * 改变任务回溯列表筛选激活项
        * item：当前点击筛选项
        *
        *当id='date'时；进行日期排序 a-b：正序；b-a：反序；
        * */
        changeBacktrackingFilter(item) {
            let {backtrackingFilterActive} = this,
                {id, filter} = item;
            if (backtrackingFilterActive !== id) {
                this.backtrackingFilterActive = id;
            } else {
                item.filter = filter === '2' ? '1' : '2';
            }
            this.getHistoryTask();
        },
        // 点击历史巡检任务
        clickTaskItem(item) {
            let {startTime, endTime, taskId} = item,
                data = {
                    startTime,
                    endTime,
                    taskId
                }
            this.$emit('changeTask', data);
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
    },
    components: {
        empty
    }
}