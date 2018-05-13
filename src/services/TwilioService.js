const Promise = require("bluebird");
const request = require('request');
const config  = require('./../config/app-config');
const log  = require('./../libs/log')(module);
const authy = require('authy')(config.get('AUTHY_API_KEY'));


const _authyPromise = (phone, phoneCode) => {
    return new Promise((resolve, reject) => {
	authy.phones().verification_start(phone, phoneCode, 'sms', (err, res) => {
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


const sendSms = async (phone, phoneCode) => {
    try {
	const res = await _authyPromise(phone, phoneCode);
    } catch (err) {
	throw new Error('Error on sending SMS. Please try again!');
    }
    return true;
}

const sendPhoneVerification = async (phone, phoneCode, smsCode) => {
    try {
	let authyPhones = authy.phones();
	Promise.promisifyAll(authyPhones, {suffix: "Promise"});
	const res = await authyPhones.verification_checkPromise(phone, phoneCode, smsCode);
	log.debug(res);		
	log.info("Successfully registered: ", phoneCode, phone);
    } catch (err) {
	log.error("Error while confirming SMS code: ", err, {phone, phoneCode, smsCode});
	throw new Error('Wrong SMS code!');
    }
    return true;
}


module.exports = {
    sendSms,
    sendPhoneVerification
}
