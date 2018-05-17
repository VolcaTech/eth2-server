# Eth2Phone
Sending Ether to a phone number with user verification via SMS.

## Project Overview
Sending ether to mobile phone number. Receiver doesn’t even need to have a wallet, but simply needs to open the web app, follow simple steps and receive ether using one of the possible ways.

## Demo
Play with the demo at https://eth2phone.github.io/ . The demo app supports Ropsten and Mainnet networks right now.

## Video: 
* [Sending demo](https://screencast-o-matic.com/watch/cbQoD1IbCD)
* [Receiving demo](https://screencast-o-matic.com/watch/cbQoDXIbCp)

## Transfer details
### Send
![Send](/public/send.png)
1. Sender generates transit private-public key pair.
2. Sender deposits ether to escrow smart contract and assigns transit public key to the deposit. On withdrawal escrow smart-contract verifies that receiver's address is signed by the transit private key.
3. Sender encrypts transit private key with random secret code and sends encrypted transit private key to verification server.
4. Sender passes the secret code to receiver by the way he chooses (voice, sms, e-mail, etc.)

### Receive
![Receive](/public/receive.png)
1. Receiver types in his phone number and the secret code. Hashed phone verification request is sent to server. (So not at any point in time verification server has the transit private key.)
2. Server sends the verification code via SMS to the phone entered.
3. Receiver gets the code from SMS and types it in. If the code is correct, server returns encrypted transit private key to receiver.
4. Receiver decrypts the transit private key with the secret code provided by sender and gets the transit private key. Receiver signs address of his choice with the transit private key. Receiver sends signed address to verification server.
5. Verification server tries to withdraw ether from escrow smart-contract to signed address. If signature is correct, the transaction is executed and receiver gets the ether.

## Running on Ropsten or Mainnet
Works best with Trust Wallet on mobile. You can also use a browser with Metamask on desktop.
Load https://eth2phone.github.io/ and use the app.


## Code structure
`./src/controllers/SenderController` - controller for handling sender's requests

`./src/controllers/ReceiverController` - controller for handling receiver's requests

`./src/services/TwilioService` - service for SMS auth via Twilio

`./src/services/TransferService` - service for handling interaction with Transfer models stored in MongoDB

`./src/services/EscrowContratService` - service for handling interaction with Ethereum blockchain via e2pEscrow Contract.


This repo contains NodeJS server code for handling SMS-authentication. Front-end code + smart-contracts are located in the separate repository - https://github.com/Dobrokhvalov/eth2phone

## License
MIT Liscense 
