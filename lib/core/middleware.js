const bodyParser = require('body-parser');

module.exports = function NautilusWebMiddleware(app) {
  app.use(require('../middleware/headers'));
  app.use(require('../middleware/slash')(app));

  app.use(bodyParser.json());
};
