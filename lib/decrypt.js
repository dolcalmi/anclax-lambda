var promisify = require('js-promisify');
var AWS = require('aws-sdk');

var kms = new AWS.KMS({
  region: 'us-east-1'
});

export default async function decrypt(text) {
  const buffer = new Buffer(text, 'hex')

  const params = {
    CiphertextBlob: buffer
  }

  const { Plaintext } = await promisify(kms.decrypt, [params], kms)

  return Plaintext.toString()
}
