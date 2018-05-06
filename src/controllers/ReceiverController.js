const TransferService = require('../services/TransferService');
const TwilioService = require('../services/TwilioService');
const EscrowContractService = require('../services/EscrowContractService');

const log = require('../libs/log')(module);
const BadRequestError = require('../libs/error').BadRequestError;


function* claim(req, res) {
    
    const transferId = req.body.transferId;
    if (!transferId) {
	throw new BadRequestError('Please provide transfer id');
    };

    log.info({transferId});
    // transfer instance from server's database
    const transferDb = yield TransferService.getByTransferId(transferId);
    if (!transferDb) {
	throw new BadRequestError('No transfer found on server!');
    }

    yield EscrowContractService.checkTransferStatusBeforeWithdraw(transferDb.transitAddress);
    if (transferDb.phone !== "+71111111111") {
	yield TwilioService.sendSms(transferDb.phone, transferDb.phoneCode);
    }
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
    
    const transfer = yield TransferService.getByTransferId(transferId);
    if (!transfer) {
	throw new BadRequestError('No transfer found in database!');
    }

    if (transfer.phone !== "+71111111111") {
	yield TwilioService.sendPhoneVerification(transfer.phone, transfer.phoneCode, code);
    }

    res.json({success: true, transfer: transfer});
}


function* confirm(req, res) {
    const transferId = req.body.transferId;
    if (!transferId) {
	throw new BadRequestError('Please provide transferId');
    };
    const transfer = yield TransferService.getByTransferId(transferId);
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

    const transferBc = yield EscrowContractService.checkTransferStatusBeforeWithdraw(transfer.transitAddress);
    
    // check that signature is valid    
    const signatureValid = yield EscrowContractService.checkSignature(transfer.transitAddress,
								     to, v, r, s);
    if (!signatureValid) {
	throw new BadRequestError('Signature is not valid');
    };
    
    // send transaction
    const txHash = yield EscrowContractService.withdraw(transfer.transitAddress,
								    to, v, r, s);

    res.json({success: true, txHash, amount: transferBc.amount });
}


module.exports = {
    claim,
    verifySms,
    confirm
}

