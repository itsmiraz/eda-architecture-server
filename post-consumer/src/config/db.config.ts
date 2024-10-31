import mongoose from "mongoose";

export const connectDB = async () => {
  await mongoose
    .connect("mongodb://127.0.0.1:27017/eda")
    .then(() => {
      console.log("MongoDb Connected");
    })
    .catch((err) => {
      console.log("error connecting to db", err);
    });
};
