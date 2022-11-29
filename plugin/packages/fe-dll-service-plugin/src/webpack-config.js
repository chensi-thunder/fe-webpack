const webpack = require('webpack')
const { resolve } = require('path')
const { merge } = require('webpack-merge')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const SetDependVersionPlugin = require('./plugin/set-depend-version')

// 设置webpack config文件
module.exports = function getWebpackDllConfig (config, dllOpt ) {
  const { dependVersionMap, dllList } = dllOpt
  const { root, dllFolderPath, webpackConf, publicPath } = config
  const nodeEnv = process.env.NODE_ENV || 'development'
  const isProduction = nodeEnv !== 'development'
  return merge({
    mode: process.env.NODE_ENV || 'development',
    entry: {
      vendor: dllList
    },
    // 开发环境需要sourcemap
    devtool: isProduction ? false : 'cheap-module-eval-source-map',
    output: {
      path: dllFolderPath,
      filename: '[name].js',
      // vendor.dll.js中暴露出全局变量名
      // 保持与webpack.DllPlugin中名称一致
      library: '[name]_[hash]',
      publicPath
    },
    resolve: {
      alias: {
        '@': resolve(root, './src'),
        'vue$': 'vue/dist/vue.esm.js'
      }
    },
    plugins: [
      // 清除之前的dll文件
      new CleanWebpackPlugin(),
      // manifest.json描述动态链接库包含了哪些内容
      new webpack.DllPlugin({
        path: resolve(dllFolderPath, '[name]-manifest.json'),
        // 保持与output.library中名称一致
        name: '[name]_[hash]',
        context: process.cwd()
      }),
      // 提取依赖version map
      new SetDependVersionPlugin({ map: dependVersionMap }),
      new MiniCssExtractPlugin({
        filename: "[name].css",
        chunkFilename: "[id].css",
      })
    ],
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [ MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader' ] // 处理fusion组件库的postcss
        },
        {
          test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/i,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 4096,
                fallback: {
                  loader: 'file-loader',
                  options: {
                    name: 'fonts/[name].[hash:8].[ext]'
                  }
                }
              }
            }
          ]
        }
      ]
    }
  }, webpackConf)
}
