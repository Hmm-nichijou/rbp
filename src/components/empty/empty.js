export default {
    name: 'empty',
    props: {
        // 当前主题；切换空状态样式
        currentTheme: {
            type: String,
            default: 'default'
        },
        message: {
            type: String,
            default: '暂无数据'
        },
        type: {
            type: String,
            default: ''
        }
    }
}
