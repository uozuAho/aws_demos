# AWS demos

I build/modify AWS stacks so infrequently that I forget how to do so every time.
This is a collection of small demo projects to jog my memory.


## localstack
I'm really struggling to get anything useful happening on localstack. Issues:

- lambdas need AWS resource endpoints overriden: https://docs.localstack.cloud/tools/local-endpoint-injection/
    - doesn't work when I try it (enpoint not found)
- getting logs from cloudwatch: can find log groups with `aws logs describe-log-groups`,
  but then all other logs commands fail with 'log group not found'
