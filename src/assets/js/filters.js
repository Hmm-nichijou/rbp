export default {
    /*
       * 截取小数点前
       * value：气体数值
       * */
    filterDecimalPointBefore(value) {
        let cacheValue = value.toString();
        if (cacheValue === '0') {
            cacheValue = '0.00';
        }
        return Number(cacheValue.toString().split('.')[0]);
    },
    /*
    * 截取小数点后
    * value：气体数值
    * */
    filterDecimalPointAfter(value) {
        let cacheValue = value.toString();
        if (cacheValue === '0') {
            cacheValue = '0.00';
        }
        return Number(cacheValue.toString().split('.')[1]);
    }
}