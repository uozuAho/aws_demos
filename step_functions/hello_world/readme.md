# Step functions: hello world

Built following
- https://docs.aws.amazon.com/step-functions/latest/dg/tutorial-creating-lambda-state-machine.html
- https://docs.aws.amazon.com/step-functions/latest/dg/tutorial-lambda-state-machine-cdk.html

# Quick start
```sh
cdk deploy                           # deploy stack to AWS
cdk deploy --hotswap                 # fast deploy stack to AWS (causes drift, use for dev only)
                                     #    handy for lambda dev
cdk diff                             # diff local stack against deployed stack

# when you're done
cdk destroy                          # delete stack(s)
```

Once deployed:
- go to the aws step functions console
- click on the `HelloStateMachine*` state machine
- click 'start execution'
- add a field 'who' to the payload
- go
