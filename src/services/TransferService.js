'use strict';
const Transfer = require('../models/transfer');


function* create(values) {
    const transfer = new Transfer(values);
    yield transfer.save();
    return transfer;
}

function* getTransfers(from) {
    return yield Transfer.find({from});
}

function* getByTxHash(txHash) {
    return yield Transfer.findOne({txHash});
}

function* updateTransferStatus(txHash, status) {
    return yield Transfer.findOneAndUpdate({txHash}, {$set: {status}});
}



module.exports = {
    create,
    getTransfers,
    getByTxHash,
    updateTransferStatus
}
