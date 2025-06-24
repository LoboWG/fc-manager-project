import { Client, GatewayIntentBits } from 'discord.js';
import 'dotenv/config'; // Charge les variables du fichier .env

// Crée une nouvelle instance du client (le bot)
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
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