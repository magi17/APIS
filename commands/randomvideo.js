const fs = require("fs");
const path = require("path");
const dataFilePath = path.join(__dirname, "../data/videos.json");

function readJsonFile() {
    try {
        return JSON.parse(fs.readFileSync(dataFilePath, "utf8"));
    } catch (error) {
        return [];
    }
}

module.exports = {
    name: "randomVideo",
    category: "videos",
    usage: "/shoti2",
    method: "get",
    route: "/shoti2",
    handler: (req, res) => {
        const data = readJsonFile();
        const total = data.length;

        if (total === 0) {
            return res.status(404).json({
                message: "❌ No videos available",
                total,
                title: null,
                url: null
            });
        }

        const randomVideo = data[Math.floor(Math.random() * total)];

        res.json({
            message: "✅ Random video fetched successfully",
            total,
            title: randomVideo.title,
            url: randomVideo.url
        });
    }
};
