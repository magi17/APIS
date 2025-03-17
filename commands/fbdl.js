const getFBInfo = require("@xaviabot/fb-downloader");

module.exports = {
    name: "fbdl",
    category: "videos",
    usage: "/fbdl?url=<Facebook_Video_URL>",
    handler: async (req, res) => {
        const { url } = req.query;

        if (!url) {
            return res.status(400).json({ error: "Query parameter 'url' is required." });
        }

        try {
            const result = await getFBInfo(url);
            res.json({ video: result });
        } catch (error) {
            res.status(500).json({ error: "Internal Server Error", details: error.message });
        }
    }
};
