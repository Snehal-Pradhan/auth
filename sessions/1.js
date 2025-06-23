import express from "express";
import session from "express-session";
import dotenv from "dotenv";
import helmet from "helmet";
dotenv.config();
const PORT = process.env.PORT || 3000;



const app = express();

app.use(express.json());
app.use(helmet());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 360000,
        httpOnly: true,
        sameSite: "lax"
    }
}))

const requireLogin = (req, res, next) => {
    if (!req.session.user) return res.status(401).json({ msg: 'user not authenticated' });
    next();
}


const users = [
    { id: 1, username: 'admin', password: 'password123' },
    { id: 2, username: 'user', password: 'mypassword' }
];


app.get('/', (req, res) => {
    res.json({ message: 'Session Auth API' });
});



app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    req.session.user = {
        id: user.id,
        username: user.username
    };

    res.json({ msg: 'login successful', user: req.session.user });
})


app.get("/profile", requireLogin, (req, res) => {
    res.json({ msg: 'welcome to profile', user: req.session.user });
})


app.post("/logout", requireLogin, (req, res) => {
    try {
        req.session.destroy();
    } catch (error) {
        return res.status(500).json({ message: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logout successful' });
})




app.listen(PORT, () => {
    console.log(`app listening at port ${PORT}`);
})