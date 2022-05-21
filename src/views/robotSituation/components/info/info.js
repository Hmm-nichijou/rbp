export default {
    props: {
        currentInfo: {
            type: Object,
            default: () => {
            }
        }
    },
    filters: {
        timeStamp(StatusMinute) {
            if (StatusMinute) {
                let day = parseInt(StatusMinute / 60 / 24),
                    hour = parseInt(StatusMinute / 60 % 24),
                    min = parseInt(StatusMinute % 60);
                StatusMinute = '';
                if (day) {
                    StatusMinute = day + '天';
                }
                if (hour) {
                    StatusMinute += hour + '小时';
                }
                if (min && !day) {
                    StatusMinute += parseFloat(min) + '分钟';
                }
                return StatusMinute
            } else {
                return '-'
            }
        },
        formatterNavigationStatus(status) {
            switch (status) {
                case 0: {
                    return '导航中'
                }
                case 1: {
                    return '导航完成'
                }
                case 2: {
                    return '偏离车道线'
                }
                case 3: {
                    return '规划失败'
                }
                case 4: {
                    return '机器人遇障'
                }
                case '': {
                    return '未导航'
                }
            }
        },
    }
}