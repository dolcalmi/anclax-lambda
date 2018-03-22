// Call locally with .default({}, {}, (a, b) => { console.log(b) })
import apex from 'apex.js'
import request from 'request'

export async function slackMessage({ text }) {
  const result = await request.post(process.env['WEBHOOK_URL']).json({ text })

  return result
}

export default apex(e => {
  return slackMessage(e);
})
