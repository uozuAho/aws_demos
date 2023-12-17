import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsManager from 'aws-cdk-lib/aws-secretsmanager';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as glue from 'aws-cdk-lib/aws-glue';

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
    const glueBucket = new s3.Bucket(this, 'glue-bucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });
    const s3_endpoint = new ec2.GatewayVpcEndpoint(this, 'vpc-endpoint', {
      vpc,
      service: new ec2.GatewayVpcEndpointAwsService('s3'),
      subnets: [{subnetType: ec2.SubnetType.PUBLIC}],
    });
    // because glue can't access the public internet, endpoints are needed for
    // external AWS services
    const secretsManagerEndpoint = new ec2.InterfaceVpcEndpoint(this, 'secrets-manager-endpoint', {
      vpc,
      service: new ec2.InterfaceVpcEndpointAwsService('secretsmanager'),
      subnets: {subnetType: ec2.SubnetType.PUBLIC},
    });
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
    const srcGlueConnection = new glue.CfnConnection(this, 'src-glue-connection', {
      catalogId: this.account,
      connectionInput: {
        connectionType: 'JDBC',
        connectionProperties: {
          JDBC_CONNECTION_URL: `jdbc:postgresql://${srcDb.dbInstanceEndpointAddress}:${srcDb.dbInstanceEndpointPort}/postgres`,
          JDBC_ENFORCE_SSL: 'false',
          SECRET_ID: srcDbCreds.secretArn,
        },
        name: 'src-glue-connection',
        physicalConnectionRequirements: {
          availabilityZone: vpc.availabilityZones[0],
          securityGroupIdList: [dbSecurityGroup.securityGroupId],
          subnetId: vpc.publicSubnets[0].subnetId,
        },
      },
    });
    const tgtGlueConnection = new glue.CfnConnection(this, 'tgt-glue-connection', {
      catalogId: this.account,
      connectionInput: {
        connectionType: 'JDBC',
        connectionProperties: {
          JDBC_CONNECTION_URL: `jdbc:postgresql://${tgtDb.dbInstanceEndpointAddress}:${tgtDb.dbInstanceEndpointPort}/postgres`,
          JDBC_ENFORCE_SSL: 'false',
          SECRET_ID: tgtDbCreds.secretArn, // todo: this didn't work
          JDBC_DRIVER_JAR_URI: glueBucket.s3UrlForObject('jdbc/postgresql-42.7.1.jar'), // todo: this didn't work
            // maybe glue role doesn't have access to the bucket?
        },
        name: 'tgt-glue-connection',
        physicalConnectionRequirements: {
          availabilityZone: vpc.availabilityZones[0],
          securityGroupIdList: [dbSecurityGroup.securityGroupId],
          subnetId: vpc.publicSubnets[0].subnetId,
        },
      },
    });
  }
}
