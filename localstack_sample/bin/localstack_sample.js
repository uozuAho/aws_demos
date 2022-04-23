#!/usr/bin/env node
const cdk = require('aws-cdk-lib');
const { LocalstackSampleStack } = require('../lib/localstack_sample-stack');

const app = new cdk.App();
new LocalstackSampleStack(app, 'LocalstackSampleStack');
