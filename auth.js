const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const router = express.Router();

module.exports = (usersCollection) => {

    // User Registration API
    router.post("/register", async (req, res) => {
        try {
            const { name, email, password } = req.body;

            // Check required fields
            if (!name || !email || !password) {
                return res.status(400).json({
                    success: false,
                    message: "All fields are required"
                });
            }

            // Check existing user
            const existingUser = await usersCollection.findOne({
                email: email.toLowerCase()
            });

            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: "Email already registered"
                });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create user
            const newUser = {
                name,
                email: email.toLowerCase(),
                password: hashedPassword,
                createdAt: new Date()
            };

            await usersCollection.insertOne(newUser);

            res.status(201).json({
                success: true,
                message: "User registered successfully!"
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    });

    // User Login API
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // Find user
        const user = await usersCollection.findOne({
            email: email.toLowerCase()
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Generate JWT token
        const token = jwt.sign(
    {
        userId: user._id.toString(),
        name: user.name,
        email: user.email
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
);

        res.status(200).json({
            success: true,
            message: "Login successful!",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

    return router;
};