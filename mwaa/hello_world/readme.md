# AWS MWAA hello world

Built following https://docs.aws.amazon.com/mwaa/latest/userguide/vpc-create.html
Also used https://github.com/aws-samples/cdk-amazon-mwaa-cicd

NOTE: MWAA environment has a constant per-hour cost. Destroy this demo when
you're done.

# todo
- finish deploying infra: https://docs.aws.amazon.com/mwaa/latest/userguide/create-environment.html
    - deployment currently breaks with 'Unable to read mwaahellostack-bucket83908e77-yxuy0swfkcfr/requirements.txt'
        - does the bucket & contents have to be created first?
            - or, just don't specify requirements.txt in cfn
    - is it worth doing this with CDK?
- get access: https://docs.aws.amazon.com/mwaa/latest/userguide/manage-access.html
    - https://docs.aws.amazon.com/mwaa/latest/userguide/access-airflow-ui.html
- run a dag: https://docs.aws.amazon.com/mwaa/latest/userguide/working-dags.html

iam policy created by mwaa console env builder:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": "airflow:PublishMetrics",
            "Resource": "arn:aws:airflow:ap-southeast-2:ACCOUNT_ID:environment/MyAirflowEnvironment"
        },
        {
            "Effect": "Deny",
            "Action": "s3:ListAllMyBuckets",
            "Resource": [
                "arn:aws:s3:::mwaa-demo-manual",
                "arn:aws:s3:::mwaa-demo-manual/*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject*",
                "s3:GetBucket*",
                "s3:List*"
            ],
            "Resource": [
                "arn:aws:s3:::mwaa-demo-manual",
                "arn:aws:s3:::mwaa-demo-manual/*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogStream",
                "logs:CreateLogGroup",
                "logs:PutLogEvents",
                "logs:GetLogEvents",
                "logs:GetLogRecord",
                "logs:GetLogGroupFields",
                "logs:GetQueryResults"
            ],
            "Resource": [
                "arn:aws:logs:ap-southeast-2:ACCOUNT_ID:log-group:airflow-MyAirflowEnvironment-*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "logs:DescribeLogGroups"
            ],
            "Resource": [
                "*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": "cloudwatch:PutMetricData",
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "sqs:ChangeMessageVisibility",
                "sqs:DeleteMessage",
                "sqs:GetQueueAttributes",
                "sqs:GetQueueUrl",
                "sqs:ReceiveMessage",
                "sqs:SendMessage"
            ],
            "Resource": "arn:aws:sqs:ap-southeast-2:*:airflow-celery-*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "kms:Decrypt",
                "kms:DescribeKey",
                "kms:GenerateDataKey*",
                "kms:Encrypt"
            ],
            "NotResource": "arn:aws:kms:*:ACCOUNT_ID:key/*",
            "Condition": {
                "StringLike": {
                    "kms:ViaService": [
                        "sqs.ap-southeast-2.amazonaws.com"
                    ]
                }
            }
        }
    ]
}
```
