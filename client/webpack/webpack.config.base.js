const path = require('path');
const extractTextPlugin = require("extract-text-webpack-plugin");
const vueLoaderPlugin = require('vue-loader/lib/plugin');
const htmlPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

const fs = require('fs');

const srcPath = path.resolve(__dirname, '../src');
const outputPath = path.resolve(__dirname, '../dist');

const mainPath = path.resolve(srcPath, './main');
const managePath = path.resolve(srcPath, './manage');

// const outputMainPath = path.resolve(outputPath, './main');

let outputTemplatePath = path.resolve(__dirname, '../dist/template');

const copyFile = require('copy-webpack-plugin');
const serverConfig = require('../config/server_config');

// const api_key = serverConfig.api_key;

//发布环境使用
const env = process.env.NODE_ENV;

const resourcePrfix = serverConfig.resourcePrfix;

if (env == 'production') {
    outputTemplatePath = path.resolve(__dirname, '../template');
}

//如果dist文件不存在就创建
try {
    fs.statSync(outputPath);
} catch (error) {
    fs.mkdirSync(outputPath);
}

const crypto = require('crypto'),
    md5 = crypto.createHash('md5'),
    token = md5.update(serverConfig.appID + serverConfig.appSecret).digest('hex');

//移除dist生成的path
function rmGenFile(outputPath) {
    let files = fs.readdirSync(outputPath);

    files.forEach((item) => {

        if (item != 'favicon.ico') {
            var fpath = path.resolve(outputPath, item),
                fstat = fs.statSync(fpath);

            if (fstat.isDirectory()) {
                rmGenFile(fpath);
                fs.rmdirSync(fpath)
            } else {
                fs.unlinkSync(fpath);
            }
        }
    });
}

rmGenFile(outputPath);

//生成入文件
let entry = {
    'manage': ["@babel/polyfill", `${managePath}/index.js`],
}

// 暂时不使用，因为对外的没有处理
// let htmlPlug = [];

// function genEntey(entryPath, parent, outPath, prefix) {
//     let files = fs.readdirSync(entryPath);

//     files.forEach(item => {

//         var fpath = path.resolve(entryPath, item),
//             foutPath = path.resolve(outPath, item),
//             fstat = fs.statSync(fpath);

//         if (fstat.isDirectory()) {
//             //如果dist文件不存在就创建
//             try {
//                 fs.statSync(foutPath);
//             } catch (error) {
//                 fs.mkdirSync(foutPath);
//             }

//             genEntey(fpath, parent + "/" + item, foutPath);

//         } else if (/\.html$/.test(item)) {

//             try { //检查js是否存在，不存在就会报错, 所以不存在的时候直接移动html

//                 var jsItemName = path.join(
//                     `${templateJSPath}`, `${parent}`, `${item}`).replace(/\.html$/, '.js')

//                 // console.log(jsItemName);

//                 fs.statSync(jsItemName);

//                 var key = parent ?
//                     parent + "/" + item.replace(/\.js$/, "") :
//                     item.replace(/\.js$/, "");

//                 //使用～分割，避免层次神
//                 key = path.join(prefix, key.replace('/', '~').replace('.html', ''));

//                 entry[key] = jsItemName;

//                 htmlPlug.push(new htmlPlugin({
//                     filename: `${foutPath}`,
//                     template: `ejs-compiled-loader!${fpath}`,
//                     inject: false,
//                     excludeChunks: ['manage', 'runtime~manage'],
//                     //加入公共模块vendor~main
//                     chunks: ['vendor~main', `${key}`, `runtime~${key}`],
//                     chunksSortMode: 'auto',
//                 }));

//             } catch {
//                 htmlPlug.push(new htmlPlugin({
//                     filename: `${foutPath}`,
//                     template: `ejs-compiled-loader!${fpath}`,
//                     inject: false,
//                     // excludeChunks: ['manage', 'runtime~manage'],
//                     chunks: [],
//                     chunksSortMode: 'auto',
//                 }));
//             }

//         }
//     });
// }

// genEntey(templateEntryPath, "", templateOutPath, 'main');

// //合并插件
// plugins = plugins.concat(htmlPlug);

let plugins = [
    new vueLoaderPlugin(),

    new webpack.DefinePlugin({
        __secret: JSON.stringify(serverConfig.secret),
        __apiPrefix: JSON.stringify(serverConfig.apiPrefix),
        __token: JSON.stringify(token)
    }),

    new htmlPlugin({
        filename: `${outputTemplatePath}/manage.html`,
        template: `${managePath}/index.html`,
        inject: 'body',
        chunksSortMode: 'auto',
    }),

    //不能写成common.css，打包的时候会缺少文件
    //https://github.com/lavas-project/lavas/issues/85
    new extractTextPlugin({
        filename: `css/[name][hash:4].css`,
        allChunks: true
    }),

    // new copyFile([
    //     //复制文件
    //     //ckeditor
    //     {
    //         from: `/${srcPath}/common/editor`,
    //         to: `${outputPath}/editor`,
    //         force: true,
    //     }
    // ]),

    //默认的用户头像
    new copyFile([
        //复制文件
        //favicon.ico
        {
            from: `${managePath}/image/user_image.jpg`,
            to: `${outputPath}/image`,
            force: true,
        }
    ]),

    //修改用户头像时使用
    new copyFile([
        //复制文件
        //favicon.ico
        {
            from: `${managePath}/image/empty.png`,
            to: `${outputPath}/image`,
            force: true,
        }
    ]),

    new copyFile([
        //复制文件
        //favicon.ico
        {
            from: `${managePath}/image/favicon.ico`,
            to: `${outputPath}`,
            force: true,
        }
    ]),

    //热更新
    // new webpack.HotModuleReplacementPlugin(),
    // new webpack.NoEmitOnErrorsPlugin(),
    // new webpack.NamedModulesPlugin()
]

module.exports = {
    performance: {
        hints: false
        // hints: "warning", // 枚举
        // maxAssetSize: 300000, // 整数类型（以字节为单位）
        // maxEntrypointSize: 500000, // 整数类型（以字节为单位）
        // assetFilter: function (assetFilename) {
        //     // 提供资源文件名的断言函数
        //     return assetFilename.endsWith('.css') || assetFilename.endsWith('.js');
        // }
    },

    entry,

    output: {
        path: `${outputPath}`,
        filename: '[name]/index[hash:4].js',
        chunkFilename: 'js/chunks/[name][hash:4].js',
        publicPath: `${resourcePrfix}/`
    },

    // devServer: {
    //     contentBase: outputPath,
    //     compress: true,
    //     port: 9000,
    //     hot: true,
    //     inline: true,
    //     publicPath: `${outputPath}`,
    //     open: true,
    //     historyApiFallback:true,
    //     progress:true,
    // },

    // externals: {
    //     'CKEDITOR': 'window.CKEDITOR'
    // },

    // context: sourcePath,
    resolve: {
        //一定要添加，不然无法找到vue文件
        extensions: ['.js', '.vue', '.json', '.css', '.less', 'scss', 'sass'],
        alias: {
            'vue': 'vue/dist/vue.js',
            '@src': `${srcPath}`,
            '@main': `${mainPath}`,
            '@manage': `${managePath}`,
            '@magView': `${managePath}/view`,
            '@magCss': `${managePath}/css`,
            '@magComponent': `${managePath}/component`,
            '@magCommon': `${managePath}/common`
        }
    },

    optimization: {
        splitChunks: {
            chunks: 'all',
            minChunks: 2,
            minSize: 30000
        },
        runtimeChunk: true
    },

    plugins,

    module: {
        rules: [{
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    extractCSS: true,
                    loaders: {
                        css: extractTextPlugin.extract({
                            use: ["css-loader?-autoprefixer", "postcss-loader"],
                            fallback: 'vue-style-loader',
                        }),
                        less: extractTextPlugin.extract({
                            use: ['css-loader?-autoprefixer', "postcss-loader", "less-loader"],
                            fallback: 'vue-style-loader',
                        })
                    },
                    //转换src
                    transformToRequire: {
                        video: ["src", "poster"],
                        source: "src",
                        img: "src",
                        image: "xlink:href"
                    }
                }
            },
            {
                test: /\.js$/,
                loader: 'babel-loader', //已经在.babelrc配置，这里配置的话多线程任务会出错
                exclude: '/node_modules/'
            },
            {
                test: /\.css$/,
                use: extractTextPlugin.extract({ //单独打包
                    fallback: "style-loader", //一定要加fallback
                    use: ["css-loader?-autoprefixer", "postcss-loader"]
                }),
            },
            {
                test: /\.less$/,
                use: extractTextPlugin.extract({ //单独打包
                    fallback: 'style-loader', //一定要加fallback
                    use: ['css-loader?-autoprefixer', "postcss-loader", "less-loader"]
                }),
            },
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    //删除 / 改写到public path，为了热重启能找到
                    name: `image/[name].[hash:7].[ext]`,
                }
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    //删除 / 改写到public path，为了热重启能找到
                    name: `fonts/[name].[hash:7].[ext]`,
                }
            }
        ],
    }
}