'use strict';
const Transfer = require('../models/transfer');


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


module.exports = {
    create,
    getByTransferId,
    findOne
}
