const isObject = obj => obj !== null && typeof obj === 'object'

const merge = (...sources) => sources.reduce((result, toMerge) => {
  for (const [key, newValue] of Object.entries(toMerge)) {
    const oldValue = result[key]

    if (Array.isArray(oldValue) && Array.isArray(newValue)) {
      result[key] = oldValue.concat(...newValue)
    } else if (isObject(oldValue) && isObject(newValue)) {
      result[key] = merge(oldValue, newValue)
    } else {
      Object.defineProperty(result, key, Object.getOwnPropertyDescriptor(toMerge, key))
    }
  }

  return result
}, {})

module.exports = merge
