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
        try {
            const command = require(`./commands/${file}`);

            if (!command.name || !command.handler) {
                throw new Error(`Missing required properties in ${file}`);
            }

            const route = command.route || `/${command.name}`;
            const method = command.method?.toLowerCase() || 'get';

            app[method](route, command.handler);

            commands.push({
                name: command.name,
                category: command.category || "uncategorized",
                route: route,
                method: method.toUpperCase(),
                usage: command.usage || "No usage information provided."
            });

            console.log(`✅ Loaded command: ${command.name} (Route: ${route}, Method: ${method.toUpperCase()})`);
        } catch (error) {
            console.error(`❌ Error loading ${file}: ${error.message}`);
        }
    }
});

// API to get the list of all commands
app.get('/api/list', (req, res) => {
    res.json(commands);
});

const port = config.port || 3000;
app.listen(port, () => console.log(`🚀 API running on port ${port}`));
