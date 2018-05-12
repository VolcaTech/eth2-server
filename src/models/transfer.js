const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const TransferEventSchema = require('./TransferEvent').Schema;


const TransferSchema = new Schema({
    transferId: { // is calculated with sha3(phone, verificationCode)
	type: String,
	required: true,
	unique: true,
	index: true
    },    
    phoneHash: { // is calculated with sha3(phone, transferId, salt)
	type: String,
	required: true,	
    },
    transitAddress: { // transit address assigned to smart-contract deposit
	type: String,
	required: true,	
    },
    transitKeystore: {	// encrypted transit private key with secret code,
	type: String,
	required: true,
    },
    verified: { // if sms verification succeeded
	type: Boolean,
	default: false,
	required: true,
    },
    amount: {
	type: Number,
	required: true
    },
    senderAddress: {
	type: String,
	required: true
    },
    events: [TransferEventSchema],
    status: {
	type: String,
	enum: [
	    "inited", // transfer is created, but no blockchain tx found
	    "error", // smart contract deposit call failed
	    "depositing", // deposit tx is pending
	    "deposited", // deposit tx succeeded
	    "completed", // receiver got ether transfer
	    "cancelled" // deposit was cancelled by sender
	],
	default: "inited"
    }
}, {timeStamps: true});


// for faster lookups on blockchain events update
TransferSchema.index({senderAddress: 1, transitAddress: 1}, {unique: true, name: "SenderTransitAddressIndex"});


var Transfer = mongoose.model('Transfer', TransferSchema);
module.exports = Transfer;
module.exports.Schema = TransferSchema;
