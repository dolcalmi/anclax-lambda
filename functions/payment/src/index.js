const StellarSdk = require('stellar-sdk')
const server = require('../../../lib/server')
const asset = require('../../../lib/asset')

exports.handle = function(e, ctx, cb) {
  var sourceSecretKey = e.sourceSecretKey
  var receiverPublicKey = e.receiverPublicKey
  var amount = e.amount

  var sourceKeypair = StellarSdk.Keypair.fromSecret(sourceSecretKey)
  var sourcePublicKey = sourceKeypair.publicKey()

  server.loadAccount(sourcePublicKey)
    .then(function(account) {
      var transaction = new StellarSdk.TransactionBuilder(account)
          .addOperation(StellarSdk.Operation.payment({
            destination: receiverPublicKey,
            asset,
            amount
          }))
          .build()

      transaction.sign(sourceKeypair)

      server.submitTransaction(transaction)
        .then(function(transactionResult) {
          console.log(JSON.stringify(transactionResult, null, 2))

          cb(null, transactionResult)
        })
        .catch(function(err) {
          console.log(err)

          cb(JSON.stringify(err))
        })
    })
    .catch(function(e) {
      console.error(e)
      cb(JSON.stringify(e))
    })
}
