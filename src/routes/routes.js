'use strict';
module.exports = {
    '/sender/transfers': {
	'get': {
	    controller: "SenderController",
	    method: 'getTransfers'	    
	}
    },
    '/sender/send': {
	'post': {
	    controller: "SenderController",
	    method: 'send'	    
	}
    },
    '/receiver/claim-transfer': {
	'post': {
	    controller: "ReceiverController",
	    method: 'claim'	    
	}
    },        
    '/receiver/confirm': {
	'post': {
	    controller: "ReceiverController",
	    method: 'confirm'	    
	}
    }
}
