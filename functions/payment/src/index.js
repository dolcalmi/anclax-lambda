import apex from 'apex.js'
import StellarSdk  from 'stellar-sdk'

import server from '../../../lib/server'
import asset from '../../../lib/asset'
import { sendMessageToSlack, extractSnsMessage  } from '../../../lib/utils'

const paymentsSecret = process.env.PaymentsSecret

export async function pay({ sourcePublicKey, receiverPublicKey, amount }, { awsRequestId }) {
  const signerKeys = StellarSdk.Keypair.fromSecret(paymentsSecret)
  const account = await server.loadAccount(sourcePublicKey)

  console.log(`new payment from  ${sourcePublicKey} to ${receiverPublicKey}`)

  const transaction = new StellarSdk.TransactionBuilder(account)
      .addOperation(
        StellarSdk.Operation.payment({
          destination: receiverPublicKey,
          asset,
          amount
        })
      ).build()

  transaction.sign(signerKeys)

  try {
    const result = await server.submitTransaction(transaction)

    try {
      await sendMessageToSlack(`<!here> :+1: New payment from ${sourcePublicKey} to ${receiverPublicKey} - amount: ${amount}`)
    } catch(e) {
      console.log(`slack notification failure ${e}`)
    }

    return { result }
  } catch(e) {
    console.log(`failure ${e}`)

    await sendMessageToSlack(`<!everyone> :warning: payment failed from ${sourcePublicKey} to ${receiverPublicKey} - Lambda ID: ${awsRequestId}`)

    throw e
  }
}

export default apex((e, c) => {
  return pay(extractSnsMessage(e), c)
})
