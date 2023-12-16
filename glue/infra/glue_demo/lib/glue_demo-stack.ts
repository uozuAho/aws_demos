import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsManager from 'aws-cdk-lib/aws-secretsmanager';

export class GlueDemoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'vpc', {
      availabilityZones: ['ap-southeast-2a', 'ap-southeast-2b'],
      ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
    });

    const dbSubnetGroup = new rds.SubnetGroup(this, 'dbSubnetGroup', {
      description: 'Subnet group for RDS instances',
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    const dbSecurityGroup = new ec2.SecurityGroup(this, 'DBSecurityGroup', {
      vpc,
      allowAllOutbound: true,
    });
    dbSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(5432),
      'Allow inbound access to postgres'
    );

    const postgresEngine = rds.DatabaseInstanceEngine.postgres({
      version: rds.PostgresEngineVersion.VER_15_4,
    });

    const srcDbCreds = new secretsManager.Secret(this, 'src-db-creds', {
      secretName: 'src-db-creds',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          username: 'postgres',
        }),
        excludePunctuation: true,
        includeSpace: false,
        generateStringKey: 'password',
        passwordLength: 20,
      }
    });

    const tgtDbCreds = new secretsManager.Secret(this, 'tgt-db-creds', {
      secretName: 'tgt-db-creds',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          username: 'postgres',
        }),
        excludePunctuation: true,
        includeSpace: false,
        generateStringKey: 'password',
        passwordLength: 20,
      }
    });

    const srcDb = new rds.DatabaseInstance(this, 'src-db', {
      engine: postgresEngine,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        ec2.InstanceSize.MICRO
      ),
      vpc,
      credentials: rds.Credentials.fromSecret(srcDbCreds),
      subnetGroup: dbSubnetGroup,
      securityGroups: [dbSecurityGroup],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      publiclyAccessible: true,
    });

    const tgtDb = new rds.DatabaseInstance(this, 'tgt-db', {
      engine: postgresEngine,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        ec2.InstanceSize.MICRO
      ),
      vpc,
      credentials: rds.Credentials.fromSecret(tgtDbCreds),
      subnetGroup: dbSubnetGroup,
      securityGroups: [dbSecurityGroup],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      publiclyAccessible: true,
    });

    // glue stuff
    dbSecurityGroup.addIngressRule(
      dbSecurityGroup,
      ec2.Port.tcpRange(0, 65535),
      'Allow glue to access postgres'
    );
    const glueRole = new iam.Role(this, 'glue-role', {
      assumedBy: new iam.ServicePrincipal('glue.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromManagedPolicyArn(
          this,
          'glue-service-policy',
          "arn:aws:iam::aws:policy/service-role/AWSGlueServiceRole"
        ),
      ],
    });
    srcDbCreds.grantRead(glueRole);
    tgtDbCreds.grantRead(glueRole);
  }
}
