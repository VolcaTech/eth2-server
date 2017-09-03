'use strict';

// set up ========================
const express  = require('express');
const app      = express();                               // create our app w/ express
const log = require('./src/libs/log')(module);
const config = require('./src/config/app-config');
const morgan = require('morgan');             // log requests to the console (express4)
const bodyParser = require('body-parser');    // pull information from HTML POST (express4)
const methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
const buildRouter = require('./src/routes');


//app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users

app.use(morgan('dev'));                                         // log every request to the console
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header("Cache-Control", "no-cache");
    res.header("Access-Control-Max-Age", "1728000");
    // res.header('Access-Control-Allow-Origin', '*');
    // res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    // res.header("Access-Control-Allow-Credentials", "true");
    next();
}


// connect to database
require('./src/models/mongoose').connectDB();


// ROUTES
app.use('/api/v1/', allowCrossDomain,
	buildRouter('routes'));



// app.get('/', function(req, res) {
//     res.sendFile(__dirname + "/public/index.html");
// });


// ERROR HANDLING
app.use(function(req, res, next){
    res.status(404);
    log.debug('Not found URL: %s',req.url);
    res.send({ error: 'Not found' });
    return;
});


// allow CORS 
app.use(function(err, req, res, next){
    log.error(err);
    res.status(err.status || 500);
    //log.error('Internal error(%d): %s',res.statusCode,err.message);
    let message  = "Server error!";
    log.logFullError(err, req.method, req.url);
    if (err.code === 'EBADCSRFTOKEN') {
	message = "Неверный CRSF token. Обновите текущую страницу и повторите действие снова.";
    } else if (err.message && err.name === "BadRequestError") {
	message = err.message;
    };
    
    res.send({ errorMessage: message });
    return;
});



// listen (start app with node server.js) ======================================
var portNum = config.get('port');
app.listen(portNum, function() {
     log.info('Express server listening on port ' + portNum);    
});


