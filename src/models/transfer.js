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
    txHash: { // is calculated with sha3(phone, verificationCode)
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
    },
    verificationKeystoreData: { 
	type: String,
	required: true,
    },
    status: { 
	type: Number, // 0 - pending, 1 - closed, 2 - cancelled
	required: true,
    }
    
}, {timeStamps: true});


var Transfer = mongoose.model('Transfer', TransferSchema);
module.exports = Transfer;
module.exports.Schema = TransferSchema;
