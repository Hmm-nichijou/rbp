import http from "@/request/http";

let mapApi = {
    // 获取瓦片地图数据
    getTilemapDetails: params => {
        return http({
            method: 'get',
            headers: {
                'accessToken': params.token
            },
            url: `/getTilemapDetails/${params.robotId}/${params.mapName}`,
        });
    },
    // 获取路网数据
    getRoadmapGeojson: params => {
        return http({
            method: 'get',
            headers: {
                'accessToken': params.token
            },
            url: `/getRoadmapGeojson/${params.robotId}/${params.mapName}`,
        });
    }
}
export default mapApi;
