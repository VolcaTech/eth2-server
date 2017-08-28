var nconf = require('nconf');

nconf.argv()
    .env()
    .file({ file: './src/config/app-config.json' });

module.exports = nconf;
