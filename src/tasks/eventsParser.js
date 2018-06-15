const web3 = require('../utils/web3');
const log  = require('./../libs/log')(module);
const config = require("../config/app-config");
const CONTRACT_ADDRESS = config.get("ESCROW_CONTRACT_ADDRESS");
const { contractInstance: escrowContract } = require('./../services/EscrowContractService');
const axios = require('axios');


const pushEventToServer = (params) => {
    const host = config.get("ETH2PHONE_SERVER_HOST");
    const url = `${host}/api/v1/transfer-events/add`;
    params.parserApiKey = config.get("PARSER_API_KEY");
    return axios.post(url, params);    
}


const subscribeForPendingEvents = () => {
    log.debug("Subscribing for pending events.");	
    var filter = web3.eth.filter('pending');    

    filter.watch( async (error, txHash) => {
	try {
	    const dt = new Date();
	    const now = dt.toLocaleTimeString();
	    log.debug(`${now} -- Got new tx hash: ${txHash}`);
	    const tx = await web3.eth.getTransactionPromise(txHash);    
	    if (tx.to === CONTRACT_ADDRESS.toLowerCase()) {

		const DEPOSIT_SHA3 = '0xf340fa01';
		
		log.debug("GOT PENDING EVENT: ");		
		log.debug(tx);
		let eventName, transferStatus;
		if (tx.input.includes(DEPOSIT_SHA3)) {
		    // deposit event
		    eventName = 'deposit';
		    transferStatus = 'depositing';
		} else {
		    return null;
		}
		
		// get transit address from input data
		const gasPrice = tx.gasPrice.toNumber();
		const txStatus = 'pending';
		const txHash = tx.hash;

		const senderAddress = tx.from;
		const transitAddress = '0x' + tx.input.substring(tx.input.length - 40);

		const params = {
		    gasPrice,
		    txStatus,
		    txHash,
		    senderAddress,
		    transitAddress,
		    eventName,
		    transferStatus
		};
		
		log.debug("Pushing event to server: ", params);
		const result = await pushEventToServer(params);
		if (result && result.data && result.data.success) {
		    log.debug("Successfully added event!");
		} else {
		    log.debug("Error adding event: ");
		    console.log({result});
		}

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
