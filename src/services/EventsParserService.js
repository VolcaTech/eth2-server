const web3 = require('../utils/web3');
const log  = require('./../libs/log')(module);
const TransferService = require('./TransferService');
const config = require("../config/app-config");
const CONTRACT_ADDRESS = config.get("ESCROW_CONTRACT_ADDRESS");
const { contractInstance: escrowContract } = require('./EscrowContractService');


const subscribeForMinedDepositEvents = () => {
    log.debug("Subscribing for mined deposit events.");
    
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


const subscribeForMinedCancelEvents = () => {
    log.debug("Subscribing for mined cancel events.");
    
    const cancelEvent = escrowContract.LogCancel();

    cancelEvent.watch(async (error, result) => {
	try {
	    log.debug("Got mined cancel event");
	    console.log(result);
	   	    
	    const event = {
		txStatus: 'success',
		txHash: result.transactionHash,
		eventName: 'cancel',
	    };
	    const transferFilterParams = {
		senderAddress: result.args.sender,
		transitAddress: result.args.transitAddress
	    };
	    

	    await TransferService.addEvent({
		transferStatus: 'cancelled',
		event,
		transferFilterParams
	    });
	    
	} catch(err) {
	    log.debug(err);
	}
    });
}


const subscribeForMinedWithdrawEvents = () => {
    log.debug("Subscribing for mined cancel events.");
    
    const withdrawEvent = escrowContract.LogWithdraw();

    withdrawEvent.watch(async (error, result) => {
	try {
	    log.debug("Got mined withdraw event");
	    console.log(result);
	   	    
	    const event = {
		txStatus: 'success',
		txHash: result.transactionHash,
		eventName: 'withdraw',
	    };
	    const transferFilterParams = {
		senderAddress: result.args.sender,
		transitAddress: result.args.transitAddress
	    };
	    
	    await TransferService.addEvent({
		transferStatus: 'completed',
		event,
		transferFilterParams
	    });
	    
	} catch(err) {
	    log.debug(err);
	}
    });
}


const start = () => {
    subscribeForMinedDepositEvents();
    subscribeForMinedCancelEvents();
    subscribeForMinedWithdrawEvents();            
}


module.exports = {
    start
}
