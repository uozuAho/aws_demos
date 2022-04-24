import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import * as widget_service from './widget_service';

export class MyWidgetServiceStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    new widget_service.WidgetService(this, 'Widgets');
  }
}
