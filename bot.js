const { Client, GatewayIntentBits, Partials } = require("discord.js");
const fs = require("fs");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Channel]
});

const ADMIN_ID = "1494847279985852499";
const PIX = "87981682220";

const prices = {
  "1d": "R$5",
  "3d": "R$10",
  "perm": "R$20"
};

const pending = new Map();

// gerar key
function generateKey(type) {
  const base = "STORE-" + Math.random().toString(36).substring(2, 8).toUpperCase();

  if (type === "1d") return { key: base + "-1D", expires: Date.now() + 86400000 };
  if (type === "3d") return { key: base + "-3D", expires: Date.now() + 259200000 };
  return { key: base + "-PERM", expires: null };
}

// salvar key
function saveKey(data) {
  let keys = [];

  if (fs.existsSync("keys.json")) {
    keys = JSON.parse(fs.readFileSync("keys.json"));
  }

  keys.push(data);
  fs.writeFileSync("keys.json", JSON.stringify(keys, null, 2));
}

client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;

  const text = msg.content.toLowerCase();

  // COMPRA
  if (text.startsWith("comprar")) {
    const type = text.split(" ")[1];

    if (!prices[type]) return msg.reply("Use: comprar 1d / 3d / perm");

    pending.set(msg.author.id, type);

    return msg.reply(
      `💰 Plano: ${type}\n💵 ${prices[type]}\nPIX: ${PIX}\n\nEnvie o comprovante.`
    );
  }

  // comprovante
  if (msg.attachments.size > 0) {
    const type = pending.get(msg.author.id);
    if (!type) return;

    const admin = await client.users.fetch(ADMIN_ID);

    await admin.send(
      `💰 PAGAMENTO\nUser: ${msg.author.id}\nPlano: ${type}\n\nResponda ✔ ID ou ❌ ID`
    );

    return msg.reply("Comprovante enviado.");
  }

  // APROVAR
  if (text.startsWith("✔")) {
    const userId = text.split(" ")[1];
    const type = pending.get(userId);

    if (!type) return;

    const data = generateKey(type);
    saveKey(data);

    const user = await client.users.fetch(userId);

    await user.send(`🔑 KEY: ${data.key}`);

    pending.delete(userId);
  }

  // NEGAR
  if (text.startsWith("❌")) {
    const userId = text.split(" ")[1];

    pending.delete(userId);
  }
});

client.login(process.env.DISCORD_TOKEN);