'use strict';
const Transfer = require('../models/transfer');


function* create(values) {
    const transfer = new Transfer(values);
    yield transfer.save();
    return transfer;
}


function* getByTransferId(transferId) {
    return yield Transfer.findOne({transferId});
}



module.exports = {
    create,
    getByTransferId,
}
