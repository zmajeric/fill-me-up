import {MenuItemModel, RestaurantModel} from "../models/Restaurant";
import {OrderModel} from "../models/Order";
import {DolReachedError} from "../exceptions";
import {CreateOrderDTO} from "../api/v1/schemas";

export async function createOrder(order: CreateOrderDTO, restaurantId: string, menuItemsIds: string[]) {
    const restaurant = await RestaurantModel.findById(restaurantId).lean();
    if (restaurant != null && restaurant.dol <= 0) {
        throw new DolReachedError(restaurantId, restaurant.dol);
        // return res.status(400).json({error: 'Restaurant is out of available orders'});
    }

    const qty = new Map<string, number>();
    for (const id of menuItemsIds) qty.set(id, (qty.get(id) ?? 0) + 1);

    const menuItems = await MenuItemModel
        .find({_id: {$in: [...qty.keys()]}, restaurant: restaurantId})
        .select({_id: 1, price: 1})
        .lean();

    const priceById = new Map(menuItems.map(mi => [mi._id.toString(), mi.price]));
    let total = 0;
    for (const [id, count] of qty) total += (priceById.get(id) ?? 0) * count;

    const persist = {
        ...order,
        total: total,
    }

    return await OrderModel.create(persist);
}