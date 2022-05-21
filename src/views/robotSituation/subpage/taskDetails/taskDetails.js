import sevnceApi from "@/request/api/sevnce";
// 组件：任务回溯
import backtrack from "../../components/backtrack/backtrack.vue";
// 时间转换库
import moment from "moment";

export default {
    data() {
        return {
            // 任务简介
            taskInfo: [
                {
                    '所属项目': '',
                    '机器人': '',
                    '地图名称': '',
                    '任务名称': '',
                },
                {
                    '巡检点数量': '',
                    '执行批次': '',
                    '开始时间': '',
                    '结束时间': '',
                },
                {
                    '执行结果': '',
                    '巡检点异常数': '',
                    '终止原因': '',
                }
            ],
            // 识别表格激活项
            activeTable: [1, 2, 3],
            // 表格数据-表计识别
            meter: [],
            // 表格数据-气体识别
            gas: [],
            // 表格数据-环境识别
            environment: [],
            // 表格数据-噪音识别
            noise: [],
            // 表格数据-跑冒滴漏识别
            paomao: [],
            // 表格数据-异常识别
            abnormal: [],
            // 巡检结果id
            id: '',
            // 机器人id
            robotId: '',
            // 当前主题
            currentTheme: '',
            // 加载中
            loading: false,
            // 当前任务id
            currentTaskId: '',
        }
    },
    mounted() {
        this.currentTheme = localStorage.getItem('theme');
        this.id = this.$route.params.id;
        this.getResultStatus();
    },
    methods: {
        formatJsonStr(str) {
            if (str === null || str === "{}" || str === undefined) {
                return str;
            }
            try {
                let json = JSON.parse(str);
                for (let k in json) {
                    let kv = json[k];
                    try {
                        //数组
                        if (Array.isArray(kv)) {
                            try {
                                //json字符串处理
                                let sub = kv.toString().replace("[", "").replace("]", "").split(",");
                                for (let i = 0; i < sub.length; i++) {
                                    if (typeof (JSON.parse(sub[i])) == "object") {
                                        sub[i] = this.formatJsonStr(sub[i]);
                                    }
                                }
                                json[k] = sub;
                            } catch (e) {
                                console.log()
                            }
                            continue;
                        }
                        if (typeof (JSON.parse(kv)) == "object") {
                            json[k] = this.formatJsonStr(kv);
                        }
                    } catch (e2) {
                        console.log()
                    }
                }
                return json;
            } catch (e) {
                console.log()
            }
            return str;
        },
        // 获取巡检结果结果详情
        getResultStatus() {
            this.loading = true;
            this.meter = [];
            this.gas = [];
            this.environment = [];
            let token = this.$store.state.userInfo.token,
                {id} = this,
                data = {
                    method: "getPatrolTaskResultDetailByTaskResultId",
                    params: [`{'patrolTaskResultId':'${id}'}`],
                };
            sevnceApi.getRbp(data, token).then(res => {
                console.log(res)
                this.loading = false;
                let {
                    sysProjectName,
                    deviceInfoId,
                    mapName,
                    patrolTaskName,
                    patrolPointTotal,
                    patrolTaskResultAppNo,
                    startTime,
                    endTime,
                    status,
                    pointErrorNum,
                    itemListMap,
                    patrolTaskResultId
                } = res.result.mes;
                this.currentTaskId = patrolTaskResultId;
                this.taskInfo[0].所属项目 = sysProjectName;
                this.taskInfo[0].机器人 = deviceInfoId;
                this.taskInfo[0].地图名称 = mapName;
                this.taskInfo[0].任务名称 = patrolTaskName;
                this.taskInfo[1].巡检点数量 = patrolPointTotal;
                this.taskInfo[1].执行批次 = patrolTaskResultAppNo;
                this.taskInfo[1].开始时间 = moment(startTime).format('YYYY-MM-DD HH:mm:ss');
                this.taskInfo[1].结束时间 = moment(endTime).format('YYYY-MM-DD HH:mm:ss');
                this.taskInfo[2].执行结果 = status === 'FINISHED' ? '完成' : status === 'STOPPED' ? '终止' : status;
                this.taskInfo[2].巡检点异常数 = pointErrorNum;
                this.taskInfo[2].终止原因 = '';
                itemListMap.map(i => {
                    let {
                        // 巡检类型
                        ability_type,
                        // 巡检结果
                        execute_result,
                        // 巡检点id
                        patrol_point_id,
                        // 巡检点名称
                        patrol_point_name,
                        // 巡检项名称
                        patrol_item_name,
                        // 预置图片
                        remark1,
                        // 识别状态
                        status,
                        // 识别项编码（气体可用）
                        code,
                        // 识别项结果（气体可用）
                        executeResultDeatil
                    } = i;
                    // 拍照识别
                    if (ability_type === 'ROBOT_ABILITY_TYPE_METER') {
                        let obj = {
                                pointName: patrol_point_name,
                                itemName: patrol_item_name,
                                img: '',
                                AiImg: '',
                                presetImg: '',
                                value: '',
                                time: '',
                                status
                            },
                            {VUE_APP_FTP_URL, VUE_APP_OTHER_URL} = process.env;
                        if (status === 'FINISHED') {
                            let {
                                imgFtpPath,
                                aiImgFtpPath,
                                calcValue,
                                calcUnit,
                                aiCost,
                                calcSuccess,
                                mes
                            } = this.formatJsonStr(execute_result);
                            obj.img = `http://${VUE_APP_FTP_URL ? VUE_APP_FTP_URL : VUE_APP_OTHER_URL}/ftp/${imgFtpPath}`;
                            obj.AiImg = `http://${VUE_APP_FTP_URL ? VUE_APP_FTP_URL : VUE_APP_OTHER_URL}/ftp/${aiImgFtpPath}`;
                            obj.presetImg = `http://${VUE_APP_FTP_URL ? VUE_APP_FTP_URL : VUE_APP_OTHER_URL}/ftp/${remark1}`;
                            obj.value = calcSuccess ? `${calcValue ? calcValue : '-'}${calcUnit ? calcUnit : ''}` : mes;
                            obj.time = `${Number(aiCost).toFixed(2)}s`;
                        }
                        this.meter.push(obj);
                    }
                    // 温湿度
                    else if (ability_type === 'ROBOT_ABILITY_TYPE_ENVIR') {
                        let obj = {
                            pointId: patrol_point_id,
                            pointName: patrol_point_name,
                            itemName: patrol_item_name,
                            humidity: '',
                            temperature: '',
                            status
                        };
                        if (status === 'FINISHED') {
                            let {humidity, temperature} = this.formatJsonStr(execute_result).result.mes;
                            obj.humidity = humidity;
                            obj.temperature = temperature;
                        }
                        this.environment.push(obj);
                    }
                    // 气体
                    else if (ability_type === 'ROBOT_ABILITY_TYPE_GASS') {
                        let obj = {
                            pointName: patrol_point_name,
                            itemName: patrol_item_name,
                            type: '',
                            value: '',
                            status
                        }
                        if (status === 'FINISHED') {
                            obj.type = code;
                            obj.value = executeResultDeatil;
                        }
                        this.gas.push(obj);
                    }
                });
                // 去重，利用reduce方法遍历数组,reduce第一个参数是遍历需要执行的函数，第二个参数是item的初始值
                let obj = {};
                this.environment = this.environment.reduce((item, next) => {
                    if (!obj[next.pointId]) {
                        obj[next.pointId] = item.push(next);
                    }
                    return item;
                }, []);
                if (!this.robotId) {
                    this.robotId = res.result.mes.deviceInfoId;
                }
            });
        },
        /*
        * 设置状态样式
        * data：一条数据
        * */
        setStatus(data) {
            let {status} = data.row;
            if (status === 1) {
                return 'error'
            } else if (status === 2) {
                return 'warning'
            } else if (status === 3) {
                return 'mild-warning'
            }
        },
        /*
        * 组件事件：改变任务
        * */
        changeTask(data) {
            let {taskId} = data;
            this.id = taskId;
            this.$route.params.id = taskId;
            this.getResultStatus();
        },
        /*
        * 格式化状态
        * */
        formatterStatus(status) {
            switch (status) {
                case 'FINISHED' : {
                    return '正常'
                }
                case 'STOPPED' : {
                    return '中断'
                }
            }
        },
    },
    components: {
        backtrack
    }
}