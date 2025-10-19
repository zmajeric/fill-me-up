import {NextFunction, Request, Response} from "express";
import mongoose from "mongoose";
import {CreateOrderReq, UpdateOrderStatusReq} from "../../api/v1/schemas.js";
import {createOrder, updateOrderStatus} from "../../services/orders.js";
import {DomainError} from "../../exceptions/index.js";

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
        const createdOrder = await createOrder(parsedOrder.data.userId, restaurantId, menuItemsIds);
        return res.status(201).json({order: createdOrder});
    } catch (e) {
        if (e instanceof DomainError) {
            res.status(e.statusCode).json({error: e.message});
        } else {
            res.status(500).json({error: `Unknown error occurred: ${e}`});
        }
    }
}

export async function patchOrder(req: Request, res: Response, next: NextFunction) {
    const status = UpdateOrderStatusReq.safeParse(req.body);
    if (!status.success) return next(status.error);
    const orderId = req.params.id;

    try {
        const updatedOrder = await updateOrderStatus(orderId, status.data.status);
        return res.status(200).json({order: updatedOrder});
    } catch (e) {
        if (e instanceof DomainError) {
            res.status(e.statusCode).json({error: e.message});
        } else {
            res.status(500).json({error: e});
        }
    }
}