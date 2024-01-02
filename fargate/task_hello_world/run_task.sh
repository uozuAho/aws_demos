#!/bin/bash

CLUSTER_NAME="FargateTaskHelloStack-EcsCluster97242B84-BiDLBWWrg69A"
TASK_NAME="HelloFargateTask"
NETWORK_CONFIGURATION="awsvpcConfiguration={subnets=[subnet-0c7aaecacca77dcb5],securityGroups=[sg-013f490596f80c487],assignPublicIp=ENABLED}"

aws ecs run-task \
  --cluster $CLUSTER_NAME \
  --task-definition $TASK_NAME \
  --launch-type FARGATE \
  --network-configuration $NETWORK_CONFIGURATION
