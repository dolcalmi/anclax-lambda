// Call locally with .default({}, {}, (a, b) => { console.log(b) })
import apex from 'apex.js'
import StellarSdk  from 'stellar-sdk'

import extractSnsMessage from '../../../lib/extract-sns-message'
import server from '../../../lib/server'
import sns from '../../../lib/sns'

export async function createAccount({ destination }, { awsRequestId }) {
  const issuingKeys = StellarSdk.Keypair.fromSecret(process.env.IssuingKeys)

  const issuingAccount = await server.loadAccount(issuingKeys.publicKey())

  console.log('creating account', destination)

  const transaction = new StellarSdk.
        TransactionBuilder(issuingAccount)
        .addOperation(
          StellarSdk.Operation.createAccount({
            destination,
            startingBalance: '2.6'
          })
        ).build()

  transaction.sign(issuingKeys)

  try {
    const result = await server.submitTransaction(transaction);

    const snsResult = await sns.publish({
      Message: JSON.stringify({
        text: `<!here> :+1: New account created ${destination}`
      }),
      TopicArn: process.env.SlackTopicArn
    })

    return { result, snsResult }
  } catch (e) {
    await sns.publish({
      Message: JSON.stringify({
        text: `<!everyone> :warning: Account creation failed ${destination} - Lambda ID: ${awsRequestId}`
      }),
      TopicArn: process.env.SlackTopicArn
    })

    throw e
  }
}

export default apex((e, c) => {
  return createAccount(extractSnsMessage(e), c);
})
