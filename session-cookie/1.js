import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cookieParser());
app.use(express.json());

app.get('/visit', (req, res) => {
    let visitCount = parseInt(req.cookies.visitCount) || 0;
    visitCount++;

    res.cookie('visitCount', visitCount, {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'lax'
    });

    res.json({
        message: `You have visited this page ${visitCount} times.`,
    })
});


app.get('/clear', (req, res) => {
    res.clearCookie('visitCount');
    res.json({
        message: 'Visit count cookie cleared.'
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
