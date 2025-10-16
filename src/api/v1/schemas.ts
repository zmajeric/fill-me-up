import {z} from "zod";

export const MenuItemIdsOrder = z.string();
export const CreateOrderReq = z.object({
    userId: z.string().min(1),
    restaurantId: z.string().min(1),
    items: z.array(MenuItemIdsOrder).min(1)
});

export const MenuItemRestaurant = z.object({
    name: z.string(),
    price: z.number().nonnegative()
});
export const CreateRestaurantReq = z.object({
    name: z.string().min(1),
    address: z.string().min(1),
    phone: z.string().optional(),
    cuisine: z.string().optional(),
    dol: z.number().optional(),
    isActive: z.boolean().optional(),
});

export const CreateUserReq = z.object({
    email: z.string().email(),
    password: z.string().min(7),
    name: z.string().min(1),
});