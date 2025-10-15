import {createServer} from 'node:http';
import {createApp} from './server.js';
import {loadEnv} from "./config";
import {logger} from "./logger";

const env = loadEnv();

async function main() {
    const app = createApp();
    const server = createServer(app);
    server.listen(env.PORT, () => {
        logger.info(`🟢 Server listening on port ${env.PORT}`);
    });
}

main().catch((err) => {
    logger.info(`💔 Startup failed ${err}`);
    process.exit(1);
});