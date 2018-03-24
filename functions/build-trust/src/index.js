// Call locally with .default({}, {}, (a, b) => { console.log(b) })
import apex from 'apex.js'
import StellarSdk  from 'stellar-sdk'

import server from '../../../lib/server'
import asset from '../../../lib/asset'

import { sendToSns, sendMessageToSlack, extractSnsMessage  } from '../../../lib/utils'
import decrypt from '../../../lib/decrypt'

const paymentsPkey = process.env['PAYMENTS_PUBKEY']
const adminPkey = process.env['ADMIN_PUBKEY']
const authSeed = process.env['AUTH_SEED']

async function allowTrust(trustor, awsRequestId) {
  try {
    await sendToSns({
      Message: JSON.stringify({
        trustor
      }),
      TopicArn: process.env.AllowTrustTopicArn
    })
  } catch (e) {
    sendMessageToSlack(`<!everyone> :warning: sns-allow-trust failed ${trustor} - Lambda ID: ${awsRequestId}`)

    throw e
  }
}

export async function buildTrust({ secret }, { awsRequestId }) {
  try {
    const accountSecret = await decrypt(secret)

    var trusterKeys = StellarSdk.Keypair.fromSecret(accountSecret);

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

    console.log('trustline created from  account to issuer and signers updated')
    await Promise.all([
      sendMessageToSlack(`<!here> :+1: Change trust and Set Options set for ${trusterKeys.publicKey()}`),
      allowTrust(trusterKeys.publicKey(), awsRequestId)
    ])

    return { result }
  } catch(e) {
    await sendMessageToSlack(`<!everyone> :warning: Build trust failed ${trusterKeys.publicKey()} - Lambda ID: ${awsRequestId}`)

    throw e
  }
}

export default apex((e, c) => {
  return buildTrust(extractSnsMessage(e), c)
})
