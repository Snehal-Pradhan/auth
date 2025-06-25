import express from "express";
import { createClient } from "redis";
import crypto from "crypto";

const app = express();
const PORT = 3000;

app.get("/",(req,res)=>{
    res.json({msg  : "Welcome to Secure Cookie Manager"});
})


app.listen(PORT,()=>{console.log(`app listening at port : ${PORT}`)})