const fse = require('fs-extra')
const { resolve } = require('path')
const { existsSync, readFileSync, statSync } = require('fs')

function isFile (path, options) {
  if (!existsSync(path)) return false
  const stat = statSync(path, options)
  if (stat.isFile()) {
    return true
  }
  return false
}

// 判断dll版本是否发生变化
function checkDllVersionIsChange (newVersionMap, dllFolderPath) {
  const oldDllVersionPath = resolve(dllFolderPath, './dll-verdor-version.json')
  if (isFile(oldDllVersionPath)) {
    const dataStr =  readFileSync(oldDllVersionPath, { encoding: 'utf8' })
    return dataStr !== JSON.stringify(newVersionMap)
  }
  return true
}

// 删文件
function rmFileSync (fileName) {
  return fse.removeSync(fileName)
}

/**
 * 写文件
 * @param {string} fileName 文件名
 * @param {*} data 需要写入的数据
 * @param {object|sring} options 写入数据参数
 * @returns 
 */
function writeFileSync (fileName, data, options) {
  return fse.outputFileSync(fileName, data, options)
}

/**
 * 对象序列化，支持过滤掉某些字段
 * @param {object} json
 * @param {Array} list 需要过滤的字段
 */
function jsonStr (json, list = []) {
  if (!list.length) return JSON.stringify(json)
  return JSON.stringify(json, (k, v) => {
    if (list.includes(k)) {
      return undefined
    }
    return v
  })
}

module.exports = {
  isFile,
  jsonStr,
  rmFileSync,
  writeFileSync,
  checkDllVersionIsChange
}
