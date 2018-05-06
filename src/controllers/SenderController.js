const TransferService = require('../services/TransferService');
const log = require('../libs/log')(module);
const BadRequestError = require('../libs/error').BadRequestError;


function* registerTransfer(req, res) {

    const phone = req.body.phone;
    if (!phone) {
	throw new BadRequestError('Please provide phone');
    };
    
    const phoneCode = req.body.phoneCode;
    if (!phoneCode) {
	throw new BadRequestError('Please provide phone code');
    };    
    
    const transferId = req.body.transferId;
    if (!transferId) {
	throw new BadRequestError('Please provide transfer id');
    };    

    const transitKeystore = req.body.transitKeystore;
    if (!transitKeystore) {
	throw new BadRequestError('Please provide transit keystore');
    };    

    const transitAddress = req.body.transitAddress;
    if (!transitAddress) {
	throw new BadRequestError('Please provide transit address');
    };    

    const transferParams = {
	phone,
	phoneCode,
	transferId,
	transitAddress,
	transitKeystore
    };

    log.info({transferParams});
    const transfer = yield TransferService.create(transferParams);
    
    res.json({success: true, transfer: transfer});
}




module.exports = {
    registerTransfer
}
