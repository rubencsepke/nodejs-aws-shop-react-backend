import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, ScanCommand, TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

export const handler = async (event: any) => {

    const id = randomUUID();
    const {title, description, price, count} = JSON.parse(event.body);
    const client = new DynamoDBClient({ region: "eu-central-1" });
    const dynamodb = DynamoDBDocumentClient.from(client);

    if (!title || !description || !price || !count) {
        return {
            statusCode: 400,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST",
                "Access-Control-Allow-Headers": "Content-Type"
            },
            body: JSON.stringify({ message: 'Invalid request' }),
        };
    }

    if (typeof title !== 'string' ||
        typeof description !== 'string' ||
        typeof price !== 'number' ||
        typeof count !== 'number') {
        return {
            statusCode: 400,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST",
                "Access-Control-Allow-Headers": "Content-Type"
            },
            body: JSON.stringify({
                message: 'Invalid data types. Title and description must be strings, price and count must be numbers.'
            }),
        };
    }

    const product = {
        TableName: "Products",
        Item: {
            id,
            title,
            description,
            price
        }
    };

    const stock = {
        TableName: "Stocks",
        Item: {
            product_id: id,
            count
        }
    };

    await dynamodb.send(new TransactWriteCommand({
        TransactItems: [
            { Put: product },
            { Put: stock }
        ]
    }));

    return {
        statusCode: 201,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET",
            "Access-Control-Allow-Headers": "Content-Type"
        },
        body: "Product created successfully",
    };
}