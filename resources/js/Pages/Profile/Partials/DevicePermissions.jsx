import { useState, useEffect } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import { Camera, MapPin, Bell, ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react';

export default function DevicePermissions({ className = '' }) {
    const [permissions, setPermissions] = useState({
        notification: 'default',
        location: 'prompt',
        camera: 'prompt'
    });
    
    const [isSupported, setIsSupported] = useState({
        notification: false,
        location: false,
        camera: false
    });

    const checkPermissions = async () => {
        const support = {
            notification: 'Notification' in window,
            location: 'geolocation' in navigator,
            camera: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices
        };
        setIsSupported(support);

        const currentPerms = { ...permissions };

        // Check Notification
        if (support.notification) {
            currentPerms.notification = Notification.permission;
        }

        // Check Location
        if (support.location && navigator.permissions) {
            try {
                const locPerm = await navigator.permissions.query({ name: 'geolocation' });
                currentPerms.location = locPerm.state; // 'granted', 'prompt', 'denied'
                locPerm.onchange = () => {
                    setPermissions(prev => ({ ...prev, location: locPerm.state }));
                };
            } catch (e) {
                console.error("Location permission query not supported");
            }
        }

        // Check Camera
        if (support.camera && navigator.permissions) {
            try {
                const camPerm = await navigator.permissions.query({ name: 'camera' });
                currentPerms.camera = camPerm.state;
                camPerm.onchange = () => {
                    setPermissions(prev => ({ ...prev, camera: camPerm.state }));
                };
            } catch (e) {
                console.error("Camera permission query not supported");
            }
        }
        
        setPermissions(currentPerms);
    };

    useEffect(() => {
        checkPermissions();
    }, []);

    const requestNotification = async () => {
        if (!isSupported.notification) return;
        try {
            const result = await Notification.requestPermission();
            setPermissions(prev => ({ ...prev, notification: result }));
            if (result === 'granted' && 'serviceWorker' in navigator) {
                navigator.serviceWorker.register('/sw.js');
            } else if (result === 'denied') {
                alert('Notifikasi diblokir. Silakan ubah izin melalui ikon gembok (🔒) di sebelah URL browser.');
            }
        } catch (error) {
            console.error('Error requesting notification:', error);
        }
    };

    const requestLocation = () => {
        if (!isSupported.location) return;
        navigator.geolocation.getCurrentPosition(
            () => {
                checkPermissions(); // Re-check after success
            },
            (error) => {
                if (error.code === error.PERMISSION_DENIED) {
                    alert('Lokasi diblokir. Silakan ubah izin melalui ikon gembok (🔒) di sebelah URL browser.');
                }
                checkPermissions();
            }
        );
    };

    const requestCamera = async () => {
        if (!isSupported.camera) return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach(track => track.stop()); // Stop immediately
            checkPermissions();
        } catch (error) {
            alert('Kamera diblokir atau tidak tersedia. Silakan ubah izin melalui ikon gembok (🔒) di sebelah URL browser.');
            checkPermissions();
        }
    };

    const StatusBadge = ({ status }) => {
        if (status === 'granted') {
            return (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full dark:bg-green-900/30 dark:text-green-400">
                    <CheckCircle className="w-3 h-3" /> Diizinkan
                </span>
            );
        }
        if (status === 'denied') {
            return (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full dark:bg-red-900/30 dark:text-red-400">
                    <ShieldAlert className="w-3 h-3" /> Diblokir
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full dark:bg-yellow-900/30 dark:text-yellow-400">
                <AlertTriangle className="w-3 h-3" /> Belum Diminta
            </span>
        );
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Pengaturan Akses Perangkat (Permissions)
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Sistem Manajemen PKL membutuhkan beberapa akses perangkat agar dapat berfungsi optimal (untuk absensi & notifikasi). Anda bisa mengecek dan memintanya di sini.
                </p>
            </header>

            <div className="mt-6 space-y-4">
                
                {/* Location */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg dark:bg-blue-900/30 dark:text-blue-400">
                            <MapPin className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                Akses Lokasi (GPS)
                                <StatusBadge status={permissions.location} />
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Digunakan untuk memvalidasi lokasi saat Anda melakukan Check-in atau Check-out absensi.
                            </p>
                        </div>
                    </div>
                    {permissions.location !== 'granted' && (
                        <PrimaryButton onClick={requestLocation}>
                            {permissions.location === 'denied' ? 'Cek Ulang Izin' : 'Minta Izin Lokasi'}
                        </PrimaryButton>
                    )}
                </div>

                {/* Camera */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg dark:bg-indigo-900/30 dark:text-indigo-400">
                            <Camera className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                Akses Kamera
                                <StatusBadge status={permissions.camera} />
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Digunakan untuk mengambil foto selfie (beserta watermark koordinat) saat melakukan absensi.
                            </p>
                        </div>
                    </div>
                    {permissions.camera !== 'granted' && (
                        <PrimaryButton onClick={requestCamera}>
                            {permissions.camera === 'denied' ? 'Cek Ulang Izin' : 'Minta Izin Kamera'}
                        </PrimaryButton>
                    )}
                </div>

                {/* Notifications */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg dark:bg-emerald-900/30 dark:text-emerald-400">
                            <Bell className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                Notifikasi Browser
                                <StatusBadge status={permissions.notification} />
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Digunakan untuk memberitahu Anda secara real-time apabila Dosen memberikan tugas baru.
                            </p>
                        </div>
                    </div>
                    {permissions.notification !== 'granted' && (
                        <PrimaryButton onClick={requestNotification}>
                            {permissions.notification === 'denied' ? 'Cek Ulang Izin' : 'Aktifkan Notifikasi'}
                        </PrimaryButton>
                    )}
                </div>

                {/* Helper text if any denied */}
                {(permissions.location === 'denied' || permissions.camera === 'denied' || permissions.notification === 'denied') && (
                    <div className="p-4 bg-rose-50 rounded-xl border border-rose-100 dark:bg-rose-900/20 dark:border-rose-800">
                        <p className="text-sm text-rose-700 dark:text-rose-400">
                            <strong>Info:</strong> Anda telah memblokir beberapa akses. Aplikasi web tidak bisa memaksa untuk membuka blokir. Anda harus mengkliknya secara manual melalui <strong>ikon gembok (🔒)</strong> di samping URL browser, lalu setel menjadi "Izinkan", setelah itu refresh halaman ini.
                        </p>
                    </div>
                )}

            </div>
        </section>
    );
}
