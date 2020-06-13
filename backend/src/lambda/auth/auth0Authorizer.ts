import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda';
import 'source-map-support/register';
import { createLogger } from '../../utils/logger';
import { AuthHelper } from '../../utils/authHelper';
import { JwtPayload } from '../../interfaces/auth';

const logger = createLogger('auth0Authorizer');

export const handler = async (event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {

  try {
    const authHeader = event.authorizationToken;
    logger.info('Authorizing a user', authHeader);
    const jwtToken = await verifyToken(authHeader);
    logger.info('User was authorized', jwtToken);

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
};

const verifyToken = (authHeader: string): Promise<JwtPayload> => {
  return new Promise(async (resolve, reject) => {
    try {
      const token = AuthHelper.getJWTToken(authHeader);
      const jwt = AuthHelper.decodeJWTToken(token);
      const signingKey = await AuthHelper.getSigningKey(jwt);
      const payload = AuthHelper.verifyToken(token, signingKey.getPublicKey());
      resolve(payload);
    } catch (error) {
      reject(error);
    }
  });
};