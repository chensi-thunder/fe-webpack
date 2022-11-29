const { resolve } = require('path')
const { isFile } = require('./util.js')

module.exports = function dllReference (config) {
  const webpack = require('webpack')
  const tempConfigPath = resolve(__dirname, './.config.json')
  // 判断是否构建过，如未构建，则直接略过处理
  if (!isFile(tempConfigPath)) return
  const { dllFolderPath, publicPath, isOnlyDevelop } = require('./.config.json')
  const nodeEnv = process.env.NODE_ENV || 'development'
  const isProduction = nodeEnv !== 'development'
  // 仅开发环境下且限制开发环境下加载dll文件，或者不限制处理时，都处理以下配置
  if ((isOnlyDevelop && !isProduction) || !isOnlyDevelop) {
    config.plugin('vendorDll')
      .use(webpack.DllReferencePlugin, [{
        context: process.cwd(),
        manifest: resolve(dllFolderPath, './vendor-manifest.json')
      }])
    // 这里是把相关文件引用入到html模板中，包含js和css
    const assetHtmlList = []
    const assetList = ['vendor.js', 'vendor.css']
    assetList.forEach(name => {
      const filepath = resolve(dllFolderPath, `./${name}`)
      if (isFile(filepath)) {
        assetHtmlList.push({
          filepath,
          typeOfAsset: filepath.endsWith('.css') ? 'css' : 'js',
          publicPath
        })
      }
    })
    config.plugin('addAssetHtml')
      .use(require ('add-asset-html-webpack-plugin'), [ assetHtmlList ])
      .after('html')
  }

  // 仅限开发环境运行时，且当前非开发环境，copy插件将忽略dll目录
  if ((isOnlyDevelop && isProduction)) {
    config.plugin('copy')
      .tap(args => {
        if (args.length) {
          args.forEach(arg => {
            if (Array.isArray(arg)) {
              arg.forEach(item => {
                if (item.from || item.to) {
                  item.ignore = Object.assign(item.ignore || [], `${dllFolderPath}/**/*`)
                }
              })
            }
            
          })
        }
        return args
      })
  }
}