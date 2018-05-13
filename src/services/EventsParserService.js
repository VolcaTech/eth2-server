const web3 = require('../utils/web3');
const log  = require('./../libs/log')(module);
const TransferService = require('./TransferService');
const config = require("../config/app-config");
const CONTRACT_ADDRESS = config.get("ESCROW_CONTRACT_ADDRESS");
const { contractInstance: escrowContract } = require('./EscrowContractService');


const subscribeForPendingEvents = () => {
    log.debug("Subscribing for pending events.");	
    var filter = web3.eth.filter('pending');    

    filter.watch( async (error, txHash) => {
	try { 
	    const tx = await web3.eth.getTransactionPromise(txHash);
	    if (tx.to === CONTRACT_ADDRESS) {

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
		const event = {
		    txStatus: 'pending',
		    txHash: tx.hash,
		    eventName,
		    gasPrice
		};
		const transferFilterParams = {
		    senderAddress: tx.from,
		    transitAddress: '0x' + tx.input.substring(tx.input.length - 40)
		};
		await TransferService.addEvent({transferStatus, event, transferFilterParams });
	    }
	} catch(err) {
	    log.debug(err);
	}
    });
}


const subscribeForMinedDepositEvents = () => {
    log.debug("Subscribing for mined events.");
    
    const depositEvent = escrowContract.LogDeposit();

    depositEvent.watch(async (error, result) => {
	try {
	    log.debug("Got mined deposit event");
	    console.log(result);
	    
	    const transferFilterParams = {
		senderAddress: result.args.sender,
		transitAddress: result.args.transitAddress
	    };
	    
	    const transferStatus = 'deposited';
	    const eventTxStatus = 'success';
	    await TransferService.updateTransferEvent({
		transferStatus,
		eventTxHash: result.transactionHash,
		transferFilterParams,
		eventTxStatus
	    });
	} catch(err) {
	    log.debug(err);
	}
    });
}


const start = () => {
    subscribeForPendingEvents();
    subscribeForMinedDepositEvents();    
}


module.exports = {
    start
}
