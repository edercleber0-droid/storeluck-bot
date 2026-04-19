const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: ["CHANNEL"]
});

// 🔑 gerar key
function generateKey(type) {
  const base = "STORE-" + Math.random().toString(36).substring(2, 8).toUpperCase();

  if (type === "1d") return base + "-1D";
  if (type === "3d") return base + "-3D";
  if (type === "perm") return base + "-PERM";

  return base;
}

// 📦 pedidos pendentes
const pending = new Map();

// 👇 SEU ID (CORRETO)
const ADMIN_ID = "1495470321518514216";

client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;

  const text = msg.content.toLowerCase();

  // 🛒 compra
  if (text.startsWith("comprar")) {
    const type = text.split(" ")[1]; // 1d / 3d / perm

    pending.set(msg.author.id, type);

    msg.channel.send("📩 Pedido recebido! Envie o Pix e o comprovante.");
  }

  // 📎 comprovante
  if (msg.attachments.size > 0) {
    const type = pending.get(msg.author.id);

    if (!type) {
      msg.channel.send("⚠️ Nenhuma compra ativa.");
      return;
    }

    const admin = await client.users.fetch(ADMIN_ID);

    admin.send(
      `💰 NOVO PAGAMENTO\nUsuário: ${msg.author.tag}\nID: ${msg.author.id}\nTipo: ${type}\n\nConfirme com: !confirm ${msg.author.id}`
    );

    msg.channel.send("📩 Comprovante enviado para verificação!");
  }

  // ✔ confirmação
  if (text.startsWith("!confirm")) {
    const userId = text.split(" ")[1];

    const type = pending.get(userId);

    if (!type) {
      msg.reply("❌ Nenhum pagamento encontrado.");
      return;
    }

    const key = generateKey(type);

    const user = await client.users.fetch(userId);

    user.send(`✔ Pagamento aprovado!\n🔑 Sua KEY: ${key}`);

    pending.delete(userId);

    msg.reply("✔ Key enviada com sucesso!");
  }
});

client.on("ready", () => {
  console.log("🤖 Bot online");
});

// 🔐 TOKEN do Render
client.login(process.env.DISCORD_TOKEN);
