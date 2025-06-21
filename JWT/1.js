import express from "express";
import dotenv from "dotenv";
dotenv.config();
import { connectDB } from "./config/db.js";
import UserRouter from "./routes/user.routes.js"

const app = express();
const PORT = process.env.PORT || 3000;

await connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", UserRouter);



app.listen(PORT, () => {
    console.log(`app listening at port ${PORT}`);
})
