var nconf = require('nconf');

nconf.argv()
    .env()
    .file({ file: './src/server/config/app-config.json' });

module.exports = nconf;
