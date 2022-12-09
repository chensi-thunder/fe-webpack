
/* Loader就是一个函数， 当webpack解析资源时，会调用相应的Loader去处理， Loader接受到文件内容作为参数，返回内容出去。

content: 文件内容
map: SourceMap
meta: 别的Loader传递的数据 */
const feCleanLogLoader = function (content, map, meta) {

  /*
    err: Error | null,           第一个参数: 代表是否有错误
    content: string | Buffer,    第二个参数: 第二个参数是一个 string 或者 Buffer。
    sourceMap?: SourceMap,       第三个参数: 第三个参数必须是一个可以被 this module 解析的 source map。
    meta?: any                   第四个参数: 第四个参数，会被 webpack 忽略，可以是任何东西（例如一些元数据）。meta 给下一个loader传递参数
  */
  this.callback(null, content, map, meta);
  // 同步loader中不能进行异步操作

  // 将console.log替换为空
  return content.replace(/console\.log\(.*\);?/g, "");
}


module.exports = feCleanLogLoader