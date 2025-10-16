import {Router} from "express";
import {MenuItemModel, RestaurantModel} from "../../models/Restaurant";
import mongoose from "mongoose";
import {CreateRestaurantReq, MenuItemRestaurant} from "./schemas";

export function setupRestaurants(router: Router) {
    router.get('/restaurants', async (_req, res) => {
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

        const menuItem = MenuItemRestaurant.safeParse(req.body);
        if (!menuItem.success) return next(menuItem.error);

        const persist = {
            ...menuItem.data,
            restaurant: new mongoose.Types.ObjectId(restaurant.id),
        }

        const createdMenuItem = await MenuItemModel.create(persist)
        restaurant.menus.push(createdMenuItem._id);
        await restaurant.save()
        res.status(201).json({menuItem: menuItem});
    });
    return router;
}