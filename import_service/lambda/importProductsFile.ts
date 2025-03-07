import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const handler = async (event: any) => {
    try {
        const s3Client = new S3Client({ region: process.env.AWS_REGION });
        const fileName = event.queryStringParameters.name;

        if (!fileName) {
            return {
                statusCode: 400,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET",
                    "Access-Control-Allow-Headers": "Content-Type"
                },
                body: JSON.stringify({ message: 'File name is required' }),
            };
        }

        const key = `uploaded/${fileName}`;
        const put = new PutObjectCommand({
            Bucket: process.env.IMPORT_BUCKET,
            Key: key,
            ContentType: 'text/csv',
        });

        const signedUrl = await getSignedUrl(s3Client, put, { expiresIn: 3600 });

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET",
                "Access-Control-Allow-Headers": "Content-Type"
            },
            body: signedUrl,
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