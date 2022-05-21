let obj = {}
let current = null

let theme = {
    default() {
        if (!obj.default) {
            obj.default = import('@/assets/style/theme/default.useable.scss')
        }
        return obj.default
    },
    minimalism() {
        if (!obj.minimalism) {
            obj.minimalism = import('@/assets/style/theme/minimalism.useable.scss')
        }
        return obj.minimalism
    },
    prime() {
        if (!obj.prime) {
            obj.prime = import('@/assets/style/theme/prime.useable.scss')
        }
        return obj.prime
    },
}

let commonJs = {
    // transform属性兼容
    transformCompatible: ['transform', 'msTransform', 'webkitTransform', 'MozTransform', 'OTransform'],
    /*
    * 设置主题
    * name：主题名称
    * default：默认
    * minimalism：极简
    * prime：尊享
    * */
    async setTheme(name) {
        if (theme[name]) {
            let style = await theme[name]();
            if (current) {
                current.unuse();
            }
            style.use();
            current = style;
            localStorage.setItem('theme', name);
        }
    },
    // 获取当前屏幕宽度-计算缩放比例
    getScale() {
        let currentWindowWidth = window.innerWidth;
        return currentWindowWidth / 1920;
    },
    /*
    * 设置页面icon
    * icon：图标地址
    * */
    setPageIcon(icon) {
        if (icon) {
            let linkDOM = document.createElement('link');
            linkDOM.type = 'image/x-icon';
            linkDOM.rel = 'shortcut icon';
            linkDOM.href = `http://robot.7tyun.com/ftp/${icon}`;
            document.getElementsByTagName('head')[0].appendChild(linkDOM);
        }
    },
}

export default commonJs
