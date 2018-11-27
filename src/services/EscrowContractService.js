const Promise = require("bluebird");
const config = require("../config/app-config");
const log  = require('./../libs/log')(module);
const CONTRACT_ABI = require("../contracts/e2pEscrow").abi;
const web3 = require('../utils/web3');

const ethers = require('ethers');
const provider = ethers.getDefaultProvider(config.get('ETHEREUM_NETWORK'));
const wallet = new ethers.Wallet(config.get("ETHEREUM_ACCOUNT_PK"), provider);

// init contract
const CONTRACT_ADDRESS = config.get("ESCROW_CONTRACT_ADDRESS");
const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);



const getByTransitAddress = async (transitAddress) => {
    function _parseTransfer(data) {
	return {
	    transitAddress: data[0].toString(),
	    from: data[1].toString('hex'),
	    amount: ethers.utils.formatEther(data[2])
	};
    }
    
    const transferData = await contractInstance.getTransfer(transitAddress);
    console.log({transferData});
    return _parseTransfer(transferData);
}


const checkSignature = async (transitAddress, to, v, r, s) => {
    let isCorrect = false;
    try {
	log.debug(to, v, r, s);
	isCorrect = await contractInstance.verifyTransferSignature(transitAddress, to, v, r, s);
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
	result = await contractInstance.withdraw(transitAddress, to, v , r, s);
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
    contractInstance
}
