import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

// Initialize environment variables
dotenv.config();

const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB connected successfully"))
    .catch(err => console.error("❌ MongoDB connection error:", err));

// --- User Schema and Model ---
const userSchema = new mongoose.Schema({
    googleId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    photo: { type: String },
}, { timestamps: true }); // Add timestamps for createdAt and updatedAt

const User = mongoose.model('User', userSchema);

// --- API Routes ---
app.get('/', (req, res) => {
    res.send('WellPredict Server is running!');
});

app.post('/auth/google', async (req, res) => {
    console.log('📩 Received request on /auth/google with body:', req.body);

    try {
        const { name, email, photo, googleId } = req.body;
        if (!email || !googleId || !name) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: name, email, and googleId are required.'
            });
        }

        let user = await User.findOne({ email });

        if (user) {
            user.name = name;
            user.photo = photo;
            user.googleId = googleId;
            await user.save();
            console.log('👋 Found and updated existing user:', email);
        } else {
            user = await User.create({ name, email, photo, googleId });
            console.log('🆕 Created new user:', email);
        }

        res.status(200).json({ success: true, user });

    } catch (err) {
        console.error('❌ Server error on /auth/google:', err);
        res.status(500).json({ success: false, error: 'An internal server error occurred.' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server started on port ${PORT}`));
