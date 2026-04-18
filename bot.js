const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Bot online");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("Servidor rodando na porta " + PORT);
});

const { Client, GatewayIntentBits } = require("discord.js");

const fetch = global.fetch;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
});

const TOKEN = process.env.TOKEN;

if (!TOKEN) {
  console.error("TOKEN não definido no Render");
  process.exit(1);
}

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
      const res = await fetch(`https://storeluck-api.onrender.com/create?tipo=${tipo}`);

      if (!res.ok) {
        return message.reply("Erro na API");
      }

      const data = await res.json();

      if (!data.key) {
        return message.reply("Key não encontrada");
      }

      message.reply(`🔑 Sua key: ${data.key}`);
    } catch (err) {
      console.log(err);
      message.reply("Erro ao gerar key");
    }
  }
});

client.login(TOKEN);
