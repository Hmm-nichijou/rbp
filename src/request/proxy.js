import axios from "axios";

axios.defaults.baseURL = '/mapApi';
export let proxySevnceRobot = axios.create({
    baseURL: '/api'
});
export let proxyUrl = axios.create({
    baseURL: '/url'
})
export default axios;