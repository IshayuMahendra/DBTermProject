"use server";
import mongoose from "mongoose";

let isConnected = false;

async function dbConnect() {
  if(!isConnected) {
    if(process.env.MONGODB_CONN_STRING == undefined) {
      throw new Error("MongoDB Connection String must be defined");
    }

    console.log("Connected To MONGODB");
    await mongoose.connect(process.env.MONGODB_CONN_STRING);
    isConnected = true;
  }
}

export default dbConnect;