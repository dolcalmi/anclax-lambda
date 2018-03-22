// Call locally with .default({}, {}, (a, b) => { console.log(b) })
import apex from 'apex.js'
import StellarSdk  from 'stellar-sdk'

import server from '../../../lib/server'
import asset from '../../../lib/asset'

const paymentsPkey = process.env['PAYMENTS_PUBKEY']
const adminPkey = process.env['ADMIN_PUBKEY']

export async function buildTrust({ seed }) {
  var trusterKeys = StellarSdk.Keypair.fromSecret(seed);

  const truster = await server.loadAccount(trusterKeys.publicKey())

  var transaction = new StellarSdk.TransactionBuilder(truster)
      .addOperation(
        StellarSdk.Operation.changeTrust({
          asset
        }))
      .addOperation(
        StellarSdk.Operation.setOptions({
          signer: {
            ed25519PublicKey: paymentsPkey,
            weight: 2
          }
        })
      )
      .addOperation(
        StellarSdk.Operation.setOptions({
          signer: {
            ed25519PublicKey: adminPkey,
            weight: 3
          }
        }))
      .addOperation(
        StellarSdk.Operation.setOptions({
          masterWeight: 1, // set master key weight to 0
          lowThreshold: 1,
          medThreshold: 2,
          highThreshold: 3
        }))
      .build();

  transaction.sign(trusterKeys)

  const result = await server.submitTransaction(transaction)

  return { result }
}

export default apex(e => {
  return buildTrust(e);
})
