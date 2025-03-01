import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { Product, ProductWithStock } from "../model/product";
import { Stock } from "../model/stock";

export const handler = async (event: any) => {

    const client = new DynamoDBClient({ region: "eu-central-1" });
    const dynamodb = DynamoDBDocumentClient.from(client);
    const productId = event.pathParameters?.productId;

    const productsResult = await dynamodb.send(new GetCommand({
        TableName: "Products",
        Key: {
            id: productId
        }
    }));

    const stocksResult = await dynamodb.send(new GetCommand({
        TableName: "Stocks",
        Key: {
            product_id: productId
        }
    }));

    if (!productsResult.Item) {
        return {
            statusCode: 404,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET",
                "Access-Control-Allow-Headers": "Content-Type"
            },
            body: JSON.stringify({ message: 'Product not found' }),
        };
    }

    const product: ProductWithStock = {
        ...productsResult.Item as Product,
        count: (stocksResult.Item as Stock)?.count || 0
    };

    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET",
            "Access-Control-Allow-Headers": "Content-Type"
        },
        body: JSON.stringify(product),
    };
}