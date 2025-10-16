import {Router} from "express";
import {OrderModel} from "../../models/Order";
import mongoose from "mongoose";
import {MenuItemModel, RestaurantModel} from "../../models/Restaurant";
import {CreateOrderReq} from "./schemas";

export function setupOrders(router: Router) {
    // orders
    router.get('/', async (_req, res) => {
        const list = await OrderModel.find().lean();
        res.json({orders: list});
    });

    router.post('/', async (req, res, next) => {
        const parsedOrder = CreateOrderReq.safeParse(req.body);
        if (!parsedOrder.success) return next(parsedOrder.error);

        const restaurantId = parsedOrder.data.restaurantId;
        const menuItemsIds = parsedOrder.data.items
        // validate ids -- TODO: move to middleware, if at all?
        if (!mongoose.isValidObjectId(restaurantId)) {
            return res.status(400).json({error: 'Invalid restaurantId'});
        }
        if (menuItemsIds.some(id => !mongoose.isValidObjectId(id))) {
            return res.status(400).json({error: 'Invalid item id in items'});
        }

        const restaurant = await RestaurantModel.findById(restaurantId).lean();
        if (restaurant != null && restaurant.dol <= 0) {
            // todo: invalid response code
            return res.status(400).json({error: 'Restaurant is out of available orders'});
        }

        const menuItems = await MenuItemModel.find({_id: {$in: menuItemsIds}}).lean();
        if (menuItems.length !== menuItemsIds.length) {
            return res.status(400).json({error: 'One or more menu items not found'});
        }
        var total = 0;
        for (const mi of menuItems) {
            if (mi.restaurant.toString() != restaurantId) {
                res.status(403).json({error: 'Invalid menu items provided: not from the same restaurant'});
            }
            total += mi.price;
        }

        const persist = {
            ...parsedOrder.data,
            total: total,
        }

        const created = await OrderModel.create(persist);
        res.status(201).json({order: created});
    });
    return router;
}