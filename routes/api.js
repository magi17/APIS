const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router(); // ✅ Define router
const apisDir = path.join(__dirname, "../apis");

// Auto-load API routes
fs.readdirSync(apisDir).forEach(file => {
    if (file.endsWith(".js")) {
        const api = require(path.join(apisDir, file));
        router.get(api.usage, api.handler);
    }
});

// API list endpoint
router.get("/list", (req, res) => {
    const apis = fs.readdirSync(apisDir)
        .filter(file => file.endsWith(".js"))
        .map(file => require(path.join(apisDir, file)))
        .map(api => ({ name: api.name, category: api.category, path: `/api${api.usage}` }));
    
    res.json(apis);
});

module.exports = router; // ✅ Export router
