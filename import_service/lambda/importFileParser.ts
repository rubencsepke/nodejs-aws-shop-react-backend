import { CopyObjectCommand, DeleteObjectCommand, GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Readable } from "stream";
import csvParser from "csv-parser";

export const handler = async (event: any) => {
    try {
        const s3Client = new S3Client({ region: process.env.AWS_REGION });
        const bucketName = event.Records[0].s3.bucket.name;
        const objectKey = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));

        const response = await s3Client.send(new GetObjectCommand({
            Bucket: bucketName,
            Key: objectKey,
        }));

        await new Promise((resolve, reject) => {
            const stream = Readable.from(response.Body as Readable);
            stream.pipe(csvParser())
                .on('data', (data: any) => {
                    console.log('Parsed record:', JSON.stringify(data));
                })
                .on('error', (error: unknown) => {
                    console.log('Error parsing:', JSON.stringify(error));
                    reject(error);
                })
                .on('end', () => {
                    console.log('CSV parsing completed');
                    resolve("Success");
                });
        });

        const newKey = objectKey.replace('uploaded/', 'parsed/');

        await s3Client.send(new CopyObjectCommand({
            Bucket: bucketName,
            CopySource: `${bucketName}/${objectKey}`,
            Key: newKey,
        }));

        await s3Client.send(new DeleteObjectCommand({
            Bucket: bucketName,
            Key: objectKey,
        }));

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET",
                "Access-Control-Allow-Headers": "Content-Type"
            },
            body: JSON.stringify({ message: 'File processed' }),
        };

    } catch (error) {
        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET",
                "Access-Control-Allow-Headers": "Content-Type"
            },
            body: JSON.stringify({ message: 'Internal server error' }),
        };
    }
}