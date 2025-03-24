import * as cdk from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import path = require('path');
import * as iam from "aws-cdk-lib/aws-iam";

export class AuthorizationServiceStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		const basicAuthorizer = new NodejsFunction(this, 'BasicAuthorizer', {
			runtime: lambda.Runtime.NODEJS_20_X,
			handler: 'handler',
			functionName: 'authorization',
			entry: path.join(__dirname, '../lambda/basicAuthorizer.ts'),
			environment: {
				rubencsepke: 'TEST_PASSWORD',
			}
		});

		basicAuthorizer.addToRolePolicy(
			new iam.PolicyStatement({
			actions: ["lambda:InvokeFunction"],
			resources: [
				`arn:aws:lambda:${this.region}:${this.account}:function:ImportServiceStack-ImportProductsFileFunction41430-hkx1vEJBIOZc`,
			],
			})
		);

	}
}
