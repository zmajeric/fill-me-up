import {MongoClient} from "mongodb";

const uri = "mongodb://root:r00t@localhost:27017/?authSource=admin&directConnection=true";
const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
});

async function run() {
    await client.connect();
    const admin = client.db().admin();
    try {
        const status = await admin.command({replSetGetStatus: 1});
        console.log("replSetGetStatus:", status);
    } catch (e) {
        if (e.code === 94) {
            // NotYetInitialized → initialize as single-node with IPv4 host
            console.log(await admin.command({
                replSetInitiate: {_id: "rs0", members: [{_id: 0, host: "127.0.0.1:27017"}]}
            }));
            console.log(await admin.command({hello: 1}));
        } else {
            throw e;
        }
    } finally {
        await client.close();
    }
}

run();