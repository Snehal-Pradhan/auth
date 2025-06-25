import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
const PORT = process.env.PORT || 3000;


const app = express();

app.use(cookieParser());

app.get("/visit", (req, res) => {
    let visit = parseInt(req.cookies.visited) || 1;
    visit++;
    res.cookie("visited", visit, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 1000 * 60 * 60,
        secure: false // for development
    })

    res.json({ success: true, msg: `Visited ${visit} times` });
})

app.get("/clear", (req, res) => {
    res.clearCookie("visited");
    res.json({ success: true, msg: "cookie has been cleared" });
})



app.listen(PORT, () => {
    console.log(`app listening at port : ${PORT}`)
})


