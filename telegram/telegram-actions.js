const TelegramBot = require('node-telegram-bot-api');
const fs = require("fs");

const { token } = JSON.parse(fs.readFileSync("./security/API_KEY_BOT.json", "utf8"));

const bot = new TelegramBot(token, { polling: true });

const commands = [
  {
      command: "/stop",
      description: "Отписаться"
  },
]

bot.setMyCommands(commands);

bot.on("polling_error", err => console.log(err));

bot.on('text', async msg => {
  const { text, chat } = msg;

  if (text.startsWith("/start")) {
    const msgWait = await bot.sendMessage(chat.id, `Пожалуйста, подождите...`);

    const user_id = text.split(" ")[1];
    if (!user_id || !Number.isInteger(Number(user_id))) {
      const response = "Подписка на уведомления не оформлена. Для правильной подписки на уведомления необходимо выбрать соответствующую опцию в Вашем приложении BIOMATIC";
      await bot.deleteMessage(msgWait.chat.id, msgWait.message_id);
      await bot.sendMessage(chat.id, response);
      return;
    }

    const result = await (await fetch("https://zavodktm.ru/tg-subscribe", {
      method: "post",
      body: JSON.stringify({
        user_tg: chat.id,
        user_id
      })
    })).text();

    if (result !== "1") {
      console.error("subscription not possible:", result);
      if (result === "err1") {
        const response = "Вы уже подписаны на уведомления. Если хотите отписаться, выберите в меню чата команду Отписаться";
        await bot.deleteMessage(msgWait.chat.id, msgWait.message_id);
        await bot.sendMessage(chat.id, response);
      } else {
        const response = "Что-то пошло не так. Попробуйте подписаться позже.";
        await bot.deleteMessage(msgWait.chat.id, msgWait.message_id);
        await bot.sendMessage(chat.id, response);
      }
      return;
    }

    const response = "Подписка на уведомления успешно оформлена. Чтобы отписаться, выберите в меню чата команду Отписаться";
    await bot.sendMessage(chat.id, response);

  } else

    if (text.startsWith("/stop")) {
      const msgWait = await bot.sendMessage(chat.id, `Пожалуйста, подождите...`);

      const result = await (await fetch("https://zavodktm.ru/tg-unsubscribe", {
        method: "post",
        body: JSON.stringify({
          user_tg: chat.id,
        })
      })).text();

      if (result !== "1") {
        console.error("subscription not possible:", result);
        const response = "Что-то пошло не так. Попробуйте отписаться позже.";
        await bot.deleteMessage(msgWait.chat.id, msgWait.message_id);
        await bot.sendMessage(chat.id, response);
        return;
      }

      const response = "Вы успешно отписались от рассылки уведомлений. Повторная подписка возможна из приложения BIOMATIC";
      await bot.sendMessage(chat.id, response);

    }

});

module.exports = bot;