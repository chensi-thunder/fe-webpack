class SetDependVersionPlugin {
  constructor (opts) {
    this.opts = opts
  }
  apply (compiler) {
    // 在make阶段处理icon文件
    compiler.plugin('emit', (_compilation, callback) => {
      const mapStr = JSON.stringify(this.opts.map)
      // 覆盖该文件文本内容
      _compilation.assets['dll-verdor-version.json'] = {
        source: function () {
          return mapStr
        },
        size: function () {
          return mapStr.length
        }
      }
      callback()
    })
  }
}

module.exports = SetDependVersionPlugin