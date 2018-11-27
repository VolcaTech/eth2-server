const web3 = require('../utils/web3');
const log  = require('./../libs/log')(module);
const TransferService = require('./TransferService');
const config = require("../config/app-config");
//const CONTRACT_ADDRESS = config.get("ESCROW_CONTRACT_ADDRESS");
const { contractInstance: escrowContract } = require('./EscrowContractService');


const ethers = require('ethers');
const provider = ethers.getDefaultProvider(config.get('ETHEREUM_NETWORK'));
const wallet = new ethers.Wallet(config.get("ETHEREUM_ACCOUNT_PK"), provider);

// init contract
// const CONTRACT_ADDRESS = config.get("ESCROW_CONTRACT_ADDRESS");
// const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);


const subscribeForMinedDepositEvents = () => {
    log.debug("Subscribing for mined deposit events.");

    //const depositEvent = escrowContract.LogDeposit();
    
    
    //depositEvent.watch(async (error, result) => {
    escrowContract.on("LogDeposit", async (_sender, _transitAddress, _amount, _com, event) => {

	try {
	    log.debug("Got mined deposit event");
	    console.log({_sender, _transitAddress, _amount, _com});	    
	    // console.log({sender, transitAddress, amount, commission, event});

	    
	    const senderAddress = _sender.toLowerCase();
	    const transitAddress = _transitAddress.toLowerCase();
	    const amount = ethers.utils.formatEther(_amount);
	    
	    const transferStatus = 'deposited';
	    const eventTxStatus = 'success';


	    const transfer = {
		transferStatus,
		eventTxHash: event.transactionHash,
		senderAddress,
		transitAddress,
		eventTxStatus,
		amount
	    }

	    console.log({transfer});
	    
	    await TransferService.updateTransferEvent(transfer);
	} catch(err) {
	    log.debug(err);
	}
    });
}


const subscribeForMinedCancelEvents = () => {
    log.debug("Subscribing for mined cancel events.");
    
    //const cancelEvent = escrowContract.LogCancel();

    //cancelEvent.watch(async (error, result) => {
    escrowContract.on("LogCancel", async (_sender,_transitAddress, result) => {	
	try {
	    log.debug("Got mined cancel event");
	    console.log(result);
	   	    
	    const event = {
		txStatus: 'success',
		txHash: result.transactionHash,
		eventName: 'cancel',
	    };
	    const senderAddress = _sender.toLowerCase();
	    const transitAddress = _transitAddress.toLowerCase();

	    await TransferService.addEvent({
		transferStatus: 'cancelled',
		event,
		senderAddress,
		transitAddress,
	    });
	    
	} catch(err) {
	    log.debug(err);
	}
    });
}


const subscribeForMinedWithdrawEvents = () => {
    log.debug("Subscribing for mined cancel events.");
    
    escrowContract.on("LogWithdraw", async (_sender,_transitAddress, _recepient, _amount, result) => {	
	try {
	    log.debug("Got mined withdraw event");
	    console.log(result);
	   	    
	    const event = {
		txStatus: 'success',
		txHash: result.transactionHash,
		eventName: 'withdraw',
	    };

	    const senderAddress = _sender.toLowerCase();
	    const transitAddress = _transitAddress.toLowerCase();
	    
	    await TransferService.addEvent({
		transferStatus: 'completed',
		event,
		senderAddress,
		transitAddress,
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
