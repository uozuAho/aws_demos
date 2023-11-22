const { DynamoDBClient, UpdateItemCommand } = require("@aws-sdk/client-dynamodb");
const { LambdaClient, InvokeCommand } = require("@aws-sdk/client-lambda");

exports.handler = async function(event) {
  console.log("request:", JSON.stringify(event, undefined, 2));

  const dynamo = new DynamoDBClient();
  const lambda = new LambdaClient();

  // update dynamo entry for "path" with hits++
  const updateCommand = new UpdateItemCommand({
    TableName: process.env.HITS_TABLE_NAME,
    Key: { path: { S: event.path } },
    UpdateExpression: 'ADD hits :incr',
    ExpressionAttributeValues: { ':incr': { N: '1' } }
  });
  await dynamo.send(updateCommand);

  // call downstream function and capture response
  const invokeCommand = new InvokeCommand({
    FunctionName: process.env.DOWNSTREAM_FUNCTION_NAME,
    Payload: JSON.stringify(event)
  });
  const resp = await lambda.send(invokeCommand);

  const payloadStr = resp.Payload.transformToString();
  console.log('downstream response:', JSON.stringify(resp, undefined, 2));
  console.log('downstream payload:', payloadStr);

  // return response back to upstream caller
  return JSON.parse(payloadStr);
};
