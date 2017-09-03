const TransferService = require('../services/TransferService');
const TwilioService = require('../services/TwilioService');
const VeriedProxyContractService = require('../services/VeriedProxyContractService');

const log = require('../libs/log')(module);
const BadRequestError = require('../libs/error').BadRequestError;


function* claim(req, res) {
    
    const transferId = req.body.transferId;
    if (!transferId) {
	throw new BadRequestError('Please provide transfer id');
    };

    // transfer instance from server's database
    const transferDb = yield TransferService.getByTransferId(transferId)
    if (!transferDb) {
	throw new BadRequestError('No transfer found on server!');
    }
    
    yield VeriedProxyContractService.checkTransferStatusBeforeWithdraw(transferId);
    
    TwilioService.sendSms(transferDb.phone);
    res.json({success: true});
}

function* verifySms(req, res) {
    const transferId = req.body.transferId;
    if (!transferId) {
	throw new BadRequestError('Please provide transfer Id');
    };

    const code = req.body.code;
    if (!code) {
	throw new BadRequestError('Please provide SMS code');
    };
    
    const transfer = yield TransferService.getByTransferId(transferId)
    if (!transfer) {
	throw new BadRequestError('No transfer found in database!');
    }
    
    yield TwilioService.sendPhoneVerification(transfer.phone, code)

    res.json({success: true, transfer: transfer});
}


function* confirm(req, res) {
    const transferId = req.body.transferId;
    if (!transferId) {
	throw new BadRequestError('Please provide transferId');
    };
    const transfer = yield TransferService.getByTransferId(transferId)
    if (!transfer) {
	throw new BadRequestError('No transfer found on server!');
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

    yield VeriedProxyContractService.checkTransferStatusBeforeWithdraw(transferId);
    
    // check that signature is valid    
    signatureValid = yield VeriedProxyContractService.checkSignature(transferId,
								     to, v, r, s);
    if (!signatureValid) {
	throw new BadRequestError('Signature is not valid');
    };
    
    // send transaction
    const pendingTxHash = yield VeriedProxyContractService.withdraw(transferId,
								    to, v, r, s);

    res.json({success: true, pendingTxHash})
}


module.exports = {
    claim,
    verifySms,
    confirm
}

