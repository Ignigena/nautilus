module.exports = [
  'location',
  'user'
].reduce((all, model) => {
  all[model] = require(`../api/${model}/model`)
  return all
}, {})
