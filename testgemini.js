
require('dotenv').config();
const express = require('express');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, } = require("@google/generative-ai");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

// --- Models ---
const textModel = genAI.getGenerativeModel({ model: "gemini-pro" }); // Default text model
const imageGenerationModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp-image-generation" });
const imageAnalysisModel = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

// --- Single Flexible Endpoint ---
app.post('/gemini', async (req, res) => {
try {
const { prompt, imageUrl } = req.body;

if (!prompt && !imageUrl) {
        return res.status(400).json({ error: 'Please provide either a "prompt" for text/image generation or both "prompt" and "imageUrl" for image analysis.' });
    }

    // --- Image Analysis (prompt + imageUrl) ---
    if (prompt && imageUrl) {
        console.log("Performing image analysis...");
        const generationConfig = { temperature: 0.4 };
     //   const safetySettings = [...]; // Your safety settings
        const parts = [{ text: prompt }, { image_url: { url: imageUrl } }];

        const result = await imageAnalysisModel.generateContent({ contents: [{ parts }], generationConfig, safetySettings });
        const response = result.response;
        if (response?.candidates?.length > 0) {
            const textResponse = response.candidates.map(c => c.content.parts.map(p => p.text).join('')).join('\n');
            return res.json({ analysis: textResponse });
        } else {
            return res.status(500).json({ error: 'No image analysis response received.' });
        }
    }

    // --- Image Generation (prompt only, assuming intent to generate image) ---
    if (prompt && !imageUrl && prompt.toLowerCase().includes("generate image")) {
        console.log("Performing image generation...");
        const generationConfig = { temperature: 0.9 };
        const safetySettings = [...]; // Your safety settings
        const parts = [{ text: prompt }];

        const result = await imageGenerationModel.generateContent({ contents: [{ parts }], generationConfig, safetySettings });
        const response = result.response;
        if (response?.candidates?.length > 0) {
            const imageOutput = response.candidates.reduce((acc, c) => {
                c.content.parts.forEach(part => {
                    if (part.image_data) { acc.hasImage = true; console.log("Base64 image data:", part.image_data.base64); /* Handle properly */ }
                    else if (part.text?.startsWith("http")) acc.imageUrl = part.text;
                });
                return acc;
            }, { hasImage: false, imageUrl: null });

            if (imageOutput.imageUrl) return res.json({ imageUrl: imageOutput.imageUrl });
            if (imageOutput.hasImage) return res.json({ message: "Image data generated (base64 in console)." });
            return res.status(500).json({ error: 'No image URL or data in response.' });
        } else {
            return res.status(500).json({ error: 'Failed to generate image.' });
        }
    }

    // --- Text Completion (prompt only, or prompt without "generate image") ---
    if (prompt && !imageUrl) {
        console.log("Performing text completion...");
        const generationConfig = { temperature: 0.7 };
        const safetySettings = [...]; // Your safety settings

        const result = await textModel.generateContent({ prompt, generationConfig, safetySettings });
        const response = result.response;
        if (response?.candidates?.length > 0) {
            const textResponse = response.candidates.map(c => c.content.parts.map(p => p.text).join('')).join('\n');
            return res.json({ response: textResponse });
        } else {
            return res.status(500).json({ error: 'No text completion response received.' });
        }
    }

    // Should not reach here if checks above are comprehensive
    return res.status(400).json({ error: 'Invalid request parameters.' });

} catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Failed to process your request.' });
}


});

app.listen(port, () => {
console.log(Server listening on port ${port});
});
