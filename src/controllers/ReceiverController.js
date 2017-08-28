const TransferService = require('../services/TransferService');
const TwilioService = require('../services/TwilioService');

const log = require('../libs/log')(module);
const BadRequestError = require('../libs/error').BadRequestError;


function* claim(req, res) {
    
    const txHash = req.body.txHash;
    if (!txHash) {
	throw new BadRequestError('Please provide txHash');
    };

    const phone = req.body.phone;
    if (!phone) {
	throw new BadRequestError('Please provide phone');
    };

    const transfer = yield TransferService.getByTxHash(txHash)

    if (!transfer) {
	throw new BadRequestError('No transfer found!');
    }

    TwilioService.sendSms(phone)
    
    res.json({transfer});
}

function* confirm(req, res) {
    
}




module.exports = {
    claim,
    confirm
}
