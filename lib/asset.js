const StellarSdk = require('stellar-sdk')

var issuer = 'GDMC5SF3RYXLBQAINESDWZPN5VKQ7LY2XT76VVNP7OKNCJCJRMOEAZCC'

module.exports = new StellarSdk.Asset(
  'COP',
  issuer
);
