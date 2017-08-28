var connectDB = function() {
    return new Promise(function(resolve, reject) {
	var mongoose    = require('mongoose');
	var log  = require('./../libs/log')(module);
	
	var config  = require('./../config/app-config');
	log.debug(config.get('mongoose:uri'));
	
	mongoose.connect(config.get('mongoose:uri'));
	var db = mongoose.connection;
	
	db.on('error', function (err) {
	    log.error('connection error:', err.message);
	    reject();
	});
	db.once('open', function callback () {
	    log.info("Connected to DB!");
	    resolve();
	});
    });
};

module.exports.connectDB = connectDB;
