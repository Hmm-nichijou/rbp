export default {
    /*
       * 统计温湿度数据、气体数据显示个数
       * list：温湿度数据、气体数据
       * */
    itemsCount(list) {
        let count = 0;
        list.map(i => {
            if (i.flag) {
                count++
            }
        });
        if (count === 1) {
            return 'one-item'
        } else if (count === 2) {
            return 'tow-item'
        } else if (count === 3) {
            return 'three-item'
        } else if (count === 4) {
            return 'four-item'
        }
    },
    /*
    * 温湿度数据、气体数据是否全部为false
    * list：温湿度数据、气体数据
    * */
    allShow(list) {
        return list.some(i => i.flag);
    },
    /*
    * 设置随机旋转速度
    * 外部区间为2-3s
    * 内部区间为1-2s
    * */
    randomRotateSpeed() {
        this.$nextTick(() => {
            let outer = this.$refs.outer,
                inner = this.$refs.inner,
                {theme} = this,
                outerSpeed = 0, innerSpeed = 0;
            if (theme === 'default') {
                outerSpeed = (Math.random() * 2 + 2).toFixed(2);
                innerSpeed = (Math.random() + 1).toFixed(2);
            } else {
                outerSpeed = (Math.random() * 15 + 5).toFixed(2);
                innerSpeed = (Math.random() * 15 + 5).toFixed(2);
            }
            outer.map(i => {
                i.style.animation = `rotate-clockwise ${outerSpeed}s infinite linear`;
            });
            inner.map(i => {
                i.style.animation = `rotate-counterclockwise ${innerSpeed}s infinite linear`;
            });
        });
    },
}