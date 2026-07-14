import { useState, useEffect } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';

export default function NotificationSettings({ className = '' }) {
    const [permission, setPermission] = useState('default');
    const [isSupported, setIsSupported] = useState(false);

    useEffect(() => {
        if ('Notification' in window && 'serviceWorker' in navigator) {
            setIsSupported(true);
            setPermission(Notification.permission);
        }
    }, []);

    const requestPermission = async () => {
        if (!isSupported) return;

        try {
            const result = await Notification.requestPermission();
            setPermission(result);

            if (result === 'granted') {
                // Register service worker if granted
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registered with scope:', registration.scope);
                // Di sini biasanya ada logika untuk mendapatkan push subscription
                // const subscription = await registration.pushManager.subscribe({ ... });
                // lalu mengirimkannya ke backend server.
            } else if (result === 'denied') {
                alert('Anda telah memblokir notifikasi browser. Silakan izinkan secara manual melalui pengaturan browser Anda.');
            }
        } catch (error) {
            console.error('Error requesting notification permission:', error);
        }
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Pengaturan Notifikasi Browser
                </h2>

                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Kelola izin notifikasi browser untuk mendapatkan pemberitahuan saat ada tugas baru yang dipublish, bahkan saat website sedang tidak dibuka.
                </p>
            </header>

            <div className="mt-6">
                {!isSupported ? (
                    <div className="text-sm text-red-600 dark:text-red-400">
                        Browser Anda tidak mendukung Web Push Notifications.
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                            <div className="text-sm text-gray-700 dark:text-gray-300">
                                Status Izin: 
                                <span className={`ml-2 font-bold ${
                                    permission === 'granted' ? 'text-green-600' :
                                    permission === 'denied' ? 'text-red-600' : 'text-yellow-600'
                                }`}>
                                    {permission === 'granted' ? 'Diizinkan' : 
                                     permission === 'denied' ? 'Diblokir' : 'Belum Diminta'}
                                </span>
                            </div>

                            {permission !== 'granted' && (
                                <PrimaryButton onClick={requestPermission}>
                                    {permission === 'denied' ? 'Cek Izin Ulang' : 'Aktifkan Notifikasi'}
                                </PrimaryButton>
                            )}
                        </div>
                        
                        {permission === 'denied' && (
                            <p className="text-xs text-gray-500 mt-2">
                                * Anda telah memblokir notifikasi. Silakan klik ikon 🔒 (gembok) di sebelah alamat website (URL) di atas, lalu izinkan Notifikasi, kemudian refresh halaman ini.
                            </p>
                        )}
                        
                        {permission === 'granted' && (
                            <p className="text-xs text-gray-500 mt-2">
                                * Notifikasi telah aktif. Anda akan menerima notifikasi di latar belakang meskipun tidak sedang membuka website.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}
