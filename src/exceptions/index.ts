export class DomainError extends Error {
    statusCode: number;

    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = 400;
    }
}

export class DolReachedError extends DomainError {
    constructor(restaurantId: string, dol: number) {
        super(`Order ${restaurantId} cannot transition to state '${dol}'`);
        this.statusCode = 403;
    }
}

export class ModelNotFound extends DomainError {
    constructor(modelName: string, orderId: string) {
        super(`${modelName} with id:${orderId} not found`);
        this.statusCode = 404;
    }
}

export class OrderStatusTransitionNotAllowed extends DomainError {
    constructor(currentStatus: string, status: string) {
        super(`Status of order from ${currentStatus} to ${status} is not allowed`);
        this.statusCode = 403;
    }
}