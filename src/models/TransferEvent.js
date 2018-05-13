var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TransferEventSchema = new Schema({
    txHash: {
	type: String,
	required: true
    },
    eventName: {
	type: String,
	enum: ["deposit", "cancel", "withdraw"]
    },
    txStatus: {
	type: String,
	enum: ["pending", "success", "error"]	
    },
    gasPrice: {
	type: Number
    }
}, {timeStamps: true});



module.exports.Schema = TransferEventSchema;
