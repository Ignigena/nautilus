const { dirname, resolve } = require('path')

const stack = require('callsites')
const fs = require('fs-extra')

module.exports = async (type, config) => {
  const contents = typeof config === 'object' ? `module.exports = ${JSON.stringify(config)}` : config

  const path = resolve(dirname(stack()[1].getFileName()), 'config', `${type}.js`)
  await fs.outputFile(path, contents)

  return {
    remove: () => fs.remove(path),
    cleanup: () => fs.remove(dirname(path))
  }
}
