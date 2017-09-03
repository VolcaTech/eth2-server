const net = require('net');
const Web3 = require("web3");
const Promise = require("bluebird");
const BadRequestError = require('../libs/error').BadRequestError;
const config = require("../config/app-config");
const log  = require('./../libs/log')(module);

function getWeb3() {
    const web3 = new Web3(new Web3.providers.IpcProvider(process.env['HOME'] + config.get("GETH_LOCATION"), net));
    Promise.promisifyAll(web3.eth, { suffix: "Promise" });
    Promise.promisifyAll(web3.personal, { suffix: "Promise" });    
    return web3;
}

const web3 = getWeb3();
const CONTRACT_ABI = require("../contracts/VerifiedProxy");
const CONTRACT_ADDRESS = config.get("VERIFIED_CONTRACT_ADDRESS");
const contractInstance = web3.eth.contract(CONTRACT_ABI).at(CONTRACT_ADDRESS);

Promise.promisifyAll(contractInstance, { suffix: "Promise" });    

function* checkSignature(transferId, to, v, r, s) {
    let isCorrect = false;
    try {
	log.debug(to, v, r, s);
	isCorrect = yield contractInstance.verifyTransferSignaturePromise(transferId, to, v, r, s);
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





function* getByTransferId(transferId) {
    function _parseTransfer(data) {
	return {
	    id: data[0].toString(),
	    status: data[1].toNumber(),
	    from: data[2].toString('hex'),
	    amount: data[3].toNumber(),
	    blocknumber: data[4].toNumber()
	};
    }
    
    const transferData = yield contractInstance.getTransferPromise(transferId);    
    return _parseTransfer(transferData);
}


function* checkTransferStatusBeforeWithdraw(transferId) {
    // transfer instance from blockchain
    const transferBc = yield getByTransferId(transferId)
    if (!transferBc) {
	throw new BadRequestError('No transfer found on blockchain!');
    }
    
    if (transferBc.status !== 0) {
	if (transferBc.status === 1) {
	    throw new BadRequestError("Transfer has been already received!");
	} else if (transferBc.status === 2) {
	    throw new BadRequestError("Transfer can't be received! Transfer has been cancelled" );
	} else {
	    throw new BadRequestError("Transfer can't be received! Transfer status: " + transferBc.status);
	}
    }
    return true;
}


function* withdraw(transferId, to, v, r, s) {
    let result;
    try {
	//const accounts = yield web3.eth.getAccountsPromise();
	yield web3.personal.unlockAccountPromise(config.get("ETHEREUM_ACCOUNT_ADDRESS"), config.get("ETHEREUM_ACCOUNT_PASSWORD"), 3600)
	log.debug({transferId,to, v,r,s})
	result = yield contractInstance.withdrawPromise(transferId, to, v , r, s, {
	    from: config.get("ETHEREUM_ACCOUNT_ADDRESS"),
	    gas: 500000
	});
	log.debug("result: ", result);
	return result
    } catch (err)  {
	log.error(err);
	throw new BadRequestError('Error occured while making transfer!');
    }
    
    return true;
}


module.exports = {
    checkSignature,
    withdraw,
    getByTransferId,
    checkTransferStatusBeforeWithdraw
}
