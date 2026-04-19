const express = require("express");
const { Client, GatewayIntentBits, Partials } = require("discord.js");
const fs = require("fs");

const app = express();
app.get("/", (req, res) => res.send("API online"));

app.listen(process.env.PORT || 3000, () => {
  console.log("🌐 API online");
});

// =====================
// CONFIG
// =====================
const ADMIN_ID = "1494847279985852499";
const PIX = "87981682220";

const prices = {
  "1d": "R$5",
  "3d": "R$10",
  "perm": "R$20"
};

// =====================
// BOT
// =====================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Channel]
});

// pedidos em memória
const pending = new Map();

// =====================
// FUNÇÃO KEY
// =====================
function generateKey(type) {
  const base = "STORE-" + Math.random().toString(36).substring(2, 8).toUpperCase();

  if (type === "1d") return { key: base + "-1D", expires: Date.now() + 24 * 60 * 60 * 1000 };
  if (type === "3d") return { key: base + "-3D", expires: Date.now() + 3 * 24 * 60 * 60 * 1000 };
  return { key: base + "-PERM", expires: null };
}

// =====================
// SALVAR KEY
// =====================
function saveKey(data) {
  let keys = [];

  if (fs.existsSync("keys.json")) {
    keys = JSON.parse(fs.readFileSync("keys.json"));
  }

  keys.push(data);
  fs.writeFileSync("keys.json", JSON.stringify(keys, null, 2));
}

// =====================
// COMANDOS
// =====================
client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;

  const text = msg.content.toLowerCase();

  // 🛒 COMPRA
  if (text.startsWith("comprar")) {
    const type = text.split(" ")[1];

    if (!prices[type]) {
      return msg.reply("❌ Use: comprar 1d / 3d / perm");
    }

    pending.set(msg.author.id, type);

    return msg.reply(
      `📩 Pedido iniciado!\n\n💰 Plano: ${type}\n💵 Valor: ${prices[type]}\n\n🔑 PIX: ${PIX}\n\n📎 Envie o comprovante aqui.`
    );
  }

  // 📎 COMPROVANTE
  if (msg.attachments.size > 0) {
    const type = pending.get(msg.author.id);
    if (!type) return;

    const admin = await client.users.fetch(ADMIN_ID);

    await admin.send(
      `💰 NOVO PAGAMENTO\n\nUser: ${msg.author.tag}\nID: ${msg.author.id}\nPlano: ${type}\n\nResponda:\n✔ ${msg.author.id}\n❌ ${msg.author.id}`
    );

    return msg.reply("📩 Comprovante enviado para análise.");
  }

  // ✔ APROVAR
  if (text.startsWith("✔")) {
    const userId = text.split(" ")[1];
    const type = pending.get(userId);

    if (!type) return msg.reply("❌ Pedido não encontrado.");

    const data = generateKey(type);
    saveKey(data);

    const user = await client.users.fetch(userId);

    try {
      await user.send(`🔑 Sua key: ${data.key}`);
      msg.reply("✔ Key enviada com sucesso!");
    } catch {
      msg.reply("⚠️ Ative o privado para receber a key.");
    }

    pending.delete(userId);
  }

  // ❌ NEGAR
  if (text.startsWith("❌")) {
    const userId = text.split(" ")[1];

    pending.delete(userId);

    msg.reply("❌ Pedido negado.");
  }
});

// =====================
// ONLINE
// =====================
client.on("ready", () => {
  console.log("🤖 Bot online");
});

client.login(process.env.DISCORD_TOKEN);