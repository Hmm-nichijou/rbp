export default {
    props: {
        data: {
            type: Array,
            default: () => []
        },
        theme: {
            type: String,
            default: 'default'
        },
        isExecuting: {
            type: Boolean,
            default: false
        }
    },
    mounted() {
        this.randomRotateSpeed();
    },
    watch: {
        theme() {
            this.randomRotateSpeed();
        },
    }
}