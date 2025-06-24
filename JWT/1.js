import express from "express"
import dotenv from "dotenv"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs";

dotenv.config();

let users = [];
const PORT = process.env.PORT || 3000;


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            error: "Missing or malformed authorization header"
        });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(403).json({
                success: false,
                error: "Invalid token",
                details: err.message.includes("expired")
                    ? "Token expired"
                    : "Token verification failed"
            });
        }
        req.user = decoded;
        next();
    });
};


app.post("/signup", async (req, res) => {
    try {
        const { username, password } = req.body;
        const userExists = users.some(u => u.username === username);
        if (userExists) return req.status(400).json({ error: "User already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = { id: Date.now(), username: username, password: hashedPassword };
        users.push(newUser);

        res.json({ "success": true, msg: "User registered successfully", data: { username: username } });
    } catch (error) {
        res.json({ "success": false, error: error });
    }
})


app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = users.find(u => u.username === username);
        if (!user) return res.status(400).send('Invalid username or password.');

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).send('Invalid username or password.');

        const token = jwt.sign({ id: user.id, username: username }, process.env.SECRET_KEY, {
            expiresIn: '1h'
        })
        res.json({ token });
    } catch (error) {
        res.status(500).send('Error logging in.');
    }
})

app.get('/protected', verifyToken, (req, res) => {
    res.send(`Welcome ${req.user.username}! This is a protected route.`);
});





app.listen(PORT, () => {
    console.log(`app listening at port ${PORT}`)
})