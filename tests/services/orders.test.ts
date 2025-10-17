import {afterAll, beforeAll, beforeEach, describe, expect, it} from 'vitest';
import {MongoMemoryServer, MongoMemoryReplSet} from 'mongodb-memory-server';
import mongoose from 'mongoose';
import {DolReachedError} from "../../src/exceptions";
import {OrderModel} from "../../src/models/Order";
import {MenuItemModel, RestaurantModel} from "../../src/models/Restaurant";
import {createOrder, updateOrderStatus} from "../../src/services/orders";
import {UserModel} from "../../src/models/User";

describe('Orders Service', () => {
    let replSet: MongoMemoryReplSet;

    beforeAll(async () => {
        replSet = await MongoMemoryReplSet.create({
            replSet: { count: 1, storageEngine: 'wiredTiger' }, // transactions require WT
        });
        const uri = replSet.getUri();
        mongoose.set('strictQuery', true);
        await mongoose.connect(uri);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        if (replSet) await replSet.stop();
    });

    beforeEach(async () => {
        await OrderModel.deleteMany({});
        await UserModel.deleteMany({});
        await RestaurantModel.deleteMany({});
        await MenuItemModel.deleteMany({});
    });

    it('should create order with correct total price', async () => {
        const user = await UserModel.create({
            name: 'Test user',
            email: 'test@email.com',
            password: "aaaa"
        });

        // Create test restaurant
        const restaurant = await RestaurantModel.create({
            name: 'Test Restaurant',
            address: 'Test Address',
            dol: 10
        });

        // Create test menu items
        const menuItem1 = await MenuItemModel.create({
            name: 'Item 1',
            price: 10.0,
            restaurant: restaurant._id
        });
        const expectedTotal = 25.0;

        const menuItem2 = await MenuItemModel.create({
            name: 'Item 2',
            price: 15.0,
            restaurant: restaurant._id
        });

        const order = await createOrder(
            user._id.toString(),
            restaurant._id.toString(),
            [menuItem1._id.toString(), menuItem2._id.toString()]
        );

        expect(order.total).toBe(expectedTotal);
    });

    it('should throw DolReachedError when daily order limit is reached', async () => {
        const user = await UserModel.create({
            name: 'Test user',
            email: 'test@email.com',
            password: "aaaa"
        });

        const restaurant = await RestaurantModel.create({
            name: 'Test Restaurant',
            address: 'Test Address',
            dol: 1
        });

        const menuItem = await MenuItemModel.create({
            name: 'Item 1',
            price: 10.0,
            restaurant: restaurant._id
        });

        // Create first order
        await createOrder(
            user._id.toString(),
            restaurant._id.toString(),
            [menuItem._id.toString()]
        );
        // Attempt to create second order should fail
        await expect(createOrder(
            new mongoose.Types.ObjectId().toString(),
            restaurant._id.toString(),
            [menuItem._id.toString()]
        )).rejects.toThrow(DolReachedError);
    });
});