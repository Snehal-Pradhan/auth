import express from "express";
import session from "express-session";
import passport from "passport";


const app = express();
const users = [];


app.use(express.urlencoded({ extended: false }));


app.use(session({
    secret: "keyboardcat",
    resave: false,
    saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
    const user = users.find(u => u.email === email);
    if (!user || user.password !== password) return done(null, false);
    return done(null, user);
}));

passport.serializeUser((user, done) => done(null, user.email));
passport.deserializeUser((email, done) => {
    const user = users.find(u => u.email === email);
    done(null, user);
});


// ✅ Register
app.post("/register", (req, res) => {
    const { email, password } = req.body;
    if (users.find(u => u.email === email)) return res.send("User already exists");
    users.push({ email, password });
    res.send("Registered");
});

// ✅ Login
app.post("/login", passport.authenticate("local"), (req, res) => {
    res.send("Logged in");
});

// ✅ Protected
app.get("/secret", (req, res) => {
    if (req.isAuthenticated()) return res.send("Secret data 🔐");
    res.status(401).send("Unauthorized");
});

// ✅ Logout
app.get("/logout", (req, res) => {
    req.logout(() => res.send("Logged out"));
});

app.listen(3000, () => console.log("Server running on port 3000"));