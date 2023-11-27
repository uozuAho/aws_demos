import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsManager from 'aws-cdk-lib/aws-secretsmanager';
import * as ssm from 'aws-cdk-lib/aws-ssm';


export class OracleMigrateSrcStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'MyVpc', {
      availabilityZones: ['ap-southeast-2a', 'ap-southeast-2b'],
      ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
      // defaults:
      // createInternetGateway: true,
      // create public and private subnets
      // create route table
      // create NAT gateways?
      // see https://docs.aws.amazon.com/cdk/api/v2/python/aws_cdk.aws_ec2/Vpc.html
    });

    // db goes in a public subnet, for easier access. Don't do this at home!
    const subnetGroup = new rds.SubnetGroup(this, 'DBSubnetGroup', {
      description: 'Subnet group for RDS instance',
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const securityGroup = new ec2.SecurityGroup(this, 'DBSecurityGroup', {
      vpc,
      description: 'Allow inbound access to the RDS instance',
      allowAllOutbound: true,
    });
    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(1521),
      'Allow inbound access to the RDS instance'
    );

    const databaseUsername = 'admin';

    const databaseCredentialsSecret = new secretsManager.Secret(this,
      'DBCredentialsSecret',
    {
      secretName: 'oracle-migrate-src-db-credentials',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          username: databaseUsername,
        }),
        excludePunctuation: true,
        includeSpace: false,
        generateStringKey: 'password',
        passwordLength: 20,
      }
    });

    new ssm.StringParameter(this, 'DBCredentialsArn', {
      parameterName: 'oracle-migrate-src-db-credentials',
      stringValue: databaseCredentialsSecret.secretArn,
    });

    new rds.DatabaseInstance(this, 'Database', {
      engine: rds.DatabaseInstanceEngine.oracleSe2({
        version: rds.OracleEngineVersion.VER_19_0_0_0_2023_10_R1,
      }),
      vpc,
      subnetGroup: subnetGroup,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE3, ec2.InstanceSize.SMALL),
      licenseModel: rds.LicenseModel.LICENSE_INCLUDED,
      credentials: rds.Credentials.fromSecret(databaseCredentialsSecret),
      publiclyAccessible: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      securityGroups: [securityGroup]
    });
  }
}
