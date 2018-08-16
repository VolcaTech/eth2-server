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


const findOrCreate = async ({ senderAddress, transitAddress }) => {

   // find transfer in db
    let transfer = await findOne({senderAddress, transitAddress});

    // create transfer from pending tx, when transfer is sent using special link
    if (!transfer) {
	console.log("creating transfer from pending tx...");
	transfer = await create({
	    senderAddress,
	    transitAddress,
	    transferId: `link-${transitAddress}`,
	    verificationType: "none"
	});
    }

    console.log({transfer});
    return transfer;
}

const addEvent = async ({transferStatus, event, senderAddress, transitAddress }) => {

    const transfer = await findOrCreate({senderAddress, transitAddress}); 
    
    // update transfer status in db and add event
    transfer.events.push(event);
    transfer.status = transferStatus;
    await transfer.save();
}


const updateTransferEvent = async ({ transferStatus, eventTxHash, eventTxStatus, senderAddress, transitAddress, amount=null }) => {
    
    // find transfer in db
    const transfer = await findOrCreate({senderAddress, transitAddress}); 

    // update event status 
    transfer.events = transfer.events.map(event => {
	if (event.txHash === eventTxHash) {
	    event.txStatus = eventTxStatus;
	}
	return event;
    });
    transfer.status = transferStatus;

    if (amount) {
	transfer.amount = amount;
    }
    
    await transfer.save();
}


module.exports = {
    create,
    getByTransferId,
    findOne,
    addEvent,
    updateTransferEvent
}
