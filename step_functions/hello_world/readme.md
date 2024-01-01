# Step functions: hello world

Built following https://docs.aws.amazon.com/step-functions/latest/dg/tutorial-creating-lambda-state-machine.html

```sh
cdk deploy                           # deploy stack to AWS
cdk deploy --hotswap                 # fast deploy stack to AWS (causes drift, use for dev only)
                                     #    handy for lambda dev
cdk diff                             # diff local stack against deployed stack

# when you're done
cdk destroy                          # delete stack(s)
```
