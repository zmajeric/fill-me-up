import {createServer} from 'node:http';
import {createApp} from './server.js';
import {loadEnv} from "./config";
import * as util from "node:util";

const env = loadEnv();

async function main() {
    const app = createApp();
    const server = createServer(app);
    server.listen(env.PORT, () => {
        util.log(`Server listening on port ${env.PORT}`);
    });
}

main().catch((err) => {
    util.log(`Startup failed ${err}`);
    process.exit(1);
});