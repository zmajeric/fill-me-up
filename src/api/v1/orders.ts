import {Router} from "express";
import {OrderModel} from "../../models/Order";
import {postOrder, patchOrder} from "../../controllers/v1/orders";
import {DomainError} from "../../exceptions";

export function setupOrders() {
    const router = Router();
    router.get('/', async (_req, res) => {
        const list = await OrderModel.find().lean();
        res.json({orders: list});
    });

    router.get('/:id', async (req, res) => {
        const orderId = req.params.id;
        const order = await OrderModel.findById(orderId)
            .populate('userId')
            .populate('items')
            .lean();
        if (order === null) return res.status(404).json({error: 'Order not found'});
        res.json({order});
    });

    router.post('/', async (req, res, next) => {
        await postOrder(req, res, next);
    });
    router.patch('/:id/status', async (req, res, next) => {
        await patchOrder(req, res, next);
    })
    return router;
}