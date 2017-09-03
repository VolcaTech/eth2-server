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

function* checkSignature(to, v, r, s, pubKey) {
    let addr;
    try {
	log.debug(to, v, r, s);
	addr = yield contractInstance.verifySignaturePromise(to, v, r, s);
	log.debug("addr:", addr);
    } catch (err)  {
	log.error(err);
	throw new BadRequestError('Error occured while verified signature!');
    }

    if (addr.toLowerCase() !== pubKey.toLowerCase()) {
	throw new BadRequestError('Wrong signature!');
    }
    
    return true;
}

function* withdraw(to, v, r, s, pubKey) {
    let addr;
    try {
	//const accounts = yield web3.eth.getAccountsPromise();
	yield web3.personal.unlockAccountPromise(config.get("ETHEREUM_ACCOUNT_ADDRESS"), config.get("ETHEREUM_ACCOUNT_PASSWORD"), 3600)
	result = yield contractInstance.withdrawPromise(pubKey, to, v, r, s, {
	    from: config.get("ETHEREUM_ACCOUNT_ADDRESS"),
	    gas: 1000000,
	    gasPrice: 2
	});
	log.debug("result", result);
	return result
    } catch (err)  {
	log.error(err);
	throw new BadRequestError('Error occured while making transfer!');
    }
    
    return true;
}


module.exports = {
    checkSignature,
    withdraw
}
