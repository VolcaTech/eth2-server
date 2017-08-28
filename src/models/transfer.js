var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TransferSchema = new Schema({
    from: {
	type: String,
	required: true,	
    },
    phone: {
	type: String,
	required: true,	
    },
    txHash: { // sha3(phone, verificationCode)
	type: String,
	required: true,
	unique: true,
	index: true
    },
    amount: { 
	type: Number,
	required: true,
    },    
    verificationPubKey: { 
	type: String,
	required: true,
    }
    
}, {timeStamps: true});


var Transfer = mongoose.model('Transfer', TransferSchema);
module.exports = Transfer;
module.exports.Schema = TransferSchema;
