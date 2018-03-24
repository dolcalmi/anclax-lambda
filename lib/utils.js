import sns from './sns'

export async function sendToSns(params) {
  await sns.publish(params)
}

export async function sendMessageToSlack(text) {
  try {
    await sendToSns({
      Message: JSON.stringify({
        text
      }),
      TopicArn: process.env.SlackTopicArn
    })

  } catch(e) {
    console.log('slack-notification-failed')
  }
}

export function extractSnsMessage({ Records }) {
  const { Sns } = Records[0]

  return JSON.parse(Sns.Message)
}
