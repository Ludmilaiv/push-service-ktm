const express = require('express');
const {
    generateVAPIDKeys,
    subscribe, unsubscribe, main,
    logout,
    sendNotification} = require("./actions");

const appRouter = express.Router();

appRouter.get('/keys-generate/:pass', generateVAPIDKeys);
appRouter.get("/:userId", main);
appRouter.get("/logout/:userId", logout);
appRouter.post("/push/subscribe/:userId/:welcome", subscribe);
appRouter.post("/push/unsubscribe/:userId", unsubscribe);
appRouter.post("/push/send", sendNotification);

module.exports = appRouter; 