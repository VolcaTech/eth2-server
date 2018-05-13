const web3 = require('../utils/web3');
const log  = require('./../libs/log')(module);
const TransferService = require('./TransferService');
const config = require("../config/app-config");
const CONTRACT_ADDRESS = config.get("ESCROW_CONTRACT_ADDRESS");


const DEPOSIT_SHA3 = '0xf340fa01';
const CANCEL_SHA3 = '0xa7c1e629';


const subscribeForPendingEvents = () => {
    log.debug("Subscribing for pending events.");	
    var filter = web3.eth.filter('pending');    

    filter.watch( async (error, txHash) => {
	try { 
	    const tx = await web3.eth.getTransactionPromise(txHash);
	    if (tx.to === CONTRACT_ADDRESS) {
		log.debug("GOT PENDING EVENT: ");		
		log.debug(tx);
		console.log(tx);		
		let eventName;
		if (tx.input.includes(DEPOSIT_SHA3)) {
		    // deposit event
		    eventName = 'deposit';
		} else if (tx.input.includes(CANCEL_SHA3)) {
		    // cancel event		    
		    eventName = 'cancel';
		} else {
		    log.debug("Unknown event!");
		    return null;
		}

		// get transit address from input data
		const transitAddress = '0x' + tx.input.substring(tx.input.length - 40);
		const gasPrice = tx.gasPrice.toNumber();
		console.log({transitAddress, gasPrice});
		const params = {senderAddress: tx.from, transitAddress };
		console.log({params})
		const transfer = await TransferService.findOne(params);
		log.debug({transfer});
		// TransferService.addEvent()
	    }
	} catch(err) {
	    log.debug(err);
	}
    });
}

const start = () => {
    subscribeForPendingEvents();
}


module.exports = {
    start
}
