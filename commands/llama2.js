const { llama } = require("gpti");


module.exports = {
    name: "llama2",
    category: "ai",
    usage: "/llama2?q=<text>",
    handler: async (req, res) => {
        const q = req.query.q;
        if (!q) {
            return res.status(400).json({ error: 'Query "q" is required.' });
        }

        try {
            const response = await llama({ messages: [{ role: "user", content: q }], markdown: false, stream: false });
            res.json({ response });
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error', details: error.message });
        }
    }
};
