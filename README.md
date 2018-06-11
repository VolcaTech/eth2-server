# Eth2Phone
Eth2Phone DApp allows you to send ether to anyone simply identifying them by SMS verification.

## Overview
Eth2Phone allows to send ether to anyone even without Ethereum wallet. The receiver will get the special link and be verified using phone number. The only requirement for you as a sender to have the Web3 compatible Ethereum wallet with sufficient balance and the phone number of the person you are willing to send ether to. You will need to share a special message with the receiver with the link containing all the instructions, following which he or she will download the wallet (or use existing one) and receive assets to it.

## Beta
You can play with beta at https://eth2.io. The DApp supports Ethereum Main and Ropsten Test networks right now.

## Video: 
* [Sending demo](https://www.youtube.com/watch?v=FeqQyFrmptA)
* [Receiving demo](https://www.youtube.com/watch?v=qp3kkXKIHP8)


## Transfer details
### Send
![Send](/public/eth2phone_send.png)
1. Sender generates transit private-public key pair, deposits ether to Escrow Smart Contract and assigns transit public key to the deposit. On withdrawal Escrow Smart Contract verifies that receiver's address is signed by the transit private key.
2. Sender encrypts transit private key with random secret code and sends encrypted transit private key to verification server.
3. Sender passes the secret code to receiver by the way he chooses (voice, sms, e-mail, etc.)

### Receive
![Receive](/public/eth2phone_receive.png)
1. Receiver types in his phone number and the secret code. Hashed phone verification request is sent to server. (So not at any point in time verification server has the transit private key.)
2. Server sends the verification code via SMS to the phone entered.
3. Receiver gets the code from SMS and types it in. If the code is correct, server returns encrypted transit private key to receiver.
4. Receiver decrypts the transit private key with the secret code provided by sender and gets the transit private key. Receiver signs address of his choice with the transit private key. Receiver sends signed address to verification server.
5. Verification server tries to withdraw ether from Escrow Smart Contract to signed address. If signature is correct, the transaction is executed and receiver gets the ether.

## Running on Ropsten or Mainnet
Works best with [Trust Wallet](http://trustwalletapp.com) on mobile. You can also use a Desktop Browser with installed Metamask or any Web3 compatible browsers. Go to https://eth2.io to use the DApp.


## Code structure
`./src/controllers/SenderController` - controller for handling sender's requests

`./src/controllers/ReceiverController` - controller for handling receiver's requests

`./src/services/TwilioService` - service for SMS auth via Twilio

`./src/services/TransferService` - service for handling interaction with Transfer models stored in MongoDB

`./src/services/EscrowContratService` - service for handling interaction with Ethereum blockchain via e2pEscrow Contract.


This repo contains NodeJS server code for handling SMS-authentication. Front-end code + smart-contracts are located in the separate repository - https://github.com/eth2phone/eth2phone-dapp

## License
MIT Liscense 
