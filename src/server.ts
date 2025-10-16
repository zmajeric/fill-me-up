import express, {Router} from 'express';
import {requestLogger} from './requestLogger.js';
import v1 from "./api/v1";

export function createApp() {
    const app = express();

    app.use(express.json());
    app.use(requestLogger);

    app.use('/', setupMainRoutes());
    app.use('/api', setupApiRoutes());

    return app;
}

export function setupMainRoutes() {
    const router = Router();
    router.get('/health', (req, res) => {
        res.json({status: 'ok', uptime: process.uptime()});
    })
    return router;
}

export function setupApiRoutes() {
    const router = Router();
    router.use('/v1', v1)
    // router.use(v2)
    return router;
}