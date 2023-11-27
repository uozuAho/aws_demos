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
    });

    const roleS3fullAccess = new cdk.aws_iam.Role(this, 's3-fullAccess', {
      assumedBy: new cdk.aws_iam.ServicePrincipal('transfer.amazonaws.com'),
    });
    roleS3fullAccess.addToPolicy(new iam.PolicyStatement({
      actions: ['s3:*'],
      resources: [s3Bucket.bucketArn],
    }));

    const sftpServer = new transfer.CfnServer(this, 'SftpServer', {
      protocols: ['SFTP'],
      identityProviderType: 'SERVICE_MANAGED',
      endpointType: 'PUBLIC',
    });

    const userSshKey = new ec2.CfnKeyPair(this, 'tf-ftp-user', {
      keyName: 'tf-ftp-user',
    });

    new transfer.CfnUser(this, 'SftpUser', {
      userName: 'user',
      serverId: sftpServer.attrServerId,
      homeDirectory: '/home/user',
      role: roleS3fullAccess.roleArn,
      sshPublicKeys: [userSshKey.attrKeyPairId],
    });
  }
}
