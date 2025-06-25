import express from "express"
import dotenv from "dotenv"
import bcrypt from "bcryptjs"
import cookieParser from "cookie-parser"

dotenv.config()
const PORT = process.env.PORT || 3000;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const users = [];

const app = express();

if (!process.env.COOKIE_SECRET_KEY) {
    console.error('WARNING: COOKIE_SECRET_KEY is not defined in .env');
}

app.use(cookieParser(process.env.COOKIE_SECRET_KEY));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const validateUser = (req, res, next) => {
    const authToken = req.signedCookies.authToken;
    if (!authToken) {
        return res.status(401).json({ "success": false, msg: "Unauthorized: No valid authentication cookie found." });
    }
    req.user = authToken;
    next();

}

app.get("/", (req, res) => {
    res.json({ "success": true, msg: "App is working" });
});




app.post("/register", async (req, res) => {
    const { username, email, password } = req.body;
    const isRegistered = users.some(u => u.email === email);
    if (isRegistered) return res.status(409).json({ "success": false, msg: "Email already registered" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
        "username": username,
        "email": email,
        "password": hashedPassword
    }
    users.push(newUser);
    res.status(201).json({
        "success": true,
        "msg": "New User created",
        "data": {
            username: newUser.username,
            email: newUser.email
        }
    })
})



app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    if (!user) return res.status(401).json({ "success": false, message: "Invalid credentials" });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) return res.status(401).json({ "success": false, message: "Invalid credentials" });

    const authTokenPayload = { username: user.username, email: user.email, loggedInAt: Date.now() };

    res.cookie("authToken", authTokenPayload, {
        httpOnly: true,
        maxAge: 360000,
        sameSite: "Lax",
        signed: true,
        secure: IS_PRODUCTION
    })

    res.json({
        "success": true,
        "msg": "Logged in succesfully",
        data: {
            email: user.email
        }
    })
})


app.get("/profile", validateUser, (req, res) => {
    res.json({
        msg: "Welcome to your Profile", data: {
            email: req.user.email,
            loggedInAt: new Date(req.user.loggedInAt).toLocaleString()
        }
    })
})


app.post("/logout", validateUser, (req, res) => {
    res.clearCookie('authToken', {
        httpOnly: true,
        sameSite: 'Lax',
        secure: IS_PRODUCTION
    });
    res.status(200).json({ "success": true, msg: "Logged out successfully" });
})



app.listen(PORT, () => {
    console.log(`app listening at port ${PORT}`)
})