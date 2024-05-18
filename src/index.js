import dotenv from "dotenv";
import mongoose, { mongo } from "mongoose";
import { DB_NAME } from "./constants.js";
import connectDB from "./db/index.js";

dotenv.config({
  path: "./env",
});

connectDB();

//first approach
// (async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGODB_URI} / ${DB_NAME}`);
//   } catch (error) {
//     console.log(error);
//     throw err;
//   }
// })();
