import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class MwaaHelloStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new cdk.aws_s3.Bucket(this, 'Bucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      versioned: true,
    });

    const vpc = new cdk.aws_ec2.Vpc(this, 'Vpc', {
      availabilityZones: ['ap-southeast-2a', 'ap-southeast-2b'],
      ipAddresses: ec2.IpAddresses.cidr('10.192.0.0/16'),
    });

    const securityGroup = new cdk.aws_ec2.SecurityGroup(this, 'MwaaSecurityGroup', {
      vpc,
    });
    securityGroup.addIngressRule(securityGroup, ec2.Port.allTraffic(),
      "allow all traffic from within the security group");

    const mwaaRole = buildMwaaRole(this, bucket);

    const mwaaEnvironment = new cdk.aws_mwaa.CfnEnvironment(this, 'MwaaEnvironment', {
      name: 'mwaa-hello',
      // airflowVersion: '2.0.2', // latest if omitted
      dagS3Path: `dags`,
      environmentClass: 'mw1.small',
      executionRoleArn: mwaaRole.roleArn,
      // executionRoleArn: 'arn:aws:iam::123456789012:role/airflow-role',
      // loggingConfiguration: {
      //   taskLogs: {
      //     cloudWatchLogGroupArn: 'arn:aws:logs:ap-southeast-2:123456789012:log-group:airflow-task-logs',
      //     enabled: true,
      //   },
      //   webserverLogs: {
      //     cloudWatchLogGroupArn: 'arn:aws:logs:ap-southeast-2:123456789012:log-group:airflow-webserver-logs',
      //     enabled: true,
      //   },
      //   workerLogs: {
      //     cloudWatchLogGroupArn: 'arn:aws:logs:ap-southeast-2:123456789012:log-group:airflow-worker-logs',
      //     enabled: true,
      //   },
      // },
      maxWorkers: 2,
      minWorkers: 1,
      networkConfiguration: {
        securityGroupIds: [securityGroup.securityGroupId],
        subnetIds: vpc.publicSubnets.map((subnet) => subnet.subnetId),
      },
      requirementsS3Path: `requirements.txt`,
      sourceBucketArn: bucket.bucketArn,
      webserverAccessMode: 'PUBLIC_ONLY',
      weeklyMaintenanceWindowStart: 'SUN:08:00',
    });
  }
}

// mostly copied from https://github.com/aws-samples/cdk-amazon-mwaa-cicd/blob/e61dc412205843913378494b866b458b0c312543/mwaairflow/nested_stacks/environment.py#L60
function buildMwaaRole(
  stack: cdk.Stack,
  bucket: cdk.aws_s3.Bucket)
{
  const role = new cdk.aws_iam.Role(stack, 'MwaaRole', {
    assumedBy: new cdk.aws_iam.ServicePrincipal('airflow-env.amazonaws.com'),
  });
  role.addToPolicy(new cdk.aws_iam.PolicyStatement({
    resources: [`arn:aws:airflow:${stack.region}:${stack.account}:environment/*`],
    actions: ['airflow:PublishMetrics'],
    effect: cdk.aws_iam.Effect.ALLOW,
  }));
  role.addToPolicy(new cdk.aws_iam.PolicyStatement({
    resources: [bucket.bucketArn],
    actions: [
      's3:GetObject*',
      's3:GetBucket*',
      's3:List*'
    ],
    effect: cdk.aws_iam.Effect.ALLOW,
  }));
  role.addToPolicy(new cdk.aws_iam.PolicyStatement({
    resources: [`arn:aws:logs:${stack.region}:${stack.account}:log-group:airflow*`],
    actions: [
      'logs:CreateLogStream',
      'logs:CreateLogGroup',
      'logs:PutLogEvents',
      'logs:GetLogEvents',
      'logs:GetLogRecord',
      'logs:GetLogGroupFields',
      'logs:GetQueryResults',
      'logs:DescribeLogStreams',
      'logs:DescribeLogGroups',
    ],
    effect: cdk.aws_iam.Effect.ALLOW,
  }));
  role.addToPolicy(new cdk.aws_iam.PolicyStatement({
    resources: ['*'],
    actions: ['cloudwatch:PutMetricData'],
    effect: cdk.aws_iam.Effect.ALLOW,
  }));
  role.addToPolicy(new cdk.aws_iam.PolicyStatement({
    resources: ['*'],
    actions: ['sts:AssumeRole'],
    effect: cdk.aws_iam.Effect.ALLOW,
  }));
  role.addToPolicy(new cdk.aws_iam.PolicyStatement({
    resources: [
      "arn:aws:secretsmanager:*:*:airflow/connections/*",
      "arn:aws:secretsmanager:*:*:airflow/variables/*",
    ],
    actions: [
      "secretsmanager:DescribeSecret",
      "secretsmanager:PutSecretValue",
      "secretsmanager:CreateSecret",
      "secretsmanager:DeleteSecret",
      "secretsmanager:CancelRotateSecret",
      "secretsmanager:ListSecretVersionIds",
      "secretsmanager:UpdateSecret",
      "secretsmanager:GetRandomPassword",
      "secretsmanager:GetResourcePolicy",
      "secretsmanager:GetSecretValue",
      "secretsmanager:StopReplicationToReplica",
      "secretsmanager:ReplicateSecretToRegions",
      "secretsmanager:RestoreSecret",
      "secretsmanager:RotateSecret",
      "secretsmanager:UpdateSecretVersionStage",
      "secretsmanager:RemoveRegionsFromReplication",
      "secretsmanager:ListSecrets",
    ],
    effect: cdk.aws_iam.Effect.ALLOW,
  }));
  role.addToPolicy(new cdk.aws_iam.PolicyStatement({
    resources: [
      `arn:aws:kms:*:${stack.account}:key/*`,
    ],
    actions: [
      "kms:Decrypt",
      "kms:DescribeKey",
      "kms:GenerateDataKey*",
      "kms:Encrypt",
    ],
    effect: cdk.aws_iam.Effect.ALLOW,
  }));
  return role;
}
