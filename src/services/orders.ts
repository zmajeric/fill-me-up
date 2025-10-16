import {MenuItemModel, RestaurantModel} from "../models/Restaurant";
import {OrderModel} from "../models/Order";
import {DolReachedError, DomainError, MenuItemAndRestaurantMismatchError} from "../exceptions";
import {CreateOrderDTO} from "../api/v1/schemas";

export async function createOrder(order: CreateOrderDTO, restaurantId: string, menuItemsIds: string[]) {
    const restaurant = await RestaurantModel.findById(restaurantId).lean();
    if (restaurant != null && restaurant.dol <= 0) {
        throw new DolReachedError(restaurantId, restaurant.dol);
        // return res.status(400).json({error: 'Restaurant is out of available orders'});
    }

    const menuItems = await MenuItemModel.find({_id: {$in: menuItemsIds}}).lean();
    if (menuItems.length !== menuItemsIds.length) {
        throw new DomainError('One or more menu items not found');
        // return res.status(400).json({error: 'One or more menu items not found'});
    }
    let total = 0;
    for (const mi of menuItems) {
        if (mi.restaurant.toString() != restaurantId) {
            throw new MenuItemAndRestaurantMismatchError(mi._id.toString(), restaurantId);
            // res.status(403).json({error: 'Invalid menu items provided: not from the same restaurant'});
        }
        total += mi.price;
    }

    const persist = {
        ...order,
        total: total,
    }

    return await OrderModel.create(persist);
}