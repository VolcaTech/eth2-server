var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TransferSchema = new Schema({
    transferId: { // is calculated with sha3(phone, verificationCode)
	type: String,
	required: true,
	unique: true,
	index: true
    },    
    phone: {
	type: String,
	required: true,	
    },
    phoneCode: {
	type: String,
	required: true,	
    },
    transitAddress: {
	type: String,
	required: true,	
    },
    transitKeystore: { 
	type: String,
	required: true,
    }
}, {timeStamps: true});


var Transfer = mongoose.model('Transfer', TransferSchema);
module.exports = Transfer;
module.exports.Schema = TransferSchema;
