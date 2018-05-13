'use strict';
const Transfer = require('../models/transfer');
const log  = require('./../libs/log')(module);


const create = async (values) => {
    const transfer = new Transfer(values);
    await transfer.save();
    return transfer;
}


const getByTransferId = (transferId) => {
    return Transfer.findOne({transferId});
}


const findOne = (params={}) => {
    return Transfer.findOne(params);
}


const addEventFromTx = async (tx) => {
    const DEPOSIT_SHA3 = '0xf340fa01';
    const CANCEL_SHA3 = '0xa7c1e629';
    
    log.debug("GOT PENDING EVENT: ");		
    log.debug(tx);
    let eventName, transferStatus;
    if (tx.input.includes(DEPOSIT_SHA3)) {
	// deposit event
	eventName = 'deposit';
	transferStatus = 'depositing';
    } else if (tx.input.includes(CANCEL_SHA3)) {
	// cancel event		    
	eventName = 'cancel';
	transferStatus = 'cancelling';	
    } else {
	log.debug("Unknown event!");
	return null;
    }
    
    // get transit address from input data
    const transitAddress = '0x' + tx.input.substring(tx.input.length - 40);
    const gasPrice = tx.gasPrice.toNumber();

    // find transfer in db
    const transfer = await findOne({ senderAddress: tx.from, transitAddress });

    // update transfer status in db and add event
    const event = {
	txStatus: 'pending',
	txHash: tx.hash,
	eventName,
	gasPrice
    };
    
    transfer.events.push(event);
    transfer.status = transferStatus;
    await transfer.save();
}

module.exports = {
    create,
    getByTransferId,
    findOne,
    addEventFromTx
}
