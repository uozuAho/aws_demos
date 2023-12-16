import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsManager from 'aws-cdk-lib/aws-secretsmanager';
import * as dms from 'aws-cdk-lib/aws-dms';

const REGION = 'ap-southeast-2';

export class DmsPg2PgStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'SrcVpc', {
      availabilityZones: ['ap-southeast-2a', 'ap-southeast-2b'],
      ipAddresses: ec2.IpAddresses.cidr('10.0.1.0/24'),
    });


    // -------------------------------------------------------------
    // IAM
    // I'll call 'homogeneousDataMigrations' HDM
    const hdmIamPolicy = new iam.Policy(this, 'hdmPolicy', {
      policyName: 'hdmPolicy',
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "ec2:DescribeRouteTables",
            "ec2:DescribeSecurityGroups",
            "ec2:DescribeVpcPeeringConnections",
            "ec2:DescribeVpcs",
            "ec2:DescribePrefixLists",
            "logs:DescribeLogGroups"
          ],
          resources: ['*'],
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "servicequotas:GetServiceQuota"
          ],
          resources: ['arn:aws:servicequotas:*:*:vpc/L-0EA8095F'],
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "logs:CreateLogGroup",
            "logs:DescribeLogStreams"
          ],
          resources: ['arn:aws:logs:*:*:log-group:dms-data-migration-*'],
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "cloudwatch:PutMetricData"
          ],
          resources: ['*'],
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "ec2:CreateRoute",
            "ec2:DeleteRoute"
          ],
          resources: ['arn:aws:ec2:*:*:route-table/*'],
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "ec2:CreateTags"
          ],
          resources: [
            "arn:aws:ec2:*:*:security-group/*",
            "arn:aws:ec2:*:*:security-group-rule/*",
            "arn:aws:ec2:*:*:route-table/*",
            "arn:aws:ec2:*:*:vpc-peering-connection/*",
            "arn:aws:ec2:*:*:vpc/*"
          ],
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "ec2:AuthorizeSecurityGroupEgress",
            "ec2:AuthorizeSecurityGroupIngress"
          ],
          resources: ['arn:aws:ec2:*:*:security-group-rule/*'],
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "ec2:AuthorizeSecurityGroupEgress",
            "ec2:AuthorizeSecurityGroupIngress",
            "ec2:RevokeSecurityGroupEgress",
            "ec2:RevokeSecurityGroupIngress"
          ],
          resources: ['arn:aws:ec2:*:*:security-group/*'],
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "ec2:AcceptVpcPeeringConnection",
            "ec2:ModifyVpcPeeringConnectionOptions"
          ],
          resources: ['arn:aws:ec2:*:*:vpc-peering-connection/*'],
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "ec2:AcceptVpcPeeringConnection"
          ],
          resources: ['arn:aws:ec2:*:*:vpc/*'],
        }),
      ]
    });

    const hdmIamRole = new iam.Role(this, 'hdmRole', {
      assumedBy: new iam.ServicePrincipal('dms.amazonaws.com'),
    });
    hdmIamRole.attachInlinePolicy(hdmIamPolicy);
    hdmIamRole.addManagedPolicy(iam.ManagedPolicy
      .fromAwsManagedPolicyName('SecretsManagerReadWrite'));
    if (!hdmIamRole.assumeRolePolicy) {
      throw new Error('hdmIamRole.assumeRolePolicy is undefined');
    }
    hdmIamRole.assumeRolePolicy?.addStatements(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['sts:AssumeRole'],
      principals: [
        new iam.ServicePrincipal("dms-data-migrations.amazonaws.com"),
        new iam.ServicePrincipal(`dms.${REGION}.amazonaws.com`)
      ],
    }));


    // -------------------------------------------------------------
    // database
    const dbSubnetGroup = new rds.SubnetGroup(this, 'dbSubnetGroup', {
      description: 'Subnet group for RDS instance',
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
    const postgresDbCreds = new secretsManager.Secret(this, 'dms-pg2pg-pg-creds', {
      secretName: 'dms-pg2pg-pg-creds',
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
    // u have to set this manually. CDK fails to create param group, it doesn't
    // like rds.logical_replication
    // const postgresParameterGroup = new rds.ParameterGroup(this, 'dms-pg2pg-tgt-params', {
    //   description: 'Settings for target postgres database',
    //   engine: postgresEngine,
    //   parameters: {
    //     'rds.logical_replication ': '1',
    //   },
    // });
    const postgresDb = new rds.DatabaseInstance(this, 'dms-pg2pg-db', {
      engine: postgresEngine,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        ec2.InstanceSize.MICRO
      ),
      vpc,
      credentials: rds.Credentials.fromSecret(postgresDbCreds),
      subnetGroup: dbSubnetGroup,
      securityGroups: [dbSecurityGroup],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      publiclyAccessible: true,
      enablePerformanceInsights: true,
      // parameterGroup: postgresParameterGroup,
    });


    // -------------------------------------------------------------
    // DMS stuff
    const dmsSubnetGroup = new dms.CfnReplicationSubnetGroup(this, 'dms-pg2pg-sng', {
      replicationSubnetGroupDescription: 'Subnet group for DMS replication instance',
      subnetIds: vpc.privateSubnets.map(subnet => subnet.subnetId),
    });
  }
}
