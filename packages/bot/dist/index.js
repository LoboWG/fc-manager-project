"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
require("dotenv/config"); // Charge les variables du fichier .env
// Crée une nouvelle instance du client (le bot)
const client = new discord_js_1.Client({
    intents: [
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildMessages,
        discord_js_1.GatewayIntentBits.MessageContent,
        discord_js_1.GatewayIntentBits.GuildMembers,
    ],
});
// Un événement qui se déclenche une seule fois, quand le bot est prêt
client.once('ready', () => {
    if (client.user) {
        console.log(`🤖 Logged in as ${client.user.tag}!`);
    }
});
// Connecte le bot à Discord en utilisant le token du fichier .env
client.login(process.env.DISCORD_BOT_TOKEN);
