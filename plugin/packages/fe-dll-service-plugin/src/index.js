#!/usr/bin/env node
const webpack = require('webpack')
const { resolve } = require('path')
const getWebpackDllConfig = require('./webpack-config')
const { isFile, checkDllVersionIsChange, rmFileSync, writeFileSync, jsonStr } = require('./util')
const root = process.cwd()
// 基础默认配置
let baseConfig = {
  // dll目录
  dllFolderPath: resolve(root, './public/dll'),
  publicPath: '/dll/',
  isOnlyDevelop: true, // 是否只有在开发环境下
  ignoreNpmList: [], // 过滤不需要dll处理的npm
  // 默认npm包在dll处理时，是否需要替换为其他路径，而非全量加载
  replaceNpmFileMap: {
    'fusion-components': [
      'fusion-components/lib/directives/index.js',
      'fusion-components/lib/filters/index.js',
      'fusion-components/lib/components/index.js',
      'fusion-components/lib/install.js',
      'fusion-components/lib/plugins/index.js',
      'fusion-components/lib/plugins/vue-extend.js',
      'fusion-components/lib/plugins/router-extend.js',
      'fusion-components/lib/plugins/socket.js'
    ]
  },
  // 需要添加的文件
  addFiles: [],
  // 默认合并conf
  webpackConf: {}
}

// 获取当前插件的config配置
function getConfig () {
  const argv = require('yargs-parser')(process.argv.slice(2))
  let config = baseConfig
  // 设置root目录
  config.root = root
  // 处理当前运行环境
  process.env.NODE_ENV = argv.mode || 'development'
  config.NODE_ENV = process.env.NODE_ENV
  // 读取配置文件路径
  if (argv.config) {
    const filePath = resolve(root, './', argv.config)
    if (isFile(filePath)) {
      const { dllFolderPath, replaceNpmFileMap = {}, ...data } = require(filePath)
      dllFolderPath && (config.dllFolderPath = resolve(root, './', dllFolderPath))
      Object.assign(config, data)
      // 合并replaceNpmFileMap，采用后者覆盖前者的方式
      Object.assign(config.replaceNpmFileMap, replaceNpmFileMap)
    }
  }
  return config
}

// 获取需要被dll缓存处理的文件列表
function getDllFileList (config, oldConf) {
  const packageFilePath = resolve(root, './package.json')
  const { dependencies } = require(packageFilePath)
  const dllList = []
  const depMap = { ...dependencies }
  // 排除过滤的npm包
  config.ignoreNpmList.forEach(name => {
    delete depMap[name]
  })
  // 获取依赖版本map处理
  const dependVersionMap = {}
  Object.keys(depMap).forEach(name => {
    dependVersionMap[name] = require(`${name}/package.json`).version
  })

  if (config.addFiles && config.addFiles.length) {
    config.addFiles.forEach(path => {
      const isMatch = path.match(/^([a-z-@_0-9.]+)(\/||\\)?/)
      if (isMatch && isMatch[1]) {
        try {
          const name = isMatch[1]
          require.resolve(`${name}/package.json`)
          dependVersionMap[name] = require(`${name}/package.json`).version
        } catch {}
      }
    })
  }

  // 判断文件未发生变化
  const isChange = checkDllVersionIsChange(dependVersionMap, config.dllFolderPath)

  // 如果配置未发生变化、版本未发生变化，支持退出
  const ignoreKey = ['isOnlyDevelop'] // 忽略该字段的配置项
  if (jsonStr(oldConf, ignoreKey) === jsonStr(config, ignoreKey) && !isChange) {
    console.log('\x1B[32mrun dll script has skiped, the file has not changed!\x1B[0m')
    return process.exit(0)
  }

  // 处理需要打入到dll中的vender文件
  if (Object.keys(config.replaceNpmFileMap).length) {
    // 处理被替换的npm相关文件
    Object.entries(config.replaceNpmFileMap).forEach(([name, list]) => {
      if (depMap[name]) {
        delete depMap[name]
        dllList.push(...list)
      }
    })
    // 未被替换的npm包，直接追加到文件队列中
    dllList.push(...Object.keys(depMap))
  }
  if (config.addFiles && config.addFiles.length) {
    dllList.push(...config.addFiles)
  }
  return {
    dependVersionMap,
    dllList
  }
}

// 开始dll构建
function runDllBuild () {
  const config = getConfig()
  // 写入config到临时文件
  const tempConfigPath = resolve(__dirname, './.config.json')
  let oldConf = {}
  if (isFile(tempConfigPath)) {
    oldConf = require('./.config.json')
    rmFileSync(tempConfigPath)
  }
  writeFileSync(tempConfigPath, JSON.stringify(config))

  const isProduction = process.env.NODE_ENV !== 'development'
  // 仅生产环境dll支持时，直接略过此处处理
  if (isProduction && config.isOnlyDevelop) return process.exit(0)

  const dllOpt = getDllFileList(config, oldConf)
  const webpackConf = getWebpackDllConfig(config, dllOpt)
  // webpack开始构建
  webpack(webpackConf, (err, stats) => {
    // 展示处理结果
    console.log(stats.toString({
      chunks: false,  // 使构建过程更静默无输出
      colors: true    // 在控制台展示颜色
    }))
    // 展示错误
    if (err || stats.hasErrors()) {
      // 报错后删除dll目录,需下次重新编译
      rmFileSync(config.dllFolderPath)
      rmFileSync(tempConfigPath)
      return process.exit(1)
    }
    console.log('\n\x1B[32mfe-dll-service-plugin run dll build success!\x1B[0m')
    process.exit(0)
  })
}

// 开始dll构建
runDllBuild()
