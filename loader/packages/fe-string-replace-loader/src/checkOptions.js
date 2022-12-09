const { getOptions } = require('loader-utils')
const validateOptions = require('schema-utils')

const loaderName = 'string-replace-loader'
const optionsSchema = {
  type: 'object',
  properties: {
    search: {
      anyOf: [
        {
          instanceof: 'RegExp'
        },
        {
          type: 'string'
        }
      ]
    },
    replace: {
      anyOf: [
        {
          instanceof: 'Function'
        },
        {
          type: 'string'
        }
      ]
    },
    flags: {
      type: 'string',
    },
    // 是否使用内部变量，[$$filePath] [$$context] [$$fileName] [$$fileExt]四个内部变量
    isUsePrivateVariable: {
      type: 'boolean'
    },
    strict: {
      type: 'boolean'
    }
  },
  additionalProperties: false
}

const defaultOptions = {
  search: null,
  replace: null,
  flags: null,
  strict: false
}

function getOptionsArray (config) {
  const rawOptions = getOptions(config)
  const rawOptionsArray = (
    typeof rawOptions.multiple !== 'undefined'
      ? rawOptions.multiple
      : [rawOptions]
  )
  const optionsArray = []

  for (const optionsIndex in rawOptionsArray) {
    validateOptions(optionsSchema, rawOptionsArray[optionsIndex], loaderName)

    optionsArray[optionsIndex] = Object.assign({}, defaultOptions, rawOptionsArray[optionsIndex])
  }

  return optionsArray
}

module.exports = getOptionsArray
