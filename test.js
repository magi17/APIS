const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const config = require('./config.json');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public')); // Serve static HTML files

const commandsPath = path.join(__dirname, 'commands');
const commands = [];

// Load all commands automatically
fs.readdirSync(commandsPath).forEach(file => {
    if (file.endsWith('.js')) {
        const command = require(`./commands/${file}`);
        app[command.method || 'get'](command.route, command.execute);
        commands.push({
            name: command.name,
            route: command.route,
            method: command.method || 'GET',
            usage: command.usage || ''
        });
        console.log(`Loaded command: ${command.name}`);
    }
});

// API to get the list of all commands
app.get('/api/list', (req, res) => {
    res.json(commands);
});

const port = config.port || 3000;
app.listen(port, () => console.log(`API running on port ${port}`));
