import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import 'source-map-support/register';
import * as middy from "middy";
import { cors } from "middy/middlewares";
import { deleteTodo, deleteS3BucketObject, getTodo } from '../../businessLogic/todos';
import { createLogger } from '../../utils/logger';

const logger = createLogger('deleteTodo');

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    logger.info("Processing event", event);
    const todoId = event.pathParameters.todoId;

    const todoItem = await getTodo(todoId, event);

    if (!todoItem) {
      const message = "Todo does not exist or you are not authorized to delete the todo";
      logger.warning("deleteTodo", message);
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: message
        })
      };
    }

    await deleteTodo(todoId, event);
    await deleteS3BucketObject(todoId);

    return {
      statusCode: 200,
      body: ""
    };
  }
  catch (error) {
    logger.error("deleteTodo", error);
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