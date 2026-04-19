const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// 🔑 gerar key
function generateKey() {
  return "STORE-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

// anti duplicação
const usedTickets = new Set();

client.on("ready", () => {
  console.log("🤖 Bot online");
});

client.on("messageCreate", (msg) => {
  try {
    if (!msg.channel?.name?.startsWith("ticket")) return;

    const id = msg.channel.id;

    if (usedTickets.has(id)) {
      msg.channel.send("❌ Ticket já processado.");
      return;
    }

    const text = msg.content.toLowerCase();

    if (text.includes("pago") || msg.attachments.size > 0) {

      const key = generateKey();

      usedTickets.add(id);

      msg.channel.send(
        "✔ Pagamento confirmado\n🔑 KEY: " + key + "\n⏳ Expira em 24h"
      );
    }

  } catch (err) {
    console.log("❌ erro:", err);
  }
});

// 🔐 TOKEN AGORA VEM DO RENDER (NÃO DO CÓDIGO)
client.login(process.env.DISCORD_TOKEN)
  .catch(err => console.log("❌ Token error:", err));
