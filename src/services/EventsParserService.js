const web3 = require('../utils/web3');
const log  = require('./../libs/log')(module);
const TransferService = require('./TransferService');
const config = require("../config/app-config");
const CONTRACT_ADDRESS = config.get("ESCROW_CONTRACT_ADDRESS");




const subscribeForPendingEvents = () => {
    log.debug("Subscribing for pending events.");	
    var filter = web3.eth.filter('pending');    

    filter.watch( async (error, txHash) => {
	try { 
	    const tx = await web3.eth.getTransactionPromise(txHash);
	    if (tx.to === CONTRACT_ADDRESS) {
		await TransferService.addEventFromTx(tx);
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
