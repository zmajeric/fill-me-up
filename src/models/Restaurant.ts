import mongoose from 'mongoose';

export const MenuItemSchema = new mongoose.Schema(
    {
        name: {type: String, required: true},
        // quantity: {type: Number, required: true, min: 1},
        price: {type: Number, required: true, min: 0},
        restaurant: {type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true}
    },
    {timestamps: true}
);
export type MenuItem = mongoose.InferSchemaType<typeof RestaurantSchema> & { _id: mongoose.Types.ObjectId };
export const MenuItemModel = mongoose.model('MenuItem', MenuItemSchema);

const RestaurantSchema = new mongoose.Schema(
    {
        name: {type: String, required: true, index: true},
        address: {type: String, required: true},
        phone: {type: String},
        isActive: {type: Boolean, default: true},
        menus: [{type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem'}],
        dol: {type: Number, required: true, min: 0},
    },
    {timestamps: true}
);

export type Restaurant = mongoose.InferSchemaType<typeof RestaurantSchema> & { _id: mongoose.Types.ObjectId };
export const RestaurantModel = mongoose.model('Restaurant', RestaurantSchema);