import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createTodo } from '../../businessLogic/todos';
import * as middy from "middy";
import { cors } from "middy/middlewares";
import { createLogger } from '../../utils/logger';
import { CreateTodoRequest } from '../../requests/CreateTodoRequest';

const logger = createLogger('createTodo');

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    logger.info('processing event :', event);

    const newTodo: CreateTodoRequest = JSON.parse(event.body);
    const newItem = await createTodo(newTodo, event);

    return {
      statusCode: 201,
      body: JSON.stringify({
        item: newItem
      })
    };
  } catch (error) {
    logger.error("createTodo error : ", error);
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