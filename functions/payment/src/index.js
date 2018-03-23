import apex from 'apex.js'
import StellarSdk  from 'stellar-sdk'

import server from '../../../lib/server'
import asset from '../../../lib/asset'

export async function pay({ signerSecret , sourcePublicKey, receiverPublicKey, amount }) {
  const sourceKeypair = StellarSdk.Keypair.fromSecret(signerSecret)
  const account = await server.loadAccount(sourcePublicKey)

  const transaction = new StellarSdk.TransactionBuilder(account)
      .addOperation(
        StellarSdk.Operation.payment({
          destination: receiverPublicKey,
          asset,
          amount
        })
      ).build()

  transaction.sign(sourceKeypair)

  const result = await server.submitTransaction(transaction)

  return { result }
}

export default apex(e => {
  return pay(e);
})
