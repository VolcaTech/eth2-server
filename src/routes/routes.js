'use strict';
module.exports = {
    '/sender/register-transfer': {
	'post': {
	    controller: "SenderController",
	    method: 'registerTransfer'	    
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
