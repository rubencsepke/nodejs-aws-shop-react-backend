export const handler = async (event: any) => {
  console.log("Event: ", event);
  try {
    const token = event.authorizationToken;

    if (!token) {
        return generatePolicy('user', 'Deny', event.methodArn);
    }

    const encodedCreds = token.split("Basic ")[1];

    if(!encodedCreds || encodedCreds === null) {
        throw new Error("Unauthorized");
    }

    const buff = Buffer.from(encodedCreds, "base64");

    const plainCreds = buff.toString("utf-8").split(":");
    const username = plainCreds[0];
    const password = plainCreds[1].trim();

    const validPassword = process.env[username];

    const effect =
        !validPassword || validPassword !== password ? "Deny" : "Allow";

    return generatePolicy(username, effect, event.methodArn);
  }
  catch (error) {
    console.error("Error: ", error);
    return generatePolicy('user', 'Deny', event.methodArn);
  }

  
};

function generatePolicy(
  principalId: string,
  effect: "Allow" | "Deny",
  resource: string
): any {
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
