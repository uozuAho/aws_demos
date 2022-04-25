/*
This code uses callbacks to handle asynchronous function responses.
It currently demonstrates using an async-await pattern.
AWS supports both the async-await and promises patterns.
For more information, see the following:
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises
https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/calling-services-asynchronously.html
https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-handler.html
*/
const { S3Client, ListObjectsCommand } = require('@aws-sdk/client-s3');

const bucketName = process.env.BUCKET;

function buildS3Client() {
  if (process.env.LOCALSTACK_HOSTNAME) {
    const host = process.env.LOCALSTACK_HOSTNAME;
    const port = process.env.EDGE_PORT;
    return new S3Client({endpoint: `http://${host}:4566`});
  } else {
    return new S3Client();
  }
}

exports.main = async function(event, context) {
  try {
    var method = event.httpMethod;

    if (method === "GET") {
      if (event.path === "/") {
        const s3client = buildS3Client();
        const data = await s3client.send(new ListObjectsCommand({
          Bucket: bucketName,
        }));
        var body = {
          widgets: data.Contents.map(function(e) { return e.Key })
        };
        return {
          statusCode: 200,
          headers: {},
          body: JSON.stringify(body)
        };
      }
    }

    // We only accept GET for now
    return {
      statusCode: 400,
      headers: {},
      body: "We only accept GET /"
    };
  } catch(error) {
    var body = error.stack || JSON.stringify(error, null, 2);
    console.error(error);
    return {
      statusCode: 400,
        headers: {},
        body: `${process.env.LOCALSTACK_HOSTNAME}` + JSON.stringify(body)
    }
  }
}
