const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Groq = require("groq-sdk").Groq;

dotenv.config();
const app = express();

app.use(cors({ origin: "*", methods: ["GET", "POST"] }));
app.use(express.json());

// MongoDB connection
mongoose
    .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/healthpredictor", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.log("MongoDB error:", err));

// User schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});
const User = mongoose.model("User", userSchema);

// Groq client setup
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

// Signup
app.post("/signup", async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password)
            return res.status(400).json({ message: "Username and password required" });

        const existing = await User.findOne({ username });
        if (existing) return res.status(400).json({ message: "User already exists" });

        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({ username, password: hashed });

        return res.json({ success: true, message: "User created", user: { username: user.username } });
    } catch (err) {
        console.error("Signup error:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

// Login
app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password)
            return res.status(400).json({ message: "Username and password required" });

        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: "User not found" });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ message: "Invalid password" });

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET || "devsecret",
            { expiresIn: "1d" }
        );
        return res.json({ success: true, token, username: user.username });
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

// Token verification
function verifyToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.status(403).json({ message: "Token required" });

    jwt.verify(token, process.env.JWT_SECRET || "devsecret", (err, decoded) => {
        if (err) return res.status(401).json({ message: "Invalid token" });
        req.user = decoded;
        next();
    });
}

// Dashboard protected
app.get("/dashboard", verifyToken, (req, res) => {
    res.json({ message: "Welcome to dashboard", user: req.user });
});

//Groq route
app.post("/get-tips", verifyToken, async (req, res) => {
    console.log("=== /get-tips request body ===", req.body);

    try {
        const { posture, screenTime, lastMeal, lastWater, lastNightSleep, qualitySleep, screenTimeBeforeBed } = req.body;

        const prompt = `
User metrics:
Posture: ${posture}
Screen Time: ${screenTime} hrs
Last Meal: ${lastMeal} hrs ago
Last Water: ${lastWater} mins ago
Last Night's Sleep: ${lastNightSleep} hrs
Sleep Quality: ${qualitySleep}/5
Screen Time Before Bed: ${screenTimeBeforeBed} mins

Give 3 personalized tips for health and posture in structured JSON:
{
  "tips": [
    "Tip 1",
    "Tip 2",
    "Tip 3"
  ]
}
`;

        if (!process.env.GROQ_API_KEY) {
            console.log("GROQ_API_KEY is missing!");
            return res.status(500).json({ success: false, error: "GROQ_API_KEY missing" });
        }

        const response = await groq.chat.completions.create({
            //model: "llama3-8b-8192",
            model: "moonshotai/kimi-k2-instruct",
            messages: [
                { role: "system", content: "You are a helpful health assistant. Return only valid JSON." },
                { role: "user", content: prompt },
            ],
        });

        console.log("=== Raw Groq response ===", response);

        // Extract output
        let output;
        if (response?.choices?.[0]?.message?.content) output = response.choices[0].message.content;
        else output = JSON.stringify(response);

        console.log("=== Groq output content ===", output);

        let tips = [];
        try {
            const parsed = JSON.parse(output.match(/\{[\s\S]*\}/)[0]);
            tips = Array.isArray(parsed.tips) ? parsed.tips : [];
        } catch (err) {
            console.error("JSON parse failed:", err);
            return res.status(500).json({ success: false, error: "Invalid JSON from model", details: err.message });
        }

        console.log("=== Tips parsed ===", tips);
        return res.json({ success: true, tips });

    } catch (err) {
        console.error("Groq /get-tips error:", err);
        return res.status(500).json({ success: false, error: err.message });
    }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
