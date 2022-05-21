// 组件：标题
import myTitle from "@/components/title/title.vue";
// 组件：空状态
import empty from "@/components/empty/empty.vue";

export default {
    props: {
        data: {
            type: Object,
            default: () => {
            }
        },
        title: {
            type: String,
            default: ''
        },
        theme: {
            type: String,
            default: 'default'
        }
    },
    data() {
        return {
            // 图片资源ip地址
            resourceIp: `http://${process.env.VUE_APP_OTHER_URL}/ftp`,
        }
    },
    components: {
        myTitle,
        empty
    }
}