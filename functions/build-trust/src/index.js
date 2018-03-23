// Call locally with .default({}, {}, (a, b) => { console.log(b) })
import apex from 'apex.js'
import StellarSdk  from 'stellar-sdk'

import server from '../../../lib/server'
import asset from '../../../lib/asset'

const paymentsPkey = process.env['PAYMENTS_PUBKEY']
const adminPkey = process.env['ADMIN_PUBKEY']
const authSeed = process.env['AUTH_SEED']

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

  await server.submitTransaction(transaction)

  // now generate trustline from anchor to account
  const issuingKeys = StellarSdk.Keypair.fromSecret(authSeed)

  const issuingAccount = await server.loadAccount(issuingKeys.publicKey())

  const transaction2 = new StellarSdk.TransactionBuilder(issuingAccount)
      .addOperation(
        StellarSdk.Operation.allowTrust({
          trustor: trusterKeys.publicKey(),
          assetCode: asset.code,
          authorize: true,
          source: asset.issuer
        })
      )
      .build();

  transaction2.sign(issuingKeys);
  const result = await server.submitTransaction(transaction2);

  return { result }
}

export default apex(e => {
  return buildTrust(e);
})
