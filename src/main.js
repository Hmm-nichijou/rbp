import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import '@/assets/js/dialogDrag';
import html2pdf from "@/assets/js/html2pdf";
/*
* element UI
* 按需引入
* 内置过度动画
* */
import 'element-ui/lib/theme-chalk/index.css';
import 'element-ui/lib/theme-chalk/base.css';
import CollapseTransition from 'element-ui/lib/transitions/collapse-transition';
import {
    DatePicker,
    Pagination,
    Image,
    Form,
    FormItem,
    Input,
    Button,
    Checkbox,
    CheckboxGroup,
    Select,
    Option,
    Message,
    Dialog,
    Popover,
    Radio,
    RadioGroup,
    Tag,
    Table,
    TableColumn,
    Skeleton,
    SkeletonItem,
    Collapse,
    CollapseItem,
    Row,
    Col,
    Slider,
    Loading,
    Tabs,
    TabPane,
    Tree
} from 'element-ui';

Vue.use(DatePicker);
Vue.use(Pagination);
Vue.use(Image);
Vue.use(Form);
Vue.use(FormItem);
Vue.use(Input);
Vue.use(Button);
Vue.use(Checkbox);
Vue.use(CheckboxGroup);
Vue.use(Select);
Vue.use(Option);
Vue.use(Dialog);
Vue.use(Popover);
Vue.use(Radio);
Vue.use(RadioGroup);
Vue.use(Tag);
Vue.use(Table);
Vue.use(TableColumn);
Vue.use(Skeleton);
Vue.use(SkeletonItem);
Vue.use(Collapse);
Vue.use(CollapseItem);
Vue.use(Row);
Vue.use(Col);
Vue.use(Slider);
Vue.use(Loading);
Vue.use(Tabs);
Vue.use(TabPane);
Vue.use(Tree);
Vue.component(CollapseTransition.name, CollapseTransition);
Vue.component(Message.name, Message);
Vue.prototype.$message = Message;
Vue.config.productionTip = false;

// 全局filters
import filters from "@/assets/js/filters";

Object.keys(filters).forEach(i => {
    Vue.filter(i, filters[i])
});
// 全局methods
import methods from "@/assets/js/methods";

Object.keys(methods).forEach(i => {
    Vue.prototype[i] = methods[i];
});

// 页面保存为pdf文件
Vue.use(html2pdf);

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app')
