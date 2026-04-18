const { Client, GatewayIntentBits } = require("discord.js");
const fetch = require("node-fetch");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
});

const TOKEN = process.env.TOKEN;

client.on("ready", () => {
  console.log(`Bot online como ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith("!key")) {
    const tipo = message.content.split(" ")[1];

    if (!tipo) {
      return message.reply("Use: !key 1d / 3d / perma");
    }

    try {
      const res = await fetch("https://storeluck-api.onrender.com/create?tipo=" + tipo);
      const data = await res.json();

      message.reply("🔑 Sua key: " + data.key);
    } catch (err) {
      message.reply("Erro ao gerar key");
    }
  }
});

client.login(TOKEN);
