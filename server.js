require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const axios = require("axios");

const app = express();

// Middleware to set the Content Security Policy header
app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy", 
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline'; " +  // Allows inline scripts
        "style-src 'self' 'unsafe-inline'; " +  // Allows inline styles
        "img-src 'self'; " +
        "connect-src 'self'; " +  // Allow connections to your API
        "font-src 'self';"
    );
    next();
});


// CORS configuration to allow requests from the frontend's URL
const corsOptions = {
    origin: "https://ai-essay-generator-pchq.onrender.com", // Replace with your frontend's deployed URL
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions)); // Enable CORS
app.use(express.json());

// Serve the static index.html file
app.use(express.static(path.join(__dirname)));

// Handle the essay generation POST request
app.post("/generate", async (req, res) => {
    const { topic, wordCount, includeCitations, citationStyle } = req.body;

    // Build the prompt dynamically based on the input values
    let prompt = `Write an academic essay on the topic of "${topic}" that is ${wordCount} words long.`;
    if (includeCitations) {
        prompt += ` Please include citations in the ${citationStyle} format.`;
    }

    try {
        // Send the request to OpenAI API
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4",
                messages: [
                    { 
                        role: "system", 
                        content: "You are an AI essay writer. The user is likely a high school or university student needing a well-structured, clear, and formal academic essay. Ensure proper grammar, logical flow, and well-supported arguments. If relevant, include an introduction, body paragraphs, and a conclusion." 
                    },
                    { 
                        role: "user", 
                        content: prompt 
                    }
                ],
                max_tokens: 4000 // Adjust if needed
            },
            {
                headers: {
                    "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        res.json({ response: response.data.choices[0].message.content });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong" });
    }
});

// Ensure the app listens to requests on Render's port
app.listen(process.env.PORT || 5000, () => console.log("Server running on port 5000"));
