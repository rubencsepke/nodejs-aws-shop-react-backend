export const handler = async (event: any) => {
    console.log('Event: ', event);
    const token = event.authorizationToken;

    if (!token) {
        return generatePolicy('user', 'Deny', event.methodArn);
    }

    const encodedCreds = token.split(' ')[1];
    const buff = Buffer.from(encodedCreds, 'base64');
    const plainCreds = buff.toString('utf-8').split(':');
    const username = plainCreds[0];
    const password = plainCreds[1];

    const validPassword = process.env[username];

    const effect = !validPassword || validPassword !== password ? 'Deny' : 'Allow';
    return generatePolicy(username, effect, event.methodArn);
}

function generatePolicy( principalId: string, effect: "Allow" | "Deny", resource: string ): any {
    return {
        principalId,
        policyDocument: {
            Version: "2012-10-17",
            Statement: [
                {
                    Action: "execute-api:Invoke",
                    Effect: effect,
                    Resource: resource,
                },
            ],
        },
    };
}