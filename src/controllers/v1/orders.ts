import {NextFunction, Request, Response} from "express";
import {CreateOrderReq} from "../../api/v1/schemas";
import mongoose from "mongoose";
import {createOrder} from "../../services/orders";

export async function postOrder(req: Request, res: Response, next: NextFunction) {
    const parsedOrder = CreateOrderReq.safeParse(req.body);
    if (!parsedOrder.success) return next(parsedOrder.error);

    const restaurantId = parsedOrder.data.restaurantId;
    const menuItemsIds = parsedOrder.data.items
    // validate ids --- TODO: move to middleware, if at all?
    if (!mongoose.isValidObjectId(restaurantId)) {
        return res.status(400).json({error: 'Invalid restaurantId'});
    }
    if (menuItemsIds.some(id => !mongoose.isValidObjectId(id))) {
        return res.status(400).json({error: 'Invalid item menuItemId in items'});
    }

    try {
        const createdOrder =  createOrder(parsedOrder.data, restaurantId, menuItemsIds);
        return res.status(201).json({order: createdOrder});
    } catch (e) {
        throw e;
    }
}