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
  }
}
