import mongoose from 'mongoose';
import {MenuItemSchema} from "./Restaurant";

const OrderSchema = new mongoose.Schema(
    {
        userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true},
        restaurantId: {type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true},
        items: {type: [MenuItemSchema], required: true},
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'delivered', 'cancelled'],
            default: 'pending',
            index: true
        },
        total: {type: Number, required: true, min: 0},
    },
    {timestamps: true}
);

export type Order = mongoose.InferSchemaType<typeof OrderSchema> & { _id: mongoose.Types.ObjectId };
export const OrderModel = mongoose.model('Order', OrderSchema);