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

export class MenuItemAndRestaurantMismatchError extends DomainError {
    constructor(menuItemId: any, restaurantId: any) {
        super(`Menu item with id:${menuItemId} is not part of the restaurantId: '${restaurantId}'`);
        this.statusCode = 403;
    }
}