const Promise = require("bluebird");
const request = require('request');
const config  = require('./../config/app-config');
const log  = require('./../libs/log')(module);
const BadRequestError = require('../libs/error').BadRequestError;
const authy = require('authy')(config.get('AUTHY_API_KEY'));


const _authyPromise = (phone, phoneCode) => {
    return new Promise((resolve, reject) => {
	authy.phones().verification_start(phone, phoneCode, 'sms', function(err, res) {
	    if (err) {
		log.error("ERROR within authy: ", err);
		reject(err);
	    } else {
		log.debug(res);		
		log.info("SMS sent to phone: ", phone);
		resolve(res);
	    }
	});	
    });
}


function* sendSms(phone, phoneCode) {
    try {
	const res = yield _authyPromise(phone, phoneCode)
    } catch (err) {
	throw new BadRequestError('Error on sending SMS. Please try again!');
    }
    return true;
}

function* sendPhoneVerification(phone, phoneCode, smsCode) {
    try {
	let authyPhones = authy.phones();
	Promise.promisifyAll(authyPhones, {suffix: "Promise"});

	res = yield authyPhones.verification_checkPromise(phone, phoneCode, smsCode)
	log.debug(res);		
	log.info("Successfully registered: ", phoneCode, phone);
    } catch (err) {
	log.error("Error while confirming SMS code: ", err, {phone, phoneCode, smsCode});
	throw new BadRequestError('Wrong SMS code!');
    }
    return true;
}


module.exports = {
    sendSms,
    sendPhoneVerification
}
