import { Head, Link } from '@inertiajs/react';
import React, { useState } from 'react';
import ThemeToggle from '@/Components/ThemeToggle';
import { Compass, ArrowLeft, ClipboardList, MapPin, Building, User, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function PublicList({ tasks = [] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Filter tasks based on search term and selected status
    const filteredTasks = tasks.filter(task => {
        const matchesSearch = 
            task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (task.requester_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (task.reporter?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (task.target_room || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' ? true : task.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <>
            <Head title="Daftar Pengajuan Tugas PKL" />
            <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col justify-between selection:bg-indigo-600 selection:text-white relative overflow-hidden font-sans transition-colors duration-300">
                
                {/* Background Ambient Glows & Grid Mesh */}
                <div className="absolute -top-24 left-1/4 w-[700px] h-[700px] bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none"></div>
                <div className="absolute top-1/3 right-10 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[160px] pointer-events-none"></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e120_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e120_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),gradient-to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"></div>

                {/* Header */}
                <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-900 transition-colors duration-300">
                    <div className="max-w-7xl mx-auto w-full px-6 py-4 flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-2.5 group">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 border border-indigo-400/20 group-hover:scale-105 transition-transform">
                                <Compass className="w-5 h-5 text-white animate-spin-slow" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-black bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-600 dark:from-white dark:via-indigo-200 dark:to-indigo-400 bg-clip-text text-transparent tracking-tight">
                                    Geofence PKL
                                </span>
                            </div>
                        </Link>

                        <div className="flex items-center gap-3">
                            <ThemeToggle />
                            <Link
                                href={route('tasks.public.create')}
                                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02] flex items-center gap-1.5"
                            >
                                + Ajukan Tugas Baru
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="max-w-7xl mx-auto w-full px-6 py-12 flex-1 flex flex-col relative z-10">
                    <div className="mb-6 flex justify-between items-center">
                        <Link 
                            href="/"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Beranda
                        </Link>
                    </div>

                    <div className="space-y-8">
                        {/* Title and stats summary */}
                        <div className="border-b border-slate-200 dark:border-slate-900 pb-5">
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-600 dark:from-white dark:to-slate-350 bg-clip-text text-transparent">
                                <ClipboardList className="w-8 h-8 text-indigo-500" />
                                Daftar List Tugas & Laporan Aduan
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2">
                                Pantau status pengerjaan masalah teknis atau tugas yang diajukan secara real-time.
                            </p>
                        </div>

                        {/* Search & Filter bar */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/80 dark:bg-slate-900/40 p-4 border border-slate-200 dark:border-slate-900 rounded-2xl shadow-sm">
                            <div className="md:col-span-2">
                                <input
                                    type="text"
                                    placeholder="Cari tugas berdasarkan judul, pelapor, ruangan..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                />
                            </div>
                            <div>
                                <select
                                    value={statusFilter}
                                    onChange={e => setStatusFilter(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                >
                                    <option value="all">Semua Status</option>
                                    <option value="pending">Menunggu Kuota / Belum Diambil</option>
                                    <option value="proses">Sedang Dikerjakan</option>
                                    <option value="sukses">Selesai</option>
                                </select>
                            </div>
                        </div>

                        {/* Live Task Grid */}
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
                                            className="bg-white/80 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-850 hover:border-slate-300 dark:hover:border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-sm hover:shadow-xl dark:hover:shadow-indigo-950/20 transition-all duration-300 backdrop-blur-sm"
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
                                                    <h3 className="font-extrabold text-slate-900 dark:text-white text-lg leading-snug hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                                        {task.title}
                                                    </h3>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-4">
                                                        {task.description}
                                                    </p>
                                                </div>

                                                {/* Location Info */}
                                                {(task.target_room || task.campus_type) && (
                                                    <div className="flex flex-wrap gap-3 pt-2">
                                                        {task.target_room && (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-950 text-xs font-semibold text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-850">
                                                                <Building className="w-3.5 h-3.5 text-indigo-500" />
                                                                Ruang: {task.target_room}
                                                            </span>
                                                        )}
                                                        {task.campus_type && (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-950 text-xs font-semibold text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-850">
                                                                <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                                                                {task.campus_type}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Bottom Section */}
                                            <div className="border-t border-slate-200 dark:border-slate-850 pt-4 mt-5 space-y-3">
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
                                                                <div key={student.id} className="text-xs text-slate-700 dark:text-slate-350 font-medium flex justify-between">
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
                            <div className="bg-white/50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-900 rounded-3xl py-16 text-center shadow-sm">
                                <ClipboardList className="w-12 h-12 text-slate-400 dark:text-slate-700 mx-auto mb-3" />
                                <h3 className="font-bold text-slate-800 dark:text-white text-base">Tidak Ada Laporan Ditemukan</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1 max-w-md mx-auto">
                                    Silakan ubah filter pencarian atau ajukan tugas baru menggunakan tombol di kanan atas.
                                </p>
                            </div>
                        )}
                    </div>
                </main>

                {/* Footer */}
                <footer className="py-6 text-center text-xs text-slate-500 dark:text-slate-600 border-t border-slate-200 dark:border-slate-900 max-w-7xl mx-auto w-full relative z-10">
                    Sistem Monitoring Geofencing & Gamifikasi PKL © 2026. Made with Tailwind & Inertia.js.
                </footer>

            </div>
        </>
    );
}
