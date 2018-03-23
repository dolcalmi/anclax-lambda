export default function extractSnsMessage({ Records }) {
  const { Sns } = Records[0]

  return JSON.parse(Sns.Message)
}
