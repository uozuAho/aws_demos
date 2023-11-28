import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as transfer from 'aws-cdk-lib/aws-transfer';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ec2 from 'aws-cdk-lib/aws-ec2';


export class TfFtpS3DemoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const s3Bucket = new cdk.aws_s3.Bucket(this, 'S3Bucket', {
      bucketName: 'tf-ftp-s3-demo',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const roleS3fullAccess = new cdk.aws_iam.Role(this, 's3-fullAccess', {
      assumedBy: new cdk.aws_iam.ServicePrincipal('transfer.amazonaws.com'),
    });
    roleS3fullAccess.addToPolicy(new iam.PolicyStatement({
      actions: ['s3:*'],
      resources: [s3Bucket.bucketArn],
    }));

    const server = new transfer.CfnServer(this, 'SftpServer', {
      protocols: ['SFTP'],
      identityProviderType: 'SERVICE_MANAGED',
      endpointType: 'PUBLIC',
    });

    new ec2.CfnKeyPair(this, 'tf-ftp-user', {
      keyName: 'tf-ftp-user',
    });

    // const user = new transfer.CfnUser(this, 'demo-user', {
    //   userName: 'demo-user',
    //   serverId: server.attrServerId,
    //   role: roleS3fullAccess.roleArn,
    //   homeDirectory: '/home/demo-user',
    //   sshPublicKeys: ['PUB_KEY_HERE'],
    // });
  }
}
