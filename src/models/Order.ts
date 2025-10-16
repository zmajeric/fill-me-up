import mongoose from 'mongoose';

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED';

const OrderSchema = new mongoose.Schema(
    {
        userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true},
        restaurantId: {type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true},
        items: {type: [{type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem'}], required: true},
        status: {
            type: String,
            enum: ['PENDING', 'CONFIRMED', 'DELIVERED', 'CANCELLED'],
            default: 'PENDING',
            index: true
        },
        total: {type: Number, required: true, min: 0},
    },
    {timestamps: true}
);

export type Order = mongoose.InferSchemaType<typeof OrderSchema> & { _id: mongoose.Types.ObjectId };
export const OrderModel = mongoose.model('Order', OrderSchema);