var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TransferSchema = new Schema({
    phone: {
	type: String,
	required: true		
    },
    amount: {
	type: Number,
	required: true			
    },
    sender: {
	type: String,
	required: true			
    },
    cipherCode:  {
	type: String,
	required: true			
    },
    status: {
	type: Number,
	required: true
    }
}, {
    timestamps: true
});


var Transfer = mongoose.model('Transfer', TransferSchema);
module.exports = Transfer;
module.exports.Schema = TransferSchema;
