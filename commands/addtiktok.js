const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
require("dotenv").config(); // Load environment variables

const GITHUB_USERNAME = process.env.GITHUB_USERNAME || "magi17";
const GITHUB_REPO = process.env.REPO_NAME || "Uploader-";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "your_github_token_here";
const GITHUB_BRANCH = process.env.BRANCH || "main";

const dataFilePath = path.join(__dirname, "../data/videos.json");

function readJsonFile() {
    try {
        return JSON.parse(fs.readFileSync(dataFilePath, "utf8"));
    } catch (error) {
        return [];
    }
}

async function uploadToGitHub(localFile, repoPath) {
    const fileContent = fs.readFileSync(localFile, "utf8");

    const urlPath = `/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/contents/${repoPath}`;
    const options = {
        method: "GET",
        headers: { "User-Agent": "Node.js", Authorization: `token ${GITHUB_TOKEN}` }
    };

    let sha = null;
    try {
        const res = await fetch(`https://api.github.com${urlPath}`, options);
        if (res.ok) {
            const fileData = await res.json();
            sha = fileData.sha || null;
        }
    } catch (error) {
        console.error("Error checking file existence:", error.message);
    }

    const payload = {
        message: `Update ${repoPath}`,
        content: Buffer.from(fileContent).toString("base64"),
        branch: GITHUB_BRANCH,
        sha: sha || undefined
    };

    try {
        const res = await fetch(`https://api.github.com${urlPath}`, {
            method: "PUT",
            headers: {
                "User-Agent": "Node.js",
                Authorization: `token ${GITHUB_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error(await res.text());

        const response = await res.json();
        console.log(`✅ Uploaded to GitHub: ${repoPath} (${response.content.html_url})`);
        return true;
    } catch (error) {
        console.error("❌ GitHub upload failed:", error.message);
        return false;
    }
}

module.exports = {
    name: "addTikTok",
    category: "videos",
    usage: "/add?url=<TikTok_URL>",
    method: "get",
    route: "/add",
    handler: async (req, res) => {
        const tiktokUrl = req.query.url;
        if (!tiktokUrl) {
            return res.status(400).json({ message: "❌ Missing ?url=TIKTOK_URL" });
        }

        try {
            const response = await fetch(`https://kaiz-apis.gleeze.com/api/tiktok-dl?url=${encodeURIComponent(tiktokUrl)}`);
            if (!response.ok) throw new Error("TikTok API request failed");

            const jsonData = await response.json();
            if (!jsonData.title || !jsonData.url) {
                return res.status(400).json({ message: "❌ Invalid TikTok response" });
            }

            const data = readJsonFile();
            const newEntry = { title: jsonData.title.trim(), url: jsonData.url };
            data.push(newEntry);
            fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));

            console.log("✅ Added to videos.json:", newEntry);

            uploadToGitHub(dataFilePath, "videos.json").then((success) => {
                console.log(success ? "✅ GitHub upload successful" : "❌ GitHub upload failed");
            });

            res.json({
                message: "✅ Added successfully",
                total: data.length,
                added: newEntry
            });

        } catch (error) {
            console.error("❌ Error fetching TikTok video:", error.message);
            res.status(500).json({ message: "❌ Failed to fetch TikTok video" });
        }
    }
};
