import {Router} from "express";
import {setupUsers} from "./users";
import {setupRestaurants} from "./restaurants";
import {setupOrders} from "./orders";

const router = Router();

router.use("/orders", setupOrders(router));
router.use("/restaurants", setupRestaurants(router));
router.use("/users", setupUsers(router));

export default router;