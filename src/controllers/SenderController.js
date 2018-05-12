const TransferService = require('../services/TransferService');
const log = require('../libs/log')(module);
const BadRequestError = require('../libs/error').BadRequestError;


function* registerTransfer(req, res) {
    // request params
    const {
	phoneHash,
	transferId,
	transitKeystore,
	transitAddress,
	senderAddress,
	amount
    } = req.body;

    // check that needed params are present
    if (!phoneHash) {
	throw new BadRequestError('Please provide hashed phone - phoneHash');
    };    
    
    if (!transferId) {
	throw new BadRequestError('Please provide transfer id');
    };    

    if (!transitKeystore) {
	throw new BadRequestError('Please provide transit keystore');
    };    

    if (!transitAddress) {
	throw new BadRequestError('Please provide transit address');
    };    

    if (!senderAddress) {
	throw new BadRequestError('Please provide sender address');
    };    

    if (!amount) {
	throw new BadRequestError('Please provide amount');
    };        
    
    const transferParams = {
	phoneHash,
	transferId,
	transitAddress,
	transitKeystore,
	senderAddress,
	amount
    };

    log.info({transferParams});
    const transfer = yield TransferService.create(transferParams);
    
    res.json({success: true, transfer: transfer});
}




module.exports = {
    registerTransfer
}
