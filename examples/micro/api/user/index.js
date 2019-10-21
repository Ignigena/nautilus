const { resolve } = require('path')
const { utils, nautilus } = require('@nautilus/micro')

module.exports = nautilus((req, res, app) => {
  res.ok()
}, utils.config(resolve(__dirname, '../../config')))
