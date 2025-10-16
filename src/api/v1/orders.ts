import {Router} from "express";
import {OrderModel} from "../../models/Order";
import {postOrder, patchOrder} from "../../controllers/v1/orders";
import {DomainError} from "../../exceptions";

export function setupOrders(router: Router) {
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
        res.json({order});
    });

    router.post('/', async (req, res, next) => {
        try {
            await postOrder(req, res, next);
        } catch (e) {
            if (e instanceof DomainError) {
                res.status(e.statusCode).json({error: e.message});
            } else {
                res.status(500).json({error: 'Unknown error occurred'});
            }
        }
        
    });
    router.patch('/:id/status', async (req, res, next) => {
        try {
            await patchOrder(req, res, next);
        }catch (e) {
            if (e instanceof DomainError) {
                res.status(e.statusCode).json({error: e.message});
            } else {
                res.status(500).json({error: e});
            }
        }
    })
    return router;
}