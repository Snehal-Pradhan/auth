import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/jwt");
        console.log("mongodb connected");

    } catch (error) {
        console.error("mongodb failed to connect : ", error);
        process.exit(1);
    }

}

