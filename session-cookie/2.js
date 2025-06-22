// app.js
import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 3000;

// Middleware to parse cookies
app.use(cookieParser());

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files (like CSS) from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Route for the home page
app.get('/', (req, res) => {
    // Get the 'theme' cookie. Default to 'light' if not found.
    const currentTheme = req.cookies.theme || 'light';

    // Render the EJS template, passing the current theme
    res.render('index', { currentTheme: currentTheme });
});

// Route to set the theme cookie
app.get('/set-theme', (req, res) => {
    const theme = req.query.theme; // Get theme from query parameter (e.g., ?theme=dark)

    // Validate theme value to prevent arbitrary cookie setting
    if (theme === 'dark' || theme === 'light') {
        // Set the 'theme' cookie with the chosen value, expiring in 7 days
        res.cookie('theme', theme, { maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'Lax' });
    }

    // Redirect back to the home page after setting the cookie
    res.redirect('/');
});

// Start the server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});