import express from 'express';
import cookieParser from 'cookie-parser';

const app = express();
app.use(cookieParser());

// Main domain cookie
app.get('/set-main', (req, res) => {
    res.cookie('mainCookie', 'main-domain-value', {
        domain: 'localhost', // Only accessible on localhost
        path: '/', // Accessible on all paths
        httpOnly: true,
        maxAge: 86400000 // 1 day
    });
    res.json({ message: 'Main domain cookie set' });
});

// Subdomain cookie
app.get('/set-sub', (req, res) => {
    res.cookie('test', 'value', { domain: '.myapp.test', path: '/' });
    res.json({ message: 'Subdomain cookie set' });
});

// Path-specific cookie
app.get('/set-path', (req, res) => {
    res.cookie('pathCookie', 'path-specific-value', {
        path: '/api', // Only accessible on /api paths
        httpOnly: true,
        maxAge: 86400000
    });
    res.json({ message: 'Path-specific cookie set' });
});

// Cookie checker
app.get('/check-cookies', (req, res) => {
    res.json({
        cookiesPresent: req.cookies,
        headers: req.headers
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});