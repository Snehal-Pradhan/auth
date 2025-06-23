import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import cookieParser from 'cookie-parser';
import jwt, { decode } from 'jsonwebtoken';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const SECRET_KEY = process.env.SECRET_KEY

const users = [
    { id: 1, username: 'admin', password: 'admin123' }
];


app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await users.find(u => u.username === username && u.password === password);
    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '1h' });
    res.cookie('authToken', token, {
        maxAge: 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'strict',
    })
    res.json({ message: 'Login successful' });
})


app.get('/profile', (req, res) => {
    const { authToken } = req.cookies;
    if (!authToken) {
        return res.status(401).json({ message: 'not authenticated' });
    }

    try {
        const decoded = jwt.verify(authToken, SECRET_KEY);
        return res.json({
            message: 'Welcome to your profile',
            userId: decoded.id,
        });
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
})


app.post('/logout', (req, res) => {
    res.clearCookie('authToken');
    res.json({ message: 'Logged out successfully' });
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});