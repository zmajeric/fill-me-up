import express, {Router} from 'express';
import {requestLogger} from './requestLogger.js';
import {MenuItemModel, MenuItemSchema, RestaurantModel} from "./models/Restaurant";
import {z} from "zod";
import {UserModel} from "./models/User";
import mongoose from "mongoose";
import {OrderModel} from "./models/Order";

export function createApp() {
    const app = express();

    app.use(express.json());
    app.use(requestLogger);

    app.use('/', setupMainRoutes());
    app.use('/v1', setupV1Routes());

    return app;
}

export function setupMainRoutes() {
    const router = Router();
    router.get('/health', (req, res) => {
        res.json({status: 'ok', uptime: process.uptime()});
    })
    return router;
}

const MenuItemRestaurant = z.object({
    name: z.string(),
    price: z.number().nonnegative()
});
const CreateRestaurantReq = z.object({
    name: z.string().min(1),
    address: z.string().min(1),
    phone: z.string().optional(),
    cuisine: z.string().optional(),
    dol: z.number().optional(),
    isActive: z.boolean().optional(),
});

const CreateUserReq = z.object({
    email: z.string().email(),
    password: z.string().min(7),
    name: z.string().min(1),
});

const MenuItemIdsOrder = z.string();
const CreateOrderReq = z.object({
    userId: z.string().min(1),
    restaurantId: z.string().min(1),
    items: z.array(MenuItemIdsOrder).min(1)
});

export function setupV1Routes() {
    const router = Router();
    router.get('/restaurants', async (_req, res) => {
        const list = await RestaurantModel.find().populate('menus').lean();
        res.json({restaurants: list});
    });

    // restaurants
    router.post('/restaurants', async (req, res, next) => {
        const parsed = CreateRestaurantReq.safeParse(req.body);
        if (!parsed.success) return next(parsed.error);
        const created = await RestaurantModel.create(parsed.data);
        res.status(201).json({restaurant: created});
    });

    router.post('/restaurants/:id/menu-items', async (req, res, next) => {
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

    // users
    router.get('/users', async (_req, res) => {
        const list = await UserModel.find().lean();
        res.json({users: list});
    });

    router.post('/users', async (req, res, next) => {
        const parsed = CreateUserReq.safeParse(req.body);
        if (!parsed.success) return next(parsed.error);
        const created = await UserModel.create(parsed.data);
        res.status(201).json({user: created});
    });

    // orders
    router.get('/orders', async (_req, res) => {
        const list = await OrderModel.find().lean();
        res.json({orders: list});
    });

    router.post('/orders', async (req, res, next) => {
        const parsedOrder = CreateOrderReq.safeParse(req.body);
        if (!parsedOrder.success) return next(parsedOrder.error);

        const restaurantId = parsedOrder.data.restaurantId;
        const menuItemsIds = parsedOrder.data.items
        // validate ids -- TODO: move to middleware, if at all?
        if (!mongoose.isValidObjectId(restaurantId)) {
            return res.status(400).json({ error: 'Invalid restaurantId' });
        }
        if (menuItemsIds.some(id => !mongoose.isValidObjectId(id))) {
            return res.status(400).json({ error: 'Invalid item id in items' });
        }

        const restaurant = await RestaurantModel.findById(restaurantId).lean();
        if (restaurant != null && restaurant.dol <= 0) {
            // todo: invalid response code
            return res.status(400).json({ error: 'Restaurant is out of available orders' });
        }

        const menuItems = await MenuItemModel.find({ _id: { $in: menuItemsIds}}).lean();
        if (menuItems.length !== menuItemsIds.length) {
            return res.status(400).json({ error: 'One or more menu items not found' });
        }
        var total = 0;
        for (const mi of menuItems) {
            if (mi.restaurant.toString() != restaurantId) {
                res.status(403).json({ error: 'Invalid menu items provided: not from the same restaurant' });
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