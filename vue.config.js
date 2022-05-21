// let UglifyJsPlugin = require('uglifyjs-webpack-plugin');
let config = {
    publicPath: process.env.VUE_APP_PROJECT_PATH,
    productionSourceMap: false,//生产环境是否要生成 sourceMap
    devServer: {
        proxy: {
            '/mapApi': {
                target: `https://${process.env.VUE_APP_BASE_URL}/RBPWEB`,
                changeOrigin: true,
                ws: true,
                pathRewrite: {
                    '^/mapApi': ''
                }
            },
            '/api': {
                target: `http://${process.env.VUE_APP_OTHER_URL}:15560`,
                changeOrigin: true,
                ws: true,
                pathRewrite: {
                    '^/api': ''
                }
            },
            '/url': {
                target: `http://192.168.0.225:8082`,
                changeOrigin: true,
                ws: true,
                pathRewrite: {
                    '^/url': ''
                }
            }
        },
        https: false
    },
    configureWebpack: {
        externals: {
            'AMap': 'AMap' // 高德地图配置
        }
    },
    chainWebpack: config => {
        const stylus = config.module.rule('scss').toConfig()
        const theme = {...stylus.oneOf[3], test: /\.useable.scss$/}
        theme.use = [...theme.use]
        // 使用style-loader中的懒加载模式
        theme.use[0] = {loader: 'style-loader', options: {injectType: 'lazyStyleTag'}}
        config.module.rule('scss').merge({oneOf: [theme]})
    }
};

//打包为生产环境时移除console语句
// if (process.env.MODE_ENV === 'production') {
//     config.configureWebpack.plugins = [
//         new UglifyJsPlugin({
//             uglifyOptions: {
//                 compress: {
//                     drop_console: true,
//                 },
//             },
//         }),
//     ]
// }

module.exports = config;
