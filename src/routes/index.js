'use strict';

'use strict';

const _ = require('underscore');
const express = require('express');
const coAuto = require('../libs/co-auto');

function constructRouter(routesPath) {

    const apiRouter = express.Router();
    // load all routes
    _.each(require('./' + routesPath), (verbs, url) => {
	_.each(verbs, (def, verb) => {
	    const method = require('../controllers/' + def.controller)[def.method];
	    if (!method) {
		throw new Error(def.method + ' is undefined');
	    }
	    const middleware = [];
	    middleware.push(method);
	    {
		apiRouter[verb](url, coAuto.autoWrapExpress(middleware));
	    }
	});
    });
    console.log(routesPath + " router constructed!");
    return apiRouter;
}



module.exports = constructRouter;

