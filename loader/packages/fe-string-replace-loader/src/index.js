const getOptionsArray = require('./checkOptions')
const replaceStr = function (source, options) {
  let { replace, flags, strict, isUsePrivateVariable } = options
  let search
  if (options.search instanceof RegExp) {
    // if the `search` type is RegExp, we ignore `flags`
    search = options.search
  } else if (flags !== null) {
    search = new RegExp(options.search, flags)
  } else {
    search = options.search
  }

  if (strict && (typeof search === 'undefined' || search === null || typeof replace === 'undefined' || replace === null)) {
    throw new Error('Replace failed (strict mode) : options.search and options.replace are required')
  }
  // 全局内部变量替换,传入this作用域
  if (isUsePrivateVariable) {
    const filePath = this.resourcePath
    const fileOpt = filePath.match(/.*(\\|\/)([^.]+)(.*)$/)
    let fileName = ''
    let fileExt = ''
    if (fileOpt) {
      fileName = fileOpt[2]
      fileExt = fileOpt[3]
    }
    replace = replace.bind({ fileName, fileExt, filePath })
  }
  let newSource = source.replace(search, replace)

  if (strict && (newSource === source)) {
    throw new Error('Replace failed (strict mode) : ' + options.search + ' → ' + options.replace)
  }

  return newSource
}

const feStringReplaceLoader = function (content, map) {
  this.cacheable() // 设置是否可缓存标志的函数：默认情况下，loader 的处理结果会被标记为可缓存。调用这个方法然后传入 false，可以关闭 loader 处理结果的缓存能力。

  const optionsArray = getOptionsArray(this)
  let newSource = content

  for (const options of optionsArray) {
    newSource = replaceStr.call(this, newSource, options)
  }

  this.callback(null, newSource, map)
}

module.exports = feStringReplaceLoader
