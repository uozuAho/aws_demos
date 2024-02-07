import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';

// name stuff with a prefix that identifies this stack
function name(name: string) {
  return 'StepHelloTest-' + name;
}

export class StepHelloEcsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, name('vpc'), {
      availabilityZones: ['ap-southeast-2a', 'ap-southeast-2b'],
      ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
    });

    const ecsCluster = new ecs.Cluster(this, name('cluster'), {
      vpc: vpc,
    });

    const helloTaskDef = new ecs.FargateTaskDefinition(this, name('task'), {
      cpu: 256,
      memoryLimitMiB: 512,
      family: 'HelloTask',
    });

    helloTaskDef.addContainer('HelloContainer', {
      containerName: 'AlpineHelloContainer',
      image: ecs.ContainerImage.fromRegistry('public.ecr.aws/docker/library/alpine:edge'),
      essential: true,
      command: ['echo', 'Hello, World!'],
      logging: new ecs.AwsLogDriver({
        streamPrefix: name('task-logs'),
      }),
    });

    const launchTarget = new tasks.EcsFargateLaunchTarget({
      platformVersion: ecs.FargatePlatformVersion.LATEST
    });

    const stepTask = new tasks.EcsRunTask(this, name('stepTask'), {
      stateName: 'sayHello',
      cluster: ecsCluster,
      taskDefinition: helloTaskDef,
      launchTarget,
      containerOverrides: [{
        containerDefinition: helloTaskDef.defaultContainer!,
        command: ['echo', 'hello', 'world!']
      }]
    });

    const stateMachine = new sfn.StateMachine(this, name('state-machine'), {
      definitionBody: sfn.DefinitionBody.fromChainable(stepTask)
    });
  }
}
