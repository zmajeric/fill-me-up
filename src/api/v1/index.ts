import {Router} from "express";
import {setupUsers} from "./users";
import {setupRestaurants} from "./restaurants";
import {setupOrders} from "./orders";

const router = Router();

router.use("/orders", setupOrders());
router.use("/restaurants", setupRestaurants());
router.use("/users", setupUsers());

export default router;