import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsManager from 'aws-cdk-lib/aws-secretsmanager';
import * as ssm from 'aws-cdk-lib/aws-ssm';


export class OracleMigrateSrcStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const srcVpc = new ec2.Vpc(this, 'SrcVpc', {
      availabilityZones: ['ap-southeast-2a', 'ap-southeast-2b'],
      ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
    });

    const tgtVpc = new ec2.Vpc(this, 'TgtVpc', {
      availabilityZones: ['ap-southeast-2a', 'ap-southeast-2b'],
      ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
    });

    // db goes in a public subnet, for easier access. Don't do this at home!
    const srcSubnetGroup = new rds.SubnetGroup(this, 'SrcSubnetGroup', {
      description: 'Subnet group for source RDS instance',
      vpc: srcVpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const tgtSubnetGroup = new rds.SubnetGroup(this, 'TgtSubnetGroup', {
      description: 'Subnet group for target RDS instance',
      vpc: tgtVpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const srcSecurityGroup = new ec2.SecurityGroup(this, 'SrcDbSecurityGroup', {
      vpc: srcVpc,
      description: 'Allow inbound access to the RDS instance',
      allowAllOutbound: true,
    });
    srcSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(1521),
      'Allow inbound access to the RDS instance'
    );

    const tgtSecurityGroup = new ec2.SecurityGroup(this, 'TgtDbSecurityGroup', {
      vpc: tgtVpc,
      description: 'Allow inbound access to the RDS instance',
      allowAllOutbound: true,
    });
    tgtSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(1521),
      'Allow inbound access to the RDS instance'
    );

    const srcDatabaseUsername = 'srcAdmin';
    const tgtDatabaseUsername = 'tgtAdmin';

    const srcDatabaseCredentialsSecret = new secretsManager.Secret(this,
      'SrcDBCredentialsSecret',
    {
      secretName: 'oracle-migrate-src-db-credentials',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          username: srcDatabaseUsername,
        }),
        excludePunctuation: true,
        includeSpace: false,
        generateStringKey: 'password',
        passwordLength: 20,
      }
    });

    const tgtDatabaseCredentialsSecret = new secretsManager.Secret(this,
      'TgtDBCredentialsSecret',
    {
      secretName: 'oracle-migrate-tgt-db-credentials',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          username: tgtDatabaseUsername,
        }),
        excludePunctuation: true,
        includeSpace: false,
        generateStringKey: 'password',
        passwordLength: 20,
      }
    });

    new ssm.StringParameter(this, 'SrcDBCredentialsArn', {
      parameterName: 'oracle-migrate-src-db-credentials',
      stringValue: srcDatabaseCredentialsSecret.secretArn,
    });

    new ssm.StringParameter(this, 'TgtDBCredentialsArn', {
      parameterName: 'oracle-migrate-tgt-db-credentials',
      stringValue: srcDatabaseCredentialsSecret.secretArn,
    });

    new rds.DatabaseInstance(this, 'SourceDatabase', {
      engine: rds.DatabaseInstanceEngine.oracleSe2({
        version: rds.OracleEngineVersion.VER_19_0_0_0_2023_10_R1,
      }),
      vpc: srcVpc,
      subnetGroup: srcSubnetGroup,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE3, ec2.InstanceSize.SMALL),
      licenseModel: rds.LicenseModel.LICENSE_INCLUDED,
      credentials: rds.Credentials.fromSecret(srcDatabaseCredentialsSecret),
      publiclyAccessible: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      securityGroups: [srcSecurityGroup]
    });

    new rds.DatabaseInstance(this, 'TargetDatabase', {
      engine: rds.DatabaseInstanceEngine.oracleSe2({
        version: rds.OracleEngineVersion.VER_19_0_0_0_2023_10_R1,
      }),
      vpc: tgtVpc,
      subnetGroup: tgtSubnetGroup,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE3, ec2.InstanceSize.SMALL),
      licenseModel: rds.LicenseModel.LICENSE_INCLUDED,
      credentials: rds.Credentials.fromSecret(tgtDatabaseCredentialsSecret),
      publiclyAccessible: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      securityGroups: [tgtSecurityGroup]
    });
  }
}
