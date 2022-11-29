# fe-dll-service-plugin
idss观安前端项目基于vue2/webpack4抽离提取dll通用服务,主要用于将项目中的依赖包通过webpack dll的方式处理缓存数据，优化构建事件。（建议在开发环境下使用，用于提高开发环境下运行速度）

## 配置项

- config 插件的配置文件目录
idss-webpack-dll-service插件读取的配置文件目录，用于读取该插件的配置路径，项目的相对路径即可，文件的配置项，具体见使用方式

``` shell
  fe-dll-service-plugin --config=./build/dll.config.js
```

- mode 插件的运行环境，包括`development`、`production`,即生产环境和开发环境
该参数主要告知当前插件的运行环境，插件会结合`config`配置与当前`mode`配置，自动运行处理相关配置

``` shell
  fe-dll-service-plugin --mode=production
```
## 使用方式
使用该方式通常分为两步，第一步提取工程的`dependencies`资源，默认将这些资源通过dll的方式进去编译，第二步即将构建的dll资源作为html中的`static`资源进行加载处理

- 首先添加全局配置，项目目录上添加一个配置文件，用于为`idss-webpack-dll-servic`读取该配置，具体操作如下

``` javascript
// build/dll.config.js

module.exports = {
  dllFolderPath: './public/dll', // 工程项目下dll目录路径，为相对路径,默认值为'./public/dll'
  publicPath: '/dll/', // webpack publicPath，默认值为 /dll/
  isOnlyDevelop: false // 是否只在开发环境下使用dll,默认值为true
  ignoreNpmList: ['vue', 'vue-router'], // 过滤dependencies中不被打入到dll中的npm包， 默认为[]
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
  // 除了当前工程外额外需要加入到dll中文件
  addFiles: [],
  // 默认合并dll conf, 默认{}
  webpackConf: {}
}
```

- 在package.json中添加全局任务
下述配置创建了`build:dll`任务，并在`开发环境的serve任务`下，添加该`dll`任务

> idss-webpack-dll-service在运行dll时，会识别需要构建的npm版本与上次是否发生变化，如果发生变化，会进行编译；否则，直接跳过该任务

``` json
<!--package.json-->
...
"scripts": {
  "serve": "npm run build:dll && vue-cli-service serve",
  "build:dll": "./node_modules/.bin/fe-dll-service-plugin --config=./build/dll.config.js",
},
"devDependencies": {
  "fe-dll-service-plugin": "^1.0.0",
}
...

```

- vue.config.js下修改相关配置

``` javascript

{
  chainWebpack: (config) => {
    // 加载下面资源，用于处理dll资源加载到html资源中（内部会根据全局配置，自动处理）
    const setDllAssetPlugin = require('fe-dll-service-plugin/webpack-chain-dll-asset')
    setDllAssetPlugin(config)
  }
}

```

通过上述配置，即完成了一个项目在开发环境运行dll任务，加快开发环境的运行速度。

