import AWS from 'aws-sdk'
const sns = new AWS.SNS()

export default {
  publish(params) {
    return new Promise((resolve, reject) => {
      sns.publish(params, (err, data) => {
        if (err)  {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  }
}
