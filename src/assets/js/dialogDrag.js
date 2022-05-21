// 自定义v-*指令 使el-dialog组件可拖动（已处理边界问题）
import Vue from 'vue';

Vue.directive("drag", el => {
    const header = el.querySelector(".el-dialog__header");
    const main = el.querySelector(".el-dialog");
    header.style.cursor = "move";
    header.onmousedown = e => {
        // 上次鼠标弹起时X轴的偏移量
        let l = +main.style.left.replace(/px/, "");
        // 上次鼠标弹起时Y轴的偏移量
        let t = +main.style.top.replace(/px/, "");
        let x = e.pageX - l;
        let y = e.pageY - t;
        let markL = 0,
            markT = 0,
            markR = 0,
            markB = 0,
            offset = 10; // 偏移量
        document.onmousemove = e => {
            // 处理右边界
            if (main.offsetLeft + main.offsetWidth + offset >= el.offsetWidth) {
                markR === 0 && (markR = e.pageX - x);
                e.pageX - x < markR && (main.style.left = e.pageX - x + "px");
            } else if (main.offsetLeft > offset) {
                main.style.left = e.pageX - x + "px";
            } else {
                // 处理左边界
                markL === 0 && (markL = e.pageX - x);
                e.pageX - x > markL && (main.style.left = e.pageX - x + "px");
            }
            // 处理下边界
            if (main.offsetTop + main.offsetHeight + offset >= el.offsetHeight) {
                markB === 0 && (markB = e.pageY - y);
                e.pageY - y < markB && (main.style.top = e.pageY - y + "px");
            } else if (main.offsetTop > offset) {
                main.style.top = e.pageY - y + "px";
            } else {
                // 处理上边界
                markT === 0 && (markT = e.pageY - y);
                e.pageY - y > markT && (main.style.top = e.pageY - y + "px");
            }
        };
        document.onmouseup = () => {
            document.onmousemove = null;
            document.onmouseup = null;
        };
    };
});
