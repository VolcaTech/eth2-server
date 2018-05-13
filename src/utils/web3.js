const config = require("../config/app-config");
const net = require('net');
const Web3 = require("web3");
const Promise = require("bluebird");


function getWeb3() {
    const web3 = new Web3(new Web3.providers.IpcProvider(process.env['HOME'] + config.get("GETH_LOCATION"), net));
    Promise.promisifyAll(web3.eth, { suffix: "Promise" });
    Promise.promisifyAll(web3.personal, { suffix: "Promise" });
    return web3;
}

module.exports = getWeb3();
