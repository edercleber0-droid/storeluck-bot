const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");

// 🌐 PORTA FAKE (resolve warning do Render)
const app = express();

app.get("/", (req, res) => {
  res.send("Bot running");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("🌐 Keep-alive ativo");
});

// 🤖 BOT DISCORD
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: ["CHANNEL"]
});

// 🔑 key generator
function generateKey(type) {
  const base = "STORE-" + Math.random().toString(36).substring(2, 8).toUpperCase();

  if (type === "1d") return base + "-1D";
  if (type === "3d") return base + "-3D";
  if (type === "perm") return base + "-PERM";

  return base;
}

const pending = new Map();

// 👇 SEU ID
const ADMIN_ID = "1495470321518514216";

client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;

  const text = msg.content.toLowerCase();

  // compra
  if (text.startsWith("comprar")) {
    const type = text.split(" ")[1];

    pending.set(msg.author.id, type);

    msg.channel.send("📩 Pedido recebido! Envie o Pix e comprovante.");
  }

  // comprovante
  if (msg.attachments.size > 0) {
    const type = pending.get(msg.author.id);

    if (!type) return msg.channel.send("⚠️ Nenhuma compra ativa.");

    const admin = await client.users.fetch(ADMIN_ID);

    admin.send(
      `💰 NOVO PAGAMENTO\nUsuário: ${msg.author.tag}\nTipo: ${type}\nConfirme: !confirm ${msg.author.id}`
    );

    msg.channel.send("📩 Enviado para verificação!");
  }

  // confirmação
  if (text.startsWith("!confirm")) {
    const userId = text.split(" ")[1];

    const type = pending.get(userId);

    if (!type) return msg.reply("❌ Nenhum pagamento.");

    const key = generateKey(type);

    const user = await client.users.fetch(userId);

    user.send(`✔ Aprovado!\n🔑 KEY: ${key}`);

    pending.delete(userId);

    msg.reply("✔ Enviado!");
  }
});

client.on("ready", () => {
  console.log("🤖 Bot online");
});

// 🔐 TOKEN
client.login(process.env.DISCORD_TOKEN);
