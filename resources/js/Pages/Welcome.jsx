import { Head, Link } from '@inertiajs/react';
import React, { useState } from 'react';
import ThemeToggle from '@/Components/ThemeToggle';
import { Compass, Trophy, ArrowRight, Crown, Sparkles, Flame, MapPin, ClipboardList, Building, User, Clock, AlertCircle, CheckCircle } from 'lucide-react';

export default function Welcome({ auth, topStudent = null, showTopStudent = true, tasks = [], heroBgPath = null, heroButtonTop = 50, heroButtonLeft = 20 }) {
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
            <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col justify-between selection:bg-amber-400 selection:text-slate-950 relative overflow-hidden font-sans transition-colors duration-300">
                
                {/* Background Ambient Glows & Grid Mesh */}
                <div className="absolute -top-24 left-1/4 w-[700px] h-[700px] bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none"></div>
                <div className="absolute top-1/3 right-10 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[160px] pointer-events-none"></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e120_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e120_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),gradient-to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"></div>

                {/* Header / Navbar */}
                <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-900 transition-colors duration-300">
                    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 border border-indigo-400/20">
                                <Compass className="w-5 h-5 text-white animate-spin-slow" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-black bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-600 dark:from-white dark:via-slate-100 dark:to-indigo-200 bg-clip-text text-transparent tracking-tight">
                                    Geofence PKL
                                </span>
                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold tracking-wider flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span> SYSTEM ACTIVE
                                </span>
                            </div>
                        </div>

                        <nav className="flex items-center gap-3">
                            <ThemeToggle />

                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="px-6 py-2.5 bg-amber-400 hover:bg-yellow-300 text-slate-950 rounded-xl text-sm font-extrabold shadow-md shadow-amber-400/20 transition-all duration-300 flex items-center gap-2 border border-amber-300 hover:scale-[1.02]"
                                >
                                    Dashboard <ArrowRight className="w-4 h-4" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white transition-colors"
                                    >
                                        Masuk
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="px-5 py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white rounded-xl text-sm font-bold border border-slate-800 transition-all shadow-sm"
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
                    <div className="relative rounded-3xl overflow-hidden shadow-2xl w-full border border-slate-200 dark:border-slate-900 bg-white/70 dark:bg-slate-950/40">
                        {heroBgPath ? (
                            <div className="relative w-full">
                                <img 
                                    src={heroBgPath} 
                                    alt="Hero Background" 
                                    className="w-full h-auto block rounded-3xl object-contain"
                                />
                                <div 
                                    className="absolute z-10 transition-all duration-75"
                                    style={{
                                        top: `${heroButtonTop}%`,
                                        left: `${heroButtonLeft}%`,
                                        transform: 'translate(-50%, -50%)',
                                    }}
                                >
                                    {auth.user ? (
                                        <Link
                                            href={route('dashboard')}
                                            className="inline-flex px-4 py-2 sm:px-8 sm:py-4 bg-amber-500 hover:bg-amber-400 text-white rounded-xl sm:rounded-2xl text-xs sm:text-base font-black items-center justify-center gap-1.5 sm:gap-2.5 shadow-xl shadow-amber-500/30 border border-amber-400 transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.03] whitespace-nowrap"
                                        >
                                            Masuk ke Dashboard <ArrowRight className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-white stroke-[2.5]" />
                                        </Link>
                                    ) : (
                                        <Link
                                            href={route('tasks.public.create')}
                                            className="inline-flex px-4 py-2 sm:px-8 sm:py-4 bg-amber-500 hover:bg-amber-400 text-white rounded-xl sm:rounded-2xl text-xs sm:text-base font-black items-center justify-center gap-1.5 sm:gap-2.5 shadow-xl shadow-amber-500/30 border border-amber-400 transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.03] whitespace-nowrap"
                                        >
                                            Ajukan Tugas Baru <ArrowRight className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-white stroke-[2.5]" />
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="p-8 sm:p-12 min-h-[300px] flex items-center justify-center text-center bg-gradient-to-tr from-indigo-900 via-slate-900 to-indigo-950 rounded-3xl">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="inline-flex px-8 py-4 bg-amber-500 hover:bg-amber-400 text-white rounded-2xl text-base sm:text-lg font-black items-center justify-center gap-3 shadow-xl shadow-amber-500/30 border border-amber-400 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03]"
                                    >
                                        Masuk ke Dashboard <ArrowRight className="w-5 h-5 text-white stroke-[2.5]" />
                                    </Link>
                                ) : (
                                    <Link
                                        href={route('tasks.public.create')}
                                        className="inline-flex px-8 py-4 bg-amber-500 hover:bg-amber-400 text-white rounded-2xl text-base sm:text-lg font-black items-center justify-center gap-3 shadow-xl shadow-amber-500/30 border border-amber-400 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03]"
                                    >
                                        Ajukan Tugas Baru <ArrowRight className="w-5 h-5 text-white stroke-[2.5]" />
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Bottom Section: Integrated Live Task List */}
                    <div className="pt-8 border-t border-slate-200 dark:border-slate-900 space-y-8">
                        
                        {/* Section Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 dark:border-slate-900 pb-5">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-bold tracking-wider uppercase mb-2">
                                    <ClipboardList className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                    <span>Monitoring Real-Time</span>
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                                    Daftar Tugas & Laporan Aduan
                                </h2>
                                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                                    Pantau status pengerjaan kendala teknis atau tugas magang secara langsung.
                                </p>
                            </div>

                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                Total: {tasks.length} Laporan
                            </span>
                        </div>

                        {/* Search & Filter Bar */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white dark:bg-slate-900/40 p-4 border border-slate-200 dark:border-slate-900 rounded-2xl shadow-sm">
                            <div className="md:col-span-2">
                                <input
                                    type="text"
                                    placeholder="Cari tugas berdasarkan judul, pelapor, ruangan..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                />
                            </div>
                            <div>
                                <select
                                    value={statusFilter}
                                    onChange={e => setStatusFilter(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
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
                                            bg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
                                            icon: <AlertCircle className="w-4 h-4" />
                                        },
                                        proses: {
                                            label: 'Sedang Dikerjakan',
                                            bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
                                            icon: <Clock className="w-4 h-4" />
                                        },
                                        sukses: {
                                            label: 'Selesai / Sukses',
                                            bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
                                            icon: <CheckCircle className="w-4 h-4" />
                                        }
                                    };

                                    const currentStatus = statusConfig[task.status] || statusConfig.pending;

                                    return (
                                        <div 
                                            key={task.id} 
                                            className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-850 hover:border-slate-300 dark:hover:border-slate-700/80 rounded-3xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md dark:hover:shadow-indigo-950/20 transition-all duration-300 backdrop-blur-sm"
                                        >
                                            <div className="space-y-4">
                                                {/* Header card info */}
                                                <div className="flex justify-between items-start gap-2">
                                                    <div className="flex flex-col gap-1.5">
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${currentStatus.bg} flex items-center gap-1`}>
                                                            {currentStatus.icon}
                                                            {currentStatus.label}
                                                        </span>
                                                        <span className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-block self-start">
                                                            Kuota: {task.quota} orang
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">
                                                        #{task.id}
                                                    </span>
                                                </div>

                                                {/* Task Title & Details */}
                                                <div className="space-y-2">
                                                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base leading-snug">
                                                        {task.title}
                                                    </h3>
                                                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                                                        {task.description}
                                                    </p>
                                                </div>

                                                {/* Location Info */}
                                                {(task.target_room || task.campus_type) && (
                                                    <div className="flex flex-wrap gap-2 pt-1">
                                                        {task.target_room && (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-950 text-[11px] font-semibold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-850">
                                                                <Building className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                                                                {task.target_room}
                                                            </span>
                                                        )}
                                                        {task.campus_type && (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-950 text-[11px] font-semibold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-850">
                                                                <MapPin className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                                                                {task.campus_type}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Bottom Section */}
                                            <div className="border-t border-slate-100 dark:border-slate-850 pt-4 mt-5 space-y-3">
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-slate-500">Pengaju:</span>
                                                    <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                                        <User className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                                                        {task.reporter ? task.reporter.name : `${task.requester_name} (Umum)`}
                                                    </span>
                                                </div>

                                                {/* Student working info */}
                                                {task.students && task.students.length > 0 && (
                                                    <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-850 space-y-1">
                                                        <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                                                            Siswa Penanggung Jawab ({task.students.length} orang):
                                                        </p>
                                                        <div className="space-y-0.5">
                                                            {task.students.map(student => (
                                                                <div key={student.id} className="text-xs text-slate-700 dark:text-slate-300 font-medium flex justify-between">
                                                                    <span>• {student.name}</span>
                                                                    <span className="text-[10px] text-slate-400 dark:text-slate-500">({student.school_name || 'Sekolah'})</span>
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
                            <div className="bg-white dark:bg-slate-900/20 border border-slate-200 dark:border-slate-900 rounded-3xl py-12 text-center space-y-2 shadow-sm">
                                <ClipboardList className="w-10 h-10 text-slate-400 dark:text-slate-700 mx-auto" />
                                <h3 className="font-bold text-slate-800 dark:text-white text-sm">Tidak Ada Laporan Ditemukan</h3>
                                <p className="text-xs text-slate-500 max-w-md mx-auto">
                                    Silakan ubah kata kunci pencarian atau filter status untuk melihat daftar tugas lainnya.
                                </p>
                            </div>
                        )}

                    </div>

                </main>

                {/* Footer */}
                <footer className="py-6 text-center text-xs text-slate-500 border-t border-slate-200 dark:border-slate-900 max-w-7xl mx-auto w-full relative z-10 flex flex-col sm:flex-row items-center justify-between px-6 gap-2">
                    <span>Sistem Monitoring Geofencing & Gamifikasi PKL © 2026</span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-600">Built with TailwindCSS & Inertia.js</span>
                </footer>

            </div>
        </>
    );
}
