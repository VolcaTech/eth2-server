const Promise = require("bluebird");
const BadRequestError = require('../libs/error').BadRequestError;
const config = require("../config/app-config");
const log  = require('./../libs/log')(module);

const CONTRACT_ABI = require("../contracts/e2pEscrow").abi;
const web3 = require('../utils/web3');

// init contract
const CONTRACT_ADDRESS = config.get("ESCROW_CONTRACT_ADDRESS");
const contractInstance = web3.eth.contract(CONTRACT_ABI).at(CONTRACT_ADDRESS);
Promise.promisifyAll(contractInstance, { suffix: "Promise" });    


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
}
