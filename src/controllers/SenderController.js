const TransferService = require('../services/TransferService');

const log = require('../libs/log')(module);
const BadRequestError = require('../libs/error').BadRequestError;


function* getTransfers(req, res) {
    const from = req.query.from;
    if (!from) {
	throw new BadRequestError('Please provide from param');
    };
    
    const transfers = yield TransferService.getTransfers(from)
    
    res.json({transfers});
}

function* send(req, res) {
    log.debug("ind send")
    log.debug("body: ", req.body)
    log.debug("params:", req.params)
    log.debug("query:", req.query)    
    const from = req.body.from;
    if (!from) {
	throw new BadRequestError('Please provide sender address');
    };

    const verificationPubKey = req.body.publicKey;
    if (!verificationPubKey) {
	throw new BadRequestError('Please provide public key');
    };

    const phone = req.body.phone;
    if (!phone) {
	throw new BadRequestError('Please provide phone');
    };    
    
    const amount = req.body.amount;
    if (!amount) {
	throw new BadRequestError('Please provide amount');
    };    

    const txHash = req.body.txHash;
    if (!txHash) {
	throw new BadRequestError('Please provide txHash');
    };    

    const verificationKeystoreData  = req.body.verificationKeystoreData;
    if (!verificationKeystoreData) {
	throw new BadRequestError('Please provide verification Keystore Data');
    };    

    
    const transferParams = {
	from,
	phone,
	txHash,
	amount,    
	verificationPubKey,
	verificationKeystoreData,
	status: 0
    }

    const transfer = yield TransferService.create(transferParams);
    
    res.json({transfer: transfer});
}




module.exports = {
   getTransfers,
   send
}
