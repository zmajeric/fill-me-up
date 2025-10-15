import {createServer} from 'node:http';
import {createApp} from './server.js';
import {loadEnv} from "./config";
import {logger} from "./logger";
import mongoose from "mongoose";

const env = loadEnv();

async function main() {
    mongoose.set('strictQuery', true);
    await mongoose.connect(env.MONGO_URL);
    logger.info('Connected to DB with URL: ' + env.MONGO_URL);

    const app = createApp();
    const server = createServer(app);
    server.listen(env.PORT, () => {
        logger.info(`🟢 Server started on port ${env.PORT} 🟢`);
    });
}

main().catch((err) => {
    logger.info(`💔 Startup failed ${err} 💔`);
    process.exit(1);
});