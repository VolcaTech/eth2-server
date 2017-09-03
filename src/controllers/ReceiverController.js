const TransferService = require('../services/TransferService');
const TwilioService = require('../services/TwilioService');
const VeriedProxyContractService = require('../services/VeriedProxyContractService');

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
    if (transfer.status !== 0) {
	if (transfer.status === 1) {
	    throw new BadRequestError("Transfer has been already received!");
	} else if (transfer.status === 2) {
	    throw new BadRequestError("Transfer can't be received! Transfer has been cancelled" );
	} else {
	    throw new BadRequestError("Transfer can't be received! Transfer status: " + transfer.status);
	}

    }

    
    TwilioService.sendSms(phone)
    res.json({success: true});
}

function* verifySms(req, res) {
    const txHash = req.body.txHash;
    if (!txHash) {
	throw new BadRequestError('Please provide txHash');
    };

    const phone = req.body.phone;
    if (!phone) {
	throw new BadRequestError('Please provide phone');
    };

    const code = req.body.code;
    if (!code) {
	throw new BadRequestError('Please provide SMS code');
    };
    
    const transfer = yield TransferService.getByTxHash(txHash)
    if (!transfer) {
	throw new BadRequestError('No transfer found!');
    }

    
    yield TwilioService.sendPhoneVerification(phone, code)

    res.json({success: true, transfer: transfer});
}


function* confirm(req, res) {
    const txHash = req.body.txHash;
    if (!txHash) {
	throw new BadRequestError('Please provide txHash');
    };
    const transfer = yield TransferService.getByTxHash(txHash)
    if (!transfer) {
	throw new BadRequestError('No transfer found!');
    }

    const to = req.body.to.toString("hex");
    if (!to) {
	throw new BadRequestError('Please provide to');
	
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

    // check that signature is valid    
    signatureValid = yield VeriedProxyContractService.checkSignature(to, v, r, s,
								     transfer.verificationPubKey);
    if (!signatureValid) {
	throw new BadRequestError('Signature is not valid');
    };
    
    // send transaction
    const pendingTxHash = yield VeriedProxyContractService.withdraw(to, v, r, s,
							     transfer.verificationPubKey);

    // update status of transfer to closed
    const updatedTransfer = yield TransferService.updateTransferStatus(txHash, 1)

    yield updatedTransfer.save()
    
    res.json({success: true, pendingTxHash, transfer: updatedTransfer})
}


module.exports = {
    claim,
    verifySms,
    confirm
}
