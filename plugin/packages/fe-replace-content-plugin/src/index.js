class FeReplaceContentPlugin {
  apply (compiler) {
    console.log('FeReplaceContentPlugin Start！！！')
    compiler.hooks.entryOption.tap('FeReplaceContentPlugin', (context, entry) => {
      console.log('ppp')
      console.log(context)
      console.log(entry)
      /* ... */
    })

    compiler.hooks.shouldEmit.tap('FeReplaceContentPlugin', (compilation) => {
      // 返回 true 以输出 output 结果，否则返回 false
      return true
    })

    // emit 钩子
    compiler.hooks.emit.tap('FeReplaceContentPlugin', compilation => {

      for (const name in compilation.assets) {
        // console.log(name) // 打包后的文件名
        if (name.endsWith('.js')) {
          const contents = compilation.assets[name].source() // 打包后的文件内容 chunk-0f0e55aa.js
          const withoutComments = contents.replace(/\/\*\*+\*\//g, '') // 替换后的新内容
          compilation.assets[name] = {
            source: () => withoutComments,   // 内容覆盖
            size: () => withoutComments.length  // 必须返回
          }
        }
        
      }
    })
  }
}