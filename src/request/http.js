import axios from "axios";
import {proxySevnceRobot, proxyUrl} from "@/request/proxy";

function formatJsonStr(str) {
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
                                sub[i] = formatJsonStr(sub[i]);
                            }
                        }
                        json[k] = sub;
                    } catch (e) {
                        console.log()
                    }
                    continue;
                }
                if (typeof (JSON.parse(kv)) == "object") {
                    json[k] = formatJsonStr(kv);
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
}

let http = function (options, type) {
    if (options.method === 'get') {
        options.params = options.data;
    }
    let proxyRequest = '';
    return new Promise((resolve, reject) => {
        if (type) {
            if (type === 'proxyUrl') {
                proxyRequest = proxyUrl;
            } else {
                proxyRequest = proxySevnceRobot;
            }
        } else {
            proxyRequest = axios;
        }
        proxyRequest(options).then(res => {
                let {data, status} = res;
                if (String(status).startsWith('2')) {
                    data = formatJsonStr(data)
                    data.result = formatJsonStr(data.result);
                    data.mes = formatJsonStr(data.mes)
                    resolve(data);
                }
            }
        ).catch(err => {
            let arr = String(err).split(' '),
                errorCode = arr[arr.length - 1],
                {method, url, data} = options;
            if (String(errorCode).startsWith('4') || String(errorCode).startsWith('5')) {
                if (method === 'get') {
                    console.error(`接口：'${url}'错误，错误码：${errorCode}`);
                } else {
                    console.error(`接口：'${data.method}'错误，错误码：${errorCode}`);
                }
            }
            reject(err);
        });
    });
}
export default http;
