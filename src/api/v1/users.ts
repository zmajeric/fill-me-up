import {Router} from "express";
import {UserModel} from "../../models/User";
import {CreateUserReq} from "./schemas";

export function setupUsers() {
    const router = Router();
    router.get('/', async (_req, res) => {
        const list = await UserModel.find().lean();
        res.json({users: list});
    });

    router.post('/', async (req, res, next) => {
        const parsed = CreateUserReq.safeParse(req.body);
        if (!parsed.success) return next(parsed.error);
        const created = await UserModel.create(parsed.data);
        res.status(201).json({user: created});
    });
    return router;
}