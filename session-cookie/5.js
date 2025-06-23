import express, { urlencoded } from "express";
import cookieParser from "cookie-parser";

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

const DEFAULT_CONSENT = {
    necessary: true,
    analytics: false,
    marketing: false,
    stupid: true
};

// Middleware to attach consent to request
app.use((req, res, next) => {
    try {
        req.consent = req.cookies.consent
            ? JSON.parse(req.cookies.consent)
            : DEFAULT_CONSENT;
    } catch (err) {
        req.consent = DEFAULT_CONSENT;
    }
    next();
});

// Save consent preferences
app.post("/save-consent", (req, res) => {
    const { analytics, marketing, stupid } = req.body;
    const consent = {
        necessary: true,
        analytics: analytics === 'true',
        marketing: marketing === 'true',
        stupid: stupid === 'true'
    };
    res.cookie('consent', JSON.stringify(consent), { maxAge: 60000 });
    res.json({ success: true });
});

// Track route (only if analytics consented)
app.get('/track', (req, res) => {
    if (!req.consent.analytics) {
        return res.status(403).json({ error: 'Analytics not consented' });
    }
    res.json({ tracked: true });
});

app.listen(3000, () => {
    console.log(`App listening at port 3000`);
});
