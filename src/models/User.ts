import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
    {
        name: {type: String, required: true},
        email: {type: String, required: true, unique: true, index: true},
        password: {type: String, required: true},
        // orders: [{type: mongoose.Schema.Types.ObjectId, ref: 'Order'}]
    },
    {timestamps: true}
);

export type User = mongoose.InferSchemaType<typeof UserSchema> & { _id: mongoose.Types.ObjectId };
export const UserModel = mongoose.model('User', UserSchema);