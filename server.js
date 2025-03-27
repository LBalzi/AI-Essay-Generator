require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

// CORS setup to allow requests from the frontend (replace with your actual frontend URL)
const corsOptions = {
  origin: "https://ai-essay-generator-pchq.onrender.com", // Replace with your frontend URL
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions)); // Apply CORS to all routes
app.use(express.json());

app.post("/generate", async (req, res) => {
    const { prompt } = req.body;

    try {
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

app.listen(5000, () => console.log("Server running on port 5000"));
