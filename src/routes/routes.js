'use strict';
module.exports = {
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
    '/receiver/verify-sms': {
	'post': {
	    controller: "ReceiverController",
	    method: 'verifySms'	    
	}
    },
    '/receiver/confirm-transfer': {
	'post': {
	    controller: "ReceiverController",
	    method: 'confirm'	    
	}
    }
}
