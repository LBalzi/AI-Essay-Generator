const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/generate", async (req, res) => {
    const { topic, wordCount, includeCitations, citationStyle } = req.body;

    if (!topic || !wordCount || wordCount < 50 || wordCount > 3000) {
        return res.status(400).json({ error: "Invalid input data." });
    }

    // Construct the prompt
    let prompt = `Write an academic essay on the following topic: ${topic}. The essay should be approximately ${wordCount} words.`;
    
    if (includeCitations) {
        prompt += ` Use ${citationStyle} citation style.`;
    }

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
                max_tokens: Math.min(4000, wordCount * 2) // Dynamically adjust based on word count
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
        res.status(500).json({ error: error.response ? error.response.data : "Something went wrong" });
    }
});

app.listen(5000, () => console.log("Server running on port 5000"));
