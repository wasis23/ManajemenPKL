import { Head, Link } from '@inertiajs/react';
import React, { useState } from 'react';
import { Compass, Trophy, Shield, ArrowRight, Crown, Sparkles, Flame, MapPin, Activity, CheckCircle2, ClipboardList, Building, User, Clock, AlertCircle, CheckCircle } from 'lucide-react';

export default function Welcome({ auth, topStudent = null, showTopStudent = true, tasks = [], heroBgPath = null }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Filter tasks based on search term and selected status
    const filteredTasks = tasks.filter(task => {
        const matchesSearch = 
            (task.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (task.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (task.requester_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (task.reporter?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (task.target_room || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' ? true : task.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <>
            <Head title="Sistem Geofencing PKL - Landing Page" />
            <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-600 selection:text-white relative overflow-hidden font-sans">
                
                {/* Background Ambient Glows & Grid Mesh */}
                <div className="absolute -top-24 left-1/4 w-[700px] h-[700px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none"></div>
                <div className="absolute top-1/3 right-10 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[160px] pointer-events-none"></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"></div>

                {/* Header / Navbar */}
                <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-900">
                    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 border border-indigo-400/20">
                                <Compass className="w-5 h-5 text-white animate-spin-slow" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-black bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent tracking-tight">
                                    Geofence PKL
                                </span>
                                <span className="text-[10px] text-emerald-400 font-bold tracking-wider flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> SYSTEM ACTIVE
                                </span>
                            </div>
                        </div>

                        <nav className="flex items-center gap-4">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-950/50 hover:shadow-indigo-500/25 transition-all duration-300 flex items-center gap-2 border border-indigo-400/30 hover:scale-[1.02]"
                                >
                                    Dashboard <ArrowRight className="w-4 h-4" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                                    >
                                        Masuk
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold border border-slate-800 transition-all shadow-sm"
                                    >
                                        Daftar PKL
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                {/* Main Content Layout */}
                <main className="max-w-7xl mx-auto w-full px-6 pt-6 pb-16 flex-1 space-y-16 relative z-10">
                    
                    {/* Top Hero Section Container */}
                    <div className="relative rounded-3xl overflow-hidden p-6 sm:p-10 lg:p-12 border border-slate-900/80 bg-slate-950/40 backdrop-blur-sm shadow-2xl">
                        
                        {/* Custom Hero Background Image uploaded by Admin */}
                        {heroBgPath && (
                            <>
                                <div 
                                    className="absolute inset-0 bg-cover bg-center transition-all duration-700 scale-105"
                                    style={{ backgroundImage: `url(${heroBgPath})` }}
                                ></div>
                                <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-[2px]"></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/50"></div>
                            </>
                        )}

                        <div className={`relative z-10 grid grid-cols-1 ${showTopStudent ? 'lg:grid-cols-12' : 'max-w-3xl mx-auto'} gap-10 lg:gap-16 items-center`}>
                            
                            {/* Portal Akses Sistem */}
                            <div className={`${showTopStudent ? 'lg:col-span-6' : 'w-full'} space-y-6`}>
                                
                                <div className="space-y-3">
                                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold tracking-wider uppercase">
                                        <Shield className="w-4 h-4 text-indigo-400" />
                                        <span>Portal Akses Sistem</span>
                                    </div>
                                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                                        Presensi Real-time & <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">Manajemen Tugas Magang</span>
                                    </h1>
                                    <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-xl">
                                        Silakan masuk ke akun Anda untuk mulai melakukan presensi berbasis lokasi atau mengelola tugas magang Anda.
                                    </p>
                                </div>

                                {/* Fluid Live Specs Indicator */}
                                <div className="py-4 border-y border-slate-900 grid grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1">
                                            <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Geofence
                                        </div>
                                        <div className="text-xs sm:text-sm font-bold text-emerald-400 flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                            Radius 50m
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1">
                                            <Activity className="w-3.5 h-3.5 text-indigo-400" /> GPS Sensor
                                        </div>
                                        <div className="text-xs sm:text-sm font-bold text-indigo-300">
                                            Akurasi ~5m
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Toleransi
                                        </div>
                                        <div className="text-xs sm:text-sm font-bold text-amber-300">
                                            60 Menit
                                        </div>
                                    </div>
                                </div>

                                {/* CTA Action */}
                                <div className="pt-2">
                                    {auth.user ? (
                                        <Link
                                            href={route('dashboard')}
                                            className="inline-flex px-8 py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white rounded-2xl text-base font-bold items-center justify-center gap-2 shadow-[0_0_30px_rgba(99,102,241,0.35)] hover:shadow-[0_0_45px_rgba(168,85,247,0.5)] transition-all duration-300 hover:-translate-y-0.5"
                                        >
                                            Masuk ke Dashboard <ArrowRight className="w-5 h-5" />
                                        </Link>
                                    ) : (
                                        <Link
                                            href={route('tasks.public.create')}
                                            className="inline-flex px-8 py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-600 text-white rounded-2xl text-base font-bold items-center justify-center gap-2 shadow-[0_0_30px_rgba(99,102,241,0.35)] hover:shadow-[0_0_45px_rgba(99,102,241,0.5)] transition-all duration-300 hover:-translate-y-0.5"
                                        >
                                            Ajukan Tugas Baru <ArrowRight className="w-5 h-5" />
                                        </Link>
                                    )}
                                </div>

                            </div>

                            {/* Hall of Fame & Award */}
                            {showTopStudent && (
                                <div className="lg:col-span-6 relative flex flex-col justify-center">
                                    
                                    {/* Background Glow behind Spotlight */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/15 blur-[120px] pointer-events-none"></div>

                                    <div className="space-y-5 relative z-10">
                                        <div className="space-y-2 text-left">
                                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold tracking-wider uppercase">
                                                <Trophy className="w-4 h-4 text-amber-400" />
                                                <span>Hall of Fame & Award</span>
                                            </div>
                                            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                                Student of the Month
                                            </h2>
                                            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-lg">
                                                Apresiasi tertinggi atas dedikasi kinerja luar biasa, kedisiplinan presensi, dan akumulasi poin terbanyak bagi peserta magang berprestasi.
                                            </p>
                                        </div>

                                        {topStudent ? (
                                            <div className="relative pt-2">
                                                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                                                    
                                                    {/* Profile Photo */}
                                                    <div className="relative shrink-0">
                                                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-200 p-1 shadow-[0_0_40px_rgba(245,158,11,0.3)] overflow-hidden">
                                                            {topStudent.photo_path ? (
                                                                <img src={topStudent.photo_path} alt={topStudent.name} className="w-full h-full rounded-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-4xl font-black text-amber-300">
                                                                    {topStudent.name?.charAt(0).toUpperCase()}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="absolute -bottom-1 -right-1 bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 p-2 rounded-full shadow-lg">
                                                            <Crown className="w-4 h-4 sm:w-5 sm:h-5 fill-slate-950" />
                                                        </div>
                                                    </div>

                                                    {/* Details */}
                                                    <div className="space-y-2 text-center sm:text-left flex-1">
                                                        <div className="space-y-1">
                                                            <span className="inline-block px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-extrabold uppercase tracking-wider">
                                                                ⭐ {topStudent.period ? `Periode ${topStudent.period}` : 'Champion #1'}
                                                            </span>
                                                            <h3 className="text-xl sm:text-2xl font-black text-white bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
                                                                {topStudent.name}
                                                            </h3>
                                                            <p className="text-xs sm:text-sm font-semibold text-slate-300">
                                                                {topStudent.school_name || 'Peserta PKL'}
                                                                {topStudent.major && <span className="text-slate-500"> • {topStudent.major}</span>}
                                                            </p>
                                                        </div>

                                                        {topStudent.description && (
                                                            <p className="text-xs text-slate-400 italic leading-relaxed">
                                                                "{topStudent.description}"
                                                            </p>
                                                        )}

                                                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 font-bold text-xs sm:text-sm">
                                                            <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-bounce" />
                                                            <span>{topStudent.points} Poin Kinerja</span>
                                                        </div>
                                                    </div>

                                                </div>
                                            </div>
                                        ) : (
                                            <div className="py-4 space-y-1.5">
                                                <div className="inline-flex items-center gap-2 text-amber-400 font-bold text-sm">
                                                    <Sparkles className="w-4 h-4" /> Papan Peringkat Sedang Berjalan
                                                </div>
                                                <p className="text-xs text-slate-500 leading-relaxed">
                                                    Tingkatkan penyelesaian tugas magang Anda untuk menjadi Student of the Month bulan ini!
                                                </p>
                                            </div>
                                        )}

                                    </div>
                                </div>
                            )}

                        </div>
                    </div>

                    {/* Bottom Section: Integrated Live Task List */}
                    <div className="pt-8 border-t border-slate-900 space-y-8">
                        
                        {/* Section Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-900 pb-5">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold tracking-wider uppercase mb-2">
                                    <ClipboardList className="w-4 h-4 text-purple-400" />
                                    <span>Monitoring Real-Time</span>
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                                    Daftar Tugas & Laporan Aduan
                                </h2>
                                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                                    Pantau status pengerjaan kendala teknis atau tugas magang secara langsung.
                                </p>
                            </div>

                            <span className="text-xs font-bold text-slate-500 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                                Total: {tasks.length} Laporan
                            </span>
                        </div>

                        {/* Search & Filter Bar */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/40 p-4 border border-slate-900 rounded-2xl">
                            <div className="md:col-span-2">
                                <input
                                    type="text"
                                    placeholder="Cari tugas berdasarkan judul, pelapor, ruangan..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                />
                            </div>
                            <div>
                                <select
                                    value={statusFilter}
                                    onChange={e => setStatusFilter(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                >
                                    <option value="all">Semua Status</option>
                                    <option value="pending">Menunggu / Belum Diambil</option>
                                    <option value="proses">Sedang Dikerjakan</option>
                                    <option value="sukses">Selesai / Sukses</option>
                                </select>
                            </div>
                        </div>

                        {/* Task Cards Grid */}
                        {filteredTasks.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredTasks.map((task) => {
                                    const statusConfig = {
                                        pending: {
                                            label: 'Belum Diambil',
                                            bg: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
                                            icon: <AlertCircle className="w-4 h-4" />
                                        },
                                        proses: {
                                            label: 'Sedang Dikerjakan',
                                            bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                                            icon: <Clock className="w-4 h-4" />
                                        },
                                        sukses: {
                                            label: 'Selesai / Sukses',
                                            bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                                            icon: <CheckCircle className="w-4 h-4" />
                                        }
                                    };

                                    const currentStatus = statusConfig[task.status] || statusConfig.pending;

                                    return (
                                        <div 
                                            key={task.id} 
                                            className="bg-slate-900/40 border border-slate-850 hover:border-slate-700/80 rounded-3xl p-6 flex flex-col justify-between hover:shadow-xl hover:shadow-indigo-950/20 transition-all duration-300 backdrop-blur-sm"
                                        >
                                            <div className="space-y-4">
                                                {/* Header card info */}
                                                <div className="flex justify-between items-start gap-2">
                                                    <div className="flex flex-col gap-1.5">
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${currentStatus.bg} flex items-center gap-1`}>
                                                            {currentStatus.icon}
                                                            {currentStatus.label}
                                                        </span>
                                                        <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-block self-start">
                                                            Kuota: {task.quota} orang
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                                                        #{task.id}
                                                    </span>
                                                </div>

                                                {/* Task Title & Details */}
                                                <div className="space-y-2">
                                                    <h3 className="font-extrabold text-white text-base leading-snug">
                                                        {task.title}
                                                    </h3>
                                                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                                                        {task.description}
                                                    </p>
                                                </div>

                                                {/* Location Info */}
                                                {(task.target_room || task.campus_type) && (
                                                    <div className="flex flex-wrap gap-2 pt-1">
                                                        {task.target_room && (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 text-[11px] font-semibold text-slate-400 border border-slate-850">
                                                                <Building className="w-3.5 h-3.5 text-indigo-400" />
                                                                {task.target_room}
                                                            </span>
                                                        )}
                                                        {task.campus_type && (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 text-[11px] font-semibold text-slate-400 border border-slate-850">
                                                                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                                                                {task.campus_type}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Bottom Section */}
                                            <div className="border-t border-slate-850 pt-4 mt-5 space-y-3">
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-slate-500">Pengaju:</span>
                                                    <span className="font-bold text-slate-300 flex items-center gap-1">
                                                        <User className="w-3.5 h-3.5 text-slate-500" />
                                                        {task.reporter ? task.reporter.name : `${task.requester_name} (Umum)`}
                                                    </span>
                                                </div>

                                                {/* Student working info */}
                                                {task.students && task.students.length > 0 && (
                                                    <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-850 space-y-1">
                                                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                                                            Siswa Penanggung Jawab ({task.students.length} orang):
                                                        </p>
                                                        <div className="space-y-0.5">
                                                            {task.students.map(student => (
                                                                <div key={student.id} className="text-xs text-slate-300 font-medium flex justify-between">
                                                                    <span>• {student.name}</span>
                                                                    <span className="text-[10px] text-slate-500">({student.school_name || 'Sekolah'})</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="bg-slate-900/20 border border-slate-900 rounded-3xl py-12 text-center space-y-2">
                                <ClipboardList className="w-10 h-10 text-slate-700 mx-auto" />
                                <h3 className="font-bold text-white text-sm">Tidak Ada Laporan Ditemukan</h3>
                                <p className="text-xs text-slate-500 max-w-md mx-auto">
                                    Silakan ubah kata kunci pencarian atau filter status untuk melihat daftar tugas lainnya.
                                </p>
                            </div>
                        )}

                    </div>

                </main>

                {/* Footer */}
                <footer className="py-6 text-center text-xs text-slate-500 border-t border-slate-900 max-w-7xl mx-auto w-full relative z-10 flex flex-col sm:flex-row items-center justify-between px-6 gap-2">
                    <span>Sistem Monitoring Geofencing & Gamifikasi PKL © 2026</span>
                    <span className="text-[11px] text-slate-600">Built with TailwindCSS & Inertia.js</span>
                </footer>

            </div>
        </>
    );
}
