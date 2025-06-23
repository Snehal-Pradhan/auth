import express from "express";
import cookieParser from "cookie-parser";

const app = express();
app.use(cookieParser());
app.use(express.json());

const PRODUCT = [
    { id: 1, name: 'Wireless Mouse', price: 25.99 },
    { id: 2, name: 'Mechanical Keyboard', price: 89.99 }
];



app.listen(3000, () => {
    console.log(`app listening at port : 3000`);
})