import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import path = require('path');

export class ImportServiceStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		const bucket = s3.Bucket.fromBucketName(this, 'ImportBucket', 'ruben-cs-import-service-bucket');

		const importProductsFileFunction = new NodejsFunction(this, 'ImportProductsFileFunction', {
			runtime: lambda.Runtime.NODEJS_20_X,
			handler: 'handler',
			entry: path.join(__dirname, '../lambda/importProductsFile.ts'),
			environment: {
				BUCKET_NAME: bucket.bucketName,
			},
		});

		const importFileParserFunction = new NodejsFunction(this, 'ImportFileParserFunction', {
			runtime: lambda.Runtime.NODEJS_20_X,
			handler: 'handler',
			entry: path.join(__dirname, '../lambda/importFileParser.ts'),
			environment: {
				BUCKET_NAME: bucket.bucketName,
			},
		});

		// Define API Gateway resource
		const api = new apigateway.RestApi(this, 'ProductServiceApi', {
			restApiName: 'Product Service',
            defaultCorsPreflightOptions: {
				allowOrigins: apigateway.Cors.ALL_ORIGINS,
				allowMethods: ['GET'],
				allowHeaders: ['Content-Type'],
            },
		});

		bucket.grantReadWrite(importProductsFileFunction);
		bucket.grantRead(importFileParserFunction);

		const importResource = api.root.addResource('import');
		importResource.addMethod('GET', new apigateway.LambdaIntegration(importProductsFileFunction), {
			requestParameters: {
				'method.request.querystring.name': true,
			},
			requestValidatorOptions: {
				validateRequestParameters: true,
			},
		});
	}
}
