import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsManager from 'aws-cdk-lib/aws-secretsmanager';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as dms from 'aws-cdk-lib/aws-dms';

export class DmsDemoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // -----------------------------------------------------
    // VPC
    const vpc = new ec2.Vpc(this, 'DmsDemoVpc', {
      availabilityZones: ['ap-southeast-2a', 'ap-southeast-2b'],
      ipAddresses: ec2.IpAddresses.cidr('10.0.1.0/24'),
    });


    // -----------------------------------------------------
    // databases
    const dbSubnetGroup = new rds.SubnetGroup(this, 'dms-DBSubnetGroup', {
      description: 'Subnet group for RDS instances',
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    const dbSecurityGroup = new ec2.SecurityGroup(this, 'DBSecurityGroup', {
      vpc,
      allowAllOutbound: true,
    });
    dbSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(3306),
      'Allow inbound access to mysql'
    );
    dbSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(5432),
      'Allow inbound access to postgres'
    );
    const mariaDbEngine = rds.DatabaseInstanceEngine.mariaDb({
      version: rds.MariaDbEngineVersion.VER_10_11_5,
    });
    const mariaDbParameterGroup = new rds.ParameterGroup(this, 'dms-mariadb-parameters', {
      description: 'Group for specifying binary log settings for replication',
      engine: mariaDbEngine,
      parameters: {
        'binlog_checksum': 'NONE',
        'binlog_format': 'ROW',
      },
    });
    const mariaDbCreds = new secretsManager.Secret(this, 'dms-mariadb-creds', {
      secretName: 'dms-demo-mariadb-creds',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          username: 'admin',
        }),
        excludePunctuation: true,
        includeSpace: false,
        generateStringKey: 'password',
        passwordLength: 20,
      }
    });
    const mariaDb = new rds.DatabaseInstance(this, 'dms-MariaDb', {
      engine: mariaDbEngine,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.M5,
        ec2.InstanceSize.LARGE
      ),
      vpc,
      credentials: rds.Credentials.fromSecret(mariaDbCreds),
      parameterGroup: mariaDbParameterGroup,
      subnetGroup: dbSubnetGroup,
      securityGroups: [dbSecurityGroup],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      publiclyAccessible: true,
      enablePerformanceInsights: true,
      databaseName: 'dms_demo',
    });

    const postgresEngine = rds.DatabaseInstanceEngine.postgres({
      version: rds.PostgresEngineVersion.VER_15_4,
    });
    const postgresDbCreds = new secretsManager.Secret(this, 'dms-postgres-creds', {
      secretName: 'dms-demo-postgres-creds',
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
    const postgresParameterGroup = new rds.ParameterGroup(this, 'dms-postgres-parameters', {
      description: 'Group for specifying binary role setting for replication',
      engine: postgresEngine,
      parameters: {
        'session_replication_role': 'replica',
      },
    });
    const postgresDb = new rds.DatabaseInstance(this, 'dms-PostgresDb', {
      engine: postgresEngine,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.M5,
        ec2.InstanceSize.LARGE
      ),
      vpc,
      credentials: rds.Credentials.fromSecret(postgresDbCreds),
      parameterGroup: postgresParameterGroup,
      subnetGroup: dbSubnetGroup,
      securityGroups: [dbSecurityGroup],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      publiclyAccessible: true,
      enablePerformanceInsights: true,
    });


    // -----------------------------------------------------
    // ec2 client
    const ec2ClientSecurityGroup = new ec2.SecurityGroup(this, 'ec2-client-sg', {
      vpc,
      allowAllOutbound: true,
    });
    ec2ClientSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      'Allow ssh access to ec2 client instance'
    );
    const keyPair = new ec2.CfnKeyPair(this, 'dms-demo-key-pair', {
      keyName: 'dmsdemo',
    });
    const userData = ec2.UserData.forLinux();
    userData.addCommands(
      'sudo yum install -y git',
      'sudo dnf install -y mariadb105',
      'sudo dnf install -y postgresql15',
      'git clone https://github.com/aws-samples/aws-database-migration-samples.git',
    );
    const ec2Client = new ec2.Instance(this, 'dms-demo-client', {
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        ec2.InstanceSize.XLARGE
      ),
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2023,
      }),
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      keyName: keyPair.keyName,
      associatePublicIpAddress: true,
      securityGroup: ec2ClientSecurityGroup,
      userData: userData,
    });

    // -----------------------------------------------------
    // DMS stuff
    // -----------------------------------------------------
    // s3
    // const s3Bucket = new s3.Bucket(this, 'dms-demo-bucket', {
    //   removalPolicy: cdk.RemovalPolicy.DESTROY,
    //   versioned: true,
    // });

    // from manual testing, probably need:
    // - new subnet group with public subnets
    // - is creating instance profiles broken? I can't create any, always get a
    //   message: 'dms-vpc-role already exists'

    // const dmsInstance = new dms.CfnReplicationInstance(this, 'DMSInstance', {
    //   replicationInstanceIdentifier: 'dms-instance',
    //   replicationInstanceClass: 'dms.r5.large',
    //   replicationSubnetGroupIdentifier: dbSubnetGroup.subnetGroupName,
    //   allocatedStorage: 100,
    // });
  }
}
