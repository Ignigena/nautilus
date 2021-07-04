const isObject = obj => obj !== null && typeof obj === 'object'

const merge = (target, ...sources) => sources.reduce((result, toMerge) => {
  for (const [key, newValue] of Object.entries(toMerge)) {
    const oldValue = result[key]

    if (Array.isArray(oldValue) && Array.isArray(newValue)) {
      result[key] = oldValue.concat(...newValue)
    } else if (isObject(oldValue) && isObject(newValue)) {
      result[key] = merge(oldValue, newValue)
    } else {
      result[key] = newValue
    }
  }

  return result
}, target)

module.exports = merge
