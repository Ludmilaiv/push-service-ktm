self.addEventListener('install', (event) => {
    console.log('Service worker install');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('Service worker activate');
});

// self.addEventListener('fetch', (event) => {
//     console.log('Fetch');
// });

self.addEventListener('push', function(event) {
    let notificationData = {};

    try {
        notificationData = event.data.json();
    } catch (e) {
        notificationData = {
            title: 'Default title',
            body: 'Default message',
            icon: '/default-icon.png'
        };
    }

    event.waitUntil(
        self.registration.showNotification(notificationData.title, {
            body: notificationData.body,
            icon: notificationData.icon
        })
    );
});

self.addEventListener('notificationclick', function(event) {
    // close the notification
    event.notification.close();
    event.waitUntil(
        self.clients.matchAll({ type: "window" }).then((clientsArr) => {
            // If a Window tab matching the targeted URL already exists, focus that;
            const hadWindowToFocus = clientsArr.some((windowClient) =>
                windowClient.url === "https://zavodktm.ru/myapp/"
                    ? (windowClient.focus(), true)
                    : false,
            );
            // Otherwise, open a new tab to the applicable URL and focus it.
            if (!hadWindowToFocus)
                self.clients
                    .openWindow("https://zavodktm.ru/myapp/")
                    .then((windowClient) => (windowClient ? windowClient.focus() : null));
        }),
    );
});