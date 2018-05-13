const Promise = require("bluebird");
const config = require("../config/app-config");
const log  = require('./../libs/log')(module);
const CONTRACT_ABI = require("../contracts/e2pEscrow").abi;
const web3 = require('../utils/web3');

// init contract
const CONTRACT_ADDRESS = config.get("ESCROW_CONTRACT_ADDRESS");
const contractInstance = web3.eth.contract(CONTRACT_ABI).at(CONTRACT_ADDRESS);
Promise.promisifyAll(contractInstance, { suffix: "Promise" });    


const getByTransitAddress = async (transitAddress) => {
    function _parseTransfer(data) {
	return {
	    transitAddress: data[0].toString(),
	    from: data[1].toString('hex'),
	    amount: web3.fromWei(data[2], 'ether').toString(10)
	};
    }
    
    const transferData = await contractInstance.getTransferPromise(transitAddress);    
    return _parseTransfer(transferData);
}


const checkSignature = async (transitAddress, to, v, r, s) => {
    let isCorrect = false;
    try {
	log.debug(to, v, r, s);
	isCorrect = await contractInstance.verifyTransferSignaturePromise(transitAddress, to, v, r, s);
	log.debug("is correct signature:", isCorrect);
    } catch (err)  {
	log.error(err);
	throw new Error('Error occured while verifying signature!');
    }

    if (!isCorrect) {
	throw new Error('Wrong signature!');
    }
    
    return true;
}


const checkTransferStatusBeforeWithdraw = async (transitAddress) => {
    // transfer instance from blockchain
    const transferBc = await getByTransitAddress(transitAddress);

    // if no transfer in blockchain or no amount for transfer set
    if (!(transferBc && transferBc.amount > 0)) {
	throw new Error('No pending transfer found on blockchain!');
    }    
    return transferBc;
}


const withdraw = async (transitAddress, to, v, r, s) => {
    let result;
    try {
	log.debug({transitAddress, to, v, r, s});
	result = await contractInstance.withdrawPromise(transitAddress, to, v , r, s, {
	    from: config.get("ETHEREUM_ACCOUNT_ADDRESS"),
	    gas: 100000
	});
	log.debug("result: ", result);
	return result;
    } catch (err)  {
	log.error(err);
	throw new Error('Error occured while making transfer!');
    }
    
    return true;
}


module.exports = {
    checkSignature,
    withdraw,
    checkTransferStatusBeforeWithdraw,
}
