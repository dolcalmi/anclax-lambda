// Call locally with .default({}, {}, (a, b) => { console.log(b) })
import apex from 'apex.js'
import StellarSdk  from 'stellar-sdk'

import server from '../../../lib/server'

export async function createAccount({ destination }) {
  const issuingKeys = StellarSdk.Keypair.fromSecret('SBQWY3DNPFWGSZTFNV4WQZLBOJ2GQYLTMJSWK3TTMVQXEY3INFXGO52X')

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

  const result = await server.submitTransaction(transaction);

  return { result }
}

export default apex(e => {
  return createAccount(e);
})
