## [Loader 编写方法](https://blog.csdn.net/zxd1435513775/article/details/125373851)
### 一、分类
1. 同步 Loaders
```js
// async-loader.js
// this.callback 方法则更灵活，因为它允许传递多个参数，而不仅仅是 content。
module.exports = function (content, map, meta) {
  return someSyncOperation(content);
};

// sync-loader-with-multiple-results.js
module.exports = function (content, map, meta) {
  this.callback(null, someSyncOperation(content), map, meta);
  return; // 当调用 callback() 函数时，总是返回 undefined
};
```
2. 异步 Loaders
```js
// async-loader.js
// 对于异步 loader，使用 this.async 来获取 callback 函数：
module.exports = function (content, map, meta) {
  var callback = this.async();
  someAsyncOperation(content, function (err, result) {
    if (err) return callback(err);
    callback(null, result, map, meta);
  });
};

// sync-loader-with-multiple-results.js
module.exports = function (content, map, meta) {
  var callback = this.async();
  someAsyncOperation(content, function (err, result, sourceMaps, meta) {
    if (err) return callback(err);
    callback(null, result, sourceMaps, meta);
  });
};
```
3. "Raw" Loader
默认情况下，资源文件会被转化为 UTF-8 字符串，然后传给 loader。通过设置 raw 为 true，loader 可以接收原始的 Buffer。每一个 loader 都可以用 String 或者 Buffer 的形式传递它的处理结果。complier 将会把它们在 loader 之间相互转换。
```js
// async-loader.js
// 对于异步 loader，使用 this.async 来获取 callback 函数：
module.exports = function (content) {
  assert(content instanceof Buffer);
  return someSyncOperation(content);
  // 返回值也可以是一个 `Buffer`
  // 即使不是 "raw"，loader 也没问题
};
module.exports.raw = true;
```
4. Pitching Loader
loader 总是 从右到左被调用。有些情况下，loader 只关心 request 后面的 元数据(metadata)，并且忽略前一个 loader 的结果。在实际（从右到左）执行 loader 之前，会先 从左到右 调用 loader 上的 pitch 方法。
```js
// async-loader.js
// 对于异步 loader，使用 this.async 来获取 callback 函数：
module.exports = function (content, map, meta) {
  var callback = this.async();
  someAsyncOperation(content, function (err, result) {
    if (err) return callback(err);
    callback(null, result, map, meta);
  });
};

// sync-loader-with-multiple-results.js
module.exports = function (content, map, meta) {
  var callback = this.async();
  someAsyncOperation(content, function (err, result, sourceMaps, meta) {
    if (err) return callback(err);
    callback(null, result, sourceMaps, meta);
  });
};
```

### 二、创建Loader

### 三、链接
- [Loader](https://blog.csdn.net/zxd1435513775/article/details/125373851)

### [四、API](https://webpack.docschina.org/api/loaders/#thisdata)