const StellarSdk = require('stellar-sdk')

const Mainnet = process.env.Mainnet
let server

if (Mainnet) {
  console.log('Using mainnet')
  StellarSdk.Network.usePublicNetwork();

  server = new StellarSdk.Server('https://horizon.stellar.org');
} else {
  console.log('Using testnet')
  StellarSdk.Network.useTestNetwork();
  server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
}



module.exports = server
