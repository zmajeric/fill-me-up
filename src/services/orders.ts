import mongoose from "mongoose";
import {MenuItemModel, RestaurantModel} from "../models/Restaurant.js";
import {OrderModel, OrderStatus} from "../models/Order.js";
import {DolReachedError, ModelNotFound, OrderStatusTransitionNotAllowed} from "../exceptions/index.js";
import {endOfToday, startOfToday} from "../utils/utils.js";

export async function createOrder(userId: string, restaurantId: string, menuItemsIds: string[]) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const restaurant = await RestaurantModel.findById(restaurantId).session(session);
        const todayCount = await OrderModel.countDocuments({
            restaurantId: restaurantId,
            status: {$in: ['PENDING', 'CONFIRMED']},
            createdAt: {$gte: startOfToday(), $lt: endOfToday()},
        }).session(session);

        if (restaurant != null && todayCount >= restaurant.dol) {
            throw new DolReachedError(restaurantId, restaurant.dol);
        }

        const qty = new Map<string, number>();
        for (const id of menuItemsIds) qty.set(id, (qty.get(id) ?? 0) + 1);

        const menuItems = await MenuItemModel
            .find({_id: {$in: [...qty.keys()]}, restaurant: restaurantId})
            .select({_id: 1, price: 1})
            .session(session);

        const priceById = new Map(menuItems.map(mi => [mi._id.toString(), mi.price]));
        let total = 0;
        for (const [id, count] of qty) total += (priceById.get(id) ?? 0) * count;

        const persist = {
            userId: userId,
            restaurantId: restaurantId,
            items: menuItemsIds,
            total: total,
        }
        const createdOrder = await OrderModel.create([persist], {session}).then(orders => orders[0]);
        await session.commitTransaction();

        return createdOrder;
    } catch (err) {
        await session.abortTransaction();
        throw err;
    } finally {
        await session.endSession();
    }
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

        return order;
    } catch (err) {
        await session.abortTransaction();
        throw err;
    } finally {
        await session.endSession();
    }
}