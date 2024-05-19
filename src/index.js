import dotenv from "dotenv";
import mongoose, { mongo } from "mongoose";
import { DB_NAME } from "./constants.js";
import connectDB from "./db/index.js";
import { app } from "./app.js";
dotenv.config({
  path: "./env",
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000);
    console.log(`Server is running in port :${process.env.PORT}`);
  })
  .catch((error) => {
    console.log("MongoDB failed!!", error);
  });

//first approach
// (async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGODB_URI} / ${DB_NAME}`);
//   } catch (error) {
//     console.log(error);
//     throw err;
//   }
// })();
