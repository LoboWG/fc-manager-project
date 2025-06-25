"use strict";
// Fichier final et corrigé : packages/bot/src/index.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const canvas_1 = require("@napi-rs/canvas");
// --- PARTIE DISCORD ---
const client = new discord_js_1.Client({
    intents: [discord_js_1.GatewayIntentBits.Guilds],
});
client.once('ready', () => {
    if (client.user) {
        console.log(`🤖 [Discord] Logged in as ${client.user.tag}!`);
    }
});
client.login(process.env.DISCORD_BOT_TOKEN);
// --- Fonction pour générer l'image de la composition ---
async function generateLineupImage(sessionData) {
    const width = 800;
    const height = 1000;
    const canvas = new canvas_1.Canvas(width, height);
    const context = canvas.getContext('2d');
    context.fillStyle = '#2d3748'; // Fond gris foncé
    context.fillRect(0, 0, width, height);
    // Simulation de lignes de terrain de foot
    context.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    context.lineWidth = 3;
    context.beginPath();
    context.arc(width / 2, height, 200, Math.PI, 0); // Arc de cercle en bas
    context.stroke();
    context.beginPath();
    context.moveTo(0, height / 2);
    context.lineTo(width, height / 2); // Ligne médiane
    context.stroke();
    context.beginPath();
    context.arc(width / 2, height / 2, 80, 0, 2 * Math.PI); // Rond central
    context.stroke();
    context.font = 'bold 40px sans-serif';
    context.fillStyle = '#ffffff';
    context.textAlign = 'center';
    context.fillText("Composition de l'Équipe", width / 2, 60);
    const positions = {
        G: { x: 400, y: 900 },
        DG: { x: 150, y: 750 },
        DCG: { x: 325, y: 775 },
        DCD: { x: 475, y: 775 },
        DD: { x: 650, y: 750 },
        MDG: { x: 250, y: 550 },
        MDD: { x: 550, y: 550 },
        MOC: { x: 400, y: 400 },
        AG: { x: 150, y: 250 },
        AD: { x: 650, y: 250 },
        BU: { x: 400, y: 150 },
    };
    context.textAlign = 'center';
    sessionData.lineup.forEach(player => {
        const pos = positions[player.position];
        if (pos) {
            context.font = 'bold 24px sans-serif';
            context.fillStyle = '#00aaff';
            context.fillText(player.position, pos.x, pos.y - 18);
            context.font = '22px sans-serif';
            context.fillStyle = '#ffffff';
            context.fillText(player.user.username, pos.x, pos.y + 12);
        }
    });
    return canvas.toBuffer('image/png');
}
// --- PARTIE SERVEUR WEB (EXPRESS) ---
// On utilise la correction ("cast" en "any") qui fonctionne pour votre environnement
const app = express_1.default();
const PORT = 3002;
app.use(express_1.default.json());
app.post('/webhooks/lineup-ready', async (req, res) => {
    const { sessionId } = req.body;
    if (!sessionId)
        return res.status(400).send('Session ID is missing');
    console.log(`[Bot] ✅ Webhook reçu ! La composition pour la session ${sessionId} est prête.`);
    try {
        console.log(`[Bot] Récupération des données de la session depuis l'API...`);
        const response = await fetch(`http://localhost:3000/api/sessions/${sessionId}`);
        if (!response.ok)
            throw new Error(`Échec de la récupération des données de la session: ${response.statusText}`);
        const sessionData = await response.json();
        if (!sessionData.lineup || sessionData.lineup.length === 0) {
            throw new Error('La composition reçue est vide.');
        }
        console.log(`[Bot] Génération de l'image de la composition...`);
        const imageBuffer = await generateLineupImage(sessionData);
        const attachment = new discord_js_1.AttachmentBuilder(imageBuffer, { name: 'composition.png' });
        console.log(`[Bot] Recherche du salon Discord...`);
        const channel = await client.channels.fetch(process.env.DISCORD_CHANNEL_ID);
        if (channel instanceof discord_js_1.TextChannel) {
            await channel.send({
                content: `🔥 **Voici la composition pour la session !** 🔥`,
                files: [attachment]
            });
            console.log(`[Bot] ✅ Composition postée avec succès !`);
            res.status(200).send('Webhook traité et image postée');
        }
        else {
            throw new Error('Salon introuvable ou ce n\'est pas un salon textuel');
        }
    }
    catch (error) {
        console.error('[Bot] Erreur lors du traitement du webhook:', error.message);
        res.status(500).send('Erreur lors du traitement du webhook');
    }
});
app.listen(PORT, () => console.log(`[Bot] 🚀 Webhook server listening on port ${PORT}`));
//# sourceMappingURL=index.js.map