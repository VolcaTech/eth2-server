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
    
    const transferFilterParams = {
	senderAddress,
	transitAddress,
    };

    const event = {
	txStatus,
	txHash,
	eventName,
	gasPrice
    };
    
    await TransferService.addEvent({transferStatus, event, transferFilterParams });
    res.json({success: true });    
}
    

module.exports = {
    addEvent,
}
