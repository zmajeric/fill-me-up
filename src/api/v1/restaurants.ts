import {Router} from "express";
import {MenuItemModel, RestaurantModel} from "../../models/Restaurant";
import mongoose from "mongoose";
import {CreateRestaurantReq, MenuItemRestaurant} from "./schemas";

export function setupRestaurants() {
    const router = Router();
    router.get('/', async (_req, res) => {
        const list = await RestaurantModel.find().populate('menus').lean();
        res.json({restaurants: list});
    });

    router.post('/', async (req, res, next) => {
        const parsed = CreateRestaurantReq.safeParse(req.body);
        if (!parsed.success) return next(parsed.error);
        const created = await RestaurantModel.create(parsed.data);
        res.status(201).json({restaurant: created});
    });

    router.post('/:id/menu-items', async (req, res, next) => {
        const queryId = req.params.id;
        const restaurant = await RestaurantModel.findById(queryId);
        if (!restaurant) return res.status(404).json({error: 'Restaurant not found'});

        const menuItems = MenuItemRestaurant.safeParse(req.body);
        if (!menuItems.success) return next(menuItems.error);

        const persist = menuItems.data.map(mi => ({
            name: mi.name,
            price: mi.price,
            restaurant: restaurant.id,
        }));

        const createdMenuItems = await MenuItemModel.insertMany(persist)
        restaurant.menus.push(...createdMenuItems.map(mi => mi._id));
        await restaurant.save()
        res.status(201).json({menuItems: createdMenuItems});
    });
    return router;
}