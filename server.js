const express = require("express");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

app.get("/", (req, res) => {
  res.send("Proposal backend + Telegram bot is running!");
});

app.post("/telegram/webhook", async (req, res) => {
  try {
    const message = req.body.message;

    if (message?.chat?.id && message?.text) {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: message.chat.id,
          text: `Bot connected successfully! ✅\n\nYou said: ${message.text}`
        })
      });
    }

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

app.listen(PORT, "0.0.0.0", async () => {
  console.log(`Server running on port ${PORT}`);

  if (BOT_TOKEN) {
    const webhookUrl =
      `https://telegram-backend-bswi.onrender.com/telegram/webhook`;

    try {
      const response = await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${encodeURIComponent(webhookUrl)}`
      );

      console.log(await response.text());
    } catch (error) {
      console.error("Webhook error:", error);
    }
  }
});
