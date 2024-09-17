'use strict';

const appServerKey = "BOt1rEw_cmGg3kx3yoRcSb-Dm_qLc118BK8Bg6ty1kLv2r_0ixfN_6lxzZqMxJHxzi4nSFIcoWLT996M_W-xcxQ";

const pushWrapper = document.querySelector('.push-wrapper');
const pushButton = document.querySelector('.push-button');
const tgButton = document.querySelector('.tg-button');
const pushSubtitle = document.getElementById("push-subtitle");
const tgSubtitle = document.getElementById("tg-subtitle");
const pushError = document.getElementById("push-error");
const tgError = document.getElementById("tg-error");

let hasSubscription = false;
let serviceWorkerRegistration = null;
let subscriptionData = false;

let hasTgSubscription = false;

function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function unsubscribeUser() {
  serviceWorkerRegistration.pushManager.getSubscription()
    .then(function (subscription) {
      const userId = window.location.href.split("/")[3];

      if (subscription) {
        subscriptionData = {
          endpoint: subscription.endpoint
        };

        fetch(`/push/unsubscribe/${userId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(subscriptionData)
        })
          .then(function (response) {
            subscription.unsubscribe().then(() => history.back());
          })
          .catch(function (error) {
              history.back();
          });
      }
    });
}

function initPush() {
  // Set the initial subscription value
  serviceWorkerRegistration.pushManager.getSubscription()
    .then(function (subscription) {
      hasSubscription = !(subscription === null);
      if (hasSubscription) {
        unsubscribeUser();
      } else {
        history.back();
      }
    });
}

if ('serviceWorker' in navigator && 'PushManager' in window) {
  navigator.serviceWorker.register('/sw.js')
    .then(() => navigator.serviceWorker.ready.then((worker) => {
      serviceWorkerRegistration = worker;
      initPush();
    }))
    .catch((err) => { history.back(); });
}