import mongoose from "mongoose";
import {logger} from "./utils/logger";

export async function connectDb(uri: string) {
    mongoose.set('strictQuery', true);
    await mongoose.connect(uri);
    logger.info('Connected to DB with URL: ' + uri);
}