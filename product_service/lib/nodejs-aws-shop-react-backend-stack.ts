import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import path = require('path');

export class NodejsAwsShopReactBackendStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		// Define DynamoDB table
		const productsTable = new dynamodb.Table(this, 'ProductsTable', {
			partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
			tableName: 'Products',
			billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
			removalPolicy: cdk.RemovalPolicy.DESTROY,
		});

		//Define Lambda function resource
		const getProductsListFunction = new lambda.Function(this, 'GetProductsListFunction', {
			runtime: lambda.Runtime.NODEJS_20_X,
			handler: 'getProductsList.handler',
			code: lambda.Code.fromAsset('lambda'),
			environment: {
				PRODUCTS_TABLE_NAME: productsTable.tableName,
			},
		});

		const getProductsByIdFunction = new lambda.Function(this, 'GetProductsByIdFunction', {
			runtime: lambda.Runtime.NODEJS_20_X,
			handler: 'getProductsById.handler',
			code: lambda.Code.fromAsset('lambda'),
			environment: {
				PRODUCTS_TABLE_NAME: productsTable.tableName,
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

		productsTable.grantReadData(getProductsListFunction);
		productsTable.grantReadData(getProductsByIdFunction);

		// Define lambda resources with GET method
		const products = api.root.addResource('products');
		products.addMethod('GET', new apigateway.LambdaIntegration(getProductsListFunction));

		const productsById = products.addResource('{productId}');
		productsById.addMethod('GET', new apigateway.LambdaIntegration(getProductsByIdFunction));
	}
}
