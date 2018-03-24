// Call locally with .default({}, {}, (a, b) => { console.log(b) })
import apex from 'apex.js'
import StellarSdk  from 'stellar-sdk'

import server from '../../../lib/server'
import { sendToSns, sendMessageToSlack, extractSnsMessage  } from '../../../lib/utils'
import decrypt from '../../../lib/decrypt'

async function buildTrust(secret, newAccount, awsRequestId) {
  try {
    await sendToSns({
      Message: JSON.stringify({
        secret
      }),
      TopicArn: process.env.BuildTrustTopicArn
    })
  } catch (e) {
    sendMessageToSlack(`<!everyone> :warning: sns-build-trust failed ${newAccount.publicKey()} - Lambda ID: ${awsRequestId}`)

    throw e
  }
}

export async function createAccount({ secret }, { awsRequestId }) {
  const accountSecret = await decrypt(secret)

  const issuingKeys = StellarSdk.Keypair.fromSecret(process.env.IssuingKeys)
  const issuingAccount = await server.loadAccount(issuingKeys.publicKey())

  const newAccount = StellarSdk.Keypair.fromSecret(accountSecret)

  console.log('creating account', newAccount.publicKey())

  const transaction = new StellarSdk.
        TransactionBuilder(issuingAccount)
        .addOperation(
          StellarSdk.Operation.createAccount({
            destination: newAccount.publicKey(),
            startingBalance: '2.6'
          })
        ).build()

  transaction.sign(issuingKeys)

  try {
    const result = await server.submitTransaction(transaction);

    await Promise.all([
      buildTrust(secret, newAccount, awsRequestId),
      sendMessageToSlack(`<!here> :+1: New account created ${newAccount.publicKey()}`)
    ])

    return { result }
  } catch (e) {
    await sendMessageToSlack(`<!everyone> :warning: Account creation failed ${newAccount.publicKey()} - Lambda ID: ${awsRequestId}`)

    throw e
  }
}

export default apex((e, c) => {
  return createAccount(extractSnsMessage(e), c);
})
