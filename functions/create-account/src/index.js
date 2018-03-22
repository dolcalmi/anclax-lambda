// Call locally with .default({}, {}, (a, b) => { console.log(b) })
import apex from 'apex.js'
import StellarSdk  from 'stellar-sdk'

import server from '../../../lib/server'

export async function createAccount(e) {
  const issuingKeys = StellarSdk.Keypair.fromSecret('SBQWY3DNPFWGSZTFNV4WQZLBOJ2GQYLTMJSWK3TTMVQXEY3INFXGO52X')

  const account = await server.loadAccount(issuingKeys.publicKey())

  return { account }
}

export default apex(e => {
  return createAccount(e);
})
