const fs = require('fs')
const path = require('path')

const klaw = require('klaw-sync')

class NautilusLoader {
  constructor (dirname, ext = '.js') {
    this.dir = dirname
    this.ext = ext
    this.filter = new RegExp(`${ext}$`)
    this.loaded = {}
    return this
  }

  all () {
    return this.matching()
  }

  matching (filter) {
    if (!fs.existsSync(this.dir)) return {}
    this.load(filter || this.filter).map(item => {
      let hook = path.basename(item.path, this.ext)
      this.loaded[hook] = require(item.path)
    })
    return this.loaded
  }

  load (filter) {
    return klaw(this.dir, {
      nodir: true,
      traverseAll: true,
      filter: item => filter.test(item.path.replace(this.dir, ''))
    })
  }
};

module.exports = NautilusLoader
