const express = require("express");

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// ===============================
// HOME / TEST
// ===============================

app.get("/", (req, res) => {
    res.send("Proposal backend + Telegram bot is running!");
});


// ===============================
// CONSENT
// ===============================

app.post("/consent", async (req, res) => {

    try {

        const { consent } = req.body;

        if (consent !== true) {
            return res.status(400).json({
                success: false,
                message: "Consent is required."
            });
        }

        // Telegram notification
        if (BOT_TOKEN) {

            const chatId = process.env.TELEGRAM_CHAT_ID;

            if (chatId) {

                await fetch(
                    `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            chat_id: chatId,
                            text:
                                "✅ Consent received\n\n" +
                                "User explicitly allowed the information-sharing notice."
                        })
                    }
                );
            }
        }

        res.json({
            success: true,
            message: "Consent recorded."
        });

    } catch (error) {

        console.error("Consent error:", error);

        res.status(500).json({
            success: false,
            message: "Server error."
        });
    }
});


// ===============================
// TELEGRAM WEBHOOK
// ===============================

app.post("/telegram/webhook", async (req, res) => {

    try {

        const message = req.body.message;

        if (message?.chat?.id && message?.text) {

            await fetch(
                `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        chat_id: message.chat.id,

                        text:
                            `Bot connected successfully! ✅\n\n` +
                            `You said: ${message.text}`
                    })
                }
            );
        }

        res.sendStatus(200);

    } catch (error) {

        console.error(error);

        res.sendStatus(500);
    }
});


// ===============================
// START SERVER
// ===============================

app.listen(PORT, "0.0.0.0", async () => {

    console.log(
        `Server running on port ${PORT}`
    );

    if (BOT_TOKEN) {

        const webhookUrl =
            "https://telegram-backend-bswi.onrender.com/telegram/webhook";

        try {

            const response = await fetch(
                `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${encodeURIComponent(webhookUrl)}`
            );

            console.log(
                await response.text()
            );

        } catch (error) {

            console.error(
                "Webhook error:",
                error
            );
        }
    }
});
