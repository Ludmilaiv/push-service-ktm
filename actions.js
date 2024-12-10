const webPush = require("web-push");
const fs = require("fs");
const {json, response} = require("express");
const telegramBot = require("./telegram/telegram-actions");
const { fetch, Agent } = require('undici');

const {privateKey, publicKey} = JSON.parse(fs.readFileSync("./security/VAPID.json", "utf8"));

webPush.setVapidDetails(
  'mailto:milakodina@mail.ru',
  publicKey,
  privateKey
);

function main(req, res) {
  res.render("index",
  {
    userId: req.params.userId
  });
}

function generateVAPIDKeys(req, res) {
  if (req.params.pass === "IlpIpdIgiApi2034") {
    const vapidKeys = webPush.generateVAPIDKeys();
    res.send(vapidKeys);
  } else {
    res.status = 300;
    res.send("<h1>Нет доступа</h1>");
  }
}

function logout(req, res) {
  res.render("logout",
    {
      userId: req.params.userId
    });

}

async function subscribe(req, res) {
  const subscription = {
    endpoint: req.body.endpoint,
    keys: {
      p256dh: req.body.keys.p256dh,
      auth: req.body.keys.auth
    }
  };

  const user_id = req.params.userId;
  const welcome = req.params.welcome == 1;

  const payload = JSON.stringify({
    title: "Уведомления включены",
    body: "Вы будете получать уведомления от приложения BOMATIC",
    icon: '/favicon.png'
  });

  const options = {
    TTL: 3600 // 1sec * 60 * 60 = 1h
  };

  console.log("________________________");
  console.log(new Date());
  console.log("subscription:", subscription, "user:", user_id);

  const result = await (await fetch("https://zavodktm.ru/push-subscribe", {
    method: "post",
    dispatcher: new Agent({ connectTimeout: 6000 }),
    body: JSON.stringify({
      subscription,
      user_id
    })
  })).text();

  if (result !== "1") {
    console.error("subscription not possible:", result);
    res.status(500).send('subscription not possible');
    return;
  }

  if (welcome) {
    webPush.sendNotification(
      subscription,
      payload,
      options
    ).then(function () {
      console.log('Send welcome push notification');
      res.status(200).send('subscribe');
      return;
    }).catch(err => {
      console.error("Unable to send welcome push notification", err);
      res.status(500).send('subscription not possible');
      return;
    });
  } else {
    res.status(200).send('subscribe');
  }

}

async function sendNotification(req, res) {
  let notifications = JSON.parse(req.body.notifications);
  for (let notification of notifications) {

    if (notification.type === 'web-push') {
      const subscription = {
        endpoint: notification.endpoint,
        keys: notification.keys
      };

      const payload = JSON.stringify({
        title: notification.title,
        body: notification.message,
        icon: '/favicon.png'
      });

      const options = {
        TTL: 3600 // 1sec * 60 * 60 = 1h
      };

      webPush.sendNotification(
          subscription,
          payload,
          options
      ).then(function () {
        console.log("________________________");
        console.log(new Date());
        console.log(notification)
      }).catch(err => {
        console.log("________________________");
        console.log(new Date());
        console.error("Unable to send push notification", err);
      });
    } else if (notification.type === 'telegram') {
      console.log("________________________");
      console.log(new Date());
      console.log(notification);
      await telegramBot.sendMessage(notification.chatid, notification.title.toUpperCase() + '. ' + notification.message);
    }


  };

  res.status(200).send('1');

}

async function unsubscribe(req, res) {
  const subscription = {
    endpoint: req.body.endpoint,
  };

  const user_id = req.params.userId;

  const result = await (await fetch("https://zavodktm.ru/push-unsubscribe", {
    method: "post",
    dispatcher: new Agent({ connectTimeout: 6000 }),
    body: JSON.stringify({
      subscription,
      user_id
    })
  })).text();

  if (result !== "1") {
    //console.error("unsubscription not possible: ", result);
    res.status(500).send('unsubscription not possible');
    return;
  }
  console.log("________________________");
  console.log(new Date());
  console.log("subscription: ", subscription, "user:", user_id);
  console.log("unsubscribe");
  res.status(200).send("unsubscribe");
}

async function isOnline() {
  const res = await fetch('https://zavodktm.ru/get-online',
    {dispatcher: new Agent({ connectTimeout: 6000 }),});
}

setInterval(isOnline, 300000);

module.exports = { subscribe, generateVAPIDKeys, unsubscribe, main, logout, sendNotification };