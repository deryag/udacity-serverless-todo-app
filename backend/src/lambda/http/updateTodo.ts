import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from "middy";
import { cors } from "middy/middlewares";
import { updateTodo, getTodo } from '../../businessLogic/todos';
import { createLogger } from '../../utils/logger';
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest';

const logger = createLogger('updateTodo');

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    logger.info("processing event : ", event);
    const todoId = event.pathParameters.todoId;
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body);
    const todoItem = await getTodo(todoId, event);

    if (!todoItem) {
      const message = "authorization failed or todo item does not exist!";
      logger.warning("updateTodo : ", message);
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: message
        })
      };
    }

    await updateTodo(todoId, updatedTodo, event);

    return {
      statusCode: 200,
      body: ""
    };
  } catch (error) {
    logger.error("updateTodo error : ", error);
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
