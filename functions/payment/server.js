const StellarSdk = require('stellar-sdk')
StellarSdk.Network.useTestNetwork();
module.exports = new StellarSdk.Server('https://horizon-testnet.stellar.org');
