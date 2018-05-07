const TransferService = require('../services/TransferService');
const TwilioService = require('../services/TwilioService');
const EscrowContractService = require('../services/EscrowContractService');
const log = require('../libs/log')(module);
const BadRequestError = require('../libs/error').BadRequestError;
var Web3Utils = require('web3-utils');


function* claim(req, res) {
    const { transferId, phone, dialCode, salt } = req.body;
    if (!transferId) {
	throw new BadRequestError('Please provide transfer id');
    };

    if (!phone) {
	throw new BadRequestError('Please provide phone');	
    }

    if (!dialCode) {
	throw new BadRequestError('Please provide dial code');	
    }

    if (!salt) {
	throw new BadRequestError('Please provide salt');	
    }
    
    log.info({transferId});
    // transfer instance from server's database
    const transferDb = yield TransferService.getByTransferId(transferId);
    if (!transferDb) {
	throw new BadRequestError('No transfer found on server.');
    }

    const calculatedHash = Web3Utils.sha3(phone, transferId, salt);
    if (transferDb.phoneHash !== calculatedHash) {
	throw new BadRequestError('Phone number is not assigned to this transfer.');
    }
    
    
    yield EscrowContractService.checkTransferStatusBeforeWithdraw(transferDb.transitAddress);
    if (phone !== "+71111111111") {
	yield TwilioService.sendSms(phone, dialCode);
    }
    res.json({success: true});
}

function* verifySms(req, res) {
    const { transferId, code, phone, dialCode, salt } = req.body;
    if (!transferId) {
	throw new BadRequestError('Please provide transfer Id');
    };

    if (!code) {
	throw new BadRequestError('Please provide SMS code');
    };

    if (!phone) {
	throw new BadRequestError('Please provide phone');	
    }

    if (!dialCode) {
	throw new BadRequestError('Please provide dial code');	
    }
    
    const transfer = yield TransferService.getByTransferId(transferId);
    
    if (!transfer) {
	throw new BadRequestError('No transfer found in database!');
    }

    const calculatedHash = Web3Utils.sha3(phone, transferId, salt);
    if (transfer.phoneHash !== calculatedHash) {
	throw new BadRequestError('Phone number is not assigned to this transfer.');
    }
    
    if (phone !== "+71111111111") {
	yield TwilioService.sendPhoneVerification(phone, dialCode, code);
    }
    // update transfer to be verified
    transfer.verified = true;
    const result = yield transfer.save();

    res.json({success: true, transfer: transfer});
}


function* confirm(req, res) {
    let { transferId, receiverAddress } = req.body;
    if (!transferId) {
	throw new BadRequestError('Please provide transferId');
    };
    
    receiverAddress = receiverAddress.toString("hex");    
    if (!receiverAddress) {
	throw new BadRequestError('Please provide receiver address');
    };

    // signature (v,r,s)
    const v = parseInt(req.body.v,10);
    if (!v) {
	throw new BadRequestError('Please provide valid signature (v)');
    };
    
    const r = req.body.r.toString("hex");
    if (!r) {
	throw new BadRequestError('Please provide valid signature (r)');
    };
    
    const s = req.body.s.toString("hex");
    if (!s) {
	throw new BadRequestError('Please provide valid signature (s)');
    };
    
    const transfer = yield TransferService.getByTransferId(transferId);
    if (!transfer) {
	throw new BadRequestError('No transfer found on server!');
    }
    
    if (!transfer.verified) {
	throw new BadRequestError('Receiver is not verified!');
    }
    
    const transferBc = yield EscrowContractService.checkTransferStatusBeforeWithdraw(transfer.transitAddress);
    
    // check that signature is valid    
    const signatureValid = yield EscrowContractService.checkSignature(transfer.transitAddress,
								     receiverAddress, v, r, s);
    if (!signatureValid) {
	throw new BadRequestError('Signature is not valid');
    };
    
    // send transaction
    const txHash = yield EscrowContractService.withdraw(transfer.transitAddress,
								    receiverAddress, v, r, s);

    res.json({success: true, txHash, amount: transferBc.amount });
}


module.exports = {
    claim,
    verifySms,
    confirm
}

