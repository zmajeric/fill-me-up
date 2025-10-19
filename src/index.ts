import {createServer} from 'node:http';
import {createApp} from './api/server.js';
import {loadEnv} from "./config.js";
import {logger} from "./utils/logger.js";
import {connectDb} from "./db.js";

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