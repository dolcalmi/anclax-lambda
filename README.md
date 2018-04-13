## Functions

### payments

```
apex invoke payment < event.json
```

### Account creation flow

1. create_account
2. buildTrust
3. AllowTrustTopicArn


### Payment flow

## Deploying


## Setup

## Testnet

- Create role for lambda
- Add policy anclax_lambda_logs
- Add policy based on AnclaxSnsPublish
- deploy with "apex deploy create-account --env=testnet"
- connect in aws console SNS queue to lambda


### Lambdas Setup

Before deploying add ENV vars to the following files functions/function-name/env.json

And then for deployment do `apex deploy --env-file functions/function-name/env.json`

#### Create account

```
{
    "SlackTopicArn": "arn:aws:sns:us-east-1:201246010122:a-production-anclax-sns-slack-message-testnet",
    "BuildTrustTopicArn": "arn:aws:sns:us-east-1:201246010122:a-production-anclax-sns-build-trust-testnet",
    "IssuingKeys": "Seed for account with enough lumens to create other accounts",
    "KMSKey": "arn for KMS",
    "Testnet": true
}
```
### Build Trust

```
{
    "PAYMENTS_PUBKEY": "KEYS USED TO MAKE PAYMENTS",
    "ADMIN_PUBKEY": "MASTER KEY SHOULD BE OFFLINE!",
    "KMSKey": "SET_ME",
    "SlackTopicArn": "arn:aws:sns:us-east-1:201246010122:a-production-anclax-sns-slack-message-testnet",
    "AllowTrustTopicArn": "arn:aws:sns:us-east-1:201246010122:a-production-anclax-sns-allow-trust-testnet"
}
```

### Allow trust

```
 {
    "COPAuthSeed": "SEED FOR ACCOUNT WITH ENOUGH PERMISSION TO SET TRUSTLINE",
    "SlackTopicArn": "arn:aws:sns:us-east-1:201246010122:a-production-anclax-sns-slack-message-testnet"
 }
```

### Payment

```
{
  "PaymentsSecret": "seed with permission to make payments on behalf of users",
  "SlackTopicArn": "arn:aws:sns:us-east-1:201246010122:a-production-anclax-sns-slack-message-testnet"
}
```