import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();

const PORT = process.env.PORT || 3000;
const COOKIE_SECRET = process.env.COOKIE_SECRET;

const AB_TEST_NAME = "new_feature_rollout";


const AB_BUCKETS_DISTRIBUTION = [
    { name: "A", weight: 0.10 },
    { name: "B", weight: 0.90 }
];

const AB_BUCKET_NAMES = AB_BUCKETS_DISTRIBUTION.map(b => b.name);

const app = express();
app.use(cookieParser(COOKIE_SECRET));
const assignABBucket = (req, res, next) => {
    let assignedBucket = req.cookies[AB_TEST_NAME];

    if (!assignedBucket || !AB_BUCKET_NAMES.includes(assignedBucket)) {
        const randomNumber = Math.random();
        let cumulativeWeight = 0;

        for (const bucket of AB_BUCKETS_DISTRIBUTION) {
            cumulativeWeight += bucket.weight;
            if (randomNumber < cumulativeWeight) {
                assignedBucket = bucket.name;
                break;
            }
        }

        if (!assignedBucket) {
            assignedBucket = AB_BUCKET_NAMES[0];
            console.warn("Weighted assignment failed, defaulting to first bucket.");
        }

        res.cookie(AB_TEST_NAME, assignedBucket, {
            maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
            httpOnly: true,
            // secure: process.env.NODE_ENV === "production",
        });

        console.log(`New user assigned to bucket: ${assignedBucket}`);
    } else {
        console.log(`Returning user in bucket: ${assignedBucket}`);
    }

    req.abBucket = assignedBucket;
    next();
};

app.use(assignABBucket);


app.get("/", (req, res) => {
    res.json({
        message: "A/B Test Bucket service is running.",
        yourBucket: req.abBucket,
        testName: AB_TEST_NAME
    });
});


app.get("/api/bucket", (req, res) => {
    res.json({
        abTestName: AB_TEST_NAME,
        assignedBucket: req.abBucket,
        distribution: AB_BUCKETS_DISTRIBUTION
    });
});

app.listen(PORT, () => {
    console.log(`A/B Testing Buckets App listening on port ${PORT}`);
    console.log(`A/B Test: "${AB_TEST_NAME}"`);
    console.log("Distribution:");
    AB_BUCKETS_DISTRIBUTION.forEach(b => console.log(`  - ${b.name}: ${b.weight * 100}%`));
    if (!process.env.COOKIE_SECRET) {
        console.warn("WARNING: COOKIE_SECRET not set in .env! Using a default secret.");
    }
});