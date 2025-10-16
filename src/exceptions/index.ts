export class DomainError extends Error {
    statusCode: number = 400;

    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = 400;
    }
}

export class DolReachedError extends DomainError {
    constructor(restaurantId: any, dol: any) {
        super(`Order ${restaurantId} cannot transition to state '${dol}'`);
    }
}

export class ModelNotFound extends DomainError {
    constructor(modelName: string, orderId: any) {
        super(`${modelName} with id:${orderId} not found`);
        this.statusCode = 404;
    }
}

export class OrderStatusTransitionNotAllowed extends DomainError {
    constructor(currentStatus: any, status: any) {
        super(`Status of order from ${currentStatus} to ${status} is not allowed`);
        this.statusCode = 403;
    }
}