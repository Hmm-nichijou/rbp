import http from "@/request/http";

let sevnceApi = {
    getRbp: (params, token, url) => {
        let proxy = 'proxySevnceRobot';
        if (!url) url = '';
        if (url) proxy = 'proxyUrl'
        return http({
            method: "post",
            headers: {
                "content-type": url ? "application/x-www-form-urlencoded" : "application/json",
                mq: process.env.VUE_APP_MQ,
                ack: "false",
                cmd: "produce",
                Authorization: token,
                'Access-Control-Allow-Origin': '*'
            },
            url,
            data: params
        }, proxy)
    }
}
export default sevnceApi;