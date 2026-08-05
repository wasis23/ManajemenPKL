import { Head, Link, useForm } from '@inertiajs/react';
import React from 'react';
import ThemeToggle from '@/Components/ThemeToggle';
import { Compass, ArrowLeft, Send, MapPin, Building, User, Users, FileText, ClipboardList } from 'lucide-react';

export default function PublicCreate({ availableStudentsCount }) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        requester_name: '',
        target_room: '',
        campus_type: 'Kampus 1',
        quota: 1,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('tasks.public.store'));
    };

    return (
        <>
            <Head title="Ajukan Tugas PKL Baru" />
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
                                href={route('tasks.public.list')}
                                className="px-4 py-2.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white rounded-xl text-xs font-bold border border-slate-250 dark:border-slate-800 transition-colors flex items-center gap-1.5 shadow-sm"
                            >
                                <ClipboardList className="w-4 h-4 text-indigo-500" />
                                Pantau Daftar Tugas
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="max-w-3xl mx-auto w-full px-6 py-12 flex-1 flex flex-col justify-center relative z-10">
                    <div className="mb-6">
                        <Link 
                            href="/"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Beranda
                        </Link>
                    </div>

                    <div className="bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl dark:shadow-2xl space-y-6 backdrop-blur-md transition-colors duration-300">
                        <div className="border-b border-slate-200 dark:border-slate-800 pb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-600 dark:from-white dark:to-indigo-300 bg-clip-text text-transparent">
                                    Form Pengajuan Tugas / Laporan Baru
                                </h2>
                                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1.5">
                                    Laporkan masalah teknis atau ajukan tugas baru untuk dikerjakan langsung oleh para siswa magang (PKL). Tidak perlu masuk akun.
                                </p>
                            </div>
                            <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold rounded-xl shrink-0 self-start md:self-center">
                                Siswa PKL Tersedia: {availableStudentsCount[data.campus_type] ?? 0} orang
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {/* Requester Name */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <User className="w-3.5 h-3.5 text-indigo-500" />
                                        Nama Pengaju
                                    </label>
                                    <input
                                        type="text"
                                        value={data.requester_name}
                                        onChange={e => setData('requester_name', e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                        placeholder="Masukkan nama lengkap Anda..."
                                        required
                                    />
                                    {errors.requester_name && <p className="text-xs text-rose-500">{errors.requester_name}</p>}
                                </div>

                                {/* Target Room */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <Building className="w-3.5 h-3.5 text-indigo-500" />
                                        Ruangan Dituju
                                    </label>
                                    <input
                                        type="text"
                                        value={data.target_room}
                                        onChange={e => setData('target_room', e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                        placeholder="Contoh: Lab Komputer 3, Ruang Kajur..."
                                        required
                                    />
                                    {errors.target_room && <p className="text-xs text-rose-500">{errors.target_room}</p>}
                                </div>
                            </div>

                            {/* Title */}
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <FileText className="w-3.5 h-3.5 text-indigo-500" />
                                    Judul Tugas / Laporan
                                </label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={e => setData('title', e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                    placeholder="Contoh: Instalasi Kabel LAN Baru..."
                                    required
                                />
                                {errors.title && <p className="text-xs text-rose-500">{errors.title}</p>}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {/* Campus Type */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                                        Lokasi Kampus
                                    </label>
                                    <select
                                        value={data.campus_type}
                                        onChange={e => setData('campus_type', e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                        required
                                    >
                                        <option value="Kampus 1" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">Kampus 1</option>
                                        <option value="Kampus 2" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">Kampus 2</option>
                                    </select>
                                    {errors.campus_type && <p className="text-xs text-rose-500">{errors.campus_type}</p>}
                                </div>

                                {/* Quota / Jumlah Anak PKL */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <Users className="w-3.5 h-3.5 text-indigo-500" />
                                        Jumlah Anak PKL yang Dibutuhkan
                                    </label>
                                    <input
                                        type="number"
                                        value={data.quota}
                                        onChange={e => setData('quota', parseInt(e.target.value) || '')}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                        placeholder="Contoh: 1, 2..."
                                        min="1"
                                        required
                                    />
                                    {errors.quota && <p className="text-xs text-rose-500">{errors.quota}</p>}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                    Deskripsi & Petunjuk Masalah
                                </label>
                                <textarea
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    rows="4"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors resize-none"
                                    placeholder="Jelaskan secara mendetail detail masalah atau tugas yang diajukan agar mempermudah pengerjaan oleh anak PKL..."
                                    required
                                ></textarea>
                                {errors.description && <p className="text-xs text-rose-500">{errors.description}</p>}
                            </div>

                            {/* Submit Button */}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full py-4 bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white rounded-xl text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.01]"
                                >
                                    <Send className="w-4 h-4" />
                                    {processing ? 'Mengirim Pengajuan...' : 'Kirim Pengajuan Tugas'}
                                </button>
                            </div>
                        </form>
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
