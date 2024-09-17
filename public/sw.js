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
});