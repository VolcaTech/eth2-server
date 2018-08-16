const TransferService = require('../services/TransferService');
const config = require("../config/app-config");

const PARSER_API_KEY = config.get("PARSER_API_KEY");


const addEvent = async (req, res) => {
    const {
	senderAddress,
	transitAddress,
	txStatus,
	txHash,
	eventName,
	gasPrice,
	transferStatus,
	parserApiKey
    } = req.body;

    if (parserApiKey !== PARSER_API_KEY) {
	throw new Error("Wrong api key");
    }
    

    const event = {
	txStatus,
	txHash,
	eventName,
	gasPrice
    };

    console.log({event, senderAddress, transitAddress});
    
    await TransferService.addEvent({transferStatus, event, senderAddress, transitAddress });
    res.json({success: true });    
}
    

module.exports = {
    addEvent,
}
