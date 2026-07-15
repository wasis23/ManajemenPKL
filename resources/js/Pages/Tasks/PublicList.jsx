import { Head, Link } from '@inertiajs/react';
import React, { useState } from 'react';
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
            <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-600 selection:text-white">
                
                {/* Header */}
                <header className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between border-b border-slate-900">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
                            <Compass className="w-6 h-6 text-white animate-spin-slow" />
                        </div>
                        <span className="text-xl font-black bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
                            Geofence PKL
                        </span>
                    </Link>

                    <Link
                        href={route('tasks.public.create')}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-950 transition-colors flex items-center gap-1.5"
                    >
                        + Ajukan Tugas Baru
                    </Link>
                </header>

                {/* Main Content */}
                <main className="max-w-7xl mx-auto w-full px-6 py-12 flex-1 flex flex-col">
                    <div className="mb-6 flex justify-between items-center">
                        <Link 
                            href="/"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Beranda
                        </Link>
                    </div>

                    <div className="space-y-8">
                        {/* Title and stats summary */}
                        <div className="border-b border-slate-900 pb-5">
                            <h1 className="text-3xl font-black text-white flex items-center gap-2 bg-gradient-to-r from-white to-slate-350 bg-clip-text text-transparent">
                                <ClipboardList className="w-8 h-8 text-indigo-500" />
                                Daftar List Tugas & Laporan Aduan
                            </h1>
                            <p className="text-sm text-slate-400 mt-2">
                                Pantau status pengerjaan masalah teknis atau tugas yang diajukan secara real-time.
                            </p>
                        </div>

                        {/* Search & Filter bar */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/40 p-4 border border-slate-900 rounded-2xl">
                            <div className="md:col-span-2">
                                <input
                                    type="text"
                                    placeholder="Cari tugas berdasarkan judul, pelapor, ruangan..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                />
                            </div>
                            <div>
                                <select
                                    value={statusFilter}
                                    onChange={e => setStatusFilter(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
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
                                            className="bg-slate-900/40 border border-slate-850 hover:border-slate-800 rounded-3xl p-6 flex flex-col justify-between hover:shadow-xl hover:shadow-indigo-950/20 transition-all duration-300 backdrop-blur-sm"
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
                                                    <h3 className="font-extrabold text-white text-lg leading-snug group-hover:text-indigo-400 transition-colors">
                                                        {task.title}
                                                    </h3>
                                                    <p className="text-sm text-slate-400 leading-relaxed line-clamp-4">
                                                        {task.description}
                                                    </p>
                                                </div>

                                                {/* Location Info */}
                                                {(task.target_room || task.campus_type) && (
                                                    <div className="flex flex-wrap gap-3 pt-2">
                                                        {task.target_room && (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 text-xs font-semibold text-slate-400 border border-slate-850">
                                                                <Building className="w-3.5 h-3.5 text-indigo-400" />
                                                                Ruang: {task.target_room}
                                                            </span>
                                                        )}
                                                        {task.campus_type && (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 text-xs font-semibold text-slate-400 border border-slate-850">
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
                                                                <div key={student.id} className="text-xs text-slate-350 font-medium flex justify-between">
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
                            <div className="bg-slate-900/20 border border-slate-900 rounded-3xl py-16 text-center">
                                <ClipboardList className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                                <h3 className="font-bold text-white text-base">Tidak Ada Laporan Ditemukan</h3>
                                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                                    Silakan ubah filter pencarian atau ajukan tugas baru menggunakan tombol di kanan atas.
                                </p>
                            </div>
                        )}
                    </div>
                </main>

                {/* Footer */}
                <footer className="py-6 text-center text-xs text-slate-600 border-t border-slate-900 max-w-7xl mx-auto w-full">
                    Sistem Monitoring Geofencing & Gamifikasi PKL © 2026. Made with Tailwind & Inertia.js.
                </footer>

            </div>
        </>
    );
}
