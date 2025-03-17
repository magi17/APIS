module.exports = {
    name: "hello",
    category: "greetings",
    usage: "/api/hello",
    handler: (req, res) => {
        res.json({ message: "Hello, world!" });
    }
};
