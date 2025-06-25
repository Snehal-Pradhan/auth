import express from "express";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.get("/set", (req, res) => {
    res.cookie("welcome", "hi", { httpOnly: true, maxAge: 60000 });
    res.json({ "success": true, msg: "cookies has been set" });
})

app.get("/read", (req, res) => {
    const welcomeValue = req.cookies.welcome;
    if (welcomeValue === undefined) return res.status(404).json({ "success": false, msg: "cookies unreadable" });
    res.json({
        "success": true, msg: "cookies readable", data:
        {
            welcome: welcomeValue
        }
    })
});

app.get("/clear", (req, res) => {
    res.clearCookie("welcome")
    res.json({ "success": true, msg: "cookies has been cleared" });
})


app.listen(3000, () => {
    console.log(`app listening at port 3000`);
})