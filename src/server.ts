import express, {Router} from 'express';
import {requestLogger} from './requestLogger.js';

export function createApp() {
    const app = express();

    app.use(express.json());
    app.use(requestLogger);

    app.use('/v1/', apiV1Router());

    return app;
}

export function apiV1Router() {
    const router = Router();
    router.get('/health', (req, res) => {
        res.json({status: 'ok', uptime: process.uptime()});
    })
    return router;
}