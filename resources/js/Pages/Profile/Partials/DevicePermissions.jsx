import { useState, useEffect } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import { usePage } from '@inertiajs/react';
import { Camera, MapPin, Bell, ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react';

export default function DevicePermissions({ className = '' }) {
    const { telegram_channel_link } = usePage().props;
    
    const [permissions, setPermissions] = useState({
        location: 'prompt',
        camera: 'prompt'
    });
    
    const [isSupported, setIsSupported] = useState({
        location: false,
        camera: false
    });

    const checkPermissions = async () => {
        const support = {
            location: 'geolocation' in navigator,
            camera: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices
        };
        setIsSupported(support);

        const currentPerms = { ...permissions };

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
                    Pengaturan Akses Perangkat & Notifikasi
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Sistem Manajemen PKL membutuhkan beberapa akses perangkat agar dapat berfungsi optimal (untuk absensi), serta menyediakan integrasi Telegram Channel untuk notifikasi tugas baru.
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

                {/* Telegram Notifications */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gradient-to-br from-sky-500/5 to-transparent">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-sky-50 text-sky-600 rounded-lg dark:bg-sky-900/30 dark:text-sky-400">
                            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.53-1.4.52-.46-.01-1.35-.26-2.01-.48-.81-.27-1.46-.42-1.4-.88.03-.24.38-.49 1.04-.75 4.07-1.77 6.79-2.94 8.15-3.5 3.88-1.61 4.68-1.89 5.21-1.9.11 0 .37.03.54.17.14.11.18.27.2.38-.01.07.01.23 0 .34z"/>
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                Notifikasi Telegram Channel
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-sky-650 bg-sky-50 px-2 py-0.5 rounded-full dark:bg-sky-950/40 dark:text-sky-300">
                                    Aktif (Real-time)
                                </span>
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Informasi lowongan tugas baru akan langsung dikirimkan ke channel Telegram secara real-time.
                            </p>
                        </div>
                    </div>
                    {telegram_channel_link ? (
                        <a
                            href={telegram_channel_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                        >
                            Gabung Channel Telegram
                        </a>
                    ) : (
                        <span className="text-xs font-semibold text-gray-400 italic">
                            Link channel belum dikonfigurasi
                        </span>
                    )}
                </div>

                {/* Helper text if any denied */}
                {(permissions.location === 'denied' || permissions.camera === 'denied') && (
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
