const TransferService = require('../services/TransferService');
const TwilioService = require('../services/TwilioService');
const EscrowContractService = require('../services/EscrowContractService');
const log = require('../libs/log')(module);
const Web3Utils = require('web3-utils');


const claim = async (req, res) => {
    const { transferId, phone, dialCode, salt } = req.body;
    if (!transferId) {
	throw new Error('Please provide transfer id');
    };
    
    if (!phone) {
	throw new Error('Please provide phone');	
    }

    if (!dialCode) {
	throw new Error('Please provide dial code');	
    }

    if (!salt) {
	throw new Error('Please provide salt');	
    }
    
    log.info({transferId});
    // transfer instance from server's database
    const transferDb = await TransferService.getByTransferId(transferId);
    if (!transferDb) {
	throw new Error('No transfer found on server.');
    }

    const calculatedHash = Web3Utils.sha3(phone, transferId, salt);
    if (transferDb.phoneHash !== calculatedHash) {
	throw new Error('Phone number is not assigned to this transfer.');
    }
    
    
    await EscrowContractService.checkTransferStatusBeforeWithdraw(transferDb.transitAddress);
    if (phone !== "+71111111111") {
	await TwilioService.sendSms(phone, dialCode);
    }
    res.json({success: true});
}

const verifySms = async (req, res) => {
    const { transferId, code, phone, dialCode, salt } = req.body;
    if (!transferId) {
	throw new Error('Please provide transfer Id');
    };

    if (!code) {
	throw new Error('Please provide SMS code');
    };

    if (!phone) {
	throw new Error('Please provide phone');	
    }

    if (!dialCode) {
	throw new Error('Please provide dial code');	
    }
    
    const transfer = await TransferService.getByTransferId(transferId);
    
    if (!transfer) {
	throw new Error('No transfer found in database!');
    }

    const calculatedHash = Web3Utils.sha3(phone, transferId, salt);
    if (transfer.phoneHash !== calculatedHash) {
	throw new Error('Phone number is not assigned to this transfer.');
    }
    
    if (phone !== "+71111111111") {
	await TwilioService.sendPhoneVerification(phone, dialCode, code);
    }
    // update transfer to be verified
    transfer.verified = true;
    const result = await transfer.save();

    res.json({success: true, transitKeystore: transfer.transitKeystore});
}


const confirm = async (req, res) => {
    let { transferId, receiverAddress } = req.body;
    if (!transferId) {
	throw new Error('Please provide transferId');
    };
    
    receiverAddress = receiverAddress.toString("hex");    
    if (!receiverAddress) {
	throw new Error('Please provide receiver address');
    };

    // signature (v,r,s)
    const v = parseInt(req.body.v,10);
    if (!v) {
	throw new Error('Please provide valid signature (v)');
    };
    
    const r = req.body.r.toString("hex");
    if (!r) {
	throw new Error('Please provide valid signature (r)');
    };
    
    const s = req.body.s.toString("hex");
    if (!s) {
	throw new Error('Please provide valid signature (s)');
    };
    
    const transfer = await TransferService.getByTransferId(transferId);
    if (!transfer) {
	throw new Error('No transfer found on server!');
    }
    
    if (!transfer.verified) {
	throw new Error('Receiver is not verified!');
    }
    
    const transferBc = await EscrowContractService.checkTransferStatusBeforeWithdraw(transfer.transitAddress);
    
    // check that signature is valid    
    const signatureValid = await EscrowContractService.checkSignature(transfer.transitAddress,
								     receiverAddress, v, r, s);
    if (!signatureValid) {
	throw new Error('Signature is not valid');
    };
    
    // send transaction
    const txHash = await EscrowContractService.withdraw(transfer.transitAddress,
								    receiverAddress, v, r, s);

    res.json({success: true, txHash, amount: transferBc.amount });
}


const claimLinkTransfer = async (req, res) => {
    let { transitAddress, receiverAddress } = req.body;
    if (!transitAddress) {
	throw new Error('Please provide transitAddress');
    };

    receiverAddress = receiverAddress.toString("hex");
    if (!receiverAddress) {
	throw new Error('Please provide receiver address');
    };

    // signature (v,r,s)
    const v = parseInt(req.body.v,10);
    if (!v) {
	throw new Error('Please provide valid signature (v)');
    };

    const r = req.body.r.toString("hex");
    if (!r) {
	throw new Error('Please provide valid signature (r)');
    };

    const s = req.body.s.toString("hex");
    if (!s) {
	throw new Error('Please provide valid signature (s)');
    };

    const transferBc = await EscrowContractService.checkTransferStatusBeforeWithdraw(transitAddress);

    // check that signature is valid
    const signatureValid = await EscrowContractService.checkSignature(transitAddress,
								      receiverAddress, v, r, s);
    if (!signatureValid) {
	throw new Error('Signature is not valid');
    };

    // send transaction
    const txHash = await EscrowContractService.withdraw(transitAddress,
							receiverAddress, v, r, s);

    res.json({success: true, txHash, amount: transferBc.amount });
}


const getTransfer = async (req, res) => {
    const { transferId } = req.params;
    if (!transferId) {
	throw new Error('Please provide transfer id');
    };
    
    const transfer = await TransferService.getByTransferId(transferId);
    if (!transfer) {
	throw new Error('No transfer found on server.');
    }
    
    res.json({success: true, transfer });    
}
    

module.exports = {
    claim,
    verifySms,
    confirm,
    getTransfer,
    claimLinkTransfer
}

