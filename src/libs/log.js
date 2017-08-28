const winston = require('winston');
const util = require('util');
const config = require('./../config/app-config');


const getLogger = function(module) {

    //отобразим метку с именем файла, который выводит сообщение
    const path = module.filename.split('/').slice(-2).join('/'); 
    
    const logger =  new winston.Logger({
        transports : [
            new winston.transports.Console({
                colorize:   true,
                level:      (config.get("logLevel") || "info"),
                label:      path
            })
        ]
    });
    
    logger.logFullError = function(err, signature) { 
	if (!err) {
	    return;
	}
	const args = Array.prototype.slice.call(arguments);
	args.shift();
	logger.error.apply(logger, args);
	logger.error(util.inspect(err));
	if (!err.logged) {
	    logger.error(err.stack);
	}
	err.logged = true;
    };
    
    
    return logger;
}


module.exports = getLogger;


