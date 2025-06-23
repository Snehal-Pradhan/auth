import express from 'express';
import cookieParser from 'cookie-parser';

const app = express();
app.use(cookieParser());

// Middleware to read feature flags
app.use((req, res, next) => {
    req.features = req.cookies.features
        ? JSON.parse(req.cookies.features)
        : { darkmode: false, newFeatures: false };
    next();
});

// Toggle dark mode
app.get("/toggle-dark-mode", (req, res) => {
    req.features.darkmode = !req.features.darkmode;
    res.cookie("features", JSON.stringify(req.features), {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days expiration
        httpOnly: true // More secure
    });
    res.json({ darkmode: req.features.darkmode });
});

// A/B test endpoint
app.get("/new-feature", (req, res) => {
    if (req.features.newFeatures === undefined) {
        req.features.newFeatures = Math.random() > 0.5;
        res.cookie("features", JSON.stringify(req.features), {
            maxAge: 30 * 24 * 60 * 60 * 1000,
            httpOnly: true
        });
    }
    res.json({ newFeature: req.features.newFeatures });
});

app.listen(3000, () => {
    console.log(`App listening at port 3000`);
});