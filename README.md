# Eth2Phone Server
Sending Ether to a phone number with user verification via SMS.

## Project Overview
Sending ether to mobile phone number. Receiver doesn’t even need to have a wallet, but simply needs to open the web app, follow simple steps and receive ether using one of the possible ways.

## Demo
Play with the demo at https://eth2phone.github.io/ . The demo app supports Ropsten network right now.

## Video:
* [Sending demo](https://screencast-o-matic.com/watch/cbQoD1IbCD)
* [Receiving demo](https://screencast-o-matic.com/watch/cbQoDXIbCp)

## Transfer details
![Architecture](/Algorithm.png)
1. Sender generates verification private-public key pair. Sender transfers ether to smart contract and assigns verification public key. On withdrawal smart-contract verifies that receiver's address is signed by the verification private key.
2. Sender encrypts verification private key with random secret code and sends encrypted keystore data to verification server.
3. Sender passes the secret code to receiver by the way he chooses (voice, sms, e-mail, etc.)
4. Receiver types in his phone number and the secret code. Hashed phone verification request is sent to server. (So not at any point in time verification server has the verification private key.)
5. Server sends the verification code via SMS to the phone entered.
6 Receiver gets the code from SMS and types it in. If the code is correct, server returns encrypted keystore data to receiver.
7. Receiver decrypts keystore data with the secret code provided by sender and gets verification private key. Receiver signs address to transfer to ether with verfication private key. Receiver sends signed address to verification server. Verification server tries to withdraw ether through smart-contract to signed address. If signature is correct, the transaction is executed and receiver gets the ether.

## Running on Ropsten
You should be good to go if you set Metamask to point at the correct network.
Load https://eth2phone.github.io/ and use the app.

## Code structure
`./src/controllers/SenderController` - controller for handling sender's requests

`./src/controllers/ReceiverController` - controller for handling receiver's requests

`./src/services/TwilioService` - service for SMS auth via Twilio

`./src/services/TransferService` - service for handling interaction with Transfer models stored in MongoDB

`./src/services/VerifiedProxyService` - service for handling interaction with VerifiedProxy Contract. 

This repo contains NodeJS server code for handling SMS-authentication. Front-end code + smart-contracts are located in the separate repository - https://github.com/Dobrokhvalov/eth2phone

## License
MIT Liscense
