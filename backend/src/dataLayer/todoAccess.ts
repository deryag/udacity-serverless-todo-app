import * as AWS from "aws-sdk";
const AWSXray = require('aws-xray-sdk');
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { config } from "../common";
import { createLogger } from "../utils/logger";
import { TodoItem } from "../models/TodoItem";
import { TodoUpdate } from "../models/TodoUpdate";
import { UpdateTodoRequest } from "../requests/UpdateTodoRequest";

const XAWS = AWSXray.captureAWS(AWS);
const logger = createLogger('todoAccess');

export class TodoAccess {
    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly todosTable = config.todosTableName,
        private readonly todosTableIndexName = config.todosTableIndexName) {
    }

    async getTodoItem(todoId: string): Promise<TodoItem> {
        try {
            logger.info(`getTodoItem with id : ${todoId}`);

            const params: DocumentClient.QueryInput = {
                IndexName: this.todosTableIndexName,
                TableName: this.todosTable,
                KeyConditionExpression: 'todoId = :todoId',
                ExpressionAttributeValues: {
                    ':todoId': todoId
                }
            };

            const result = await this.docClient.query(params).promise();

            if (result.Items && result.Items.length) {
                return Promise.resolve(result.Items[0] as TodoItem);
            }

            return Promise.resolve(undefined);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async getTodo(todoId: string, userId: string): Promise<TodoItem> {
        try {
            logger.info(`getTodo with id : ${todoId}`);

            const params: DocumentClient.QueryInput = {
                TableName: this.todosTable,
                KeyConditionExpression: 'todoId = :todoId and userId = :userId',
                ExpressionAttributeValues: {
                    ':todoId': todoId,
                    ':userId': userId
                }
            };

            const result = await this.docClient.query(params).promise();

            if (result.Items && result.Items.length) {
                return Promise.resolve(result.Items[0] as TodoItem);
            }

            return Promise.resolve(undefined);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async getAllTodos(): Promise<TodoItem[]> {
        try {
            logger.info("getAllTodos");

            const result = await this.docClient.query({
                TableName: this.todosTable
            }).promise();

            return Promise.resolve(result.Items as TodoItem[]);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async getAllTodosByUser(userId: string): Promise<TodoItem[]> {
        try {
            logger.info(`getAllTodosByUser userId : ${userId}`);

            const params: DocumentClient.QueryInput = {
                TableName: this.todosTable,
                KeyConditionExpression: "userId = :userId",
                ExpressionAttributeValues: {
                    ':userId': userId
                }
            };

            const result = await this.docClient.query(params).promise();
            return Promise.resolve(result.Items as TodoItem[]);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async createTodo(todo: TodoItem): Promise<TodoItem> {
        try {
            logger.info("createTodo", todo);

            const params: DocumentClient.PutItemInput = {
                TableName: this.todosTable,
                Item: todo
            };

            await this.docClient.put(params).promise();
            return Promise.resolve(todo);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async updateAttachmentUrl(todoId: string, userId: string, attachmentUrl: string): Promise<void> {
        try {
            logger.info(`updateAttachmentUrl : ${todoId}`);

            const params: DocumentClient.UpdateItemInput = {
                TableName: this.todosTable,
                Key: {
                    "todoId": todoId,
                    "userId": userId
                },
                UpdateExpression: "set #a = :a",
                ExpressionAttributeNames: {
                    '#a': 'attachmentUrl',
                },
                ExpressionAttributeValues: {
                    ":a": attachmentUrl
                }
            };

            await this.docClient.update(params).promise();
            return Promise.resolve();
        } catch (error) {
            return Promise.reject(error);
        }
    };

    async updateTodo(todoId: string, userId: string, item: UpdateTodoRequest): Promise<TodoUpdate> {
        try {
            logger.info(`updateTodo with id: ${todoId}`);

            const params: DocumentClient.UpdateItemInput = {
                TableName: this.todosTable,
                Key: {
                    "userId": userId,
                    "todoId": todoId
                },
                UpdateExpression: "set #a = :a, #b = :b, #c = :c",
                ExpressionAttributeNames: {
                    '#a': 'name',
                    '#b': 'dueDate',
                    '#c': 'done'
                },
                ExpressionAttributeValues: {
                    ":a": item.name,
                    ":b": item.dueDate,
                    ":c": item.done
                },
                ReturnValues: "UPDATED_NEW"
            };

            const updatedItem = await this.docClient.update(params).promise();
            return Promise.resolve(updatedItem.Attributes as TodoUpdate);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async deleteTodo(todoId: string, userId: string): Promise<void> {
        try {
            logger.info(`deleteTodo with id: ${todoId}`);

            const params: DocumentClient.DeleteItemInput = {
                TableName: this.todosTable,
                Key: {
                    "userId": userId,
                    "todoId": todoId
                }
            };

            await this.docClient.delete(params).promise();
            return Promise.resolve();
        } catch (error) {
            return Promise.reject(error);
        }
    }
}

const createDynamoDBClient = () => {
    if (config.isOffline) {
        logger.info("createDynamoDBClient locally");
        return new XAWS.DynamoDB.DocumentClient({
            region: "localhost",
            endpoint: "http://localhost:8000"
        });
    }

    return new XAWS.DynamoDB.DocumentClient();
};