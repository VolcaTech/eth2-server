const net = require('net');
const Web3 = require("web3");
const Promise = require("bluebird");
const BadRequestError = require('../libs/error').BadRequestError;
const config = require("../config/app-config");
const log  = require('./../libs/log')(module);
// const TransferService = require('./TransferService');


function getWeb3() {
    const web3 = new Web3(new Web3.providers.IpcProvider(process.env['HOME'] + config.get("GETH_LOCATION"), net));
    Promise.promisifyAll(web3.eth, { suffix: "Promise" });
    Promise.promisifyAll(web3.personal, { suffix: "Promise" });
    return web3;
}

const web3 = getWeb3();
const CONTRACT_ABI = require("../contracts/e2pEscrow").abi;
const CONTRACT_ADDRESS = config.get("ESCROW_CONTRACT_ADDRESS");
const contractInstance = web3.eth.contract(CONTRACT_ABI).at(CONTRACT_ADDRESS);

Promise.promisifyAll(contractInstance, { suffix: "Promise" });    


function subscribeForPendingEvents() {
    // log.debug("Subscribing for pending events.");	
    //var options = {address: CONTRACT_ADDRESS, fromBlock: 'earliest', toBlock: 'earliest'};
    //var filter = web3.eth.filter(options);
    var myEvent = contractInstance.LogDeposit({}, {fromBlock: 'pending', toBlock: 'pending'});
    

    myEvent.watch((error, tx) => {
	// try { 
	//     const tx = await web3.eth.getTransactionPromise(txHash);
	//     if (tx.to === CONTRACT_ADDRESS) {
	log.debug("GOT PENDING EVENT: ");
	log.debug(tx);
	//     }
	// } catch(err) {
	//     log.debug(err);
	// }
    });
}

function* getByTransitAddress(transitAddress) {
    function _parseTransfer(data) {
	return {
	    transitAddress: data[0].toString(),
	    from: data[1].toString('hex'),
	    amount: web3.fromWei(data[2], 'ether').toString(10)
	};
    }
    
    const transferData = yield contractInstance.getTransferPromise(transitAddress);    
    return _parseTransfer(transferData);
}


function* checkSignature(transitAddress, to, v, r, s) {
    let isCorrect = false;
    try {
	log.debug(to, v, r, s);
	isCorrect = yield contractInstance.verifyTransferSignaturePromise(transitAddress, to, v, r, s);
	log.debug("is correct signature:", isCorrect);
    } catch (err)  {
	log.error(err);
	throw new BadRequestError('Error occured while verifying signature!');
    }

    if (!isCorrect) {
	throw new BadRequestError('Wrong signature!');
    }
    
    return true;
}


function* checkTransferStatusBeforeWithdraw(transitAddress) {
    // transfer instance from blockchain
    const transferBc = yield getByTransitAddress(transitAddress);
    // log.debug({transferBc, transitAddress});
    // if no transfer in blockchain or no amount for transfer set
    if (!(transferBc && transferBc.amount > 0)) {
	throw new BadRequestError('No pending transfer found on blockchain!');
    }    
    return transferBc;
}


function* withdraw(transitAddress, to, v, r, s) {
    let result;
    try {
	log.debug({transitAddress, to, v, r, s});
	result = yield contractInstance.withdrawPromise(transitAddress, to, v , r, s, {
	    from: config.get("ETHEREUM_ACCOUNT_ADDRESS"),
	    gas: 100000
	});
	log.debug("result: ", result);
	return result;
    } catch (err)  {
	log.error(err);
	throw new BadRequestError('Error occured while making transfer!');
    }
    
    return true;
}


module.exports = {
    checkSignature,
    withdraw,
    checkTransferStatusBeforeWithdraw,
    subscribeForPendingEvents
}
