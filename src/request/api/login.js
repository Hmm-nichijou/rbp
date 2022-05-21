import http from "@/request/http";
import qs from "qs";

let ip = `https://${process.env.VUE_APP_OTHER_URL}/jwt/token`
let loginApi = {
    // 登录
    login: params => {
        return http({
            method: 'post',
            url: `${ip}/loginIn`,
            data: JSON.stringify(params),// 转为JSON字符串
            headers: {
                "Content-Type": 'application/json'
            }
        });
    },
    // 检查token是否有效
    checkToken: params => {
        return http({
            method: 'post',
            url: `${ip}/checkToken`,
            data: qs.stringify(params)
        });
    },
    // 退出登录；目前需前端删除localStorage储存的token数据
    logOut: params => {
        return http({
            method: 'post',
            url: `${ip}/logOut`,
            data: JSON.stringify(params),
            headers: {
                "Content-Type": 'application/json'
            }
        });
    },
}
export default loginApi;
