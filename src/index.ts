import {createServer} from 'node:http';
import {createApp} from './api/server';
import {loadEnv} from "./config";
import {logger} from "./utils/logger";
import {connectDb} from "./db";

const env = loadEnv();

async function main() {
    connectDb(env.MONGO_URL)
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