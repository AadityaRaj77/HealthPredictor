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
mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:2017/healthpredictor", {
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

// Dashboard
app.get("/dashboard", verifyToken, (req, res) => {
    res.json({ message: "Welcome to dashboard", user: req.user });
});

//Groq route
app.post("/get-tips", verifyToken, async (req, res) => {
    console.log("=== /get-tips request body ===", req.body);

    try {
        const { posture, screenTime, lastMeal, lastWater, lastNightSleep, qualitySleep, screenTimeBeforeBed } = req.body;
        const prompt = `
Based on the following user metrics, generate a comprehensive health report.
User metrics:
- Posture: ${posture}
- Screen Time: ${screenTime} hrs
- Last Meal: ${lastMeal} hrs ago
- Last Water: ${lastWater} mins ago
- Last Night's Sleep: ${lastNightSleep} hrs
- Sleep Quality: ${qualitySleep}/5
- Screen Time Before Bed: ${screenTimeBeforeBed} mins

Please provide the report in the following structured JSON format.
- "alerts": Give a "Risk", "Moderate", or "Good" level for each key metric.
- "generalizedTips": 3 general health tips.
- "nearFutureRisks": 1-sentence risk for each category.
- "potentialFutureDiseases": List of 3-4 potential long-term diseases.
- "quickFixes": 3 immediate, actionable fixes.

{
  "alerts": {
    "posture": { "level": "Risk", "message": "Your reported posture is a high risk for back and neck pain." },
    "screenTime": { "level": "Moderate", "message": "Your screen time is moderate, but ensure you take breaks." },
    "hydration": { "level": "Risk", "message": "Going ${lastWater} mins without water leads to dehydration." },
    "sleep": { "level": "Risk", "message": "Sleeping only ${lastNightSleep} hours with quality ${qualitySleep}/5 is a major health risk." }
  },
  "generalizedTips": [
    "Aim for 7-9 hours of quality sleep each night.",
    "Incorporate a 30-minute walk into your daily routine.",
    "Try to eat a balanced diet rich in fruits and vegetables."
  ],
  "nearFutureRisks": {
    "physical": "You are at immediate risk of eye strain, headaches, and back stiffness.",
    "mental": "Expect reduced focus, mental fatigue, and potential irritability from poor sleep.",
    "overall": "Your overall productivity and energy levels are likely to be significantly reduced."
  },
  "potentialFutureDiseases": [
    "Chronic Back Pain",
    "Digital Eye Strain Syndrome",
    "Insomnia / Sleep Disorders",
    "Metabolic issues from sedentary habits"
  ],
  "quickFixes": [
    "Stand up, stretch your back and neck, and walk around for 2 minutes right now.",
    "Drink a full glass of water immediately to rehydrate.",
    "Use the 20-20-20 rule: Every 20 minutes, look at something 20 feet away for 20 seconds."
  ]
}
`;

        if (!process.env.GROQ_API_KEY) {
            console.log("GROQ_API_KEY is missing!");
            return res.status(500).json({ success: false, error: "GROQ_API_KEY missing" });
        }

        const response = await groq.chat.completions.create({
            model: "llama3-8b-8192", // Switched model
            messages: [
                { role: "system", content: "You are a helpful health assistant. You must return ONLY a valid JSON object matching the user's requested structure. Do not include any markdown formatting like ```json or any text outside the JSON object." },
                { role: "user", content: prompt },
            ],
            temperature: 0.7,
            response_format: { type: "json_object" }, // Enforce JSON output
        });

        console.log("=== Raw Groq response ===", response);

        let output;
        if (response?.choices?.[0]?.message?.content) output = response.choices[0].message.content;
        else output = JSON.stringify(response);

        console.log("=== Groq output content ===", output);

        let healthReport = {};
        try {
            let jsonString = output;
            if (!output.trim().startsWith('{')) {
                jsonString = output.match(/\{[\s\S]*\}/)[0]; // Fallback regex
            }
            healthReport = JSON.parse(jsonString);
        } catch (err) {
            console.error("JSON parse failed:", err);
            console.error("Raw output that failed parsing:", output); // Log the bad output
            return res.status(500).json({ success: false, error: "Invalid JSON from model", details: err.message });
        }

        console.log("=== Health Report parsed ===", healthReport);
        return res.json({ success: true, healthReport: healthReport });

    } catch (err) {
        console.error("Groq /get-tips error:", err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));