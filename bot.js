const express = require("express");
const { Client, GatewayIntentBits, Partials } = require("discord.js");

// 🌐 ANTI-SONO (Render free)
const app = express();
app.get("/", (req, res) => {
  res.send("Bot ativo");
});
app.listen(process.env.PORT || 3000, () => {
  console.log("🌐 Anti-sleep ativo");
});

// 🤖 BOT
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Channel]
});

// 🔑 GERADOR DE KEY
function generateKey(type) {
  const base = "STORE-" + Math.random().toString(36).substring(2, 8).toUpperCase();
  if (type === "1d") return base + "-1D";
  if (type === "3d") return base + "-3D";
  if (type === "perm") return base + "-PERM";
}

// 🗂 pedidos
const pending = new Map();

// 👇 SEU ID (admin)
const ADMIN_ID = "1494847279985852499";

// 💬 COMANDOS
client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;

  const text = msg.content.toLowerCase().trim();
  console.log("MSG:", text); // debug

  // 🛒 comprar
  if (text === "comprar 1d" || text === "comprar 3d" || text === "comprar perm") {
    const type = text.split(" ")[1];
    pending.set(msg.author.id, type);
    return msg.reply("📩 Pedido iniciado! Agora envie o comprovante.");
  }

  // 📎 comprovante (imagem)
  if (msg.attachments.size > 0) {
    const type = pending.get(msg.author.id);

    if (!type) return msg.reply("⚠️ Nenhuma compra ativa.");

    const admin = await client.users.fetch(ADMIN_ID);

    await admin.send(
      `💰 PAGAMENTO\nUser: ${msg.author.tag}\nID: ${msg.author.id}\nPlano: ${type}\n\nUse: !confirm ${msg.author.id}`
    );

    return msg.reply("📩 Comprovante enviado!");
  }

  // ✔ confirmar
  if (text.startsWith("!confirm")) {
    const userId = text.split(" ")[1];
    const type = pending.get(userId);

    if (!type) return msg.reply("❌ Nenhum pedido.");

    const key = generateKey(type);
    const user = await client.users.fetch(userId);

    await user.send(`🔑 Sua key: ${key}`);

    pending.delete(userId);
    return msg.reply("✔ Key enviada!");
  }
});

// 🚀 online
client.on("ready", () => {
  console.log("🤖 Bot online");
});

// 🔐 token
client.login(process.env.DISCORD_TOKEN);
