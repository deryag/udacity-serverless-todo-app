import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from "middy";
import { cors } from "middy/middlewares";
import { getTodo, getUploadUrl } from '../../businessLogic/todos';
import { createLogger } from '../../utils/logger';

const logger = createLogger('generateUploadUrl');

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    logger.info("processing event :", event);
    const todoId = event.pathParameters.todoId;
    const todoItem = await getTodo(todoId, event);

    if (!todoItem) {
      const message = "authorization failed or todo item does not exist!";
      logger.warning("generateUploadUrl :", message);
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: message
        })
      };
    }

    const uploadUrl = getUploadUrl(todoItem.todoId);

    return {
      statusCode: 200,
      body: JSON.stringify({
        uploadUrl
      })
    };
  } catch (error) {
    logger.error("generateUploadUrl : ", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error
      })
    };
  }
});

handler.use(
  cors({
    origin: "*",
    credentials: true
  })
);