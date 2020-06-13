// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = '3abhe74ta';
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`;

export const authConfig = {
  domain: 'deryag.auth0.com',            // Auth0 domain
  clientId: '3cccOX58IWHRPxGQWbZSpfDJ6ajvjmAC',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
};