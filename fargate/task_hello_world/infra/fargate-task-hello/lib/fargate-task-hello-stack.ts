import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';

export class FargateTaskHelloStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'Vpc', {
      availabilityZones: ['ap-southeast-2a', 'ap-southeast-2b'],
      ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
    });

    const ecsCluster = new ecs.Cluster(this, 'EcsCluster', {
      vpc: vpc,
    });

    const helloTaskDef = new ecs.FargateTaskDefinition(this, 'HelloTask', {
      cpu: 256,
      memoryLimitMiB: 512,
      family: 'HelloFargateTask',
    });
    helloTaskDef.addContainer('HelloContainer', {
      containerName: 'AlpineHelloContainer',
      image: ecs.ContainerImage.fromRegistry('public.ecr.aws/docker/library/alpine:edge'),
      essential: true,
      command: ['echo', 'Hello, World! My boop is ${MY_BOOP}'],
      environment: {
        MY_BOOP: 'boop',
      },
      logging: new ecs.AwsLogDriver({
        streamPrefix: 'HelloFargateTask',
      }),
    });
  }
}
