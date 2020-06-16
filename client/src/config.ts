// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'h3abhe74ta';
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`;

export const authConfig = {
  domain: 'deryag.auth0.com',            // Auth0 domain
  clientId: '03N67jeIm9f8IC77oQnJ9rDQGvo9uYsJ',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
};