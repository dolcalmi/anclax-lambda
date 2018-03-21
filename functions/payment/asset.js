const StellarSdk = require('stellar-sdk')

var issuer = 'GCBHF6PPWQOKFG6BMGXXV3WDCW63TJ5FETRFNDAG3COC3MDNOWWBQYKM'

module.exports = new StellarSdk.Asset(
  'COP',
  issuer
);
