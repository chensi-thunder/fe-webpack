
/* Loader就是一个函数， 当webpack解析资源时，会调用相应的Loader去处理， Loader接受到文件内容作为参数，返回内容出去。

source 文件内容
map： SourceMap
meta： 别的Loader传递的数据 */
const feCleanLogLoader = function (source) {

  /*
    第一个参数：err 代表是否有错误
    第二个参数：source 处理后的内容
    第三个参数：source-map 继续传递source-map
    第四个参数：meta 给下一个loader传递参数
  */
  this.callback(null, source, map, meta);
  // 同步loader中不能进行异步操作

  // 将console.log替换为空
  return source.replace(/console\.log\(.*\);?/g, "");
}


module.exports = feCleanLogLoader