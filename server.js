const express = require("express");
const apiRoutes = require("./routes/api");

const app = express();
const PORT = 3000;

app.use("/api", apiRoutes); // ✅ Use the router

app.listen(PORT, () => {
    console.log(`API server running at http://localhost:${PORT}`);
});
