import apex from 'apex.js'
import StellarSdk  from 'stellar-sdk'

import server from '../../../lib/server'
import asset from '../../../lib/asset'

import { sendMessageToSlack, extractSnsMessage  } from '../../../lib/utils'

const authSeed = process.env.COPAuthSeed

export async function allowTrust({ trustor }, { awsRequestId }) {
  try {
    const issuingKeys = StellarSdk.Keypair.fromSecret(authSeed)
    const issuingAccount = await server.loadAccount(asset.issuer)
    const transaction = new StellarSdk.TransactionBuilder(issuingAccount)
          .addOperation(
            StellarSdk.Operation.allowTrust({
              trustor,
              assetCode: asset.code,
              authorize: true
            })
          )
          .build();

    transaction.sign(issuingKeys);

    console.log(`preparing to trust ${trustor} with key ${issuingKeys.publicKey()}`)

    const result = await server.submitTransaction(transaction)

    console.log(`${trustor} trusted`)

    await sendMessageToSlack(`<!here> :+1: ${trustor} is now trusted to hold COP`)

    return { result }
  } catch(e) {
    console.log(`failure ${e}`)

    await sendMessageToSlack(`<!everyone> :warning: Allow trust failed ${trustor} - Lambda ID: ${awsRequestId}`)

    throw e
  }
}

export default apex((e, c) => {
  return allowTrust(extractSnsMessage(e), c)
})
