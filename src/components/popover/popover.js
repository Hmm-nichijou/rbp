export default {
    name: 'Popover',
    props: {
        visible: {
            type: Boolean,
            default: false,
        },// 是否显示/隐藏popover
        customClass: {
            type: String,
            default: 'popover'
        },// 自定义类名
    },
    data() {
        return {}
    },
    methods: {
        /*
        * 移入面包屑弹出框
        * event：弹出框dom节点
        * */
        enterBreadcrumbPopover(event) {
            this.$emit('target', event.target)
        },
        // 鼠标离开时隐藏popover
        leavePopover() {
            this.$emit('leave', '')
        },
    }
}