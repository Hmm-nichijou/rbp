// 组件；全局顶栏：搜索框、刷新、全屏、用户信息、通知消息、主题、设置
import topBar from '@/components/topBar/topBar.vue';
// 组件：顶部logo
import logo from "@/components/logo/logo.vue";
// 通用混入js
import mixins from "@/assets/js/mixins";
// 类似邮箱联系人输入框操作
import 'multi-items-input'
import 'multi-items-input/dist/multi-items-input.css'
import sevnceApi from "@/request/api/sevnce";

export default {
    mixins: [mixins],
    data() {
        return {
            // 面包屑
            navbar: [
                {
                    id: 0,
                    name: '业务管理'
                },
                {
                    id: 1,
                    name: '巡检管理'
                },
                {
                    id: 2,
                    name: '巡检任务'
                }
            ],
            // 当前主题
            currentTheme: '',
            // 左侧面板列表标题
            listTIle: ['任务名称', '任务类型', '机器人', '开始时间', '循环间隔', '执行状态', '任务状态', '更新时间'],
            // 任务列表数据
            taskList: [],
            // 任务列表分页
            taskListPage: {
                currentPage: 1,
                pageSize: 15,
                total: 100
            },
            // 右侧任务表单数据
            taskForm: {
                id: '',
                // 机器人
                robot: {},
                // 巡检地图
                map: '',
                // 任务名称
                name: '',
                // 任务类型
                type: '',
                // 开始时间
                startDate: '',
                // 循环间隔
                cycle: '',
                // 间隔单位
                cycleUnit: '',
                // 状态
                status: 'NOT_TAKE_EFFECT',
                // 检测点列表
                pointList: [],
                // 备注
                remarks: ''
            },
            // 右侧任务表单-机器人列表选项
            robotList: [],
            // 地图选项
            mapOptions: [],
            // 任务类型选项
            typeOptions: [],
            // 状态选项
            statusOption: [
                {
                    label: '不生效',
                    value: 'NOT_TAKE_EFFECT',
                },
                {
                    label: '生效',
                    value: 'TAKE_EFFECT',
                }
            ],
            // 周期单位选项
            cycleOptions: [],
            // 巡检点列表选项
            pointOptions: [],
            // 缓存巡检点列表选项-用于获取当前点位选项的索引
            _pointOptions: [],
            // 对话框-选择机器人
            dialogSelectRobot: false,
            // 选择机器人对话框-搜索框内容
            searchRobotValue: '',
            // 筛选弹出框
            filterPopoverFlag: false,
            // 任务列表加载状态
            taskListLoading: false,
            // 机器人列表弹出框加载状态
            robotListLoading: false,
            // 加载任务详情状态
            taskDetailsLoading: false,
        }
    },
    mounted() {
        this.currentTheme = localStorage.getItem('theme');
        this.getTaskList();
    },
    methods: {
        // 组件事件：切换主题
        changeTheme(value) {
            this.currentTheme = value;
        },
        // 切换当前页码
        changeCurrentPage() {
            this.getTaskList();
        },
        /*
        * 树结构根据 searchRobotValue 进行筛选
        * value：输入框内容
        * data：数据
        * node：dom节点
        * */
        filterNode(value, data, node) {
            if (!value) return true;
            let _array = [];//这里使用数组存储 只是为了存储值。
            this.getReturnNode(value, _array, node);
            let result = false;
            _array.forEach(i => result = result || i);
            return result;
        },
        getReturnNode(value, _array, node) {
            let isPass = node.data && node.data.label && node.data.label.indexOf(value) !== -1;
            isPass ? _array.push(isPass) : '';
            if (!isPass && node.level !== 1 && node.parent) {
                this.getReturnNode(value, _array, node.parent);
            }
        },
        // 打开dialog-获取机器人列表
        openDialog() {
            if (this.robotList.length) return;
            this.robotListLoading = true;
            let url = '/RBP/patrol/task/patrolTask/treeDataByDeviceInfo',
                {id, token} = this.$store.state.userInfo,
                data = `json=${JSON.stringify({userId: id, category: 'ROBOT'})}`;
            sevnceApi.getRbp(data, token, url).then(res => {
                let {mes} = res;
                if (mes.length) {
                    let list = []
                    mes.map(i => {
                        let {type, id, name} = i;
                        if (type === 'project') {
                            list.push({
                                id,
                                label: name,
                                children: []
                            });
                        }
                    });
                    mes.map(i => {
                        let {type, pId, id, name} = i;
                        if (type === 'deviceDefine') {
                            list.map(j => {
                                if (pId === j.id) {
                                    j.children.push({
                                        id,
                                        label: name,
                                        children: []
                                    })
                                }
                            })
                        }
                    });
                    mes.map(i => {
                        let {type, pId, id, name} = i;
                        if (type === 'deviceDetail') {
                            list.map(j => {
                                j.children.map(k => {
                                    if (pId === k.id) {
                                        k.children.push({
                                            id,
                                            label: name,
                                            projectId: pId.substring(0, pId.indexOf('_'))
                                        })
                                    }
                                });
                            })
                        }
                    });
                    this.robotList = list;
                }
            }).finally(() => {
                this.robotListLoading = false;
            })
        },
        // 关闭dialog（动画执行完成后）
        closedDialog() {
            this.searchRobotValue = '';
        },
        // 根据key返回对应选项
        getOptions(key) {
            return this[`${key}Options`];
        },
        // 切换表单-状态
        changeStatus(item) {
            let {value} = item;
            this.taskForm.status = value;
        },
        // 匹配检测点列表选项
        search(keywords, cb) {
            let {pointOptions} = this;
            setTimeout(() => {
                keywords ? cb(pointOptions.filter(item => item.name.indexOf(keywords) > -1)) : cb(pointOptions);
            }, 100);
        },
        // 匹配检测点列表选项-选择选项
        selectPoint(arr, obj) {
            let {id, name} = obj;
            if (!id) {
                arr.map((i, index) => {
                    if (i.name === name && i.id === id) {
                        arr.splice(index, 1);
                        this.$message.error('请输入与检测点列表匹配的点位名称')
                    }
                });
            }
            this.taskForm.pointList = arr;
        },
        /*
        * 删除巡检点位
        * 删除元素后的数组
        * */
        deletePoint(obj, arr) {
            this.taskForm.pointList = arr;
        },
        // 获取任务列表
        getTaskList() {
            this.taskListLoading = true;
            let {projectId, deviceId} = this.$route.query,
                {currentPage, pageSize} = this.taskListPage,
                params = {
                    pageNo: currentPage,
                    pageSize: pageSize
                },
                {token} = this.$store.state.userInfo,
                url = '/RBP/patrol/task/patrolTask/list';
            if (projectId) params.projectId = projectId;
            if (deviceId) params.deviceId = deviceId;
            let data = `json=${JSON.stringify(params)}`;
            sevnceApi.getRbp(data, token, url).then(res => {
                let {list, count} = res.mes.page,
                    array = [];
                list.map(i => {
                    let {
                            id,
                            taskName,
                            taskType,
                            deviceInfoIdName,
                            startTiming,
                            status,
                            taskStatus,
                            updateDate,
                            intervalTime,
                            intervalUnit
                        } = i,
                        obj = {
                            id,
                            name: taskName,
                            type: taskType,
                            robot: deviceInfoIdName,
                            startDate: startTiming,
                            cycle: intervalTime,
                            cycleUnit: intervalUnit,
                            executionStatus: status,
                            taskStatus,
                            update: updateDate
                        }
                    array.push(obj);
                });
                this.taskList = array;
                this.taskListPage.total = count;
            }).finally(() => {
                this.taskListLoading = false
            })
        },
        // 获取任务详情
        getTaskDetails(taskId) {
            this.taskDetailsLoading = true;
            let {token} = this.$store.state.userInfo,
                url = '/RBP/patrol/task/patrolTask/get',
                params = {
                    taskId
                }, data = `json=${JSON.stringify(params)}`;
            sevnceApi.getRbp(data, token, url).then(res => {
                let {
                    id,
                    mapId,
                    remarks,
                    startTiming,
                    taskName,
                    taskStatus,
                    taskType,
                    patrolTaskPointIds,
                    intervalTime,
                    intervalUnit,
                    deviceInfoId,
                    deviceInfoIdName,
                    sysProject
                } = res.mes;
                this.taskForm.id = id;
                this.taskForm.robot = {id: deviceInfoId, label: deviceInfoIdName, projectId: sysProject.id};
                this.taskForm.name = taskName;
                this.taskForm.startDate = startTiming;
                this.taskForm.status = taskStatus;
                this.taskForm.remarks = remarks;
                // 回调函数-获取到下拉框内容后处理数据
                let callback = () => {
                    this.taskForm.map = mapId;
                    this.taskForm.type = taskType;
                    this.taskForm.cycle = intervalTime;
                    this.taskForm.cycleUnit = intervalUnit;
                    let ids = patrolTaskPointIds.split(',');
                    this.getPatrolPointList(ids);
                }
                this.getMapList(callback);
            })
        },
        // 确认选择机器人
        confirmRobot(data, node) {
            let {level} = node
            if (level === 3) {
                this.taskForm.map = '';
                this.taskForm.pointList = [];
                this.taskForm.robot = data;
                this.getMapList();
            }
        },
        // 通过机器人id获取地图列表
        getMapList(cb) {
            let {id} = this.taskForm.robot,
                data = {
                    method: "selectMapInfoAndTaskType",
                    params: [`{'deviceId':'${id}'}`],
                },
                {token} = this.$store.state.userInfo;
            sevnceApi.getRbp(data, token).then(res => {
                let {dictList, dictUtilList, mapInfoList} = res.result.mes,
                    maps = [];
                this.typeOptions = dictList;
                mapInfoList.map(i => {
                    maps.push({
                        label: i.name,
                        value: i.id
                    })
                });
                this.mapOptions = maps;
                this.cycleOptions = dictUtilList;
                if (cb) {
                    cb();
                }
            })
        },
        /*
        * 改变下拉框选项时
        * value：改变的选项value值（地图id）
        * key：表单项key值
        * */
        changeOption(value, key) {
            if (key === 'map') {
                this.taskForm.pointList = [];
                this.getPatrolPointList();
            } else if (key === 'type') {
                if (value === 'IMMEDIATELY') {
                    this.taskForm.cycle = '';
                    this.taskForm.cycleUnit = '';
                    this.taskForm.startDate = '';
                } else if (value === 'TIMING') {
                    this.taskForm.cycle = '';
                    this.taskForm.cycleUnit = '';
                } else if (value === 'CYCLE') {
                    this.taskForm.startDate = '';
                }
            }
        },
        // 获取巡检点列表
        getPatrolPointList(ids = []) {
            let {id} = this.taskForm.robot,
                {map} = this.taskForm,
                data = {
                    method: "selectPatrolPointInfo",
                    params: [`{'deviceId':'${id}','mapId':'${map}'}`],
                },
                {token} = this.$store.state.userInfo;
            sevnceApi.getRbp(data, token).then(res => {
                let {mes} = res.result,
                    list = [];
                mes.map(i => {
                    list.push({
                        name: `${i.pointName}#${i.remark1 ? i.remark1 : ''}`,
                        id: i.id
                    });
                });
                this._pointOptions = JSON.parse(JSON.stringify(list));
                this.pointOptions = list;
                // 获取任务详情的时候 需要复现已选点位
                if (ids.length) {
                    let newList = [];
                    list.map(i => {
                        ids.map(j => {
                            if (i.id === j) {
                                newList.push(i);
                            }
                        });
                    });
                    this.taskForm.pointList = newList;
                    this.taskDetailsLoading = false;
                }
            })
        },
        // 添加任务
        addTask() {
            this.taskForm = {
                id: '',
                // 机器人
                robot: {},
                // 巡检地图
                map: '',
                // 任务名称
                name: '',
                // 任务类型
                type: '',
                // 开始时间
                startDate: '',
                // 循环间隔
                cycle: '',
                // 间隔单位
                cycleUnit: '',
                // 状态
                status: 'NOT_TAKE_EFFECT',
                // 检测点列表
                pointList: [],
                // 备注
                remarks: ''
            }
        },
        // 保存任务
        saveTask() {
            this.taskDetailsLoading = true;
            let {id: userId, token} = this.$store.state.userInfo,
                url = '/RBP/patrol/task/patrolTask/save',
                {id, name, map, status, type, robot, cycleUnit, cycle, remarks, pointList, startDate} = this.taskForm,
                mapName = '', pointListIds = [];
            pointList.map(i => {
                pointListIds.push(i.id);
            });
            pointListIds = pointListIds.join(',');
            mapName = this.mapOptions.filter(i => i.value === map)[0].label;
            let params = {
                    deviceId: robot.id,
                    taskName: name,
                    taskId: id,
                    mapId: map,
                    mapName,
                    taskStatus: status,
                    taskType: type,
                    projectId: robot.projectId,
                    intervalUnit: cycleUnit,
                    intervalTime: cycle,
                    remarks,
                    patrolTaskPointIds: pointListIds,
                    userId,
                    businessType: 'ROBOT',
                    startTiming: startDate,
                    startDate: ''
                },
                data = `json=${JSON.stringify(params)}`;
            sevnceApi.getRbp(data, token, url).then(res => {
                let {ok} = res;
                if (ok) {
                    this.$message({
                        type: 'success',
                        message: '保存任务成功'
                    });
                    this.getTaskList();
                }
            }).finally(() => {
                this.taskDetailsLoading = false;
            })
        },
        // 删除任务
        deleteTask() {
            this.taskDetailsLoading = true;
            let {token} = this.$store.state.userInfo,
                {id} = this.taskForm,
                url = '/RBP/patrol/task/patrolTask/delete',
                params = {
                    taskId: id
                },
                data = `json=${JSON.stringify(params)}`;
            sevnceApi.getRbp(data, token, url).then(res => {
                let {mes} = res;
                if (mes) {
                    this.$message({
                        type: 'success',
                        message: '删除任务成功'
                    });
                    this.getTaskList();
                    this.addTask();
                }
            }).finally(() => {
                this.taskDetailsLoading = false;
            })
        },
    },
    components: {
        topBar,
        logo
    },
    filters: {
        // 格式化表单键名
        formatterKeyName(key) {
            switch (key) {
                case 'robot': {
                    return '机器人'
                }
                case 'map': {
                    return '巡检地图'
                }
                case 'name': {
                    return '任务名称'
                }
                case 'type': {
                    return '任务类型'
                }
                case 'startDate': {
                    return '开始时间'
                }
                case 'cycle': {
                    return '循环间隔'
                }
                case 'status': {
                    return '状态'
                }
                case 'pointList': {
                    return '检测点'
                }
                case 'remarks': {
                    return '备注'
                }
            }
        },
    },
    watch: {
        searchRobotValue(newValue) {
            this.$refs.tree.filter(newValue);
        }
    }
}