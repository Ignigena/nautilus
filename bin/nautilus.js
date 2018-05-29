#!/usr/bin/env node
const args = require('mri');
const getPort = require('get-port');

const Nautilus = require('../');
const { version } = require('../package');

const flags = args(process.argv.slice(2), {
  default: {
    port: process.env.PORT || 3000,
  },
  alias: {
    p: 'port',
    v: 'version',
  },
  unknown(flag) {
    console.log(`Unknown option "${flag}"`);
    process.exit(1);
  },
});

if (flags.version) {
  console.log(version);
  process.exit();
}

let nautilus;

getPort(flags.port).then(port => {
  nautilus = new Nautilus({
    appPath: process.cwd(),
    port,
  });

  if (port !== flags.port) {
    nautilus.app.log.warn(`Port ${flags.port} is currently in use.`);
  }

  nautilus.start(() => {
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  });
});

function shutdown() {
  console.log('');
  nautilus.app.log.info('Gracefully shutting down. Please wait...');
  nautilus.stop(() => nautilus.app.log.info('...done'));
}
