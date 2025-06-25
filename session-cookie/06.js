import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import LZString from "lz-string";

dotenv.config();
const PORT = process.env.PORT || 3000;
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const COOKIE_SECRET_KEY = process.env.COOKIE_SECRET_KEY;

const users = new Map();
const products = new Map();
const carts = new Map();
const orders = new Map();

products.set("prod-1", { id: "prod-1", name: "Laptop Pro", price: 1200.00, stock: 10 });
products.set("prod-2", { id: "prod-2", name: "Wireless Mouse", price: 25.00, stock: 50 });
products.set("prod-3", { id: "prod-3", name: "Mechanical Keyboard", price: 75.00, stock: 20 });
products.set("prod-4", { id: "prod-4", name: "USB-C Hub", price: 40.00, stock: 30 });

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(COOKIE_SECRET_KEY));

const getCart = (userId) => {
    const compressedCart = carts.get(userId);
    if (compressedCart) {
        try {
            const decompressed = LZString.decompressFromBase64(compressedCart);
            if (decompressed) {
                return JSON.parse(decompressed);
            }
        } catch (error) {
            console.error(`Error decompressing/parsing cart for user ${userId}:`, error);
        }
    }
    return [];
};

const setCart = (userId, cartObject) => {
    if (!Array.isArray(cartObject)) {
        console.warn(`Attempted to set non-array cart for user ${userId}. Converting to empty array.`);
        cartObject = [];
    }
    const jsonString = JSON.stringify(cartObject);
    const compressed = LZString.compressToBase66(jsonString); // Corrected to base66 if using LZString's compressToBase66
    carts.set(userId, compressed);
};

const deleteCart = (userId) => {
    carts.delete(userId);
};

const initializeUserCart = (userId) => {
    setCart(userId, []);
};

const ValidateAuth = (req, res, next) => {
    const authToken = req.signedCookies.AuthToken;

    if (!authToken) {
        return res.status(401).json({ msg: "Unauthorized: No authentication token provided" });
    }

    const userIdFromToken = authToken;

    const foundUser = users.get(userIdFromToken);

    if (!foundUser) {
        return res.status(403).json({ msg: "Forbidden: User associated with token not found" });
    }

    const loggedInAt = Date.now();

    req.userData = {
        id: foundUser.id,
        username: foundUser.username,
        email: foundUser.email,
        loggedInAt: loggedInAt
    };
    next();
};

app.get("/", (req, res) => {
    res.status(200).json({ msg: "App is working!" });
});

app.post("/register", async (req, res) => {
    const { username, email, password } = req.body;

    if (!username) return res.status(400).json({ msg: "Username is required." });
    if (!password) return res.status(400).json({ msg: "Password is required." });
    if (!email) return res.status(400).json({ msg: "Email is required." });

    if (username.length < 2 || username.length > 30) {
        return res.status(400).json({ msg: "Username must be between 2 and 30 characters." });
    }
    if (password.length < 8 || password.length > 30) {
        return res.status(400).json({ msg: "Password must be between 8 and 30 characters." });
    }

    const userExists = Array.from(users.values()).some(u => u.email === email);
    if (userExists) {
        return res.status(409).json({ msg: "Email already registered." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userId = uuidv4();

    const newUser = {
        id: userId,
        username: username,
        email: email,
        passwordHash: hashedPassword
    };

    users.set(userId, newUser);
    initializeUserCart(userId);

    res.status(201).json({
        msg: "User registered successfully!",
        data: {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
        }
    });
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ msg: "Email and password are required." });
    }

    const registeredUser = Array.from(users.values()).find(u => u.email === email);
    if (!registeredUser) {
        return res.status(404).json({ msg: "Invalid Credentials: User not found." });
    }

    const passwordMatch = await bcrypt.compare(password, registeredUser.passwordHash);
    if (!passwordMatch) {
        return res.status(401).json({ msg: "Invalid Credentials: Wrong password." });
    }

    res.cookie("AuthToken", registeredUser.id, {
        httpOnly: true,
        secure: IS_PRODUCTION,
        sameSite: "Lax",
        maxAge: 1000 * 60 * 60 * 24,
        signed: true
    });

    res.status(200).json({
        success: true,
        msg: "Logged in successfully!",
        data: {
            email: registeredUser.email,
            username: registeredUser.username
        }
    });
});

app.get("/profile", ValidateAuth, (req, res) => {
    const userData = req.userData;
    res.status(200).json({
        msg: "Welcome to your profile!",
        data: {
            id: userData.id,
            email: userData.email,
            username: userData.username,
            loggedInAt: new Date(userData.loggedInAt).toLocaleString()
        }
    });
});

app.post("/logout", (req, res) => {
    res.clearCookie('AuthToken', {
        httpOnly: true,
        secure: IS_PRODUCTION,
        sameSite: "Lax",
    });
    res.status(200).json({ msg: "Logged out successfully!" });
});

app.get("/api/products", (req, res) => {
    const allProducts = Array.from(products.values());
    res.status(200).json({ msg: "Products retrieved successfully.", products: allProducts });
});

app.get("/api/products/:productId", (req, res) => {
    const { productId } = req.params;
    const product = products.get(productId);
    if (!product) {
        return res.status(404).json({ msg: "Product not found." });
    }
    res.status(200).json({ msg: "Product retrieved successfully.", product });
});

app.post("/api/cart/add", ValidateAuth, (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.userData.id;

    if (!productId || typeof quantity !== 'number' || quantity <= 0) {
        return res.status(400).json({ msg: "Product ID and a positive quantity are required." });
    }

    if (!products.has(productId)) {
        return res.status(404).json({ msg: "Product not found in catalog." });
    }

    let cart = getCart(userId);

    const existingItemIndex = cart.findIndex(item => item.productId === productId);

    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += quantity;
    } else {
        cart.push({ productId, quantity });
    }

    setCart(userId, cart);
    res.status(200).json({ msg: "Item added/updated in cart successfully.", cart });
});

app.put("/api/cart/update", ValidateAuth, (req, res) => {
    const { productId, newQuantity } = req.body;
    const userId = req.userData.id;

    if (!productId || typeof newQuantity !== 'number' || newQuantity < 0) {
        return res.status(400).json({ msg: "Product ID and a non-negative new quantity are required." });
    }

    let cart = getCart(userId);
    const itemIndex = cart.findIndex(item => item.productId === productId);

    if (itemIndex === -1) {
        return res.status(404).json({ msg: "Item not found in cart." });
    }

    if (newQuantity === 0) {
        cart.splice(itemIndex, 1);
    } else {
        cart[itemIndex].quantity = newQuantity;
    }

    setCart(userId, cart);
    res.status(200).json({ msg: "Cart item quantity updated successfully.", cart });
});

app.delete("/api/cart/remove/:productId", ValidateAuth, (req, res) => {
    const { productId } = req.params;
    const userId = req.userData.id;

    let cart = getCart(userId);
    const initialLength = cart.length;

    cart = cart.filter(item => item.productId !== productId);

    if (cart.length === initialLength) {
        return res.status(404).json({ msg: "Item not found in cart." });
    }

    setCart(userId, cart);
    res.status(200).json({ msg: "Item removed from cart successfully.", cart });
});

app.get("/api/cart", ValidateAuth, (req, res) => {
    const userId = req.userData.id;
    const cart = getCart(userId);
    const detailedCart = cart.map(item => {
        const productDetails = products.get(item.productId);
        return {
            ...item,
            product: productDetails ? { name: productDetails.name, price: productDetails.price } : null
        };
    });
    res.status(200).json({ msg: "Cart retrieved successfully.", cart: detailedCart });
});

app.delete("/api/cart/clear", ValidateAuth, (req, res) => {
    const userId = req.userData.id;
    setCart(userId, []);
    res.status(200).json({ msg: "Cart cleared successfully.", cart: [] });
});

app.post("/api/checkout", ValidateAuth, (req, res) => {
    const userId = req.userData.id;
    const cart = getCart(userId);

    if (cart.length === 0) {
        return res.status(400).json({ msg: "Cannot checkout with an empty cart." });
    }

    let totalPrice = 0;
    const itemsForOrder = [];
    let stockError = false;
    let stockErrorMessage = "";

    for (const item of cart) {
        const product = products.get(item.productId);
        if (!product) {
            stockError = true;
            stockErrorMessage = `Product '${item.productId}' not found.`;
            break;
        }
        if (product.stock < item.quantity) {
            stockError = true;
            stockErrorMessage = `Not enough stock for '${product.name}'. Available: ${product.stock}, Requested: ${item.quantity}.`;
            break;
        }
        totalPrice += product.price * item.quantity;
        itemsForOrder.push({ ...item, name: product.name, price: product.price });
    }

    if (stockError) {
        return res.status(400).json({ msg: `Checkout failed: ${stockErrorMessage}` });
    }

    for (const item of cart) {
        const product = products.get(item.productId);
        if (product) {
            product.stock -= item.quantity;
        }
    }

    const orderId = uuidv4();
    const newOrder = {
        id: orderId,
        userId: userId,
        items: itemsForOrder,
        totalPrice: parseFloat(totalPrice.toFixed(2)),
        orderDate: Date.now()
    };
    orders.set(orderId, newOrder);

    deleteCart(userId);

    res.status(200).json({
        msg: "Order placed successfully!",
        order: {
            id: newOrder.id,
            totalPrice: newOrder.totalPrice,
            orderDate: new Date(newOrder.orderDate).toLocaleString()
        }
    });
});

app.get("/api/orders", ValidateAuth, (req, res) => {
    const userId = req.userData.id;
    const userOrders = Array.from(orders.values()).filter(order => order.userId === userId);

    res.status(200).json({
        msg: "Orders retrieved successfully.",
        orders: userOrders.map(order => ({
            id: order.id,
            totalPrice: order.totalPrice,
            orderDate: new Date(order.orderDate).toLocaleString(),
            itemsCount: order.items.length
        }))
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ msg: "An unexpected server error occurred." });
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    if (!COOKIE_SECRET_KEY) {
        console.warn("WARNING: COOKIE_SECRET_KEY is not set in your .env file! Signed cookies will not work correctly.");
    }
    if (IS_PRODUCTION) {
        console.log("Running in Production mode. Secure cookies (HTTPS) are enabled.");
    } else {
        console.log("Running in Development mode. Secure cookies are disabled (for HTTP).");
    }
    console.log(`Users in memory: ${users.size}`);
    console.log(`Products in catalog: ${products.size}`);
    console.log("Remember: All in-memory data will be lost on server restart!");
});