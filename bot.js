const express = require("express");
const app = express();
app.use(express.json());

const { Client, GatewayIntentBits } = require("discord.js");
const axios = require("axios");

const TOKEN = process.env.TOKEN;
const MP_TOKEN = process.env.MP_TOKEN;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
});

// banco de keys
let db = {};

// gerar key
function gerarKey() {
  return "KEY-" + Math.random().toString(36).substring(2, 10).toUpperCase();
}

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // 🛒 COMPRAR
  if (message.content.startsWith("!comprar")) {
    const tipo = message.content.split(" ")[1];

    const price = tipo === "1d" ? 5 : tipo === "3d" ? 10 : 20;

    try {
      const res = await axios.post(
        "https://api.mercadopago.com/checkout/preferences",
        {
          items: [
            {
              title: `Key ${tipo}`,
              quantity: 1,
              currency_id: "BRL",
              unit_price: price
            }
          ],
          external_reference: message.author.id
        },
        {
          headers: {
            Authorization: `Bearer ${MP_TOKEN}`
          }
        }
      );

      // 💬 TEXTO 1 (COMPRA)
      message.reply(
        `💳 Pagamento criado!\nClique no link abaixo:\n${res.data.init_point}`
      );

    } catch (err) {
      // 💬 TEXTO ERRO
      message.reply("❌ Erro ao gerar pagamento. Tente novamente.");
    }
  }

  // 🔑 PEGAR KEY
  if (message.content.startsWith("!minhakey")) {
    const data = db[message.author.id];

    if (!data) {
      // 💬 TEXTO 5
      return message.reply("❌ Você ainda não comprou uma key.");
    }

    // 💬 TEXTO KEY
    message.reply(`🔑 Sua key: ${data.key}`);
  }
});

// 🔔 WEBHOOK (pagamento aprovado)
app.post("/webhook", (req, res) => {
  const payment = req.body;

  if (
    payment.type === "payment" &&
    payment.data.status === "approved"
  ) {
    const userId = payment.data.external_reference;

    const key = gerarKey();

    db[userId] = {
      key: key
    };

    console.log("✔ Pagamento aprovado:", userId, key);
  }

  res.sendStatus(200);
});

client.login(TOKEN);

app.listen(process.env.PORT || 3000, () => {
  console.log("Bot online");
});
