import apex from 'apex.js'
import StellarSdk  from 'stellar-sdk'

import server from '../../../lib/server'
import { sendMessageToSlack, extractSnsMessage  } from '../../../lib/utils'

const paymentsSecret = process.env.PaymentSecret

export async function pay({ sourcePublicKey, receiverPublicKey, amount, assetInfo, memo }, { awsRequestId }) {
  const asset  = new StellarSdk.Asset(
    assetInfo.code,
    assetInfo.issuer
  )

  const signerKeys = StellarSdk.Keypair.fromSecret(paymentsSecret)
  const account = await server.loadAccount(sourcePublicKey)

  console.log(`new payment from  ${sourcePublicKey} to ${receiverPublicKey}`)

  let transaction = new StellarSdk.TransactionBuilder(account)
      .addOperation(
        StellarSdk.Operation.payment({
          destination: receiverPublicKey,
          asset,
          amount
        })
      ).addMemo(
        StellarSdk.Memo.hash(memo)
      ).build()

  transaction.sign(signerKeys)

  try {
    const result = await server.submitTransaction(transaction)

    try {
      await sendMessageToSlack(`<!here> :+1: New payment from ${sourcePublicKey} to ${receiverPublicKey} - amount: ${amount} - asset: ${assetInfo.code}`)
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
