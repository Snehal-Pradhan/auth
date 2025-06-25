import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
dotenv.config()
const PORT = process.env.PORT || 3000;

const app = express()
const IN_PRODUCTION = process.env.IN_PRODUCTION === 'production'
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET_KEY));

app.get("/", (req, res) => {
    res.json({ msg: "App is working" });
})

app.get("/get-consent-status", (req, res) => {
    const gdpr_consent = req.signedCookies.gdpr_consent;
    if (gdpr_consent === false) {
        return res.json({ msg: "Consent explicitly refused" });
    } else if (gdpr_consent === true) {
        return res.json({ msg: "Consent has been given" });
    } else {
        return res.json({ msg: "No consent recorded" });
    }
})

app.post("/consent", (req, res) => {
    const consentString = req.body.consent;
    const consent = consentString === "true";
    res.cookie("gdpr_consent", consent, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24,
        signed: true,
        secure: IN_PRODUCTION,
        sameSite: "Lax"
    })
    res.json({
        msg: "Your choice has been saved in cookies",
        data: {
            gdpr_consent: consent
        }
    })
})


app.post("/track/analytics", (req, res) => {
    const consent = req.signedCookies.gdpr_consent;
    if (consent) {
        res.cookie("tracking", consent, {
            httpOnly: true,
            sameSite: "Lax",
            maxAge: 1000 * 60 * 60 * 24 * 30,
            signed: true,
            secure: IN_PRODUCTION
        })
        res.json({ msg: "tracking ON" })
    }
    else {
        res.json({ msg: "server refused to set tracking cookie" })
    }
})


app.post("/clear-consent-cookies", (req, res) => {
    res.clearCookie("gdpr_consent", {
        httpOnly: true,
        sameSite: "Lax",
        secure: IN_PRODUCTION
    })
    res.clearCookie("tracking", {
        httpOnly: true,
        sameSite: "Lax",
        secure: IN_PRODUCTION
    })
    res.json({ msg: "cookies cleared" })
}
)




app.listen(PORT, () => {
    console.log(`app listening at port ${PORT}`)
})