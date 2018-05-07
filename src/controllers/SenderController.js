const TransferService = require('../services/TransferService');
const log = require('../libs/log')(module);
const BadRequestError = require('../libs/error').BadRequestError;


function* registerTransfer(req, res) {

    const phoneHash = req.body.phoneHash;
    if (!phoneHash) {
	throw new BadRequestError('Please provide hashed phone - phoneHash');
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
	phoneHash,
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
