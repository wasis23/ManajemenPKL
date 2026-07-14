self.addEventListener('push', function(event) {
    if (!(self.Notification && self.Notification.permission === 'granted')) {
        return;
    }

    // Mendapatkan data dari push event yang dikirim backend
    const data = event.data?.json() ?? {};
    
    // Fallback text jika backend tidak mengirimkan payload spesifik
    const title = data.title || 'Tugas PKL Baru Telah Dipublish!';
    const message = data.message || 'Silakan cek dashboard untuk melihat detail tugas.';
    const icon = data.icon || '/favicon.ico'; 
    const targetUrl = data.url || '/dashboard';

    event.waitUntil(
        self.registration.showNotification(title, {
            body: message,
            icon: icon,
            data: {
                url: targetUrl
            },
            vibrate: [200, 100, 200]
        })
    );
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();

    // Membuka atau memfokuskan tab ke URL yang dituju
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(windowClients => {
            const urlToOpen = new URL(event.notification.data.url, self.location.origin).href;

            for (let i = 0; i < windowClients.length; i++) {
                let client = windowClients[i];
                // Jika tab dengan URL tersebut sudah ada, fokuskan ke sana
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            
            // Jika belum terbuka, buka window/tab baru
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
