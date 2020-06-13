/**
 * Fields in a request to create a single TODO item.
 */
interface CreateTodoRequest {
    name: string;
    dueDate: string;
}

/**
 * Fields in a request to update a single TODO item.
 */
interface UpdateTodoRequest {
    name: string;
    dueDate: string;
    done: boolean;
}

export {
    CreateTodoRequest,
    UpdateTodoRequest
};