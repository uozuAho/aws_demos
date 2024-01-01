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

    const mwaaExecutionRole = new cdk.aws_iam.Role(this, 'MwaaExecutionRole', {
      assumedBy: new cdk.aws_iam.ServicePrincipal('airflow.amazonaws.com'),
      managedPolicies: [
        cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonMWAAExecutionRolePolicy'),
      ],
    });

    const mwaaEnvironment = new cdk.aws_mwaa.CfnEnvironment(this, 'MwaaEnvironment', {
      name: 'mwaa-hello',
      // airflowVersion: '2.0.2', // latest if omitted
      dagS3Path: `dags`,
      environmentClass: 'mw1.small',
      executionRoleArn: mwaaExecutionRole.roleArn,
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
