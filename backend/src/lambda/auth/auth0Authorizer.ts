import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda';
import 'source-map-support/register';
import { createLogger } from '../../utils/logger';
import { AuthHelper } from '../../utils/authHelper';
import { JwtPayload } from '../../auth/JwtPayload';

const logger = createLogger('auth0Authorizer');

export const handler = async (event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {

  try {
    const authHeader = event.authorizationToken;
    logger.info('authorization for user inputs : ' + authHeader, authHeader);
    const jwtToken = await verifyToken(authHeader);
    logger.info('authorized user token : ', jwtToken);

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
    logger.error('user not authorized!', { error: e.message })

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
      const key = 'MIIC+zCCAeOgAwIBAgIJHxHbTKDiQuiOMA0GCSqGSIb3DQEBCwUAMBsxGTAXBgNV\nBAMTEGRlcnlhZy5hdXRoMC5jb20wHhcNMjAwNjAyMjA1MzE0WhcNMzQwMjA5MjA1\nMzE0WjAbMRkwFwYDVQQDExBkZXJ5YWcuYXV0aDAuY29tMIIBIjANBgkqhkiG9w0B\nAQEFAAOCAQ8AMIIBCgKCAQEAxnkRkTxD+KZLpwwSL7ABtl0VGJkz9ckuIfx3tWZv\nshdCFVm9PfPA9ar3nOaj68crOFYP8yXFFtEADC4IItthAwE9jGdvd3NXBfx7bFti\ngZhrSbH2TJ0zAyNaxjjewgQ9ta1VcDe9vt9gCympbO6gizb1FyUb6yhRF0fp9j77\n7nkYcpsJaGqh6D/c6S8LK5vOMSi5JAar8aalynmlcfD/PNuvfYsl0zkQaLQlXH7+\n05qfwIafAM2I4pltj8BcQ8ANlP9JwIOwDinw3TFpNSfxCcYmYF3G7Q/HzRkHPu0f\nIWNSBisaHijERwARG0NdXlObvMuGik5+3OrnqcPCjESVKQIDAQABo0IwQDAPBgNV\nHRMBAf8EBTADAQH/MB0GA1UdDgQWBBSlumuPpSFOcO6tc/QYfE7cpxAymDAOBgNV\nHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEBADheY9ijh6Vzwk0aJllb96Fu\n0/og2HZuW1Vxk6LpFXeLz9k9J780OhnEtnXPKLjxNuU4mlUJo4ZY11xgiTAS2W9V\n06Ug5cDPpjMrSzJyONN9s75foK6PB8P753Mmi1AdMm80ZmqmF8B02K6eHeOb9Twi\nbznbSg0BDCY0XLy6ke5/ytUjZCPcWCNxOZpYbrj0xKEcFwVNimENwkWxpG2vXhVp\nZ7By0DafpOZ23kmHxhMv7Siv7LIoDZuRwwD6JLbJBByZ/PEPIELwu6ZyMJrW1tqu\ngA0WAbVFoMko33z2M0o3afSW0t9dvffOeQnODd4JMI8a4El2AGh0bvwD0yLH7zM=';
      logger.info('authorizing a user with ' + signingKey + ' pubKey: ' + signingKey.getPublicKey(), signingKey);
      const payload = AuthHelper.verifyToken(token, '-----BEGIN CERTIFICATE-----\n'+key+'\n-----END CERTIFICATE-----\n');
      resolve(payload);
    } catch (error) {
      reject(error);
    }
  });
};