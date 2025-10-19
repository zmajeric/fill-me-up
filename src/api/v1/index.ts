import {Router} from "express";
import {setupUsers} from "./users.js";
import {setupRestaurants} from "./restaurants.js";
import {setupOrders} from "./orders.js";

const router = Router();

router.use("/orders", setupOrders());
router.use("/restaurants", setupRestaurants());
router.use("/users", setupUsers());

export default router;