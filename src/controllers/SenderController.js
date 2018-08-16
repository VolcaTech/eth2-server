const TransferService = require('../services/TransferService');
const log = require('../libs/log')(module);


const registerTransfer = async (req, res) => {
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
	throw new Error('Please provide hashed phone - phoneHash');
    };    
    
    if (!transferId) {
	throw new Error('Please provide transfer id');
    };    

    if (!transitKeystore) {
	throw new Error('Please provide transit keystore');
    };    

    if (!transitAddress) {
	throw new Error('Please provide transit address');
    };    

    if (!senderAddress) {
	throw new Error('Please provide sender address');
    };    

    if (!amount) {
	throw new Error('Please provide amount');
    };        
    
    const transferParams = {
	phoneHash: phoneHash.toLowerCase(),
	transferId: transferId.toLowerCase(),
	transitAddress: transitAddress.toLowerCase(),
	senderAddress: senderAddress.toLowerCase(),
	transitKeystore,	
	amount,
	verificationType: 'phone'
    };

    log.info({transferParams});
    const transfer = await TransferService.create(transferParams);
    
    res.json({success: true, transfer: transfer});
}




module.exports = {
    registerTransfer
}
