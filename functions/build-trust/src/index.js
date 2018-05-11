// Call locally with .default({}, {}, (a, b) => { console.log(b) })
import apex from 'apex.js'
import StellarSdk  from 'stellar-sdk'

import server from '../../../lib/server'

import { sendToSns, sendMessageToSlack, extractSnsMessage  } from '../../../lib/utils'
import decrypt from '../../../lib/decrypt'

const paymentsPkey = process.env['PAYMENTS_PUBKEY']
const adminPkey = process.env['ADMIN_PUBKEY']
const authSeed = process.env['AUTH_SEED']

async function allowTrust(trustor, assetInfo, awsRequestId) {
  try {
    await sendToSns({
      Message: JSON.stringify({
        trustor,
        assetInfo
      }),
      TopicArn: process.env.AllowTrustTopicArn
    })
  } catch (e) {
    sendMessageToSlack(`<!everyone> :warning: sns-allow-trust failed ${trustor} - Lambda ID: ${awsRequestId}`)
  }
}

export async function buildTrust({ secret, assetInfo }, { awsRequestId }) {
  try {
    const asset  = new StellarSdk.Asset(
      assetInfo.code,
      assetInfo.issuer
    )

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
              weight: 5
            }
          }))
        .addOperation(
          StellarSdk.Operation.setOptions({
            masterWeight: 0, // set master key weight to 1
            lowThreshold: 1,
            medThreshold: 2,
            highThreshold: 5
          }))
        .build();

    transaction.sign(trusterKeys)

    const result = await server.submitTransaction(transaction)

    console.log('trustline created from  account to issuer and signers updated')

    await sendMessageToSlack(`<!here> :+1: Change trust and set Options set for ${trusterKeys.publicKey()} - trusting ${assetInfo.code} issued by ${assetInfo.issuer}`)
    await allowTrust(trusterKeys.publicKey(), assetInfo, awsRequestId)


    return { result }
  } catch(e) {
    await sendMessageToSlack(`<!everyone> :warning: Build trust failed ${trusterKeys.publicKey()} - Lambda ID: ${awsRequestId}`)

    throw e
  }
}

export default apex((e, c) => {
  return buildTrust(extractSnsMessage(e), c)
})
