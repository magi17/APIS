require('express')();
const express = require('express');
const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} = require("@google/generative-ai");

const app = express();
const port = process.env.PORT || 3000;

// ⚠️ Hardcoded API Key (For Beta Testing Only)
const apiKey = "AIzaSyD5CCNspQlYuqIR2t1BggzEFG0jmTThino";
const genAI = new GoogleGenerativeAI(apiKey);

// --- Models ---
const textModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp-image-generation" });
const imageGenerationModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp-image-generation" });
const imageAnalysisModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp-image-generation" });

app.use(express.json());

// Define safety settings
const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH }
];

// Helper function to check if the request is for image generation
const isImageRequest = (prompt) => /^generate\s+.+/i.test(prompt.trim());

// --- Unified AI Endpoint ---
app.get('/gemini', async (req, res) => {
    try {
        const prompt = req.query.ask;
        const imageUrl = req.query.imageurl;

        if (!prompt) {
            return res.status(400).json({ error: 'Missing "ask" parameter in the request.' });
        }

        // --- Image Analysis ---
        if (imageUrl) {
            console.log("Performing image analysis...");
            const result = await imageAnalysisModel.generateContent({
                contents: [{ parts: [{ text: prompt }, { image_url: { url: imageUrl } }] }],
                generationConfig: { temperature: 0.4 },
                safetySettings
            });

            const response = result.response;
            if (response?.candidates?.length > 0) {
                const textResponse = response.candidates.map(c => c.content.parts.map(p => p.text).join('')).join('\n');
                return res.json({ analysis: textResponse });
            }
            return res.status(500).json({ error: 'No image analysis response received.' });
        }

        // --- Image Generation ---
        if (isImageRequest(prompt)) {
            console.log("Performing image generation...");
            const result = await imageGenerationModel.generateContent({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.9 },
                safetySettings
            });

            const response = result.response;
            if (response?.candidates?.length > 0) {
                // Extract Image URL from response
                const imageUrls = response.candidates.flatMap(c =>
                    c.content.parts
                        .filter(part => part.text?.startsWith("http"))
                        .map(part => part.text)
                );

                if (imageUrls.length > 0) {
                    return res.json({ imageUrl: imageUrls[0] });
                }

                return res.status(500).json({ error: 'No valid image URL found in response.' });
            }
            return res.status(500).json({ error: 'Failed to generate image.' });
        }

        // --- Text Completion ---
        console.log("Performing text completion...");
        const result = await textModel.generateContent({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7 },
            safetySettings
        });

        const response = result.response;
        if (response?.candidates?.length > 0) {
            const textResponse = response.candidates.map(c => c.content.parts.map(p => p.text).join('')).join('\n');
            return res.json({ response: textResponse });
        }
        return res.status(500).json({ error: 'No text completion response received.' });

    } catch (error) {
        console.error('Error processing request:', error.message);
        res.status(500).json({ error: 'Failed to process your request.', details: error.message });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
