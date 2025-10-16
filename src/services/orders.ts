import {MenuItemModel, RestaurantModel} from "../models/Restaurant";
import {OrderModel, OrderStatus} from "../models/Order";
import {DolReachedError, ModelNotFound, OrderStatusTransitionNotAllowed} from "../exceptions";
import {CreateOrderDTO} from "../api/v1/schemas";
import mongoose from "mongoose";

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

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const order = await OrderModel.findById(orderId).session(session);
        if (!order) throw new ModelNotFound('Order', orderId);

        const allowed: Record<OrderStatus, OrderStatus[]> = {
            PENDING: ['CONFIRMED'],
            CONFIRMED: ['DELIVERED', 'CANCELLED'],
            DELIVERED: [],
            CANCELLED: []
        };

        if (!allowed[order.status].includes(status)) {
            throw new OrderStatusTransitionNotAllowed(order.status, status);
        }

        order.status = status;
        await order.save({session});

        await session.commitTransaction();
        return order.toObject();
    } catch (err) {
        await session.abortTransaction();
        throw err;
    } finally {
        await session.endSession();
    }
}