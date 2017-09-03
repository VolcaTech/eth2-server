const TransferService = require('../services/TransferService');

const log = require('../libs/log')(module);
const BadRequestError = require('../libs/error').BadRequestError;


function* send(req, res) {

    const phone = req.body.phone;
    if (!phone) {
	throw new BadRequestError('Please provide phone');
    };    
    
    const transferId = req.body.transferId;
    if (!transferId) {
	throw new BadRequestError('Please provide transfer id');
    };    

    const verificationKeystoreData  = req.body.verificationKeystoreData;
    if (!verificationKeystoreData) {
	throw new BadRequestError('Please provide verification Keystore Data');
    };    
    
    const transferParams = {
	phone,
	transferId,
	verificationKeystoreData,
    }

    const transfer = yield TransferService.create(transferParams);
    
    res.json({success: true, transfer: transfer});
}




module.exports = {
   send
}
