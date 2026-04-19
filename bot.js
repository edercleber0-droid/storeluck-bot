const express = require("express");
const { Client, GatewayIntentBits, Partials } = require("discord.js");

// 🌐 ANTI-SONO (Render)
const app = express();
app.get("/", (req, res) => res.send("Bot ativo"));
app.listen(process.env.PORT || 3000);

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

// 💰 PREÇOS
const prices = {
  "1d": "R$5",
  "3d": "R$10",
  "perm": "R$20"
};

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

  // 🛒 comprar
  if (text.startsWith("comprar")) {
    const type = text.split(" ")[1];

    if (!["1d", "3d", "perm"].includes(type)) {
      return msg.reply("❌ Use: comprar 1d / 3d / perm");
    }

    if (pending.has(msg.author.id)) {
      return msg.reply("⚠️ Você já tem um pedido ativo.");
    }

    pending.set(msg.author.id, type);

    return msg.reply(
      `📩 Pedido iniciado!\n\n💰 Plano: ${type}\n💵 Valor: ${prices[type]}\n\n🔑 Pix: 87981682220\n\n📎 Envie o comprovante após o pagamento.`
    );
  }

  // 📎 comprovante
  if (msg.attachments.size > 0) {
    const type = pending.get(msg.author.id);
    if (!type) return;

    const admin = await client.users.fetch(ADMIN_ID);

    await admin.send(
      `💰 PAGAMENTO\nUser: ${msg.author.tag}\nID: ${msg.author.id}\nPlano: ${type}\n\nConfirme com: !confirm ${msg.author.id}`
    );

    pending.delete(msg.author.id);

    return msg.reply("📩 Comprovante enviado para análise!");
  }

  // ✔ confirmar (admin)
  if (text.startsWith("!confirm")) {
    const userId = text.split(" ")[1];
    const type = pending.get(userId);

    if (!type) return msg.reply("❌ Nenhum pedido.");

    const key = generateKey(type);
    const user = await client.users.fetch(userId);

    try {
      await user.send(`🔑 Sua key: ${key}`);
      msg.reply("✔ Key enviada no privado!");
    } catch {
      msg.reply("⚠️ Não consegui enviar no PV. O usuário precisa ativar mensagens privadas.");
    }

    pending.delete(userId);
  }
});

// 🚀 ONLINE
client.on("ready", () => {
  console.log("🤖 Bot online");
});

// 🔐 TOKEN
client.login(process.env.DISCORD_TOKEN);
