import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import { 
  MapPin, Award, ClipboardList, Settings, Users, CheckCircle, AlertTriangle, 
  Clock, Plus, Trash2, Camera, ShieldAlert, AwardIcon, Compass, RefreshCw,
  Trophy, HelpCircle, UserPlus, Star, ArrowRight, UploadCloud, Check, X, Pencil,
  GraduationCap, Calendar, Database, Server, PlusCircle, Wrench, BookOpen
} from 'lucide-react';
import DevicePermissions from '@/Pages/Profile/Partials/DevicePermissions';

// Indonesian Date Formatter
const formatDateIndo = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
};

// Haversine formula in JS
function getDistanceJS(lat1, lon1, lat2, lon2) {
    const R = 6371000; // meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // in meters
}

export default function Dashboard({ settings, leaderboard, todayAttendance, tasks, attendances = [], permissions = [], availableStudentsCount = {}, schools = [], agendas = [], simlabLabs = [], simlabAssets = [], simlabFilters = {} }) {
    const { auth, flash } = usePage().props;
    const user = auth.user;

    // Determine initial tab based on role
    const getInitialTab = () => {
        if (user.role === 'anak_pkl') return 'attendance';
        return 'tasks';
    };

    const [activeTab, setActiveTab] = useState(getInitialTab());
    const [searchStudent, setSearchStudent] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const pendingPermitsCount = permissions.filter(p => p.status === 'pending').length;

    // Check if current time is past settings.work_hour_end
    const isPastWorkHourEnd = () => {
        if (!settings?.work_hour_end) return false;
        const now = new Date();
        const [endHour, endMin] = settings.work_hour_end.split(':').map(Number);
        const endDateTime = new Date();
        endDateTime.setHours(endHour, endMin, 0, 0);
        return now > endDateTime;
    };

    const filteredAttendances = attendances.filter(att => {
        const matchName = (att.user?.name || '').toLowerCase().includes(searchStudent.toLowerCase()) || 
                          (att.user?.email || '').toLowerCase().includes(searchStudent.toLowerCase());
        const matchStartDate = filterStartDate ? att.date >= filterStartDate : true;
        const matchEndDate = filterEndDate ? att.date <= filterEndDate : true;
        const matchStatus = filterStatus === 'all' 
            ? true 
            : (filterStatus === 'present' 
                ? att.status === 'present' 
                : (filterStatus === 'rejected' 
                    ? (att.status === 'rejected' || att.status === 'late') 
                    : (filterStatus === 'belum_absen' 
                        ? (att.status === 'belum_absen' || (!att.check_in && att.status !== 'izin_tidak_masuk')) 
                        : att.status === filterStatus)));
        return matchName && matchStartDate && matchEndDate && matchStatus;
    });

    const hasFilters = !!(searchStudent || filterStartDate || filterEndDate || filterStatus !== 'all');
    const getTodayDateString = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    const statsSource = hasFilters 
        ? filteredAttendances 
        : attendances.filter(a => a.date === getTodayDateString());

    const exportAttendanceToExcel = () => {
        let tableHtml = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
            <head>
                <!--[if gte mso 9]>
                <xml>
                    <x:ExcelWorkbook>
                        <x:ExcelWorksheets>
                            <x:ExcelWorksheet>
                                <x:Name>Rekap Absensi PKL</x:Name>
                                <x:WorksheetOptions>
                                    <x:DisplayGridlines/>
                                </x:WorksheetOptions>
                            </x:ExcelWorksheet>
                        </x:ExcelWorksheets>
                    </x:ExcelWorkbook>
                </xml>
                <![endif]-->
                <style>
                    table { border-collapse: collapse; width: 100%; font-family: sans-serif; }
                    h2 { font-family: sans-serif; color: #1e1b4b; }
                    p { font-family: sans-serif; color: #4b5563; font-size: 14px; }
                    th { background-color: #4f46e5; color: white; font-weight: bold; text-align: left; padding: 10px; border: 1px solid #e5e7eb; }
                    td { padding: 8px; border: 1px solid #e5e7eb; font-size: 13px; }
                    .status-present { background-color: #d1fae5; color: #065f46; font-weight: bold; }
                    .status-rejected { background-color: #fee2e2; color: #991b1b; font-weight: bold; }
                    .status-permit { background-color: #fef3c7; color: #92400e; font-weight: bold; }
                    .status-pending { background-color: #f3f4f6; color: #374151; font-weight: bold; }
                </style>
            </head>
            <body>
                <h2>LAPORAN REKAP ABSENSI ANAK PKL</h2>
                <p>Dicetak pada: ${new Date().toLocaleDateString('id-ID')} - ${new Date().toLocaleTimeString('id-ID')}</p>
                <table>
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Nama Anak PKL</th>
                            <th>Nama Sekolah</th>
                            <th>Tanggal</th>
                            <th>Jam Masuk</th>
                            <th>Jam Pulang</th>
                            <th>Status Absen Masuk</th>
                            <th>Status Absen Pulang</th>
                            <th>Kampus Masuk</th>
                            <th>Kampus Pulang</th>
                            <th>Koordinat Masuk</th>
                            <th>Koordinat Keluar</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        filteredAttendances.forEach((att, index) => {
            const statusInText = att.check_in 
                ? (att.status === 'present' ? 'Tepat Waktu' : (att.status === 'late' ? 'Terlambat' : 'Ditolak')) 
                : (att.status === 'izin_tidak_masuk' ? 'Izin (Tidak Masuk)' : 'Belum Absen');
            const statusInClass = att.check_in 
                ? (att.status === 'present' ? 'status-present' : 'status-rejected') 
                : (att.status === 'izin_tidak_masuk' ? 'status-permit' : 'status-pending');

            const statusOutText = att.check_out 
                ? 'Tepat Waktu' 
                : (att.status === 'izin_tidak_masuk' ? 'Izin (Tidak Masuk)' : 'Belum Absen');
            const statusOutClass = att.check_out 
                ? 'status-present' 
                : (att.status === 'izin_tidak_masuk' ? 'status-permit' : 'status-pending');

            tableHtml += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${att.user?.name || '-'}</td>
                    <td>${att.user?.school_name || '-'}</td>
                    <td>${att.date}</td>
                    <td>${att.check_in || '--:--'}</td>
                    <td>${att.check_out || '--:--'}</td>
                    <td class="${statusInClass}">${statusInText}</td>
                    <td class="${statusOutClass}">${statusOutText}</td>
                    <td>${att.in_campus || '-'}</td>
                    <td>${att.out_campus || '-'}</td>
                    <td>${att.in_latitude && att.in_longitude ? `${att.in_latitude}, ${att.in_longitude}` : '-'}</td>
                    <td>${att.out_latitude && att.out_longitude ? `${att.out_latitude}, ${att.out_longitude}` : '-'}</td>
                </tr>
            `;
        });

        tableHtml += `
                    </tbody>
                </table>
            </body>
            </html>
        `;

        const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `rekap_absensi_pkl_${new Date().toISOString().slice(0, 10)}.xls`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const [gpsLoading, setGpsLoading] = useState(false);
    const [clientCoords, setClientCoords] = useState(null);
    const [clientDistance, setClientDistance] = useState(null);
    const [gpsError, setGpsError] = useState(null);
    const [showNotify, setShowNotify] = useState(false);
    const [notifyMsg, setNotifyMsg] = useState({ type: '', text: '' });

    // Modals state
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [activeCompleteTask, setActiveCompleteTask] = useState(null);
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [editingUserPoints, setEditingUserPoints] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [showProofModal, setShowProofModal] = useState(null);
    const [showPermitModal, setShowPermitModal] = useState(false);

    // Inertia Forms
    const [attendanceProcessing, setAttendanceProcessing] = useState(false);

    // Camera States for Selfie Attendance
    const [showCameraModal, setShowCameraModal] = useState(false);
    const [attendanceType, setAttendanceType] = useState(''); // 'check-in' or 'check-out'
    const [cameraStream, setCameraStream] = useState(null);
    const [capturedSelfie, setCapturedSelfie] = useState(null);
    const [selfieBlob, setSelfieBlob] = useState(null);
    const [cameraError, setCameraError] = useState(null);
    const videoRef = React.useRef(null);

    const startCamera = async () => {
        setCameraError(null);
        setCapturedSelfie(null);
        setSelfieBlob(null);
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            
            let videoConstraints = true;
            
            if (videoDevices.length > 1) {
                videoConstraints = { facingMode: 'user' };
            } else if (videoDevices.length === 1) {
                videoConstraints = true;
            }
            
            const stream = await navigator.mediaDevices.getUserMedia({
                video: videoConstraints
            });
            setCameraStream(stream);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Camera access error:", err);
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true
                });
                setCameraStream(stream);
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (fallbackErr) {
                setCameraError("Gagal mengakses kamera. Pastikan izin kamera diberikan.");
            }
        }
    };

    const stopCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
    };

    const capturePhoto = () => {
        if (!videoRef.current) return;
        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        if (clientCoords) {
            ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
            ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
            
            ctx.font = "14px Arial";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            const dateStr = new Date().toLocaleString('id-ID');
            ctx.fillText(`Lat: ${clientCoords.lat.toFixed(6)} | Lng: ${clientCoords.lng.toFixed(6)}`, canvas.width / 2, canvas.height - 25);
            ctx.fillText(`${dateStr}`, canvas.width / 2, canvas.height - 10);
        }

        canvas.toBlob((blob) => {
            if (blob) {
                setSelfieBlob(blob);
                setCapturedSelfie(URL.createObjectURL(blob));
                stopCamera();
            }
        }, 'image/jpeg', 0.85);
    };

    const closeCameraModal = () => {
        stopCamera();
        setShowCameraModal(false);
        setCapturedSelfie(null);
        setSelfieBlob(null);
        setCameraError(null);
    };

    const openCamera = (type) => {
        setAttendanceType(type);
        setShowCameraModal(true);
        setTimeout(() => {
            startCamera();
        }, 100);
    };

    const submitAttendanceWithSelfie = () => {
        if (!clientCoords || !selfieBlob) return;

        setAttendanceProcessing(true);
        const url = route(attendanceType === 'check-in' ? 'attendance.check-in' : 'attendance.check-out');
        const selfieFile = new File([selfieBlob], `selfie_${Date.now()}.jpg`, { type: 'image/jpeg' });

        router.post(url, {
            latitude: clientCoords.lat,
            longitude: clientCoords.lng,
            selfie: selfieFile
        }, {
            forceFormData: true,
            preserveScroll: true,
            onFinish: () => {
                setAttendanceProcessing(false);
                closeCameraModal();
                scanGps();
            }
        });
    };

    useEffect(() => {
        if (cameraStream && videoRef.current) {
            videoRef.current.srcObject = cameraStream;
        }
    }, [cameraStream]);

    useEffect(() => {
        return () => {
            if (cameraStream) {
                cameraStream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Auto-refresh tasks list every 10 seconds when viewing jobboard
    useEffect(() => {
        let interval;
        if (activeTab === 'jobboard' || activeTab === 'mytasks') {
            interval = setInterval(() => {
                router.reload({ only: ['tasks'], preserveScroll: true, preserveState: true });
            }, 10000);
        }
        return () => clearInterval(interval);
    }, [activeTab]);

    const dist1 = (clientCoords && settings) ? getDistanceJS(clientCoords.lat, clientCoords.lng, parseFloat(settings.latitude), parseFloat(settings.longitude)) : null;
    const dist2 = (clientCoords && settings) ? getDistanceJS(clientCoords.lat, clientCoords.lng, parseFloat(settings.latitude_2 || settings.latitude), parseFloat(settings.longitude_2 || settings.longitude)) : null;
    const closerCampusName = (dist1 !== null && dist2 !== null) ? (dist1 <= dist2 ? 'Kampus 1' : 'Kampus 2') : 'Kampus';

    const cannotCheckIn = () => {
        if (!clientCoords) return true;
        if (clientDistance !== null && clientDistance > (settings?.radius || 50)) return true;
        if (attendanceProcessing) return true;

        if (settings) {
            const now = new Date();
            const nowStr = now.toTimeString().split(' ')[0];
            const startTime = settings.work_hour_start;
            const endTime = settings.work_hour_end;

            if (nowStr >= startTime && nowStr <= endTime) {
                // Check if they have an approved masuk_terlambat permit
                const hasPermit = permissions.some(p => 
                    p.type === 'masuk_terlambat' && 
                    p.status === 'approved' && 
                    p.date === now.toISOString().slice(0, 10)
                );
                if (hasPermit) return false;

                // Check 60-minute tolerance
                const [startH, startM, startS] = startTime.split(':').map(Number);
                const startDate = new Date();
                startDate.setHours(startH, startM, startS || 0, 0);
                const diffMs = now - startDate;
                const diffMin = diffMs / 1000 / 60;

                if (diffMin >= 0 && diffMin <= 60) {
                    return false;
                }
                return true;
            }
        }
        return false;
    };

    const cannotCheckOut = () => {
        if (!clientCoords) return true;
        if (clientDistance !== null && clientDistance > (settings?.radius || 50)) return true;
        if (attendanceProcessing) return true;
        if (todayAttendance?.status === 'rejected') return true;

        const now = new Date();
        const nowStr = now.toTimeString().split(' ')[0];
        const hasPulangCepat = permissions.some(p => 
            p.type === 'pulang_cepat' && 
            p.status === 'approved' && 
            p.date === now.toISOString().slice(0, 10)
        );

        if (!todayAttendance || !todayAttendance.check_in) {
            if (!settings) return true;
            if (!hasPulangCepat && nowStr <= settings.work_hour_end) {
                return true;
            }
        }

        if (settings && !hasPulangCepat && nowStr >= settings.work_hour_start && nowStr <= settings.work_hour_end) {
            return true;
        }

        return false;
    };

    const cannotTakeTask = () => {
        if (!todayAttendance || !todayAttendance.check_in || todayAttendance.status === 'rejected') return true;
        if (todayAttendance.check_out) return true;
        
        const hasPendingTask = tasks.pending?.length > 0;
        const hasActiveTask = tasks.active?.length > 0;
        if (hasPendingTask || hasActiveTask) return true;

        return false;
    };

    const permitForm = useForm({
        date: new Date().toISOString().split('T')[0],
        type: 'tidak_masuk',
        reason: '',
        proof: null,
        screenshot: null
    });

    const submitPermit = (e) => {
        e.preventDefault();
        permitForm.post(route('permissions.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setShowPermitModal(false);
                permitForm.reset();
            }
        });
    };

    const taskForm = useForm({
        title: '',
        description: '',
        quota: 1,
        requester_name: user ? user.name : '',
        target_room: '',
        campus_type: 'Kampus 1'
    });

    const completeForm = useForm({
        is_assisted: false,
        proof_photo: null
    });

    const settingsForm = useForm({
        latitude: settings?.latitude || -7.5619,
        longitude: settings?.longitude || 110.8540,
        latitude_2: settings?.latitude_2 || -7.5620,
        longitude_2: settings?.longitude_2 || 110.8550,
        radius: settings?.radius || 50,
        work_hour_start: settings?.work_hour_start ? settings.work_hour_start.substring(0, 5) : '08:00',
        work_hour_end: settings?.work_hour_end ? settings.work_hour_end.substring(0, 5) : '16:00',
        telegram_bot_token: settings?.telegram_bot_token || '',
        telegram_chat_id: settings?.telegram_chat_id || '',
        telegram_channel_link: settings?.telegram_channel_link || ''
    });

    const userForm = useForm({
        name: '',
        email: '',
        password: '',
        role: 'anak_pkl',
        school_name: '',
        major: '',
        whatsapp_number: '',
        address: '',
        date_of_birth: '',
        start_date: '',
        end_date: '',
        social_media: ''
    });

    const pointsForm = useForm({
        points: 0
    });

    const editUserForm = useForm({
        name: '',
        email: '',
        password: '',
        role: 'anak_pkl',
        school_name: '',
        major: '',
        whatsapp_number: '',
        address: '',
        date_of_birth: '',
        start_date: '',
        end_date: '',
        social_media: ''
    });

    const schoolForm = useForm({
        name: '',
    });

    // SIMLAB states and forms
    const [simlabActiveSubTab, setSimlabActiveSubTab] = useState('list');
    const [filterLabId, setFilterLabId] = useState(simlabFilters?.laboratorium_id || '');
    const [filterKondisi, setFilterKondisi] = useState(simlabFilters?.kondisi || '');

    const simlabAssetForm = useForm({
        laboratorium_id: '',
        kode_aset: '',
        nama_aset: '',
        jenis_aset: 'statis',
        kondisi: 'baik',
        stok: 1,
        posisi_meja: '',
        spesifikasi: {
            cpu: '',
            ram: ''
        }
    });

    const simlabTicketForm = useForm({
        aset_id: '',
        nama_pelapor: user ? user.name : '',
        email_pelapor: user ? user.email : '',
        deskripsi_kerusakan: ''
    });

    const simlabLoanForm = useForm({
        email_peminjam: user ? user.email : '',
        aset_id: '',
        jumlah: 1,
        tanggal_pinjam: new Date().toISOString().split('T')[0],
        tanggal_kembali_rencana: new Date().toISOString().split('T')[0],
        catatan: ''
    });

    const handleFilterChange = (labId, kondisi) => {
        setFilterLabId(labId);
        setFilterKondisi(kondisi);
        router.get(route('dashboard'), {
            simlab_lab_id: labId,
            simlab_kondisi: kondisi
        }, {
            preserveState: true,
            preserveScroll: true,
            only: ['simlabAssets', 'simlabFilters']
        });
    };

    // Agenda management forms and handlers
    const agendaForm = useForm({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        start_time: '',
        end_time: ''
    });

    const [editingAgenda, setEditingAgenda] = useState(null);
    const editAgendaForm = useForm({
        title: '',
        description: '',
        date: '',
        start_time: '',
        end_time: ''
    });

    const handleCreateAgenda = (e) => {
        e.preventDefault();
        agendaForm.post(route('agendas.store'), {
            preserveScroll: true,
            onSuccess: () => {
                agendaForm.reset('title', 'description', 'start_time', 'end_time');
            }
        });
    };

    const startEditingAgenda = (agenda) => {
        setEditingAgenda(agenda);
        editAgendaForm.setData({
            title: agenda.title,
            description: agenda.description || '',
            date: agenda.date,
            start_time: agenda.start_time ? agenda.start_time.substring(0, 5) : '',
            end_time: agenda.end_time ? agenda.end_time.substring(0, 5) : ''
        });
    };

    const cancelEditingAgenda = () => {
        setEditingAgenda(null);
        editAgendaForm.reset();
    };

    const handleUpdateAgenda = (e) => {
        e.preventDefault();
        editAgendaForm.patch(route('agendas.update', editingAgenda.id), {
            preserveScroll: true,
            onSuccess: () => {
                setEditingAgenda(null);
                editAgendaForm.reset();
            }
        });
    };

    const deleteAgenda = (agendaId) => {
        if (confirm('Apakah Anda yakin ingin menghapus agenda ini?')) {
            router.delete(route('agendas.destroy', agendaId), {
                preserveScroll: true
            });
        }
    };

    // Handle Flash Notifications
    useEffect(() => {
        if (flash.success) {
            setNotifyMsg({ type: 'success', text: flash.success });
            setShowNotify(true);
            const timer = setTimeout(() => setShowNotify(false), 6000);
            return () => clearTimeout(timer);
        } else if (flash.error) {
            setNotifyMsg({ type: 'error', text: flash.error });
            setShowNotify(true);
            const timer = setTimeout(() => setShowNotify(false), 6000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    // Geolocation handler
    const scanGps = () => {
        setGpsLoading(true);
        setGpsError(null);
        if (!navigator.geolocation) {
            setGpsError("Browser Anda tidak mendukung Geolocation.");
            setGpsLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                setClientCoords({ lat, lng });

                // Calculate distance
                if (settings) {
                    const dist1 = getDistanceJS(lat, lng, parseFloat(settings.latitude), parseFloat(settings.longitude));
                    const dist2 = getDistanceJS(lat, lng, parseFloat(settings.latitude_2 || settings.latitude), parseFloat(settings.longitude_2 || settings.longitude));
                    const dist = Math.min(dist1, dist2);
                    setClientDistance(dist);
                }
                setGpsLoading(false);
            },
            (error) => {
                let msg = "Gagal memindai lokasi GPS.";
                if (error.code === error.PERMISSION_DENIED) {
                    msg = "Izin lokasi ditolak. Aktifkan GPS pada browser Anda.";
                } else if (error.code === error.POSITION_UNAVAILABLE) {
                    msg = "Informasi lokasi tidak tersedia.";
                } else if (error.code === error.TIMEOUT) {
                    msg = "Waktu pindaian GPS habis.";
                }
                setGpsError(msg);
                setGpsLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    // Auto scan GPS on load for student
    useEffect(() => {
        if (user.role === 'anak_pkl') {
            scanGps();
        }
    }, []);

    // Attendance submit handlers
    const submitCheckIn = (e) => {
        e.preventDefault();
        if (!clientCoords) return;
        
        setAttendanceProcessing(true);
        router.post(route('attendance.check-in'), {
            latitude: clientCoords.lat,
            longitude: clientCoords.lng
        }, {
            preserveScroll: true,
            onFinish: () => {
                setAttendanceProcessing(false);
                scanGps();
            }
        });
    };

    const submitCheckOut = (e) => {
        e.preventDefault();
        if (!clientCoords) return;

        setAttendanceProcessing(true);
        router.post(route('attendance.check-out'), {
            latitude: clientCoords.lat,
            longitude: clientCoords.lng
        }, {
            preserveScroll: true,
            onFinish: () => {
                setAttendanceProcessing(false);
                scanGps();
            }
        });
    };

    // SIMLAB submit handlers
    const submitSimlabAsset = (e) => {
        e.preventDefault();
        simlabAssetForm.post(route('simlab.assets.store'), {
            preserveScroll: true,
            onSuccess: () => {
                simlabAssetForm.reset();
                setSimlabActiveSubTab('list');
            }
        });
    };

    const submitSimlabTicket = (e) => {
        e.preventDefault();
        simlabTicketForm.post(route('simlab.tickets.store'), {
            preserveScroll: true,
            onSuccess: () => {
                simlabTicketForm.reset();
                setSimlabActiveSubTab('list');
            }
        });
    };

    const submitSimlabLoan = (e) => {
        e.preventDefault();
        simlabLoanForm.post(route('simlab.loans.store'), {
            preserveScroll: true,
            onSuccess: () => {
                simlabLoanForm.reset();
                setSimlabActiveSubTab('list');
            }
        });
    };

    // Task submit handlers
    const createReportedTask = (e) => {
        e.preventDefault();
        taskForm.post(route('tasks.store'), {
            onSuccess: () => {
                taskForm.reset();
                setNotifyMsg({ type: 'success', text: 'Laporan tugas berhasil dibuat!' });
                setShowNotify(true);
            }
        });
    };

    const takeTask = (taskId) => {
        router.post(route('tasks.take', taskId), {}, {
            preserveScroll: true
        });
    };

    const cancelTask = (taskId) => {
        if (confirm('Apakah Anda yakin ingin membatalkan pengambilan tugas ini?')) {
            router.post(route('tasks.cancel', taskId), {}, {
                preserveScroll: true
            });
        }
    };

    const openCompleteModal = (task) => {
        setActiveCompleteTask(task);
        completeForm.reset();
        setShowCompleteModal(true);
    };

    const submitCompleteTask = (e) => {
        e.preventDefault();
        if (!activeCompleteTask) return;

        completeForm.post(route('tasks.complete', activeCompleteTask.id), {
            forceFormData: true,
            onSuccess: () => {
                setShowCompleteModal(false);
                setActiveCompleteTask(null);
                completeForm.reset();
            }
        });
    };

    const deleteTask = (taskId) => {
        if (confirm('Apakah Anda yakin ingin menghapus tugas ini?')) {
            router.delete(route('tasks.destroy', taskId), {
                preserveScroll: true
            });
        }
    };

    // Setting update handler
    const updateGeofenceSettings = (e) => {
        e.preventDefault();
        settingsForm.post(route('settings.update'), {
            preserveScroll: true
        });
    };

    // User management handlers
    const createNewUser = (e) => {
        e.preventDefault();
        userForm.post(route('users.store'), {
            onSuccess: () => {
                setShowAddUserModal(false);
                userForm.reset();
            }
        });
    };

    const openEditPoints = (u) => {
        setEditingUserPoints(u);
        pointsForm.setData('points', u.points);
    };

    const submitPointsChange = (e) => {
        e.preventDefault();
        pointsForm.patch(route('users.points.update', editingUserPoints.id), {
            preserveScroll: true,
            onSuccess: () => {
                setEditingUserPoints(null);
                pointsForm.reset();
            }
        });
    };

    const openEditUser = (u) => {
        setEditingUser(u);
        editUserForm.setData({
            name: u.name,
            email: u.email,
            password: '',
            role: u.role,
            school_name: u.school_name || '',
            major: u.major || '',
            whatsapp_number: u.whatsapp_number || '',
            address: u.address || '',
            date_of_birth: u.date_of_birth || '',
            start_date: u.start_date || '',
            end_date: u.end_date || '',
            social_media: u.social_media || ''
        });
    };

    const submitUserEdit = (e) => {
        e.preventDefault();
        editUserForm.patch(route('users.update', editingUser.id), {
            preserveScroll: true,
            onSuccess: () => {
                setEditingUser(null);
                editUserForm.reset();
            }
        });
    };

    const deleteUser = (userId) => {
        if (confirm('Apakah Anda yakin ingin menghapus pengguna ini? Semua data terkait (tugas/absensi) akan ikut terhapus.')) {
            router.delete(route('users.destroy', userId), {
                preserveScroll: true
            });
        }
    };

    const createSchool = (e) => {
        e.preventDefault();
        schoolForm.post(route('schools.store'), {
            preserveScroll: true,
            onSuccess: () => {
                schoolForm.reset();
            }
        });
    };

    const deleteSchool = (schoolId) => {
        if (confirm('Apakah Anda yakin ingin menghapus sekolah ini?')) {
            router.delete(route('schools.destroy', schoolId), {
                preserveScroll: true
            });
        }
    };

    const handleUpdatePermitStatus = (permitId, status) => {
        router.patch(route('permissions.status.update', permitId), { status }, {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Sistem Geofencing PKL
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Halo, <span className="font-semibold text-indigo-600 dark:text-indigo-400">{user.name}</span> ({user.role.replace('_', ' ').toUpperCase()})
                        </p>
                    </div>
                    {user.role === 'anak_pkl' && (
                        <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-2 rounded-xl shadow-md font-bold">
                            <Trophy className="w-5 h-5 animate-bounce" />
                            <span>Poin Anda: {user.points}</span>
                        </div>
                    )}
                </div>
            }
        >
            <Head title="Dashboard PKL" />

            {/* Flash Notification Toast */}
            {showNotify && (
                <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 p-4 rounded-xl shadow-2xl transition-all duration-300 transform translate-y-0 ${
                    notifyMsg.type === 'success' 
                        ? 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-500 dark:bg-emerald-950 dark:text-emerald-200' 
                        : 'bg-rose-50 text-rose-800 border-l-4 border-rose-500 dark:bg-rose-950 dark:text-rose-200'
                }`}>
                    {notifyMsg.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <AlertTriangle className="w-5 h-5 text-rose-500" />}
                    <div className="text-sm font-medium mr-2">{notifyMsg.text}</div>
                    <button onClick={() => setShowNotify(false)} className="hover:opacity-75">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        
                        {/* Left Column Navigation Tabs */}
                        <div className="lg:col-span-3">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sticky top-6">
                                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 mb-3">
                                    Menu Utama
                                </p>
                                <nav className="space-y-1">
                                    {user.role === 'anak_pkl' && (
                                        <>
                                            <button
                                                onClick={() => setActiveTab('attendance')}
                                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                                    activeTab === 'attendance'
                                                        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 shadow-sm'
                                                        : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50'
                                                }`}
                                            >
                                                <Compass className="w-5 h-5" />
                                                Absensi Geofence
                                            </button>

                                            <button
                                                onClick={() => setActiveTab('jobboard')}
                                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                                    activeTab === 'jobboard'
                                                        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 shadow-sm'
                                                        : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50'
                                                }`}
                                            >
                                                <ClipboardList className="w-5 h-5" />
                                                Papan Lowongan Kerja
                                                {tasks.available?.length > 0 && (
                                                    <span className="ml-auto bg-rose-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                                                        {tasks.available.length}
                                                    </span>
                                                )}
                                            </button>

                                            <button
                                                onClick={() => setActiveTab('mytasks')}
                                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                                    activeTab === 'mytasks'
                                                        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 shadow-sm'
                                                        : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50'
                                                }`}
                                            >
                                                <CheckCircle className="w-5 h-5" />
                                                Tugas Saya
                                                {tasks.active?.length > 0 && (
                                                    <span className="ml-auto bg-amber-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                                                        {tasks.active.length}
                                                    </span>
                                                )}
                                            </button>

                                            <button
                                                onClick={() => setActiveTab('permissions')}
                                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                                    activeTab === 'permissions'
                                                        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 shadow-sm'
                                                        : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50'
                                                }`}
                                            >
                                                <Clock className="w-5 h-5" />
                                                Izin & Dispensasi
                                            </button>

                                            <button
                                                onClick={() => setActiveTab('agenda')}
                                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                                    activeTab === 'agenda'
                                                        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 shadow-sm'
                                                        : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50'
                                                }`}
                                            >
                                                <Calendar className="w-5 h-5" />
                                                Agenda Kegiatan
                                            </button>

                                            <button
                                                onClick={() => setActiveTab('device_permissions')}
                                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                                    activeTab === 'device_permissions'
                                                        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 shadow-sm'
                                                        : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50'
                                                }`}
                                            >
                                                <Settings className="w-5 h-5" />
                                                Pengaturan Perangkat
                                            </button>

                                            <button
                                                onClick={() => setActiveTab('simlab')}
                                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                                    activeTab === 'simlab'
                                                        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 shadow-sm'
                                                        : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50'
                                                }`}
                                            >
                                                <Database className="w-5 h-5" />
                                                Integrasi SIMLAB
                                            </button>
                                        </>
                                    )}

                                    {user.role !== 'anak_pkl' && (
                                        <>
                                        <button
                                            onClick={() => setActiveTab('tasks')}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                                activeTab === 'tasks'
                                                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 shadow-sm'
                                                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50'
                                            }`}
                                        >
                                            <ClipboardList className="w-5 h-5" />
                                            Kelola Laporan Tugas
                                        </button>

                                        <button
                                            onClick={() => setActiveTab('agenda')}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                                activeTab === 'agenda'
                                                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 shadow-sm'
                                                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50'
                                            }`}
                                        >
                                            <Calendar className="w-5 h-5" />
                                            Agenda Kegiatan
                                        </button>

                                        <button
                                            onClick={() => setActiveTab('simlab')}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                                activeTab === 'simlab'
                                                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 shadow-sm'
                                                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50'
                                            }`}
                                        >
                                            <Database className="w-5 h-5" />
                                            Integrasi SIMLAB
                                        </button>
                                        </>
                                    )}

                                    <button
                                        onClick={() => setActiveTab('leaderboard')}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                            activeTab === 'leaderboard'
                                                ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 shadow-sm'
                                                : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50'
                                        }`}
                                    >
                                        <Award className="w-5 h-5" />
                                        Papan Peringkat
                                    </button>

                                    {user.role === 'admin' && (
                                        <>
                                            <div className="border-t border-gray-100 dark:border-gray-700 my-4"></div>
                                            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 mb-3">
                                                Administrasi
                                            </p>
                                            
                                            <button
                                                onClick={() => setActiveTab('users')}
                                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                                    activeTab === 'users'
                                                        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 shadow-sm'
                                                        : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50'
                                                }`}
                                            >
                                                <Users className="w-5 h-5" />
                                                Kelola Pengguna
                                            </button>

                                            <button
                                                onClick={() => setActiveTab('attendance_recap')}
                                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                                    activeTab === 'attendance_recap'
                                                        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 shadow-sm'
                                                        : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50'
                                                }`}
                                            >
                                                <Clock className="w-5 h-5" />
                                                Rekap Absensi
                                            </button>

                                            <button
                                                onClick={() => setActiveTab('admin_permissions')}
                                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                                    activeTab === 'admin_permissions'
                                                        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 shadow-sm'
                                                        : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50'
                                                }`}
                                            >
                                                <ClipboardList className="w-5 h-5" />
                                                Persetujuan Izin
                                                {pendingPermitsCount > 0 && (
                                                    <span className="ml-auto bg-rose-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                                                        {pendingPermitsCount}
                                                    </span>
                                                )}
                                            </button>

                                            <button
                                                onClick={() => setActiveTab('schools')}
                                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                                    activeTab === 'schools'
                                                        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 shadow-sm'
                                                        : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50'
                                                }`}
                                            >
                                                <GraduationCap className="w-5 h-5" />
                                                Kelola Sekolah
                                            </button>

                                            <button
                                                onClick={() => setActiveTab('manage_agendas')}
                                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                                    activeTab === 'manage_agendas'
                                                        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 shadow-sm'
                                                        : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50'
                                                }`}
                                            >
                                                <Calendar className="w-5 h-5" />
                                                Kelola Agenda
                                            </button>

                                            <button
                                                onClick={() => setActiveTab('settings')}
                                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                                    activeTab === 'settings'
                                                        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 shadow-sm'
                                                        : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50'
                                                }`}
                                            >
                                                <Settings className="w-5 h-5" />
                                                Pengaturan GPS
                                            </button>
                                        </>
                                    )}
                                </nav>
                            </div>
                        </div>

                        {/* Right Column Content Areas */}
                        <div className="lg:col-span-9">
                            <div className="space-y-6">

                                {/* ================= TAB: AGENDA (STUDENTS / VIEW ONLY) ================= */}
                                {activeTab === 'agenda' && (
                                    <div className="space-y-6">
                                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                <Calendar className="w-5 h-5 text-indigo-500" />
                                                Agenda Kegiatan & Informasi PKL
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                Berikut adalah jadwal agenda kegiatan dan informasi penting yang telah ditentukan oleh Administrator.
                                            </p>
                                        </div>

                                        <div className="space-y-4">
                                            {agendas?.length > 0 ? (
                                                agendas.map((agenda) => {
                                                    const agendaDate = new Date(agenda.date);
                                                    const today = new Date();
                                                    today.setHours(0,0,0,0);
                                                    const isUpcoming = agendaDate >= today;

                                                    return (
                                                        <div key={agenda.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                                                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                                                <div className="space-y-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                                                                            isUpcoming 
                                                                                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300' 
                                                                                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-450'
                                                                        }`}>
                                                                            {isUpcoming ? 'Mendatang' : 'Selesai'}
                                                                        </span>
                                                                        <span className="text-xs text-gray-450 dark:text-gray-400">
                                                                            Dibuat oleh: {agenda.creator?.name || 'Administrator'}
                                                                        </span>
                                                                    </div>
                                                                    <h4 className="text-lg font-bold text-gray-900 dark:text-white leading-snug">
                                                                        {agenda.title}
                                                                    </h4>
                                                                    <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                                                                        {agenda.description || 'Tidak ada deskripsi.'}
                                                                    </p>
                                                                </div>

                                                                <div className="bg-gray-50 dark:bg-gray-900/60 p-4 rounded-xl shrink-0 border border-gray-150 dark:border-gray-700 flex flex-row md:flex-col items-center md:items-start justify-between md:justify-center gap-4 md:w-56">
                                                                    <div className="flex items-center gap-2 text-sm text-gray-750 dark:text-gray-300">
                                                                        <Calendar className="w-4 h-4 text-indigo-500" />
                                                                        <span className="font-semibold text-xs">{formatDateIndo(agenda.date)}</span>
                                                                    </div>
                                                                    {agenda.start_time && (
                                                                        <div className="flex items-center gap-2 text-sm text-gray-750 dark:text-gray-300">
                                                                            <Clock className="w-4 h-4 text-indigo-500" />
                                                                            <span className="font-semibold text-xs">
                                                                                {agenda.start_time.substring(0, 5)} {agenda.end_time ? `- ${agenda.end_time.substring(0, 5)}` : ''} WIB
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-sm border border-gray-100 dark:border-gray-700 text-center text-gray-500">
                                                    <Calendar className="w-12 h-12 text-gray-350 mx-auto mb-3 animate-bounce" />
                                                    <p className="font-semibold text-gray-700 dark:text-gray-300">Belum Ada Agenda</p>
                                                    <p className="text-sm text-gray-400 mt-1">Saat ini belum ada jadwal agenda kegiatan yang dipublikasikan.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* ================= TAB: MANAGE AGENDAS (ADMIN ONLY) ================= */}
                                {activeTab === 'manage_agendas' && user.role === 'admin' && (
                                    <div className="space-y-6">
                                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                <Calendar className="w-5 h-5 text-indigo-500" />
                                                Kelola Agenda Kegiatan & Informasi PKL
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                Tambahkan, perbarui, atau hapus jadwal agenda kegiatan yang ditujukan untuk anak-anak PKL.
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                                            {/* Form section */}
                                            <div className="xl:col-span-4 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
                                                <h4 className="font-bold text-gray-900 dark:text-white text-base">
                                                    {editingAgenda ? 'Edit Agenda' : 'Tambah Agenda Baru'}
                                                </h4>
                                                
                                                <form onSubmit={editingAgenda ? handleUpdateAgenda : handleCreateAgenda} className="space-y-4">
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Judul Agenda</label>
                                                        <input
                                                            type="text"
                                                            value={editingAgenda ? editAgendaForm.data.title : agendaForm.data.title}
                                                            onChange={e => editingAgenda ? editAgendaForm.setData('title', e.target.value) : agendaForm.setData('title', e.target.value)}
                                                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-905 border border-gray-250 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
                                                            placeholder="Contoh: Pembekalan PKL..."
                                                            required
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Deskripsi / Informasi</label>
                                                        <textarea
                                                            value={editingAgenda ? editAgendaForm.data.description : agendaForm.data.description}
                                                            onChange={e => editingAgenda ? editAgendaForm.setData('description', e.target.value) : agendaForm.setData('description', e.target.value)}
                                                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-905 border border-gray-250 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white h-24 resize-none"
                                                            placeholder="Tulis deskripsi detail agenda atau tempat pelaksanaan..."
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Tanggal Kegiatan</label>
                                                        <input
                                                            type="date"
                                                            value={editingAgenda ? editAgendaForm.data.date : agendaForm.data.date}
                                                            onChange={e => editingAgenda ? editAgendaForm.setData('date', e.target.value) : agendaForm.setData('date', e.target.value)}
                                                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-905 border border-gray-250 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
                                                            required
                                                        />
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Jam Mulai</label>
                                                            <input
                                                                type="time"
                                                                value={editingAgenda ? editAgendaForm.data.start_time : agendaForm.data.start_time}
                                                                onChange={e => editingAgenda ? editAgendaForm.setData('start_time', e.target.value) : agendaForm.setData('start_time', e.target.value)}
                                                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-905 border border-gray-250 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Jam Selesai</label>
                                                            <input
                                                                type="time"
                                                                value={editingAgenda ? editAgendaForm.data.end_time : agendaForm.data.end_time}
                                                                onChange={e => editingAgenda ? editAgendaForm.setData('end_time', e.target.value) : agendaForm.setData('end_time', e.target.value)}
                                                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-905 border border-gray-250 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-2 pt-2">
                                                        <button
                                                            type="submit"
                                                            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm"
                                                        >
                                                            {editingAgenda ? 'Simpan Perubahan' : 'Tambah Agenda'}
                                                        </button>
                                                        {editingAgenda && (
                                                            <button
                                                                type="button"
                                                                onClick={cancelEditingAgenda}
                                                                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-250 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-white rounded-xl text-xs font-bold"
                                                            >
                                                                Batal
                                                            </button>
                                                        )}
                                                    </div>
                                                </form>
                                            </div>

                                            {/* List section */}
                                            <div className="xl:col-span-8 space-y-4">
                                                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                                                    <h4 className="font-bold text-gray-900 dark:text-white text-base mb-4">Daftar Agenda Kegiatan</h4>
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                                            <thead className="text-xs text-gray-450 uppercase bg-gray-50 dark:bg-gray-900">
                                                                <tr>
                                                                    <th className="px-6 py-3">Agenda</th>
                                                                    <th className="px-6 py-3">Waktu</th>
                                                                    <th className="px-6 py-3 text-right">Aksi</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                                {agendas?.length > 0 ? (
                                                                    agendas.map((agenda) => (
                                                                        <tr key={agenda.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20">
                                                                            <td className="px-6 py-4">
                                                                                <div className="font-bold text-gray-900 dark:text-white">{agenda.title}</div>
                                                                                <div className="text-xs text-gray-400 line-clamp-1 mt-0.5">{agenda.description || '-'}</div>
                                                                            </td>
                                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                                <div className="text-xs font-bold text-gray-800 dark:text-gray-250">{formatDateIndo(agenda.date)}</div>
                                                                                {agenda.start_time && (
                                                                                    <div className="text-[10px] text-gray-400 mt-0.5">{agenda.start_time.substring(0, 5)} {agenda.end_time ? `- ${agenda.end_time.substring(0, 5)}` : ''} WIB</div>
                                                                                )}
                                                                            </td>
                                                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                                                <div className="inline-flex gap-2">
                                                                                    <button
                                                                                        onClick={() => startEditingAgenda(agenda)}
                                                                                        className="p-1.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-lg transition-colors"
                                                                                        title="Edit Agenda"
                                                                                    >
                                                                                        <Pencil className="w-4 h-4" />
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => deleteAgenda(agenda.id)}
                                                                                        className="p-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-lg transition-colors"
                                                                                        title="Hapus Agenda"
                                                                                    >
                                                                                        <Trash2 className="w-4 h-4" />
                                                                                    </button>
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    ))
                                                                ) : (
                                                                    <tr>
                                                                        <td colSpan="3" className="px-6 py-8 text-center text-gray-400">Belum ada agenda yang dibuat.</td>
                                                                    </tr>
                                                                )}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ================= TAB: ATTENDANCE ================= */}
                                {activeTab === 'attendance' && user.role === 'anak_pkl' && (
                                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-indigo-50/50 to-purple-50/20 dark:from-gray-750 dark:to-gray-800">
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                <MapPin className="w-5 h-5 text-indigo-500" />
                                                Absensi Kehadiran GPS Geofence
                                            </h3>
                                        </div>

                                        <div className="p-6 space-y-8">
                                            {/* GPS Scanner Radar Visualizer */}
                                            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                                                <div className="md:col-span-5 flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 relative overflow-hidden h-64">
                                                    {gpsLoading ? (
                                                        <div className="flex flex-col items-center justify-center space-y-4">
                                                            <div className="relative">
                                                                <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                                                                <Compass className="w-8 h-8 text-indigo-600 absolute top-4 left-4 animate-pulse" />
                                                            </div>
                                                            <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">Memindai koordinat GPS...</p>
                                                        </div>
                                                    ) : clientCoords ? (
                                                        <div className="text-center space-y-4 w-full">
                                                            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
                                                                clientDistance <= settings?.radius
                                                                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 border border-emerald-400 animate-pulse'
                                                                    : 'bg-rose-100 dark:bg-rose-950 text-rose-600 border border-rose-400'
                                                            }`}>
                                                                <MapPin className="w-8 h-8" />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-gray-400">Jarak Anda dengan Kampus</p>
                                                                <p className="text-2xl font-black text-gray-800 dark:text-white mt-1">
                                                                    {clientDistance ? `${clientDistance.toFixed(1)} meter` : 'Menghitung...'}
                                                                </p>
                                                            </div>
                                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                                                                clientDistance <= settings?.radius
                                                                    ? 'bg-emerald-500 text-white'
                                                                    : 'bg-rose-500 text-white'
                                                            }`}>
                                                                {clientDistance <= settings?.radius ? (
                                                                    <>
                                                                        <Check className="w-3.5 h-3.5" /> Dalam Radius {closerCampusName}
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <X className="w-3.5 h-3.5" /> Di Luar Radius
                                                                    </>
                                                                )}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <div className="text-center space-y-4">
                                                            <Compass className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto" />
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">Belum ada pindaian lokasi GPS.</p>
                                                            <button 
                                                                onClick={scanGps}
                                                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 mx-auto"
                                                            >
                                                                <RefreshCw className="w-3.5 h-3.5" /> Pindai GPS
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="md:col-span-7 space-y-4">
                                                    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 space-y-3">
                                                        <div className="flex flex-col gap-1 text-sm">
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-500">Koordinat Kampus 1:</span>
                                                                <span className="font-semibold text-gray-700 dark:text-gray-300">{settings?.latitude}, {settings?.longitude}</span>
                                                            </div>
                                                            <div className="flex justify-between border-t border-gray-150 dark:border-gray-800 pt-1">
                                                                <span className="text-gray-500">Koordinat Kampus 2:</span>
                                                                <span className="font-semibold text-gray-700 dark:text-gray-300">{settings?.latitude_2 || '-'}, {settings?.longitude_2 || '-'}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-gray-500">Radius Toleransi:</span>
                                                            <span className="font-semibold text-gray-700 dark:text-gray-300">{settings?.radius} meter</span>
                                                        </div>
                                                        <div className="flex justify-between text-sm border-t border-gray-200 dark:border-gray-700 pt-2">
                                                            <span className="text-gray-500">Koordinat Anda:</span>
                                                            <span className="font-semibold text-gray-700 dark:text-gray-300">
                                                                {clientCoords ? `${clientCoords.lat.toFixed(6)}, ${clientCoords.lng.toFixed(6)}` : 'Belum dipindai'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {gpsError && (
                                                        <div className="p-3 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-xl flex items-start gap-2">
                                                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                                                            <span>{gpsError}</span>
                                                        </div>
                                                    )}

                                                    {clientDistance !== null && clientDistance > (settings?.radius || 50) && (
                                                        <div className="p-3 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-xl flex items-start gap-2">
                                                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                                                            <span>
                                                                Anda berada di luar radius area Kampus 1 ({dist1 !== null ? Math.round(dist1) : '-'} m) dan Kampus 2 ({dist2 !== null ? Math.round(dist2) : '-'} m) (batas toleransi: {settings?.radius} m). 
                                                                Tombol absen dinonaktifkan. Silakan mendekat ke salah satu area kampus.
                                                            </span>
                                                        </div>
                                                    )}

                                                    <div className="flex gap-4">
                                                        <button
                                                            onClick={scanGps}
                                                            className="px-4 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                                                        >
                                                            <RefreshCw className={`w-4 h-4 ${gpsLoading ? 'animate-spin' : ''}`} />
                                                            Pindai Ulang
                                                        </button>

                                                         {/* Check-In / Check-Out Actions */}
                                                         {todayAttendance?.check_out ? (
                                                             <div className="flex-1 py-3 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold rounded-xl text-sm text-center">
                                                                 Sudah Menyelesaikan Absensi Hari Ini
                                                             </div>
                                                         ) : (!todayAttendance?.check_in && !isPastWorkHourEnd()) ? (
                                                             <div className="flex-1">
                                                                 <button
                                                                     type="button"
                                                                     onClick={() => openCamera('check-in')}
                                                                     disabled={cannotCheckIn()}
                                                                     className={`w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                                                                         cannotCheckIn()
                                                                             ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                                                             : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md shadow-indigo-200 dark:shadow-none'
                                                                     }`}
                                                                 >
                                                                     <Check className="w-4 h-4" />
                                                                     Absen Masuk
                                                                 </button>
                                                             </div>
                                                         ) : (
                                                             <div className="flex-1">
                                                                 <button
                                                                     type="button"
                                                                     onClick={() => openCamera('check-out')}
                                                                     disabled={cannotCheckOut()}
                                                                     className={`w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                                                                         cannotCheckOut()
                                                                             ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                                                             : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md'
                                                                     }`}
                                                                 >
                                                                     <ArrowRight className="w-4 h-4" />
                                                                     Absen Pulang
                                                                 </button>
                                                             </div>
                                                         )}
                                                    </div>
                                                </div>
                                            </div>

                                             {/* Today's Log Card */}
                                             <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
                                                 <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wider">
                                                     Status Log Absensi Hari Ini
                                                 </h4>
                                                 
                                                 {todayAttendance ? (
                                                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                                         <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 flex items-center justify-between gap-3">
                                                             <div className="flex items-center gap-3">
                                                                 <Clock className="w-8 h-8 text-indigo-500 bg-indigo-50 dark:bg-indigo-950 p-1.5 rounded-lg" />
                                                                 <div>
                                                                     <p className="text-xs text-gray-400">Jam Masuk</p>
                                                                     <p className="text-sm font-bold text-gray-700 dark:text-white mt-0.5">{todayAttendance.check_in || '--:--'}</p>
                                                                 </div>
                                                             </div>
                                                             {todayAttendance.in_selfie && (
                                                                 <button 
                                                                     onClick={() => setShowProofModal(`/storage/${todayAttendance.in_selfie}`)}
                                                                     className="group relative rounded-lg overflow-hidden w-10 h-10 border border-gray-200 dark:border-gray-700 shadow-sm hover:scale-105 transition-transform shrink-0"
                                                                 >
                                                                     <img src={`/storage/${todayAttendance.in_selfie}`} className="w-full h-full object-cover" alt="Selfie Masuk" />
                                                                     <div className="absolute inset-0 bg-black/45 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                         <Camera className="w-3.5 h-3.5 text-white" />
                                                                     </div>
                                                                 </button>
                                                             )}
                                                         </div>

                                                         <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 flex items-center justify-between gap-3">
                                                             <div className="flex items-center gap-3">
                                                                 <Clock className="w-8 h-8 text-amber-500 bg-amber-50 dark:bg-amber-950 p-1.5 rounded-lg" />
                                                                 <div>
                                                                     <p className="text-xs text-gray-400">Jam Pulang</p>
                                                                     <p className="text-sm font-bold text-gray-700 dark:text-white mt-0.5">{todayAttendance.check_out || '--:--'}</p>
                                                                 </div>
                                                             </div>
                                                             {todayAttendance.out_selfie && (
                                                                 <button 
                                                                     onClick={() => setShowProofModal(`/storage/${todayAttendance.out_selfie}`)}
                                                                     className="group relative rounded-lg overflow-hidden w-10 h-10 border border-gray-200 dark:border-gray-700 shadow-sm hover:scale-105 transition-transform shrink-0"
                                                                 >
                                                                     <img src={`/storage/${todayAttendance.out_selfie}`} className="w-full h-full object-cover" alt="Selfie Pulang" />
                                                                     <div className="absolute inset-0 bg-black/45 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                         <Camera className="w-3.5 h-3.5 text-white" />
                                                                     </div>
                                                                 </button>
                                                             )}
                                                         </div>

                                                         <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 flex items-center gap-3">
                                                             <ShieldAlert className={`w-8 h-8 p-1.5 rounded-lg ${
                                                                 todayAttendance.status === 'present' ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950' : (todayAttendance.status === 'late' ? 'text-amber-500 bg-amber-50 dark:bg-amber-950' : 'text-rose-500 bg-rose-50 dark:bg-rose-950')
                                                             }`} />
                                                             <div>
                                                                 <p className="text-xs text-gray-400">Status Validasi</p>
                                                                 <span className={`inline-flex px-2.5 py-0.5 text-xs font-bold rounded-full mt-1 ${
                                                                     todayAttendance.status === 'present' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' : (todayAttendance.status === 'late' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300')
                                                                 }`}>
                                                                     {todayAttendance.status === 'present' ? 'Tepat Waktu' : (todayAttendance.status === 'late' ? 'Terlambat' : 'Ditolak')}
                                                                 </span>
                                                             </div>
                                                         </div>
                                                     </div>
                                                 ) : (
                                                     <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl text-center text-sm text-gray-500 dark:text-gray-400">
                                                         Anda belum melakukan absensi hari ini.
                                                     </div>
                                                 )}
                                             </div>
                                        </div>
                                    </div>
                                )}


                                {/* ================= TAB: JOB BOARD (STUDENT ONLY) ================= */}
                                {activeTab === 'jobboard' && user.role === 'anak_pkl' && (
                                    <div className="space-y-6">
                                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                <ClipboardList className="w-5 h-5 text-indigo-500" />
                                                Papan Lowongan Pekerjaan (Tersedia)
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                Ambil tugas yang dilaporkan oleh Dosen/Staf. Status tugas akan berubah otomatis menjadi Proses saat kuota terpenuhi.
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {tasks.available?.length > 0 ? (
                                                tasks.available.map((task) => {
                                                    const hasTaken = task.students?.some(s => s.id === user.id);
                                                    return (
                                                        <div key={task.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between hover:shadow-md transition-shadow">
                                                            <div>
                                                                <div className="flex justify-between items-start gap-2">
                                                                    <h4 className="font-bold text-gray-900 dark:text-white text-base leading-snug">
                                                                        {task.title}
                                                                    </h4>
                                                                    <div className="flex flex-col items-end gap-1 shrink-0">
                                                                        <span className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 text-xs font-bold px-2 py-0.5 rounded-full">
                                                                            Kuota: {task.quota} orang
                                                                        </span>
                                                                        {task.students?.length > 0 && (
                                                                            <span className="text-[10px] text-slate-400 font-medium">
                                                                                {task.students.length} anak sudah mengambil
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 line-clamp-3">
                                                                    {task.description}
                                                                </p>
                                                            </div>

                                                            <div className="border-t border-gray-50 dark:border-gray-700 pt-4 mt-4 flex items-center justify-between">
                                                                <div className="text-xs text-gray-400">
                                                                    Pelapor: <span className="font-semibold text-gray-600 dark:text-gray-300">
                                                                        {task.reporter ? task.reporter.name : `${task.requester_name} (Umum)`}
                                                                        {task.target_room && ` | Ruang: ${task.target_room} (${task.campus_type})`}
                                                                    </span>
                                                                </div>
                                                                 {hasTaken ? (
                                                                     <span className="px-3 py-1.5 bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-650 flex items-center gap-1">
                                                                         <Check className="w-3.5 h-3.5" /> Sudah Anda Ambil
                                                                     </span>
                                                                 ) : (
                                                                     <button
                                                                         onClick={() => !cannotTakeTask() && takeTask(task.id)}
                                                                         disabled={cannotTakeTask()}
                                                                         className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                                                                             cannotTakeTask()
                                                                                 ? 'bg-gray-200 dark:bg-gray-750 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                                                                 : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                                                                         }`}
                                                                     >
                                                                         Ambil Tugas <ArrowRight className="w-3.5 h-3.5" />
                                                                     </button>
                                                                 )}
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 text-center text-gray-500">
                                                    <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                                    <p className="font-semibold">Papan Tugas Bersih!</p>
                                                    <p className="text-sm text-gray-400 mt-1">Belum ada tugas baru yang dilaporkan.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}


                                {/* ================= TAB: MY TASKS (STUDENT ONLY) ================= */}
                                {activeTab === 'mytasks' && user.role === 'anak_pkl' && (
                                    <div className="space-y-6">
                                        
                                        {/* 1. Tugas Pending (Menunggu Kuota Terpenuhi) */}
                                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                                             <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                                                 <Clock className="w-5 h-5 text-indigo-400" />
                                                 Tugas Pending (Menunggu Kuota Terpenuhi)
                                             </h3>

                                             {tasks.pending?.length > 0 ? (
                                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                     {tasks.pending.map((task) => (
                                                         <div key={task.id} className="bg-gray-50 dark:bg-gray-900 rounded-xl p-5 border border-gray-150 dark:border-gray-800 flex flex-col justify-between">
                                                             <div>
                                                                 <h4 className="font-bold text-gray-950 dark:text-white text-base">{task.title}</h4>
                                                                 <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{task.description}</p>
                                                             </div>

                                                             <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                                                                 <div className="flex items-center justify-between sm:justify-start gap-4">
                                                                     <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-850 dark:bg-indigo-950/50 dark:text-indigo-300">
                                                                         <Compass className="w-3.5 h-3.5 animate-spin-slow text-indigo-500" /> MENUNGGU KUOTA
                                                                     </span>
                                                                     <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                                                                         {task.students?.length} / {task.quota} Kuota
                                                                     </span>
                                                                 </div>
                                                                 <button
                                                                     onClick={() => cancelTask(task.id)}
                                                                     className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
                                                                 >
                                                                     Batal Ambil
                                                                 </button>
                                                             </div>
                                                         </div>
                                                     ))}
                                                 </div>
                                             ) : (
                                                 <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">
                                                     Tidak ada tugas pending yang Anda ambil.
                                                 </p>
                                             )}
                                         </div>

                                         {/* 2. Active Tasks */}
                                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                                                <Clock className="w-5 h-5 text-amber-500 animate-pulse" />
                                                Tugas Aktif (Sedang Dikerjakan)
                                            </h3>

                                            {tasks.active?.length > 0 ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {tasks.active.map((task) => (
                                                        <div key={task.id} className="bg-gray-50 dark:bg-gray-900 rounded-xl p-5 border border-gray-150 dark:border-gray-800 flex flex-col justify-between">
                                                            <div>
                                                                <h4 className="font-bold text-gray-950 dark:text-white text-base">{task.title}</h4>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{task.description}</p>
                                                            </div>

                                                            <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                                                    <Clock className="w-3.5 h-3.5" /> PROSES
                                                                </span>
                                                                <button
                                                                    onClick={() => openCompleteModal(task)}
                                                                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm"
                                                                >
                                                                    Selesaikan <Check className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">
                                                    Anda tidak memiliki tugas aktif saat ini.
                                                </p>
                                            )}
                                        </div>

                                        {/* 3. Riwayat Tugas Selesai */}
                                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                                                <CheckCircle className="w-5 h-5 text-emerald-500" />
                                                Riwayat Tugas Selesai
                                            </h3>

                                            {tasks.completed?.length > 0 ? (
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                                        <thead className="text-xs text-gray-400 uppercase bg-gray-50 dark:bg-gray-900 rounded-lg">
                                                            <tr>
                                                                    <th scope="col" className="px-6 py-3">Nama Tugas</th>
                                                                    <th scope="col" className="px-6 py-3">Kategori</th>
                                                                    <th scope="col" className="px-6 py-3">Status</th>
                                                                    <th scope="col" className="px-6 py-3">Bukti</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                            {tasks.completed.map((task) => (
                                                                <tr key={task.id} className="bg-white dark:bg-gray-800">
                                                                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{task.title}</td>
                                                                    <td className="px-6 py-4">
                                                                        <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                                                                            task.is_assisted 
                                                                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' 
                                                                                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                                                        }`}>
                                                                            {task.is_assisted ? 'Dibantu Pembimbing (+1)' : 'Mandiri (+2)'}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-6 py-4">
                                                                        <span className="bg-emerald-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">SUKSES</span>
                                                                    </td>
                                                                    <td className="px-6 py-4">
                                                                        {task.proof_photo ? (
                                                                            <button 
                                                                                onClick={() => setShowProofModal(`/storage/${task.proof_photo}`)}
                                                                                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                                                                            >
                                                                                <Camera className="w-3.5 h-3.5" /> Lihat Bukti
                                                                            </button>
                                                                        ) : 'Tidak ada'}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">
                                                    Belum ada riwayat penyelesaian tugas.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}


                                {/* ================= TAB: DEVICE PERMISSIONS ================= */}
                                {activeTab === 'device_permissions' && (
                                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8 dark:bg-gray-800">
                                        <DevicePermissions className="max-w-3xl mx-auto" />
                                    </div>
                                )}


                                {/* ================= TAB: LEADERBOARD ================= */}
                                {activeTab === 'leaderboard' && (
                                    <div className="space-y-6">
                                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 bg-gradient-to-br from-indigo-50/20 via-white to-purple-50/10 dark:from-gray-800 dark:to-gray-800">
                                            <div className="text-center max-w-lg mx-auto">
                                                <Trophy className="w-12 h-12 text-amber-500 mx-auto mb-2 animate-bounce" />
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Papan Peringkat Kinerja Anak PKL</h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                    Penyelesaian tugas mandiri memberi poin tertinggi (+2 Poin). Bersainglah secara sehat untuk meraih posisi puncak!
                                                </p>
                                            </div>

                                            {/* 3D-Like Podium Visualizer */}
                                            {leaderboard.podium?.length > 0 && (
                                                <div className="flex flex-col md:flex-row md:items-end justify-center gap-4 mt-12 mb-8 max-w-2xl mx-auto px-4">
                                                    
                                                    {/* 2nd Place */}
                                                    {leaderboard.podium[1] && (
                                                        <div className="flex flex-col items-center flex-1 order-2 md:order-1 mt-6">
                                                            <div className="w-12 h-12 rounded-full bg-slate-200 border-2 border-slate-300 flex items-center justify-center font-bold text-slate-700 text-lg shadow-sm">
                                                                🥈
                                                            </div>
                                                            <p className="text-sm font-bold text-gray-800 dark:text-white mt-2 text-center truncate w-full">{leaderboard.podium[1].name.split(' ')[0]}</p>
                                                            <div className="w-full bg-slate-100 dark:bg-slate-700 h-28 rounded-t-2xl mt-3 flex flex-col items-center justify-center p-3 border-t-4 border-slate-400 shadow-inner">
                                                                <span className="text-2xl font-black text-slate-500 dark:text-slate-300">2</span>
                                                                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-1">{leaderboard.podium[1].points} Poin</span>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* 1st Place */}
                                                    {leaderboard.podium[0] && (
                                                        <div className="flex flex-col items-center flex-1 order-1 md:order-2">
                                                            <div className="relative">
                                                                <div className="w-16 h-16 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center font-bold text-amber-700 text-2xl shadow-md ring-4 ring-amber-300 ring-offset-2 dark:ring-offset-gray-800">
                                                                    👑
                                                                </div>
                                                                <div className="absolute -top-1 -right-1 bg-yellow-500 text-white rounded-full p-1 shadow-sm">
                                                                    <Star className="w-3.5 h-3.5 fill-white" />
                                                                </div>
                                                            </div>
                                                            <p className="text-base font-black text-gray-900 dark:text-white mt-2 text-center truncate w-full">{leaderboard.podium[0].name.split(' ')[0]}</p>
                                                            <div className="w-full bg-gradient-to-b from-amber-400 to-amber-500 dark:from-amber-500 dark:to-amber-600 h-36 rounded-t-2xl mt-3 flex flex-col items-center justify-center p-3 border-t-4 border-amber-300 shadow-md">
                                                                <span className="text-3xl font-black text-white">1</span>
                                                                <span className="text-xs font-black text-amber-50 mt-1">{leaderboard.podium[0].points} Poin</span>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* 3rd Place */}
                                                    {leaderboard.podium[2] && (
                                                        <div className="flex flex-col items-center flex-1 order-3 mt-10">
                                                            <div className="w-12 h-12 rounded-full bg-orange-100 border-2 border-orange-300 flex items-center justify-center font-bold text-orange-700 text-lg shadow-sm">
                                                                🥉
                                                            </div>
                                                            <p className="text-sm font-bold text-gray-800 dark:text-white mt-2 text-center truncate w-full">{leaderboard.podium[2].name.split(' ')[0]}</p>
                                                            <div className="w-full bg-orange-50 dark:bg-orange-950/20 h-20 rounded-t-2xl mt-3 flex flex-col items-center justify-center p-3 border-t-4 border-orange-400 shadow-inner">
                                                                <span className="text-2xl font-black text-orange-600 dark:text-orange-400">3</span>
                                                                <span className="text-xs font-bold text-orange-700 dark:text-orange-300 mt-1">{leaderboard.podium[2].points} Poin</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Detailed Student Ranking Table */}
                                            <div className="overflow-x-auto mt-6">
                                                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                                    <thead className="text-xs text-gray-400 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                                        <tr>
                                                            <th scope="col" className="px-6 py-3 w-16 text-center">Rank</th>
                                                            <th scope="col" className="px-6 py-3">Nama Lengkap</th>
                                                            <th scope="col" className="px-6 py-3">Email</th>
                                                            <th scope="col" className="px-6 py-3 text-right">Poin</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                        {leaderboard.all?.map((student, idx) => (
                                                            <tr key={student.id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                                                <td className="px-6 py-4 font-bold text-center text-gray-950 dark:text-white">
                                                                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                                                                </td>
                                                                <td className="px-6 py-4 font-semibold text-gray-950 dark:text-white">{student.name}</td>
                                                                <td className="px-6 py-4 text-xs">{student.email}</td>
                                                                <td className="px-6 py-4 font-black text-right text-indigo-600 dark:text-indigo-400">{student.points}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                )}


                                {/* ================= TAB: MANAGE TASKS (DOSEN, STAF, ADMIN) ================= */}
                                {activeTab === 'tasks' && user.role !== 'anak_pkl' && (
                                    <div className="space-y-6">
                                        
                                        {/* Task Creation Form */}
                                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 border-b pb-3 dark:border-gray-700">
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                    <Plus className="w-5 h-5 text-indigo-500" />
                                                    Buat Laporan Tugas / Aduan Baru
                                                </h3>
                                                <div className="px-3 py-1 bg-teal-50 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900 text-teal-700 dark:text-teal-400 text-xs font-bold rounded-full">
                                                    Siswa PKL Tersedia: {availableStudentsCount[taskForm.data.campus_type] ?? 0} orang
                                                </div>
                                            </div>

                                            <form onSubmit={createReportedTask} className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Nama Pengaju</label>
                                                        <input
                                                            type="text"
                                                            value={taskForm.data.requester_name}
                                                            onChange={e => taskForm.setData('requester_name', e.target.value)}
                                                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
                                                            placeholder="Nama lengkap pengaju..."
                                                            required
                                                        />
                                                        {taskForm.errors.requester_name && <p className="text-xs text-rose-500 mt-1">{taskForm.errors.requester_name}</p>}
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Ruangan Dituju</label>
                                                        <input
                                                            type="text"
                                                            value={taskForm.data.target_room}
                                                            onChange={e => taskForm.setData('target_room', e.target.value)}
                                                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
                                                            placeholder="Contoh: Lab Komputer 3..."
                                                            required
                                                        />
                                                        {taskForm.errors.target_room && <p className="text-xs text-rose-500 mt-1">{taskForm.errors.target_room}</p>}
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Lokasi Kampus</label>
                                                        <select
                                                            value={taskForm.data.campus_type}
                                                            onChange={e => taskForm.setData('campus_type', e.target.value)}
                                                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
                                                            required
                                                        >
                                                            <option value="Kampus 1">Kampus 1</option>
                                                            <option value="Kampus 2">Kampus 2</option>
                                                        </select>
                                                        {taskForm.errors.campus_type && <p className="text-xs text-rose-500 mt-1">{taskForm.errors.campus_type}</p>}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className="md:col-span-2">
                                                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Judul Laporan / Masalah</label>
                                                        <input
                                                            type="text"
                                                            value={taskForm.data.title}
                                                            onChange={e => taskForm.setData('title', e.target.value)}
                                                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
                                                            placeholder="Contoh: Printer rusak di ruang akademik"
                                                            required
                                                        />
                                                        {taskForm.errors.title && <p className="text-xs text-rose-500 mt-1">{taskForm.errors.title}</p>}
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Kuota Anak PKL</label>
                                                        <input
                                                            type="number"
                                                            value={taskForm.data.quota}
                                                            onChange={e => taskForm.setData('quota', parseInt(e.target.value))}
                                                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
                                                            min="1"
                                                            required
                                                        />
                                                        {taskForm.errors.quota && <p className="text-xs text-rose-500 mt-1">{taskForm.errors.quota}</p>}
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Penjelasan Detail Masalah</label>
                                                    <textarea
                                                        value={taskForm.data.description}
                                                        onChange={e => taskForm.setData('description', e.target.value)}
                                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none h-28 resize-none dark:text-white"
                                                        placeholder="Sebutkan langkah detail penanganan masalah atau tugas yang perlu didelegasikan..."
                                                        required
                                                    />
                                                    {taskForm.errors.description && <p className="text-xs text-rose-500 mt-1">{taskForm.errors.description}</p>}
                                                </div>

                                                <div className="flex justify-end">
                                                    <button
                                                        type="submit"
                                                        disabled={taskForm.processing}
                                                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold flex items-center gap-1.5 shadow-md shadow-indigo-100 dark:shadow-none"
                                                    >
                                                        <Plus className="w-4 h-4" /> Laporkan Masalah
                                                    </button>
                                                </div>
                                            </form>
                                        </div>

                                        {/* Task List / Submissions */}
                                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                                                Daftar Laporan & Penugasan
                                            </h3>

                                            {tasks.all?.length > 0 ? (
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                                        <thead className="text-xs text-gray-400 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                                            <tr>
                                                                <th scope="col" className="px-6 py-3">Tugas / Pelapor</th>
                                                                <th scope="col" className="px-6 py-3">Kuota Diambil</th>
                                                                <th scope="col" className="px-6 py-3">Status</th>
                                                                <th scope="col" className="px-6 py-3">Detail Penyelesaian</th>
                                                                <th scope="col" className="px-6 py-3 text-right">Aksi</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                            {tasks.all.map((task) => (
                                                                <tr key={task.id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                                                    <td className="px-6 py-4">
                                                                        <div>
                                                                            <p className="font-bold text-gray-900 dark:text-white">{task.title}</p>
                                                                            <p className="text-xs text-gray-400 truncate max-w-sm mt-0.5">{task.description}</p>
                                                                            <span className="text-[10px] text-indigo-500 mt-1 inline-block">
                                                                                Pengaju: {task.reporter ? task.reporter.name : `${task.requester_name} (Umum)`}
                                                                                {task.target_room && ` | Ruang: ${task.target_room} (${task.campus_type})`}
                                                                            </span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-6 py-4 font-semibold text-gray-750 dark:text-gray-300">
                                                                        {task.students?.length} / {task.quota} Orang
                                                                    </td>
                                                                    <td className="px-6 py-4">
                                                                        <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                                                                            task.status === 'pending'
                                                                                ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                                                                                : task.status === 'proses'
                                                                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                                                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                                                        }`}>
                                                                            {task.status}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-6 py-4">
                                                                        {task.status === 'sukses' ? (
                                                                            <div className="space-y-1">
                                                                                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                                                                    {task.is_assisted ? 'Dibantu Pembimbing' : 'Mandiri (Sukses)'}
                                                                                </p>
                                                                                {task.proof_photo && (
                                                                                    <button 
                                                                                        onClick={() => setShowProofModal(`/storage/${task.proof_photo}`)}
                                                                                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                                                                                    >
                                                                                        <Camera className="w-3.5 h-3.5" /> Lihat Bukti Foto
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                        ) : (
                                                                            <span className="text-xs text-gray-400">Belum diselesaikan</span>
                                                                        )}
                                                                    </td>
                                                                    <td className="px-6 py-4 text-right">
                                                                        {(user.role === 'admin' || (task.reporter_id === user.id && !['proses', 'sukses'].includes(task.status))) && (
                                                                            <button
                                                                                onClick={() => deleteTask(task.id)}
                                                                                className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg inline-flex"
                                                                                title="Hapus Tugas"
                                                                            >
                                                                                <Trash2 className="w-4 h-4" />
                                                                            </button>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">
                                                    Belum ada penugasan terdaftar.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}


                                {/* ================= TAB: SCHOOLS MANAGEMENT (ADMIN ONLY) ================= */}
                                {activeTab === 'schools' && user.role === 'admin' && (
                                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4 border-b pb-3 dark:border-gray-700">
                                            <GraduationCap className="w-5 h-5 text-indigo-500" />
                                            Kelola Daftar Sekolah
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                            Tambahkan daftar sekolah yang diperbolehkan untuk mendaftar PKL. Data ini akan muncul sebagai pilihan di formulir pendaftaran dan profil.
                                        </p>

                                        {/* Form Tambah Sekolah */}
                                        <form onSubmit={createSchool} className="space-y-4 max-w-xl mb-8">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Nama Sekolah Baru</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={schoolForm.data.name}
                                                        onChange={e => schoolForm.setData('name', e.target.value)}
                                                        className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
                                                        placeholder="Contoh: SMK Negeri 2 Surakarta..."
                                                        required
                                                    />
                                                    <button
                                                        type="submit"
                                                        disabled={schoolForm.processing}
                                                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold flex items-center gap-1.5 shadow-md shadow-indigo-100 dark:shadow-none"
                                                    >
                                                        <Plus className="w-4 h-4" /> Tambah
                                                    </button>
                                                </div>
                                                {schoolForm.errors.name && <p className="text-xs text-rose-500 mt-1">{schoolForm.errors.name}</p>}
                                            </div>
                                        </form>

                                        {/* Daftar Sekolah */}
                                        <div className="border-t pt-6 dark:border-gray-700">
                                            <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-4">Daftar Sekolah Terdaftar ({schools.length})</h4>
                                            {schools.length > 0 ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {schools.map((school) => (
                                                        <div key={school.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-150 dark:border-gray-800">
                                                            <span className="text-sm font-medium text-gray-900 dark:text-white">{school.name}</span>
                                                            <button
                                                                onClick={() => deleteSchool(school.id)}
                                                                className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg inline-flex"
                                                                title="Hapus Sekolah"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">
                                                    Belum ada sekolah terdaftar. Silakan tambahkan sekolah baru di atas.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}


                                {/* ================= TAB: GEOFENCE SETTINGS (ADMIN ONLY) ================= */}
                                {activeTab === 'settings' && user.role === 'admin' && (
                                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4 border-b pb-3 dark:border-gray-700">
                                            <Settings className="w-5 h-5 text-indigo-500" />
                                            Pengaturan Koordinat & Area Geofencing Kampus
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                            Ubah koordinat GPS pusat kampus serta radius toleransi (meter) untuk menentukan area absensi yang valid.
                                        </p>

                                        <form onSubmit={updateGeofenceSettings} className="space-y-4 max-w-xl">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="p-4 bg-gray-50/50 dark:bg-gray-900/40 rounded-xl border border-gray-150 dark:border-gray-800">
                                                    <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-3">Koordinat Kampus 1</h4>
                                                    <div className="space-y-3">
                                                        <div>
                                                            <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Latitude</label>
                                                            <input
                                                                type="text"
                                                                value={settingsForm.data.latitude}
                                                                onChange={e => settingsForm.setData('latitude', e.target.value)}
                                                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
                                                                required
                                                            />
                                                            {settingsForm.errors.latitude && <p className="text-xs text-rose-500 mt-1">{settingsForm.errors.latitude}</p>}
                                                        </div>
                                                        <div>
                                                            <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Longitude</label>
                                                            <input
                                                                type="text"
                                                                value={settingsForm.data.longitude}
                                                                onChange={e => settingsForm.setData('longitude', e.target.value)}
                                                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
                                                                required
                                                            />
                                                            {settingsForm.errors.longitude && <p className="text-xs text-rose-500 mt-1">{settingsForm.errors.longitude}</p>}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-4 bg-gray-50/50 dark:bg-gray-900/40 rounded-xl border border-gray-150 dark:border-gray-800">
                                                    <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-3">Koordinat Kampus 2</h4>
                                                    <div className="space-y-3">
                                                        <div>
                                                            <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Latitude</label>
                                                            <input
                                                                type="text"
                                                                value={settingsForm.data.latitude_2}
                                                                onChange={e => settingsForm.setData('latitude_2', e.target.value)}
                                                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
                                                                required
                                                            />
                                                            {settingsForm.errors.latitude_2 && <p className="text-xs text-rose-500 mt-1">{settingsForm.errors.latitude_2}</p>}
                                                        </div>
                                                        <div>
                                                            <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Longitude</label>
                                                            <input
                                                                type="text"
                                                                value={settingsForm.data.longitude_2}
                                                                onChange={e => settingsForm.setData('longitude_2', e.target.value)}
                                                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
                                                                required
                                                            />
                                                            {settingsForm.errors.longitude_2 && <p className="text-xs text-rose-500 mt-1">{settingsForm.errors.longitude_2}</p>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Radius Geofencing (Meter)</label>
                                                <input
                                                    type="number"
                                                    value={settingsForm.data.radius}
                                                    onChange={e => settingsForm.setData('radius', parseInt(e.target.value))}
                                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
                                                    min="10"
                                                    max="1000"
                                                    required
                                                />
                                                {settingsForm.errors.radius && <p className="text-xs text-rose-500 mt-1">{settingsForm.errors.radius}</p>}
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Mulai Jam Kerja (Blok Absen)</label>
                                                    <input
                                                        type="time"
                                                        value={settingsForm.data.work_hour_start}
                                                        onChange={e => settingsForm.setData('work_hour_start', e.target.value)}
                                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
                                                        required
                                                    />
                                                    {settingsForm.errors.work_hour_start && <p className="text-xs text-rose-500 mt-1">{settingsForm.errors.work_hour_start}</p>}
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Selesai Jam Kerja (Blok Absen)</label>
                                                    <input
                                                        type="time"
                                                        value={settingsForm.data.work_hour_end}
                                                        onChange={e => settingsForm.setData('work_hour_end', e.target.value)}
                                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
                                                        required
                                                    />
                                                    {settingsForm.errors.work_hour_end && <p className="text-xs text-rose-500 mt-1">{settingsForm.errors.work_hour_end}</p>}
                                                </div>
                                            </div>

                                            {/* Telegram Notifications Settings */}
                                            <div className="p-4 bg-sky-50/30 dark:bg-sky-950/10 rounded-xl border border-sky-100 dark:border-sky-900/30 space-y-4 mb-4">
                                                <h4 className="text-xs font-bold text-sky-650 dark:text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                                                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.53-1.4.52-.46-.01-1.35-.26-2.01-.48-.81-.27-1.46-.42-1.4-.88.03-.24.38-.49 1.04-.75 4.07-1.77 6.79-2.94 8.15-3.5 3.88-1.61 4.68-1.89 5.21-1.9.11 0 .37.03.54.17.14.11.18.27.2.38-.01.07.01.23 0 .34z"/>
                                                    </svg>
                                                    Notifikasi Telegram Channel
                                                </h4>
                                                
                                                <div className="space-y-3">
                                                    <div>
                                                        <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Telegram Bot Token</label>
                                                        <input
                                                            type="text"
                                                            value={settingsForm.data.telegram_bot_token}
                                                            onChange={e => settingsForm.setData('telegram_bot_token', e.target.value)}
                                                            placeholder="Contoh: 123456789:ABCdef..."
                                                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none dark:text-white"
                                                        />
                                                        {settingsForm.errors.telegram_bot_token && <p className="text-xs text-rose-500 mt-1">{settingsForm.errors.telegram_bot_token}</p>}
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Telegram Chat ID</label>
                                                            <input
                                                                type="text"
                                                                value={settingsForm.data.telegram_chat_id}
                                                                onChange={e => settingsForm.setData('telegram_chat_id', e.target.value)}
                                                                placeholder="Contoh: @channel_username atau -100xxx"
                                                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none dark:text-white"
                                                            />
                                                            {settingsForm.errors.telegram_chat_id && <p className="text-xs text-rose-500 mt-1">{settingsForm.errors.telegram_chat_id}</p>}
                                                        </div>
                                                        
                                                        <div>
                                                            <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Telegram Channel Link</label>
                                                            <input
                                                                type="text"
                                                                value={settingsForm.data.telegram_channel_link}
                                                                onChange={e => settingsForm.setData('telegram_channel_link', e.target.value)}
                                                                placeholder="Contoh: https://t.me/channel_username"
                                                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none dark:text-white"
                                                            />
                                                            {settingsForm.errors.telegram_channel_link && <p className="text-xs text-rose-500 mt-1">{settingsForm.errors.telegram_channel_link}</p>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-end pt-3">
                                                <button
                                                    type="submit"
                                                    disabled={settingsForm.processing}
                                                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-100 dark:shadow-none"
                                                >
                                                    Simpan Pengaturan
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {/* ================= TAB: SIMLAB INTEGRATION ================= */}
                                {activeTab === 'simlab' && (
                                    <div className="space-y-6">
                                        {/* Banner SIMLAB */}
                                        <div className="bg-gradient-to-r from-indigo-600 via-purple-650 to-indigo-800 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
                                            <div className="absolute right-0 top-0 opacity-10 transform translate-x-12 -translate-y-12">
                                                <Database className="w-64 h-64" />
                                            </div>
                                            <div className="relative z-10">
                                                <div className="flex flex-wrap items-center justify-between gap-4">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                                                                <span className="w-2 h-2 rounded-full bg-emerald-450 animate-ping"></span>
                                                                API Connected
                                                            </span>
                                                        </div>
                                                        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                                                            SIMLAB - Sistem Manajemen Laboratorium
                                                        </h2>
                                                        <p className="mt-2 text-indigo-105 max-w-2xl text-sm leading-relaxed">
                                                            Integrasi data laboratorium dan inventaris aset dari sistem SIMLAB utama. Kelola aset, laporkan kerusakan, dan ajukan peminjaman secara langsung dari dashboard Anda.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Sub Navigation Tabs */}
                                        <div className="bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-wrap gap-2">
                                            <button
                                                onClick={() => setSimlabActiveSubTab('list')}
                                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                                                    simlabActiveSubTab === 'list'
                                                        ? 'bg-indigo-600 text-white shadow-md'
                                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750'
                                                }`}
                                            >
                                                <Server className="w-4 h-4" />
                                                Daftar Aset & Lab
                                            </button>
                                            <button
                                                onClick={() => setSimlabActiveSubTab('add_asset')}
                                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                                                    simlabActiveSubTab === 'add_asset'
                                                        ? 'bg-indigo-600 text-white shadow-md'
                                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750'
                                                }`}
                                            >
                                                <PlusCircle className="w-4 h-4" />
                                                Tambah Aset Baru
                                            </button>
                                            <button
                                                onClick={() => setSimlabActiveSubTab('ticket')}
                                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                                                    simlabActiveSubTab === 'ticket'
                                                        ? 'bg-indigo-600 text-white shadow-md'
                                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750'
                                                }`}
                                            >
                                                <Wrench className="w-4 h-4" />
                                                Lapor Kerusakan
                                            </button>
                                            <button
                                                onClick={() => setSimlabActiveSubTab('loan')}
                                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                                                    simlabActiveSubTab === 'loan'
                                                        ? 'bg-indigo-600 text-white shadow-md'
                                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750'
                                                }`}
                                            >
                                                <BookOpen className="w-4 h-4" />
                                                Form Peminjaman
                                            </button>
                                        </div>

                                        {/* Tab Content: List Aset & Lab */}
                                        {simlabActiveSubTab === 'list' && (
                                            <div className="space-y-6">
                                                {/* Lab stats cards summary */}
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    {simlabLabs.slice(0, 3).map((lab) => (
                                                        <div key={lab.id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
                                                            <div>
                                                                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                                                                    {lab.lokasi}
                                                                </p>
                                                                <h4 className="text-base font-bold text-gray-800 dark:text-white">
                                                                    {lab.nama_lab}
                                                                </h4>
                                                                <div className="flex gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                                    <span>Kapasitas: {lab.kapasitas_meja} Meja</span>
                                                                    <span>Aset: {lab.asets_count} unit</span>
                                                                </div>
                                                            </div>
                                                            <div className="bg-indigo-50 dark:bg-indigo-950/40 p-3 rounded-xl">
                                                                <Server className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {simlabLabs.length === 0 && (
                                                        <div className="col-span-3 text-center py-6 text-gray-500 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                                                            Tidak ada data laboratorium.
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Filter and Assets */}
                                                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                                        <div>
                                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                                                Inventaris Aset Lab
                                                            </h3>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                                Menampilkan {simlabAssets.length} aset dari SIMLAB
                                                            </p>
                                                        </div>
                                                        {/* Filters Row */}
                                                        <div className="flex flex-wrap gap-3">
                                                            <select
                                                                value={filterLabId}
                                                                onChange={(e) => handleFilterChange(e.target.value, filterKondisi)}
                                                                className="px-4 py-2 border border-gray-250 dark:border-gray-700 dark:bg-gray-950 rounded-xl text-sm focus:outline-none dark:text-white"
                                                            >
                                                                <option value="">Semua Laboratorium</option>
                                                                {simlabLabs.map(lab => (
                                                                    <option key={lab.id} value={lab.id}>{lab.nama_lab}</option>
                                                                ))}
                                                            </select>
                                                            <select
                                                                value={filterKondisi}
                                                                onChange={(e) => handleFilterChange(filterLabId, e.target.value)}
                                                                className="px-4 py-2 border border-gray-250 dark:border-gray-700 dark:bg-gray-950 rounded-xl text-sm focus:outline-none dark:text-white"
                                                            >
                                                                <option value="">Semua Kondisi</option>
                                                                <option value="baik">Baik</option>
                                                                <option value="rusak_ringan">Rusak Ringan</option>
                                                                <option value="rusak_berat">Rusak Berat</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    {/* Assets Grid */}
                                                    {simlabAssets.length > 0 ? (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                                            {simlabAssets.map((asset) => (
                                                                <div key={asset.id} className="bg-gray-50/50 dark:bg-gray-900/40 border border-gray-150 dark:border-gray-800/80 rounded-2xl p-5 hover:shadow-md transition-all flex flex-col justify-between">
                                                                    <div>
                                                                        <div className="flex items-start justify-between gap-2 mb-3">
                                                                            <span className="bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider">
                                                                                {asset.kode_aset}
                                                                            </span>
                                                                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                                                                                asset.kondisi === 'baik' 
                                                                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                                                                                    : asset.kondisi === 'rusak_ringan'
                                                                                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                                                                                    : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                                                                            }`}>
                                                                                {asset.kondisi?.replace('_', ' ') || 'baik'}
                                                                            </span>
                                                                        </div>
                                                                        <h4 className="font-bold text-gray-800 dark:text-white mb-1 line-clamp-1">
                                                                            {asset.nama_aset}
                                                                        </h4>
                                                                        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1 mb-4">
                                                                            <p className="flex justify-between">
                                                                                <span>Jenis Aset:</span>
                                                                                <span className="font-semibold text-gray-700 dark:text-gray-300 capitalize">{asset.jenis_aset}</span>
                                                                            </p>
                                                                            <p className="flex justify-between">
                                                                                <span>Stok:</span>
                                                                                <span className="font-semibold text-gray-700 dark:text-gray-300">{asset.stok} unit</span>
                                                                            </p>
                                                                            {asset.posisi_meja && (
                                                                                <p className="flex justify-between">
                                                                                    <span>Posisi Meja:</span>
                                                                                    <span className="font-semibold text-gray-700 dark:text-gray-300">Meja #{asset.posisi_meja}</span>
                                                                                </p>
                                                                            )}
                                                                            {asset.spesifikasi && typeof asset.spesifikasi === 'object' && (
                                                                                <div className="mt-2 pt-2 border-t border-gray-150 dark:border-gray-800">
                                                                                    <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 mb-1">Spesifikasi:</p>
                                                                                    {Object.entries(asset.spesifikasi).map(([key, val]) => (
                                                                                        <p key={key} className="flex justify-between">
                                                                                            <span className="uppercase">{key}:</span>
                                                                                            <span className="font-semibold text-gray-700 dark:text-gray-300">{val}</span>
                                                                                        </p>
                                                                                    ))}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-805 mt-2">
                                                                        <button
                                                                            onClick={() => {
                                                                                simlabTicketForm.setData('aset_id', asset.id);
                                                                                setSimlabActiveSubTab('ticket');
                                                                            }}
                                                                            className="flex-1 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:hover:bg-amber-950/40 dark:text-amber-400 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                                                                        >
                                                                            <Wrench className="w-3.5 h-3.5" />
                                                                            Lapor Rusak
                                                                        </button>
                                                                        {asset.jenis_aset === 'loanable' && (
                                                                            <button
                                                                                onClick={() => {
                                                                                    simlabLoanForm.setData('aset_id', asset.id);
                                                                                    setSimlabActiveSubTab('loan');
                                                                                }}
                                                                                className="flex-1 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/40 dark:text-indigo-400 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                                                                            >
                                                                                <BookOpen className="w-3.5 h-3.5" />
                                                                                Pinjam
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-900/20 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                                                            <Server className="w-10 h-10 mx-auto text-gray-400 mb-3 animate-pulse" />
                                                            <p className="font-bold text-sm">Tidak Ada Aset Ditemukan</p>
                                                            <p className="text-xs text-gray-400 mt-1">Coba sesuaikan filter pencarian laboratorium atau kondisi Anda.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Tab Content: Add Asset Form */}
                                        {simlabActiveSubTab === 'add_asset' && (
                                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm max-w-3xl">
                                                <h3 className="text-lg font-bold text-gray-850 dark:text-white flex items-center gap-2 mb-4 border-b pb-3 dark:border-gray-700">
                                                    <PlusCircle className="w-5 h-5 text-indigo-500" />
                                                    Tambah Aset Baru ke SIMLAB
                                                </h3>
                                                <form onSubmit={submitSimlabAsset} className="space-y-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                                                Laboratorium Tujuan *
                                                            </label>
                                                            <select
                                                                value={simlabAssetForm.data.laboratorium_id}
                                                                onChange={e => simlabAssetForm.setData('laboratorium_id', e.target.value)}
                                                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
                                                                required
                                                            >
                                                                <option value="">Pilih Laboratorium</option>
                                                                {simlabLabs.map(lab => (
                                                                    <option key={lab.id} value={lab.id}>{lab.nama_lab}</option>
                                                                ))}
                                                            </select>
                                                            {simlabAssetForm.errors.laboratorium_id && <p className="text-xs text-rose-500 mt-1">{simlabAssetForm.errors.laboratorium_id}</p>}
                                                        </div>

                                                        <div>
                                                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                                                Kode Aset (Harus Unik) *
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={simlabAssetForm.data.kode_aset}
                                                                onChange={e => simlabAssetForm.setData('kode_aset', e.target.value)}
                                                                placeholder="Contoh: LAB01-PC06"
                                                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
                                                                required
                                                            />
                                                            {simlabAssetForm.errors.kode_aset && <p className="text-xs text-rose-500 mt-1">{simlabAssetForm.errors.kode_aset}</p>}
                                                        </div>

                                                        <div>
                                                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                                                Nama Aset *
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={simlabAssetForm.data.nama_aset}
                                                                onChange={e => simlabAssetForm.setData('nama_aset', e.target.value)}
                                                                placeholder="Contoh: PC Client - ASUS ROG"
                                                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
                                                                required
                                                            />
                                                            {simlabAssetForm.errors.nama_aset && <p className="text-xs text-rose-500 mt-1">{simlabAssetForm.errors.nama_aset}</p>}
                                                        </div>

                                                        <div>
                                                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                                                Jenis Aset *
                                                            </label>
                                                            <select
                                                                value={simlabAssetForm.data.jenis_aset}
                                                                onChange={e => simlabAssetForm.setData('jenis_aset', e.target.value)}
                                                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
                                                                required
                                                            >
                                                                <option value="statis">Statis</option>
                                                                <option value="consumable">Consumable</option>
                                                                <option value="loanable">Loanable</option>
                                                            </select>
                                                            {simlabAssetForm.errors.jenis_aset && <p className="text-xs text-rose-500 mt-1">{simlabAssetForm.errors.jenis_aset}</p>}
                                                        </div>

                                                        <div>
                                                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                                                Kondisi Aset
                                                            </label>
                                                            <select
                                                                value={simlabAssetForm.data.kondisi}
                                                                onChange={e => simlabAssetForm.setData('kondisi', e.target.value)}
                                                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
                                                            >
                                                                <option value="baik">Baik</option>
                                                                <option value="rusak_ringan">Rusak Ringan</option>
                                                                <option value="rusak_berat">Rusak Berat</option>
                                                            </select>
                                                            {simlabAssetForm.errors.kondisi && <p className="text-xs text-rose-500 mt-1">{simlabAssetForm.errors.kondisi}</p>}
                                                        </div>

                                                        <div>
                                                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                                                Jumlah Stok
                                                            </label>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={simlabAssetForm.data.stok}
                                                                onChange={e => simlabAssetForm.setData('stok', parseInt(e.target.value) || 1)}
                                                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
                                                            />
                                                            {simlabAssetForm.errors.stok && <p className="text-xs text-rose-500 mt-1">{simlabAssetForm.errors.stok}</p>}
                                                        </div>

                                                        <div>
                                                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                                                Posisi Meja (Optional)
                                                            </label>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={simlabAssetForm.data.posisi_meja}
                                                                onChange={e => simlabAssetForm.setData('posisi_meja', e.target.value)}
                                                                placeholder="Contoh: 6"
                                                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
                                                            />
                                                            {simlabAssetForm.errors.posisi_meja && <p className="text-xs text-rose-500 mt-1">{simlabAssetForm.errors.posisi_meja}</p>}
                                                        </div>
                                                    </div>

                                                    <div className="p-4 bg-gray-50/50 dark:bg-gray-900/40 rounded-xl border border-gray-150 dark:border-gray-800 mt-2">
                                                        <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-3">Spesifikasi Detail (Opsional)</h4>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Processor / CPU</label>
                                                                <input
                                                                    type="text"
                                                                    value={simlabAssetForm.data.spesifikasi.cpu}
                                                                    onChange={e => simlabAssetForm.setData('spesifikasi', { ...simlabAssetForm.data.spesifikasi, cpu: e.target.value })}
                                                                    placeholder="Contoh: Intel Core i7"
                                                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Memory / RAM</label>
                                                                <input
                                                                    type="text"
                                                                    value={simlabAssetForm.data.spesifikasi.ram}
                                                                    onChange={e => simlabAssetForm.setData('spesifikasi', { ...simlabAssetForm.data.spesifikasi, ram: e.target.value })}
                                                                    placeholder="Contoh: 16GB"
                                                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex justify-end pt-3 gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => setSimlabActiveSubTab('list')}
                                                            className="px-6 py-2.5 bg-gray-100 hover:bg-gray-250 dark:bg-gray-700 dark:hover:bg-gray-650 text-gray-700 dark:text-gray-200 rounded-xl text-sm font-bold"
                                                        >
                                                            Batal
                                                        </button>
                                                        <button
                                                            type="submit"
                                                            disabled={simlabAssetForm.processing}
                                                            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-100 dark:shadow-none"
                                                        >
                                                            {simlabAssetForm.processing ? 'Menyimpan...' : 'Simpan Aset'}
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        )}

                                        {/* Tab Content: Report Ticket Form */}
                                        {simlabActiveSubTab === 'ticket' && (
                                            <div className="bg-white dark:bg-gray-805 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm max-w-xl">
                                                <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-4 border-b pb-3 dark:border-gray-700">
                                                    <Wrench className="w-5 h-5 text-amber-500" />
                                                    Lapor Kerusakan Aset (Tiket)
                                                </h3>
                                                {simlabTicketForm.data.aset_id && (
                                                    <div className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 rounded-xl text-xs font-medium mb-4 flex items-center justify-between">
                                                        <span>Melaporkan kerusakan untuk Aset ID #{simlabTicketForm.data.aset_id}</span>
                                                        <button type="button" onClick={() => simlabTicketForm.setData('aset_id', '')} className="text-amber-500 hover:text-amber-700 font-bold underline">Ubah Aset</button>
                                                    </div>
                                                )}
                                                <form onSubmit={submitSimlabTicket} className="space-y-4">
                                                    {!simlabTicketForm.data.aset_id && (
                                                        <div>
                                                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                                                Pilih Aset Yang Rusak *
                                                            </label>
                                                            <select
                                                                value={simlabTicketForm.data.aset_id}
                                                                onChange={e => simlabTicketForm.setData('aset_id', e.target.value)}
                                                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
                                                                required
                                                            >
                                                                <option value="">Pilih Aset</option>
                                                                {simlabAssets.map(asset => (
                                                                    <option key={asset.id} value={asset.id}>{asset.kode_aset} - {asset.nama_aset}</option>
                                                                ))}
                                                            </select>
                                                            {simlabTicketForm.errors.aset_id && <p className="text-xs text-rose-500 mt-1">{simlabTicketForm.errors.aset_id}</p>}
                                                        </div>
                                                    )}

                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                                            Nama Pelapor *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={simlabTicketForm.data.nama_pelapor}
                                                            onChange={e => simlabTicketForm.setData('nama_pelapor', e.target.value)}
                                                            placeholder="Nama Lengkap Anda"
                                                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
                                                            required
                                                        />
                                                        {simlabTicketForm.errors.nama_pelapor && <p className="text-xs text-rose-500 mt-1">{simlabTicketForm.errors.nama_pelapor}</p>}
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                                            Email Pelapor (Opsional)
                                                        </label>
                                                        <input
                                                            type="email"
                                                            value={simlabTicketForm.data.email_pelapor}
                                                            onChange={e => simlabTicketForm.setData('email_pelapor', e.target.value)}
                                                            placeholder="nama@domain.com"
                                                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
                                                        />
                                                        {simlabTicketForm.errors.email_pelapor && <p className="text-xs text-rose-500 mt-1">{simlabTicketForm.errors.email_pelapor}</p>}
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                                            Deskripsi Detail Kerusakan *
                                                        </label>
                                                        <textarea
                                                            value={simlabTicketForm.data.deskripsi_kerusakan}
                                                            onChange={e => simlabTicketForm.setData('deskripsi_kerusakan', e.target.value)}
                                                            placeholder="Tuliskan spesifikasi/gejala kerusakan secara mendetail..."
                                                            rows="4"
                                                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
                                                            required
                                                        ></textarea>
                                                        {simlabTicketForm.errors.deskripsi_kerusakan && <p className="text-xs text-rose-500 mt-1">{simlabTicketForm.errors.deskripsi_kerusakan}</p>}
                                                    </div>

                                                    <div className="flex justify-end pt-3 gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                simlabTicketForm.setData('aset_id', '');
                                                                setSimlabActiveSubTab('list');
                                                            }}
                                                            className="px-6 py-2.5 bg-gray-100 hover:bg-gray-250 dark:bg-gray-700 dark:hover:bg-gray-650 text-gray-700 dark:text-gray-200 rounded-xl text-sm font-bold"
                                                        >
                                                            Batal
                                                        </button>
                                                        <button
                                                            type="submit"
                                                            disabled={simlabTicketForm.processing}
                                                            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-100 dark:shadow-none"
                                                        >
                                                            {simlabTicketForm.processing ? 'Mengirim...' : 'Kirim Laporan'}
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        )}

                                        {/* Tab Content: Loan Asset Form */}
                                        {simlabActiveSubTab === 'loan' && (
                                            <div className="bg-white dark:bg-gray-805 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm max-w-xl">
                                                <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-4 border-b pb-3 dark:border-gray-700">
                                                    <BookOpen className="w-5 h-5 text-indigo-500" />
                                                    Form Permintaan Peminjaman Aset
                                                </h3>
                                                {simlabLoanForm.data.aset_id && (
                                                    <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-800 dark:text-indigo-300 rounded-xl text-xs font-medium mb-4 flex items-center justify-between">
                                                        <span>Meminjam Aset ID #{simlabLoanForm.data.aset_id}</span>
                                                        <button type="button" onClick={() => simlabLoanForm.setData('aset_id', '')} className="text-indigo-500 hover:text-indigo-700 font-bold underline">Ubah Aset</button>
                                                    </div>
                                                )}
                                                <form onSubmit={submitSimlabLoan} className="space-y-4">
                                                    {!simlabLoanForm.data.aset_id && (
                                                        <div>
                                                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                                                Pilih Aset Peminjaman *
                                                            </label>
                                                            <select
                                                                value={simlabLoanForm.data.aset_id}
                                                                onChange={e => simlabLoanForm.setData('aset_id', e.target.value)}
                                                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
                                                                required
                                                            >
                                                                <option value="">Pilih Aset</option>
                                                                {simlabAssets.filter(a => a.jenis_aset === 'loanable').map(asset => (
                                                                    <option key={asset.id} value={asset.id}>{asset.kode_aset} - {asset.nama_aset} (Stok: {asset.stok})</option>
                                                                ))}
                                                            </select>
                                                            {simlabLoanForm.errors.aset_id && <p className="text-xs text-rose-500 mt-1">{simlabLoanForm.errors.aset_id}</p>}
                                                        </div>
                                                    )}

                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                                            Email Peminjam *
                                                        </label>
                                                        <input
                                                            type="email"
                                                            value={simlabLoanForm.data.email_peminjam}
                                                            onChange={e => simlabLoanForm.setData('email_peminjam', e.target.value)}
                                                            placeholder="peminjam@domain.com"
                                                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
                                                            required
                                                        />
                                                        {simlabLoanForm.errors.email_peminjam && <p className="text-xs text-rose-500 mt-1">{simlabLoanForm.errors.email_peminjam}</p>}
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                                            Jumlah *
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={simlabLoanForm.data.jumlah}
                                                            onChange={e => simlabLoanForm.setData('jumlah', parseInt(e.target.value) || 1)}
                                                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
                                                            required
                                                        />
                                                        {simlabLoanForm.errors.jumlah && <p className="text-xs text-rose-500 mt-1">{simlabLoanForm.errors.jumlah}</p>}
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                                                Tanggal Pinjam *
                                                            </label>
                                                            <input
                                                                type="date"
                                                                value={simlabLoanForm.data.tanggal_pinjam}
                                                                onChange={e => simlabLoanForm.setData('tanggal_pinjam', e.target.value)}
                                                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
                                                                required
                                                            />
                                                            {simlabLoanForm.errors.tanggal_pinjam && <p className="text-xs text-rose-500 mt-1">{simlabLoanForm.errors.tanggal_pinjam}</p>}
                                                        </div>

                                                        <div>
                                                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                                                Rencana Tanggal Kembali *
                                                            </label>
                                                            <input
                                                                type="date"
                                                                value={simlabLoanForm.data.tanggal_kembali_rencana}
                                                                onChange={e => simlabLoanForm.setData('tanggal_kembali_rencana', e.target.value)}
                                                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
                                                                required
                                                            />
                                                            {simlabLoanForm.errors.tanggal_kembali_rencana && <p className="text-xs text-rose-500 mt-1">{simlabLoanForm.errors.tanggal_kembali_rencana}</p>}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                                            Catatan Peminjaman (Opsional)
                                                        </label>
                                                        <textarea
                                                            value={simlabLoanForm.data.catatan}
                                                            onChange={e => simlabLoanForm.setData('catatan', e.target.value)}
                                                            placeholder="Contoh: Untuk keperluan praktikum instalasi jaringan..."
                                                            rows="3"
                                                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
                                                        ></textarea>
                                                        {simlabLoanForm.errors.catatan && <p className="text-xs text-rose-500 mt-1">{simlabLoanForm.errors.catatan}</p>}
                                                    </div>

                                                    <div className="flex justify-end pt-3 gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                simlabLoanForm.setData('aset_id', '');
                                                                setSimlabActiveSubTab('list');
                                                            }}
                                                            className="px-6 py-2.5 bg-gray-100 hover:bg-gray-250 dark:bg-gray-700 dark:hover:bg-gray-650 text-gray-700 dark:text-gray-200 rounded-xl text-sm font-bold"
                                                        >
                                                            Batal
                                                        </button>
                                                        <button
                                                            type="submit"
                                                            disabled={simlabLoanForm.processing}
                                                            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-100 dark:shadow-none"
                                                        >
                                                            {simlabLoanForm.processing ? 'Mengirim...' : 'Kirim Peminjaman'}
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ================= TAB: USER MANAGEMENT (ADMIN ONLY) ================= */}
                                {activeTab === 'users' && user.role === 'admin' && (
                                    <div className="space-y-6">
                                        
                                        {/* User Creation and Listing Controls */}
                                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                        <Users className="w-5 h-5 text-indigo-500" />
                                                        Manajemen Akun Pengguna
                                                    </h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                        Tambahkan dosen, staf IT, atau anak PKL serta kelola akumulasi poin reward kinerja mereka.
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => setShowAddUserModal(!showAddUserModal)}
                                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 self-start sm:self-center shadow-md shadow-indigo-100 dark:shadow-none"
                                                >
                                                    <UserPlus className="w-4 h-4" />
                                                    Tambah Pengguna
                                                </button>
                                            </div>

                                            {/* Add User Collapse Form */}
                                            {showAddUserModal && (
                                                <div className="bg-gray-50 dark:bg-gray-900 p-5 rounded-xl border border-gray-200 dark:border-gray-700 mb-6 space-y-4">
                                                    <h4 className="font-bold text-sm text-gray-800 dark:text-white">Form Pembuatan Akun Baru</h4>
                                                    <form onSubmit={createNewUser} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Nama Lengkap</label>
                                                            <input
                                                                type="text"
                                                                value={userForm.data.name}
                                                                onChange={e => userForm.setData('name', e.target.value)}
                                                                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded-xl text-sm dark:text-white"
                                                                required
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Email</label>
                                                            <input
                                                                type="email"
                                                                value={userForm.data.email}
                                                                onChange={e => userForm.setData('email', e.target.value)}
                                                                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded-xl text-sm dark:text-white"
                                                                required
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Password</label>
                                                            <input
                                                                type="password"
                                                                value={userForm.data.password}
                                                                onChange={e => userForm.setData('password', e.target.value)}
                                                                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded-xl text-sm dark:text-white"
                                                                required
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Peran / Role</label>
                                                            <select
                                                                value={userForm.data.role}
                                                                onChange={e => userForm.setData('role', e.target.value)}
                                                                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded-xl text-sm dark:text-white"
                                                                required
                                                            >
                                                                <option value="anak_pkl">Anak PKL (Student)</option>
                                                                <option value="admin">Administrator</option>
                                                            </select>
                                                        </div>
                                                        {userForm.data.role === 'anak_pkl' && (
                                                            <>
                                                                <div className="sm:col-span-2">
                                                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Nama Sekolah</label>
                                                                    <select
                                                                        value={userForm.data.school_name}
                                                                        onChange={e => userForm.setData('school_name', e.target.value)}
                                                                        className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded-xl text-sm dark:text-white"
                                                                        required
                                                                    >
                                                                        <option value="">Pilih Sekolah</option>
                                                                        {schools.map(school => (
                                                                            <option key={school.id} value={school.name}>{school.name}</option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                                <div className="sm:col-span-2">
                                                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Jurusan Sekolah</label>
                                                                    <select
                                                                        value={userForm.data.major}
                                                                        onChange={e => userForm.setData('major', e.target.value)}
                                                                        className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded-xl text-sm dark:text-white"
                                                                        required
                                                                    >
                                                                        <option value="">Pilih Jurusan</option>
                                                                        <option value="Akuntansi">Akuntansi</option>
                                                                        <option value="DKV">DKV</option>
                                                                        <option value="Perkantoran">Perkantoran</option>
                                                                        <option value="TKJ">TKJ</option>
                                                                    </select>
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">No. WhatsApp</label>
                                                                    <input
                                                                        type="text"
                                                                        value={userForm.data.whatsapp_number}
                                                                        onChange={e => userForm.setData('whatsapp_number', e.target.value)}
                                                                        placeholder="Contoh: 081234567890"
                                                                        className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded-xl text-sm dark:text-white"
                                                                        required
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Tanggal Lahir</label>
                                                                    <input
                                                                        type="date"
                                                                        value={userForm.data.date_of_birth}
                                                                        onChange={e => userForm.setData('date_of_birth', e.target.value)}
                                                                        className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded-xl text-sm dark:text-white"
                                                                        required
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Tanggal Mulai PKL</label>
                                                                    <input
                                                                        type="date"
                                                                        value={userForm.data.start_date}
                                                                        onChange={e => userForm.setData('start_date', e.target.value)}
                                                                        className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded-xl text-sm dark:text-white"
                                                                        required
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Tanggal Selesai PKL</label>
                                                                    <input
                                                                        type="date"
                                                                        value={userForm.data.end_date}
                                                                        onChange={e => userForm.setData('end_date', e.target.value)}
                                                                        className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded-xl text-sm dark:text-white"
                                                                        required
                                                                    />
                                                                </div>
                                                                <div className="sm:col-span-2">
                                                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Alamat Lengkap</label>
                                                                    <textarea
                                                                        value={userForm.data.address}
                                                                        onChange={e => userForm.setData('address', e.target.value)}
                                                                        placeholder="Masukkan alamat domisili saat ini"
                                                                        className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded-xl text-sm dark:text-white"
                                                                        required
                                                                        rows="2"
                                                                    />
                                                                </div>
                                                                <div className="sm:col-span-2">
                                                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Akun Media Sosial (Opsional)</label>
                                                                    <input
                                                                        type="text"
                                                                        value={userForm.data.social_media}
                                                                        onChange={e => userForm.setData('social_media', e.target.value)}
                                                                        placeholder="Contoh: @instagram_handle"
                                                                        className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded-xl text-sm dark:text-white"
                                                                    />
                                                                </div>
                                                            </>
                                                        )}
                                                        <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowAddUserModal(false)}
                                                                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white rounded-xl text-xs font-bold"
                                                            >
                                                                Batal
                                                            </button>
                                                            <button
                                                                type="submit"
                                                                disabled={userForm.processing}
                                                                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
                                                            >
                                                                Simpan Akun
                                                            </button>
                                                        </div>
                                                    </form>
                                                </div>
                                            )}

                                            {/* Edit Points Inline Mode */}
                                            {editingUserPoints && (
                                                <div className="bg-amber-50 dark:bg-amber-950/20 p-5 rounded-xl border border-amber-200 dark:border-amber-900 mb-6">
                                                    <h4 className="font-bold text-sm text-amber-800 dark:text-amber-400 mb-3">
                                                        Ubah Poin: {editingUserPoints.name}
                                                    </h4>
                                                    <form onSubmit={submitPointsChange} className="flex gap-4 items-end max-w-sm">
                                                        <div className="flex-1">
                                                            <label className="block text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">Jumlah Poin</label>
                                                            <input
                                                                type="number"
                                                                value={pointsForm.data.points}
                                                                onChange={e => pointsForm.setData('points', parseInt(e.target.value))}
                                                                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-amber-300 dark:border-amber-900 rounded-xl text-sm dark:text-white"
                                                                min="0"
                                                                required
                                                            />
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => setEditingUserPoints(null)}
                                                            className="px-4 py-2 bg-gray-250 dark:bg-gray-700 text-gray-700 dark:text-white rounded-xl text-xs font-bold h-10"
                                                        >
                                                            Batal
                                                        </button>
                                                        <button
                                                            type="submit"
                                                            disabled={pointsForm.processing}
                                                            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold h-10"
                                                        >
                                                            Update Poin
                                                        </button>
                                                    </form>
                                                </div>
                                            )}

                                             {/* Edit User Inline Mode */}
                                             {editingUser && (
                                                 <div className="bg-indigo-50 dark:bg-indigo-950/20 p-5 rounded-xl border border-indigo-200 dark:border-indigo-900 mb-6 space-y-4">
                                                     <h4 className="font-bold text-sm text-indigo-800 dark:text-indigo-400">
                                                         Edit Data Pengguna: {editingUser.name}
                                                     </h4>
                                                     <form onSubmit={submitUserEdit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                         <div>
                                                             <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Nama Lengkap</label>
                                                             <input
                                                                 type="text"
                                                                 value={editUserForm.data.name}
                                                                 onChange={e => editUserForm.setData('name', e.target.value)}
                                                                 className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded-xl text-sm dark:text-white"
                                                                 required
                                                             />
                                                         </div>
                                                         <div>
                                                             <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Email</label>
                                                             <input
                                                                 type="email"
                                                                 value={editUserForm.data.email}
                                                                 onChange={e => editUserForm.setData('email', e.target.value)}
                                                                 className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded-xl text-sm dark:text-white"
                                                                 required
                                                             />
                                                         </div>
                                                         <div>
                                                             <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Password Baru (Kosongkan jika tidak diubah)</label>
                                                             <input
                                                                 type="password"
                                                                 value={editUserForm.data.password}
                                                                 onChange={e => editUserForm.setData('password', e.target.value)}
                                                                 placeholder="Password Baru..."
                                                                 className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded-xl text-sm dark:text-white"
                                                             />
                                                         </div>
                                                         <div>
                                                             <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Peran / Role</label>
                                                             <select
                                                                 value={editUserForm.data.role}
                                                                 onChange={e => editUserForm.setData('role', e.target.value)}
                                                                 className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded-xl text-sm dark:text-white"
                                                                 required
                                                             >
                                                                 <option value="anak_pkl">Anak PKL (Student)</option>
                                                                 <option value="admin">Administrator</option>
                                                             </select>
                                                         </div>
                                                         {editUserForm.data.role === 'anak_pkl' && (
                                                             <>
                                                                 <div className="sm:col-span-2">
                                                                     <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Nama Sekolah</label>
                                                                     <select
                                                                          value={editUserForm.data.school_name}
                                                                          onChange={e => editUserForm.setData('school_name', e.target.value)}
                                                                          className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded-xl text-sm dark:text-white"
                                                                          required
                                                                      >
                                                                          <option value="">Pilih Sekolah</option>
                                                                          {editUserForm.data.school_name && !schools.some(s => s.name === editUserForm.data.school_name) && (
                                                                              <option value={editUserForm.data.school_name}>{editUserForm.data.school_name}</option>
                                                                          )}
                                                                          {schools.map(school => (
                                                                              <option key={school.id} value={school.name}>{school.name}</option>
                                                                          ))}
                                                                      </select>
                                                                 </div>
                                                                 <div className="sm:col-span-2">
                                                                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Jurusan Sekolah</label>
                                                                      <select
                                                                          value={editUserForm.data.major}
                                                                          onChange={e => editUserForm.setData('major', e.target.value)}
                                                                          className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded-xl text-sm dark:text-white"
                                                                          required
                                                                      >
                                                                          <option value="">Pilih Jurusan</option>
                                                                          <option value="Akuntansi">Akuntansi</option>
                                                                          <option value="DKV">DKV</option>
                                                                          <option value="Perkantoran">Perkantoran</option>
                                                                          <option value="TKJ">TKJ</option>
                                                                          {editUserForm.data.major && !['Akuntansi', 'DKV', 'Perkantoran', 'TKJ'].includes(editUserForm.data.major) && (
                                                                              <option value={editUserForm.data.major}>{editUserForm.data.major}</option>
                                                                          )}
                                                                      </select>
                                                                  </div>
                                                                 <div>
                                                                     <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">No. WhatsApp</label>
                                                                     <input
                                                                         type="text"
                                                                         value={editUserForm.data.whatsapp_number}
                                                                         onChange={e => editUserForm.setData('whatsapp_number', e.target.value)}
                                                                         placeholder="Contoh: 081234567890"
                                                                         className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded-xl text-sm dark:text-white"
                                                                         required
                                                                     />
                                                                 </div>
                                                                 <div>
                                                                     <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Tanggal Lahir</label>
                                                                     <input
                                                                         type="date"
                                                                         value={editUserForm.data.date_of_birth}
                                                                         onChange={e => editUserForm.setData('date_of_birth', e.target.value)}
                                                                         className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded-xl text-sm dark:text-white"
                                                                         required
                                                                     />
                                                                 </div>
                                                                 <div>
                                                                     <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Tanggal Mulai PKL</label>
                                                                     <input
                                                                         type="date"
                                                                         value={editUserForm.data.start_date}
                                                                         onChange={e => editUserForm.setData('start_date', e.target.value)}
                                                                         className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded-xl text-sm dark:text-white"
                                                                         required
                                                                     />
                                                                 </div>
                                                                 <div>
                                                                     <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Tanggal Selesai PKL</label>
                                                                     <input
                                                                         type="date"
                                                                         value={editUserForm.data.end_date}
                                                                         onChange={e => editUserForm.setData('end_date', e.target.value)}
                                                                         className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded-xl text-sm dark:text-white"
                                                                         required
                                                                     />
                                                                 </div>
                                                                 <div className="sm:col-span-2">
                                                                     <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Alamat Lengkap</label>
                                                                     <textarea
                                                                         value={editUserForm.data.address}
                                                                         onChange={e => editUserForm.setData('address', e.target.value)}
                                                                         placeholder="Masukkan alamat domisili saat ini"
                                                                         className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded-xl text-sm dark:text-white"
                                                                         required
                                                                         rows="2"
                                                                     />
                                                                 </div>
                                                                 <div className="sm:col-span-2">
                                                                     <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Akun Media Sosial (Opsional)</label>
                                                                     <input
                                                                         type="text"
                                                                         value={editUserForm.data.social_media}
                                                                         onChange={e => editUserForm.setData('social_media', e.target.value)}
                                                                         placeholder="Contoh: @instagram_handle"
                                                                         className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded-xl text-sm dark:text-white"
                                                                     />
                                                                 </div>
                                                             </>
                                                         )}
                                                         <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                                                             <button
                                                                 type="button"
                                                                 onClick={() => setEditingUser(null)}
                                                                 className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white rounded-xl text-xs font-bold"
                                                             >
                                                                 Batal
                                                             </button>
                                                             <button
                                                                 type="submit"
                                                                 disabled={editUserForm.processing}
                                                                 className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
                                                             >
                                                                 Simpan Perubahan
                                                             </button>
                                                         </div>
                                                     </form>
                                                 </div>
                                             )}

                                            {/* Users Table */}
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                                    <thead className="text-xs text-gray-400 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                                        <tr>
                                                            <th scope="col" className="px-6 py-3">Nama Pengguna</th>
                                                            <th scope="col" className="px-6 py-3">Email</th>
                                                            <th scope="col" className="px-6 py-3">Peran / Role</th>
                                                            <th scope="col" className="px-6 py-3">Akumulasi Poin</th>
                                                            <th scope="col" className="px-6 py-3 text-right">Aksi</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                        {/* Students list */}
                                                        {tasks.students?.map((u) => (
                                                            <tr key={u.id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                                                <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                                                                    <div>{u.name}</div>
                                                                    <div className="text-[11px] font-normal text-gray-500 dark:text-gray-400 mt-1 space-y-0.5">
                                                                        {u.school_name && <div>Sekolah: {u.school_name} {u.major && `(${u.major})`}</div>}
                                                                        {u.whatsapp_number && <div>WhatsApp: {u.whatsapp_number}</div>}
                                                                        {u.address && <div className="line-clamp-2">Alamat: {u.address}</div>}
                                                                        {u.date_of_birth && <div>Lahir: {u.date_of_birth}</div>}
                                                                        {(u.start_date || u.end_date) && (
                                                                            <div>Periode: {u.start_date || '?'} s/d {u.end_date || '?'}</div>
                                                                        )}
                                                                        {u.social_media && <div>Sosmed: {u.social_media}</div>}
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 text-xs">{u.email}</td>
                                                                <td className="px-6 py-4">
                                                                    <span className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-xs font-bold px-2 py-0.5 rounded-full uppercase">
                                                                        ANAK PKL
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 font-bold">
                                                                    <div className="flex items-center gap-2">
                                                                        <span>{u.points} Poin</span>
                                                                        <button 
                                                                            onClick={() => openEditPoints(u)}
                                                                            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                                                                        >
                                                                            (Edit)
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 text-right flex justify-end gap-2">
                                                                    <button
                                                                        onClick={() => openEditUser(u)}
                                                                        className="p-1 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-lg inline-flex"
                                                                        title="Edit Akun"
                                                                    >
                                                                        <Pencil className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => deleteUser(u.id)}
                                                                        className="p-1 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg inline-flex"
                                                                        title="Hapus Akun"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}

                                                        {/* Staff & Dosen list */}
                                                        {tasks.staff?.map((u) => (
                                                            <tr key={u.id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                                                <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{u.name}</td>
                                                                <td className="px-6 py-4 text-xs">{u.email}</td>
                                                                <td className="px-6 py-4">
                                                                    <span className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-xs font-bold px-2 py-0.5 rounded-full uppercase">
                                                                        {u.role}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 text-xs text-gray-400">-</td>
                                                                <td className="px-6 py-4 text-right flex justify-end gap-2">
                                                                    <button
                                                                        onClick={() => openEditUser(u)}
                                                                        className="p-1 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-lg inline-flex"
                                                                        title="Edit Akun"
                                                                    >
                                                                        <Pencil className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => deleteUser(u.id)}
                                                                        className="p-1 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg inline-flex"
                                                                        title="Hapus Akun"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ================= TAB: ATTENDANCE RECAP (ADMIN ONLY) ================= */}
                                {activeTab === 'attendance_recap' && user.role === 'admin' && (
                                    <div className="space-y-6">
                                        {/* Attendance Recap Cards */}
                                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                                                    <Clock className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400 font-semibold">Total Absensi {hasFilters ? '(Terfilter)' : '(Hari Ini)'}</p>
                                                    <p className="text-2xl font-black text-gray-850 dark:text-white mt-0.5">{statsSource.length}</p>
                                                </div>
                                            </div>

                                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                                                    <CheckCircle className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400 font-semibold">Tepat Waktu {hasFilters ? '(Terfilter)' : '(Hari Ini)'}</p>
                                                    <p className="text-2xl font-black text-gray-850 dark:text-white mt-0.5">
                                                        {statsSource.filter(a => a.status === 'present').length}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                                                    <AlertTriangle className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400 font-semibold">Terlambat {hasFilters ? '(Terfilter)' : '(Hari Ini)'}</p>
                                                    <p className="text-2xl font-black text-gray-850 dark:text-white mt-0.5">
                                                        {statsSource.filter(a => a.status === 'rejected' || a.status === 'late').length}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                                                    <Trophy className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400 font-semibold">Persentase Hadir {hasFilters ? '(Terfilter)' : '(Hari Ini)'}</p>
                                                    <p className="text-2xl font-black text-gray-850 dark:text-white mt-0.5">
                                                        {statsSource.length > 0 
                                                            ? `${Math.round((statsSource.filter(a => a.status === 'present' || a.status === 'late').length / statsSource.length) * 100)}%`
                                                            : '0%'
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Filters and Controls */}
                                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-4">
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Cari Nama / Email</label>
                                                        <input 
                                                            type="text" 
                                                            placeholder="Nama atau Email..."
                                                            value={searchStudent}
                                                            onChange={e => setSearchStudent(e.target.value)}
                                                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tanggal Awal</label>
                                                        <input 
                                                            type="date" 
                                                            value={filterStartDate}
                                                            onChange={e => setFilterStartDate(e.target.value)}
                                                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tanggal Akhir</label>
                                                        <input 
                                                            type="date" 
                                                            value={filterEndDate}
                                                            onChange={e => setFilterEndDate(e.target.value)}
                                                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Status</label>
                                                        <select 
                                                            value={filterStatus}
                                                            onChange={e => setFilterStatus(e.target.value)}
                                                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                        >
                                                            <option value="all">Semua Status</option>
                                                            <option value="present">Tepat Waktu</option>
                                                            <option value="rejected">Terlambat</option>
                                                            <option value="izin_tidak_masuk">Izin (Tidak Masuk)</option>
                                                            <option value="belum_absen">Belum Absen</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2 items-end pt-5 md:pt-0">
                                                    {(searchStudent || filterStartDate || filterEndDate || filterStatus !== 'all') && (
                                                        <button 
                                                            onClick={() => {
                                                                setSearchStudent('');
                                                                setFilterStartDate('');
                                                                setFilterEndDate('');
                                                                setFilterStatus('all');
                                                            }}
                                                            className="px-4 py-2 bg-gray-150 dark:bg-gray-700 hover:bg-gray-200 text-gray-700 dark:text-white text-xs font-bold rounded-xl h-10 transition-colors"
                                                        >
                                                            Reset
                                                        </button>
                                                    )}

                                                    <button 
                                                        onClick={exportAttendanceToExcel}
                                                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl h-10 flex items-center gap-2 shadow-md shadow-emerald-100 dark:shadow-none transition-colors"
                                                    >
                                                        <UploadCloud className="w-4 h-4" />
                                                        Cetak Rekap (Excel)
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Attendance Recap Table */}
                                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                                    <thead className="text-xs text-gray-400 bg-gray-50 dark:bg-gray-900 uppercase">
                                                        <tr>
                                                            <th scope="col" className="px-6 py-3">No</th>
                                                            <th scope="col" className="px-6 py-3">Anak PKL</th>
                                                            <th scope="col" className="px-6 py-3">Tanggal</th>
                                                            <th scope="col" className="px-6 py-3">Absen Masuk</th>
                                                            <th scope="col" className="px-6 py-3">Absen Pulang</th>
                                                            <th scope="col" className="px-6 py-3">Status Masuk</th>
                                                            <th scope="col" className="px-6 py-3">Status Pulang</th>
                                                            <th scope="col" className="px-6 py-3">Kampus</th>
                                                            <th scope="col" className="px-6 py-3">Koordinat GPS</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                        {filteredAttendances.length > 0 ? (
                                                            filteredAttendances.map((att, index) => (
                                                                <tr key={att.id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                                                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                                                                        {index + 1}
                                                                    </td>
                                                                    <td className="px-6 py-4">
                                                                        <div className="font-bold text-gray-900 dark:text-white">{att.user?.name || '-'}</div>
                                                                        <div className="text-xs text-gray-400">{att.user?.school_name || '-'}</div>
                                                                    </td>
                                                                    <td className="px-6 py-4 font-medium text-gray-700 dark:text-gray-300">
                                                                        {att.date}
                                                                    </td>
                                                                    <td className="px-6 py-4 text-xs font-bold">
                                                                        <div className="text-indigo-600 dark:text-indigo-400">{att.check_in || '--:--'}</div>
                                                                        {att.in_selfie && (
                                                                            <button 
                                                                                onClick={() => setShowProofModal(`/storage/${att.in_selfie}`)}
                                                                                className="mt-1.5 flex items-center gap-1 text-[10px] text-indigo-500 hover:text-indigo-600 dark:text-indigo-450 hover:underline"
                                                                            >
                                                                                <Camera className="w-3.5 h-3.5" /> Lihat Selfie
                                                                            </button>
                                                                        )}
                                                                    </td>
                                                                    <td className="px-6 py-4 text-xs font-bold">
                                                                        <div className="text-amber-600 dark:text-amber-400">{att.check_out || '--:--'}</div>
                                                                        {att.out_selfie && (
                                                                            <button 
                                                                                onClick={() => setShowProofModal(`/storage/${att.out_selfie}`)}
                                                                                className="mt-1.5 flex items-center gap-1 text-[10px] text-amber-500 hover:text-amber-600 dark:text-amber-450 hover:underline"
                                                                            >
                                                                                <Camera className="w-3.5 h-3.5" /> Lihat Selfie
                                                                            </button>
                                                                        )}
                                                                    </td>
                                                                    <td className="px-6 py-4">
                                                                        <span className={`inline-flex px-2.5 py-0.5 text-xs font-bold rounded-full ${
                                                                            att.check_in
                                                                                ? (att.status === 'present'
                                                                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                                                                                    : (att.status === 'late'
                                                                                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                                                                                        : 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'))
                                                                                : (att.status === 'izin_tidak_masuk'
                                                                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                                                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700/60 dark:text-gray-300')
                                                                        }`}>
                                                                            {att.check_in
                                                                                ? (att.status === 'present' 
                                                                                    ? 'Tepat Waktu' 
                                                                                    : (att.status === 'late' 
                                                                                        ? 'Terlambat' 
                                                                                        : 'Ditolak'))
                                                                                : (att.status === 'izin_tidak_masuk'
                                                                                    ? 'Izin (Tidak Masuk)'
                                                                                    : 'Belum Absen')}
                                                                        </span>
                                                                        {att.permit && (att.permit.type === 'masuk_terlambat' || att.permit.type === 'tidak_masuk') && (
                                                                            <div className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 mt-1 uppercase">
                                                                                Izin: {att.permit.type.replace('_', ' ')}
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                    <td className="px-6 py-4">
                                                                        <span className={`inline-flex px-2.5 py-0.5 text-xs font-bold rounded-full ${
                                                                            att.check_out
                                                                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                                                                                : (att.status === 'izin_tidak_masuk'
                                                                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                                                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700/60 dark:text-gray-300')
                                                                        }`}>
                                                                            {att.check_out
                                                                                ? 'Tepat Waktu' 
                                                                                : (att.status === 'izin_tidak_masuk'
                                                                                    ? 'Izin (Tidak Masuk)'
                                                                                    : 'Belum Absen')}
                                                                        </span>
                                                                        {att.permit && (att.permit.type === 'pulang_cepat' || att.permit.type === 'tidak_masuk') && (
                                                                            <div className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 mt-1 uppercase">
                                                                                Izin: {att.permit.type.replace('_', ' ')}
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                    <td className="px-6 py-4 text-xs">
                                                                        {att.in_campus && att.out_campus ? (
                                                                            att.in_campus === att.out_campus ? (
                                                                                <span className="font-semibold text-gray-800 dark:text-white">{att.in_campus}</span>
                                                                            ) : (
                                                                                <div className="space-y-1">
                                                                                    <div><span className="text-gray-400 font-medium">Masuk:</span> <span className="font-semibold text-gray-800 dark:text-white">{att.in_campus}</span></div>
                                                                                    <div><span className="text-gray-400 font-medium">Pulang:</span> <span className="font-semibold text-gray-800 dark:text-white">{att.out_campus}</span></div>
                                                                                </div>
                                                                            )
                                                                        ) : att.in_campus ? (
                                                                            <div><span className="text-gray-400 font-medium">Masuk:</span> <span className="font-semibold text-gray-800 dark:text-white">{att.in_campus}</span></div>
                                                                        ) : att.out_campus ? (
                                                                            <div><span className="text-gray-400 font-medium">Pulang:</span> <span className="font-semibold text-gray-800 dark:text-white">{att.out_campus}</span></div>
                                                                        ) : (
                                                                            <span className="text-gray-400">-</span>
                                                                        )}
                                                                    </td>
                                                                    <td className="px-6 py-4 text-xs space-y-1">
                                                                        {att.in_latitude && att.in_longitude ? (
                                                                            <a 
                                                                                href={`https://www.google.com/maps?q=${att.in_latitude},${att.in_longitude}`} 
                                                                                target="_blank" 
                                                                                rel="noopener noreferrer"
                                                                                className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline"
                                                                            >
                                                                                <MapPin className="w-3 h-3" /> Lokasi Masuk
                                                                            </a>
                                                                        ) : null}
                                                                        {att.out_latitude && att.out_longitude ? (
                                                                            <div className="mt-1">
                                                                                <a 
                                                                                    href={`https://www.google.com/maps?q=${att.out_latitude},${att.out_longitude}`} 
                                                                                    target="_blank" 
                                                                                    rel="noopener noreferrer"
                                                                                    className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 hover:underline"
                                                                                >
                                                                                    <MapPin className="w-3 h-3" /> Lokasi Pulang
                                                                                </a>
                                                                            </div>
                                                                        ) : null}
                                                                        {!att.in_latitude && !att.out_latitude && (
                                                                            <span className="text-gray-400">-</span>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                                                    <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                                                    <p className="font-semibold">Tidak Ada Data Absensi!</p>
                                                                    <p className="text-xs text-gray-400 mt-1">Data absensi kosong atau filter tidak cocok.</p>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ================= TAB: STUDENT PERMISSIONS (STUDENT ONLY) ================= */}
                                {activeTab === 'permissions' && user.role === 'anak_pkl' && (
                                    <div className="space-y-6">
                                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                                                Form Pengajuan Izin / Dispensasi
                                            </h3>
                                            <form onSubmit={submitPermit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Tanggal Izin</label>
                                                    <input
                                                        type="date"
                                                        value={permitForm.data.date}
                                                        onChange={e => permitForm.setData('date', e.target.value)}
                                                        className="w-full px-4 py-2 bg-white dark:bg-gray-850 border border-gray-250 dark:border-gray-700 rounded-xl text-sm dark:text-white"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Jenis Izin</label>
                                                    <select
                                                        value={permitForm.data.type}
                                                        onChange={e => permitForm.setData('type', e.target.value)}
                                                        className="w-full px-4 py-2 bg-white dark:bg-gray-850 border border-gray-250 dark:border-gray-700 rounded-xl text-sm dark:text-white"
                                                        required
                                                    >
                                                        <option value="tidak_masuk">Izin Tidak Masuk</option>
                                                        <option value="masuk_terlambat">Izin Masuk Terlambat</option>
                                                        <option value="pulang_cepat">Izin Pulang Cepat</option>
                                                    </select>
                                                </div>
                                                <div className="sm:col-span-2">
                                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Alasan Izin</label>
                                                    <textarea
                                                        rows="3"
                                                        value={permitForm.data.reason}
                                                        onChange={e => permitForm.setData('reason', e.target.value)}
                                                        placeholder="Tuliskan alasan lengkap pengajuan izin..."
                                                        className="w-full px-4 py-2 bg-white dark:bg-gray-850 border border-gray-250 dark:border-gray-700 rounded-xl text-sm dark:text-white"
                                                        required
                                                    ></textarea>
                                                </div>
                                                <div className="sm:col-span-1">
                                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Upload Bukti (Wajib)</label>
                                                    <input
                                                        type="file"
                                                        accept=".pdf,.jpg,.jpeg,.png"
                                                        onChange={e => permitForm.setData('proof', e.target.files[0])}
                                                        className="w-full text-sm text-gray-550 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-600 dark:file:bg-gray-750 dark:file:text-white hover:file:bg-indigo-100"
                                                        required
                                                    />
                                                    {permitForm.errors.proof && <p className="text-xs text-rose-500 mt-1">{permitForm.errors.proof}</p>}
                                                </div>
                                                <div className="sm:col-span-1">
                                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Upload Screenshot Izin (Wajib)</label>
                                                    <input
                                                        type="file"
                                                        accept=".pdf,.jpg,.jpeg,.png"
                                                        onChange={e => permitForm.setData('screenshot', e.target.files[0])}
                                                        className="w-full text-sm text-gray-550 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-600 dark:file:bg-gray-750 dark:file:text-white hover:file:bg-indigo-100"
                                                        required
                                                    />
                                                    {permitForm.errors.screenshot && <p className="text-xs text-rose-500 mt-1">{permitForm.errors.screenshot}</p>}
                                                </div>
                                                <div className="sm:col-span-2 flex justify-end">
                                                    <button
                                                        type="submit"
                                                        disabled={permitForm.processing}
                                                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
                                                    >
                                                        Kirim Pengajuan
                                                    </button>
                                                </div>
                                            </form>
                                        </div>

                                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                                            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                                    Riwayat Pengajuan Izin Anda
                                                </h3>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                                    <thead className="text-xs text-gray-400 bg-gray-50 dark:bg-gray-900 uppercase">
                                                        <tr>
                                                            <th className="px-6 py-3">Tanggal</th>
                                                            <th className="px-6 py-3">Jenis Izin</th>
                                                            <th className="px-6 py-3">Alasan</th>
                                                            <th className="px-6 py-3">Bukti Fisik</th>
                                                            <th className="px-6 py-3">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                        {permissions.length === 0 ? (
                                                            <tr>
                                                                <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                                                                    Belum ada riwayat pengajuan izin.
                                                                </td>
                                                            </tr>
                                                        ) : (
                                                            permissions.map(p => (
                                                                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                                                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{p.date}</td>
                                                                    <td className="px-6 py-4 uppercase text-xs">
                                                                        {p.type.replace('_', ' ')}
                                                                    </td>
                                                                    <td className="px-6 py-4 max-w-xs truncate" title={p.reason}>
                                                                        {p.reason}
                                                                    </td>
                                                                    <td className="px-6 py-4 space-y-1">
                                                                        {p.proof_path && (
                                                                            <div>
                                                                                <a
                                                                                    href={`/storage/${p.proof_path}`}
                                                                                    target="_blank"
                                                                                    rel="noreferrer"
                                                                                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline block"
                                                                                >
                                                                                    Lihat Bukti
                                                                                </a>
                                                                            </div>
                                                                        )}
                                                                        {p.screenshot_path && (
                                                                            <div>
                                                                                <a
                                                                                    href={`/storage/${p.screenshot_path}`}
                                                                                    target="_blank"
                                                                                    rel="noreferrer"
                                                                                    className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline block"
                                                                                >
                                                                                    Lihat Screenshot
                                                                                </a>
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                    <td className="px-6 py-4">
                                                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase ${
                                                                            p.status === 'approved' 
                                                                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                                                                : p.status === 'rejected'
                                                                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                                                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                                                        }`}>
                                                                            {p.status}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ================= TAB: ADMIN PERMISSIONS REVIEW (ADMIN ONLY) ================= */}
                                {activeTab === 'admin_permissions' && user.role === 'admin' && (
                                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                                        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                                Persetujuan Izin / Dispensasi Siswa
                                            </h3>
                                            <p className="text-xs text-gray-400 mt-1">Daftar semua pengajuan izin dari siswa PKL.</p>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                                <thead className="text-xs text-gray-400 bg-gray-50 dark:bg-gray-900 uppercase">
                                                    <tr>
                                                        <th className="px-6 py-3">Nama Siswa</th>
                                                        <th className="px-6 py-3">Sekolah</th>
                                                        <th className="px-6 py-3">Tanggal</th>
                                                        <th className="px-6 py-3">Tipe Izin</th>
                                                        <th className="px-6 py-3">Alasan</th>
                                                        <th className="px-6 py-3">Bukti</th>
                                                        <th className="px-6 py-3">Status</th>
                                                        <th className="px-6 py-3 text-right">Aksi</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                    {permissions.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="8" className="px-6 py-8 text-center text-gray-400">
                                                                Belum ada pengajuan izin masuk.
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        permissions.map(p => (
                                                            <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                                                <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                                                                    {p.user?.name}
                                                                </td>
                                                                <td className="px-6 py-4 text-xs">
                                                                    {p.user?.school_name || '-'}
                                                                </td>
                                                                <td className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">
                                                                    {p.date}
                                                                </td>
                                                                <td className="px-6 py-4 text-xs font-bold uppercase">
                                                                    {p.type.replace('_', ' ')}
                                                                </td>
                                                                <td className="px-6 py-4 max-w-xs truncate" title={p.reason}>
                                                                    {p.reason}
                                                                </td>
                                                                <td className="px-6 py-4 space-y-1">
                                                                    {p.proof_path && (
                                                                        <div>
                                                                            <a
                                                                                href={`/storage/${p.proof_path}`}
                                                                                target="_blank"
                                                                                rel="noreferrer"
                                                                                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline block"
                                                                            >
                                                                                Lihat Bukti
                                                                            </a>
                                                                        </div>
                                                                    )}
                                                                    {p.screenshot_path && (
                                                                        <div>
                                                                            <a
                                                                                href={`/storage/${p.screenshot_path}`}
                                                                                target="_blank"
                                                                                rel="noreferrer"
                                                                                className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline block"
                                                                            >
                                                                                Lihat Screenshot
                                                                            </a>
                                                                        </div>
                                                                    )}
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase ${
                                                                        p.status === 'approved' 
                                                                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                                                            : p.status === 'rejected'
                                                                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                                                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                                                    }`}>
                                                                        {p.status}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 text-right">
                                                                    {p.status === 'pending' && (
                                                                        <div className="flex justify-end gap-2">
                                                                            <button
                                                                                onClick={() => handleUpdatePermitStatus(p.id, 'approved')}
                                                                                className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-colors"
                                                                            >
                                                                                Setujui
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleUpdatePermitStatus(p.id, 'rejected')}
                                                                                className="px-3 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-bold transition-colors"
                                                                            >
                                                                                Tolak
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* ================= MODAL: TASK COMPLETION PROOF ================= */}
            {showCompleteModal && activeCompleteTask && (
                <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="relative bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700">
                        <button 
                            onClick={() => setShowCompleteModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h3 className="text-lg font-bold text-gray-950 dark:text-white pr-6">
                            Konfirmasi Penyelesaian Tugas
                        </h3>
                        <p className="text-xs text-gray-400 mt-1">Tugas: {activeCompleteTask.title}</p>

                        <form onSubmit={submitCompleteTask} className="mt-5 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Penyelesaian</label>
                                <div className="flex gap-4">
                                    <label className="flex-1 flex items-center justify-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition-colors">
                                        <input
                                            type="radio"
                                            name="is_assisted"
                                            checked={completeForm.data.is_assisted === false}
                                            onChange={() => completeForm.setData('is_assisted', false)}
                                            className="text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-xs font-bold text-gray-750 dark:text-gray-300">Mandiri (+2 Poin)</span>
                                    </label>
                                    
                                    <label className="flex-1 flex items-center justify-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition-colors">
                                        <input
                                            type="radio"
                                            name="is_assisted"
                                            checked={completeForm.data.is_assisted === true}
                                            onChange={() => completeForm.setData('is_assisted', true)}
                                            className="text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-xs font-bold text-gray-750 dark:text-gray-300">Dibantu (+1 Poin)</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Unggah Bukti Foto</label>
                                <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-250 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500 rounded-xl p-6 bg-gray-50 dark:bg-gray-900 cursor-pointer transition-colors group">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={e => completeForm.setData('proof_photo', e.target.files[0])}
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        required
                                    />
                                    {completeForm.data.proof_photo ? (
                                        <div className="text-center">
                                            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2 animate-bounce" />
                                            <p className="text-xs font-bold text-gray-800 dark:text-white truncate max-w-[250px]">
                                                {completeForm.data.proof_photo.name}
                                            </p>
                                            <p className="text-[10px] text-gray-400 mt-0.5">
                                                Click or drag to change
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="text-center group-hover:scale-105 transition-transform duration-200">
                                            <UploadCloud className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                                            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Select Image File</p>
                                            <p className="text-[10px] text-gray-400 mt-0.5">JPEG, PNG, JPG, GIF (Max 5MB)</p>
                                        </div>
                                    )}
                                </div>
                                {completeForm.errors.proof_photo && <p className="text-xs text-rose-500 mt-1">{completeForm.errors.proof_photo}</p>}
                            </div>

                            {/* UPLOAD PROGRESS BAR */}
                            {completeForm.progress && (
                                <div className="w-full bg-gray-150 dark:bg-gray-900 rounded-full h-2.5 overflow-hidden">
                                    <div 
                                        className="bg-indigo-600 h-full rounded-full transition-all duration-300 ease-out" 
                                        style={{ width: `${completeForm.progress.percentage}%` }}
                                    ></div>
                                    <p className="text-[10px] text-indigo-500 font-bold text-right mt-1">
                                        Uploading... {completeForm.progress.percentage}%
                                    </p>
                                </div>
                            )}

                            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => setShowCompleteModal(false)}
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-750 dark:hover:bg-gray-700 text-gray-700 dark:text-white rounded-xl text-xs font-bold"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={completeForm.processing}
                                    className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl text-xs font-bold shadow-md"
                                >
                                    Selesaikan Tugas
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ================= MODAL: CAMERA CAPTURE SELFIE ================= */}
            {showCameraModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="relative bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-700">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-indigo-50/50 to-purple-50/20 dark:from-gray-750 dark:to-gray-800 flex justify-between items-center">
                            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Camera className="w-5 h-5 text-indigo-500 animate-pulse" />
                                Selfie Absen {attendanceType === 'check-in' ? 'Masuk' : 'Pulang'}
                            </h3>
                            <button onClick={closeCameraModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 flex flex-col items-center justify-center space-y-6">
                            {cameraError ? (
                                <div className="p-4 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-sm font-semibold rounded-xl flex items-start gap-2 w-full">
                                    <AlertTriangle className="w-5 h-5 shrink-0" />
                                    <span>{cameraError}</span>
                                </div>
                            ) : !capturedSelfie ? (
                                /* Camera Live Stream */
                                <div className="relative w-full aspect-[3/4] max-w-xs rounded-2xl overflow-hidden border-4 border-indigo-100 dark:border-gray-700 bg-gray-950 shadow-inner flex items-center justify-center">
                                    {cameraStream ? (
                                        <video 
                                            ref={videoRef} 
                                            autoPlay 
                                            playsInline 
                                            className="w-full h-full object-cover"
                                            style={{ transform: 'scaleX(-1)' }}
                                        ></video>
                                    ) : (
                                        <div className="flex flex-col items-center space-y-3">
                                            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                                            <p className="text-xs text-gray-400 font-semibold">Mengaktifkan kamera...</p>
                                        </div>
                                    )}
                                    {/* Circular Guide Overlay */}
                                    <div className="absolute inset-0 border-[24px] border-black/45 pointer-events-none flex items-center justify-center">
                                        <div className="w-4/5 aspect-square rounded-full border-2 border-dashed border-white/60"></div>
                                    </div>
                                </div>
                            ) : (
                                /* Captured Photo Preview */
                                <div className="relative w-full aspect-[3/4] max-w-xs rounded-2xl overflow-hidden border-4 border-emerald-500 bg-gray-950 shadow-md">
                                    <img src={capturedSelfie} className="w-full h-full object-cover" alt="Captured Selfie" />
                                    <span className="absolute top-3 right-3 bg-emerald-500 text-white rounded-full p-1 shadow-md">
                                        <Check className="w-4 h-4" />
                                    </span>
                                </div>
                            )}

                            {/* Info text */}
                            <p className="text-xs text-gray-500 dark:text-gray-400 text-center max-w-xs">
                                {!capturedSelfie 
                                    ? "Posisikan wajah Anda di tengah lingkaran dan pastikan pencahayaan cukup sebelum mengambil foto."
                                    : "Foto selfie berhasil diambil! Silakan klik 'Kirim Absensi' untuk menyelesaikan proses absensi."}
                            </p>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={closeCameraModal}
                                className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                Batal
                            </button>

                            {!capturedSelfie ? (
                                <button
                                    type="button"
                                    onClick={capturePhoto}
                                    disabled={!cameraStream}
                                    className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all ${
                                        !cameraStream
                                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100 dark:shadow-none'
                                    }`}
                                >
                                    <Camera className="w-4 h-4" /> Ambil Foto
                                </button>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        onClick={startCamera}
                                        className="px-4 py-2 border border-dashed border-indigo-200 dark:border-gray-700 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-colors flex items-center gap-1.5"
                                    >
                                        <RefreshCw className="w-4 h-4" /> Retake Foto
                                    </button>
                                    <button
                                        type="button"
                                        onClick={submitAttendanceWithSelfie}
                                        disabled={attendanceProcessing}
                                        className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5"
                                    >
                                        {attendanceProcessing ? (
                                            <>
                                                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Mengirim...
                                            </>
                                        ) : (
                                            <>
                                                <Check className="w-4 h-4" /> Kirim Absensi
                                            </>
                                        )}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ================= MODAL: PHOTO PROOF PREVIEW ================= */}
            {showProofModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="relative bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-4 shadow-2xl border border-gray-100 dark:border-gray-700">
                        <button 
                            onClick={() => setShowProofModal(null)}
                            className="absolute -top-3 -right-3 bg-rose-500 text-white rounded-full p-1.5 hover:bg-rose-600 shadow-md"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        <div className="rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-900 max-h-[70vh] flex items-center justify-center">
                            <img src={showProofModal} alt="Bukti Foto Pekerjaan" className="object-contain max-h-[70vh] w-full" />
                        </div>
                    </div>
                </div>
            )}

        </AuthenticatedLayout>
    );
}
