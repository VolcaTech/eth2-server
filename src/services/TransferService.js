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


const addEvent = async ({transferStatus, event, transferFilterParams }) => {

    // find transfer in db
    const transfer = await findOne(transferFilterParams);

    // update transfer status in db and add event
    transfer.events.push(event);
    transfer.status = transferStatus;
    await transfer.save();
}


const updateTransferEvent = async ({ transferStatus, eventTxHash, eventTxStatus, transferFilterParams }) => {
    
    // find transfer in db
    const transfer = await findOne(transferFilterParams);
    // update event status 
    transfer.events = transfer.events.map(event => {
	if (event.txHash === eventTxHash) {
	    event.txStatus = eventTxStatus;
	}
	return event;
    });
    transfer.status = transferStatus;
    await transfer.save();
}


module.exports = {
    create,
    getByTransferId,
    findOne,
    addEvent,
    updateTransferEvent
}
