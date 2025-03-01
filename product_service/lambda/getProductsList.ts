import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { Product } from "../model/product";

export const handler = async () => {

    const client = new DynamoDBClient({ region: "eu-central-1" });
    const dynamodb = DynamoDBDocumentClient.from(client);

    const productsResult = await dynamodb.send(new ScanCommand({
        TableName: "Products",
    }));

    const products: Product[] = productsResult.Items as Product[] || [];

    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET",
            "Access-Control-Allow-Headers": "Content-Type"
        },
        body: JSON.stringify(products),
    };
}