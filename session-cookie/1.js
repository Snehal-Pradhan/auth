import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import cookieParser from 'cookie-parser';

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cookieParser());

app.get("/set-cookie",(req,res)=>{
    res.cookie("welcome","hello-user",{
        maxAge :  60000,
        httpOnly : true,
    })
    res.json({msg : "Cookie has been set!"});
})

app.get("/", (req, res) => {
    res.render("home");
})



app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
