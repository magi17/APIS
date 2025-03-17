module.exports = {
    name: "add",
    category: "math",
    usage: "/add",
    handler: (req, res) => {
        const a = parseInt(req.query.a) || 0;
        const b = parseInt(req.query.b) || 0;
        res.json({ result: a + b });
    }
};
