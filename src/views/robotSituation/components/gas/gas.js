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
        isTable: {
            type: Boolean,
            default: true
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