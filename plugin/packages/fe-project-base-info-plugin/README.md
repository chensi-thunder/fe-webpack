# fe-project-base-info-plugin
该包为 webpack plugin，主要用于在全局 `window.fe` 对象上挂载项目基础信息，便于快速定查阅，具体使用见当前文档

在控制台输入 `window.fe` 即可获取下述格式信息：

```javascript
 {
  name: "gdt-ui", 
  version: "1.0.1", 
  barnch: "master", 
  commitId: "9ec20bc7de33ac76a78eb2cca80642fb61eacceb", 
  packTime: "2021-03-10 09:33:35"
}
```

## Install:

```bash
$ npm install --save-dev fe-project-base-info-plugin
```

## 相关配置
在 webpack 中引入

```javascript
const ProjectBaseInfoPlugin = require('ProjectBaseInfoPlugin')
const isProduction = process.env.NODE_ENV === 'production'

...
configureWebpack: config => {
  isProduction && config.plugins.push(new ProjectBaseInfoPlugin())
}
...
```    

结果：index.html `<body>` 标签底部会插入下述格式代码：

```html
<script type="text/javascript">window.fe = {"name":"gdt-ui","version":"1.0.1","barnch":"master","commitId":"9ec20bc7de33ac76a78eb2cca80642fb61eacceb","packTime":"2021-03-10 09:33:35"}</script>
```

## 注意事项

1. 该包依赖 git 来获取项目基础仓库信息，如 `git rev-parse --abbrev-ref HEAD` 获取分支「在非 git 环境下获取不到任何信息」；
2. 该包版本信息，沿用了 `package.json` 中的 version 字段；
3. 挂载 `window.fe` 是通过 `html-webpack-plugin` 插件相关 hooks 实现「该插件兼容了 v4.0.0+ 和 v3.2.0 版本」；
4. 该包依赖 `html-webpack-plugin`、`shelljs`。
