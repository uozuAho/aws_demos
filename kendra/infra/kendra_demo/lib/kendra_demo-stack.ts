import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class KendraDemoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new cdk.aws_s3.Bucket(this, 'KendraDemoBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const comprehendRole = new cdk.aws_iam.Role(this, 'comprehend-role', {
      assumedBy: new cdk.aws_iam.ServicePrincipal('comprehend.amazonaws.com'),
    });
    comprehendRole.attachInlinePolicy(
      new cdk.aws_iam.Policy(this, 'comprehend-policy', {
        statements: [
          new cdk.aws_iam.PolicyStatement({
            actions: [
              's3:GetObject',
              's3:ListBucket',
              's3:PutObject'
            ],
            resources: [bucket.bucketArn, bucket.arnForObjects('*')],
          }),
        ],
      })
    );

    const kendraRole = new cdk.aws_iam.Role(this, 'kendra-role', {
      assumedBy: new cdk.aws_iam.ServicePrincipal('kendra.amazonaws.com'),
    });
    kendraRole.attachInlinePolicy(
      new cdk.aws_iam.Policy(this, 'kendra-policy', {
        statements: [
          new cdk.aws_iam.PolicyStatement({
            actions: [
              'cloudwatch:PutMetricData',
            ],
            resources: ['*'],
            conditions: {
              StringEquals: {
                'cloudwatch:namespace': 'Kendra',
              },
            },
          }),
          new cdk.aws_iam.PolicyStatement({
            actions: [
              'logs:DescribeLogGroups',
              'logs:DescribeLogStreams',
              'logs:CreateLogGroup',
              'logs:CreateLogStream',
              'logs:PutLogEvents',
            ],
            resources: ['*'],
          }),
          new cdk.aws_iam.PolicyStatement({
            actions: [
              's3:GetObject',
              's3:ListBucket',
            ],
            resources: [bucket.bucketArn, bucket.arnForObjects('*')],
          }),
          new cdk.aws_iam.PolicyStatement({
            actions: [
              'kendra:BatchPutDocument',
              'kendra:BatchDeleteDocument',
              'kendra:ListDataSourceSyncJobs'
            ],
            resources: ['*'],
          }),
        ],
      })
    );

    const kendraIndex = new cdk.aws_kendra.CfnIndex(this, 'kendra-index', {
      name: 'kendra-demo-index',
      edition: 'DEVELOPER_EDITION',
      roleArn: kendraRole.roleArn,
      description: 'Kendra Demo Index',
      // these fields aren't really explained in the tutorial. Do you have to know
      // the output of comprehend before indexing your docs??
      documentMetadataConfigurations: [
        'COMMERCIAL_ITEM',
        'DATE',
        'EVENT',
        'LOCATION',
        'ORGANIZATION',
        'OTHER',
        'PERSON',
        'QUANTITY',
        'TITLE',
      ].map(name => ({
        name,
        type: 'STRING_LIST_VALUE',
        search: {
          facetable: true,
          searchable: true,
          displayable: true,
        },
      })),
    });

    const kendraDataSource = new cdk.aws_kendra.CfnDataSource(this, 'kendra-data-source', {
      name: 'kendra-demo-data-source',
      indexId: kendraIndex.ref,
      type: 'S3',
      roleArn: kendraRole.roleArn,
      dataSourceConfiguration: {
        s3Configuration: {
          bucketName: bucket.bucketName,
          documentsMetadataConfiguration: {
            s3Prefix: 'metadata',
          },
        },
      },
    });
  }
}
