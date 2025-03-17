module.exports = {
    name: "time",
    category: "utility",
    usage: "/time",
    handler: (req, res) => {
        res.json({ time: new Date().toISOString() });
    }
};
