'use strict';

const appServerKey = "BOt1rEw_cmGg3kx3yoRcSb-Dm_qLc118BK8Bg6ty1kLv2r_0ixfN_6lxzZqMxJHxzi4nSFIcoWLT996M_W-xcxQ";

const pushWrapper = document.querySelector('.push-wrapper');
const pushButton = document.querySelector('.push-button');
const tgButton = document.querySelector('.tg-button');
const pushSubtitle = document.getElementById("push-subtitle");
const tgSubtitle = document.getElementById("tg-subtitle");
const pushError = document.getElementById("push-error");
const tgError = document.getElementById("tg-error");
const closeBtn = document.querySelector('.close');

let loading = true;

let hasSubscription = false;
let serviceWorkerRegistration = null;
let subscriptionData = false;

let hasTgSubscription = false;

// closeBtn.addEventListener('click', function (e) {
//   e.preventDefault();
//   history.back();
// })

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

function updatePushButton() {

  if (hasSubscription) {
    loading = false;
    pushError.textContent = "";
    pushSubtitle.innerHTML = "Отключить<br>push-уведомления";
    pushButton.classList.add("push-button_active");
    pushButton.innerHTML = '<span class="push-button__img">&#128226;<span>';
  } else {
    loading = false;
    pushError.textContent = "";
    pushSubtitle.innerHTML = "Включить<br>push-уведомления";
    pushButton.classList.remove("push-button_active");
    pushButton.innerHTML = '<span class="push-button__img">&#128226;<span>';
  }
}

function subscribeUser(showWelcome) {
  if (loading) return;
  loading = true;
  pushError.textContent = "";
  pushButton.innerHTML = '<img class="push-button__img" src="img/spinner-icon-0.gif" alt="загрузка">';
  serviceWorkerRegistration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlB64ToUint8Array(appServerKey)
  })
    .then(function (subscription) {
      const userId = window.location.href.split("/")[3];
      fetch(`/push/subscribe/${userId}/${showWelcome ? '1' : '0'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscription)
      })
        .then(function (response) {
          return response;
        })
        .then(function (text) {
          console.log('User is subscribed.');
          hasSubscription = true;
          updatePushButton();

        })
        .catch(function (error) {
          hasSubscription = false;
          console.error('error fetching subscribe', error);
          pushError.textContent = "Сервис web-push не поддерживается вашим браузером или смартфоном";
        });

    })
    .catch(function (err) {
      console.log('Failed to subscribe the user: ', err);
      pushError.textContent = "Сервис web-push не поддерживается вашим браузером или смартфоном";
    });
}

function unsubscribeUser() {
  if (loading) return;
  loading = true;
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
            return response;
          })
          .then(function (text) {
            hasSubscription = false;

            updatePushButton();
          })
          .catch(function (error) {
            hasSubscription = true;
            console.error('error fetching subscribe', error);
            pushButton.textContent = 'error fetching subscribe: ' + error;
          });

        hasSubscription = false;

        updatePushButton();
        return subscription.unsubscribe();
      }
    });
}

function initPush() {

  pushButton.addEventListener('click', function () {
    if (hasSubscription) {
      unsubscribeUser();
    } else {
      subscribeUser(true);
    }
  });

  // Set the initial subscription value
  serviceWorkerRegistration.pushManager.getSubscription()
    .then(function (subscription) {
      console.log(subscription);
      hasSubscription = !(subscription === null);
      console.log(subscription);
      updatePushButton();
      // Если уведомления включены, отправляем данные пользователя на сервер на случай, если их там нет (например, включил ранее, когда был авторизирован под другим пользователем)
      if (hasSubscription) subscribeUser(false);
    });
}

function initTg() {
  tgButton.addEventListener("click", function () {
    subscribeTgUser();
  })
}

function subscribeTgUser() {
  const userId = window.location.href.split("/")[3];
  tgError.textContent = "";
  window.open(`https://t.me/biomatic24_bot?start=${userId}`);
}

initTg();
if ('serviceWorker' in navigator && 'PushManager' in window) {
  let sw = '/sw.js';
  const detectOS = () => /android/i.test(navigator.userAgent) ? "Android" :
      /iPad|iPhone|iPod/.test(navigator.userAgent) ? "iOS" : "Неустановленная ОС";
  if (detectOS() !== 'Android') {
    sw = 'sw-ios.js';
  }
  navigator.serviceWorker.register(sw)
    .then(() => navigator.serviceWorker.ready.then((worker) => {
      serviceWorkerRegistration = worker;
      console.log(serviceWorkerRegistration);
      serviceWorkerRegistration.update();
      initPush();
    }))
    .catch((err) => { console.log('Service Worker Error: ' + err); pushButton.textContent = 'Service Worker Error: ' + err; });
}


