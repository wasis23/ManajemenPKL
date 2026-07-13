import { Head, Link, useForm } from '@inertiajs/react';
import React from 'react';
import { Compass, ArrowLeft, Send, MapPin, Building, User, FileText, ClipboardList } from 'lucide-react';

export default function PublicCreate({ availableStudentsCount }) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        requester_name: '',
        target_room: '',
        campus_type: 'Kampus 1',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('tasks.public.store'));
    };

    return (
        <>
            <Head title="Ajukan Tugas PKL Baru" />
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
                        href={route('tasks.public.list')}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold border border-slate-800 transition-colors flex items-center gap-1.5"
                    >
                        <ClipboardList className="w-4 h-4" />
                        Pantau Daftar Tugas
                    </Link>
                </header>

                {/* Main Content */}
                <main className="max-w-3xl mx-auto w-full px-6 py-12 flex-1 flex flex-col justify-center">
                    <div className="mb-6">
                        <Link 
                            href="/"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Beranda
                        </Link>
                    </div>

                    <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 backdrop-blur-md">
                        <div className="border-b border-slate-800 pb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-black text-white bg-gradient-to-r from-white to-indigo-300 bg-clip-text text-transparent">
                                    Form Pengajuan Tugas / Laporan Baru
                                </h2>
                                <p className="text-sm text-slate-400 mt-2">
                                    Laporkan masalah teknis atau ajukan tugas baru untuk dikerjakan langsung oleh para siswa magang (PKL). Tidak perlu masuk akun.
                                </p>
                            </div>
                            <div className="px-4 py-2 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold rounded-xl shrink-0 self-start md:self-center">
                                Siswa PKL Tersedia: {availableStudentsCount} orang
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {/* Requester Name */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <User className="w-3.5 h-3.5 text-indigo-400" />
                                        Nama Pengaju
                                    </label>
                                    <input
                                        type="text"
                                        value={data.requester_name}
                                        onChange={e => setData('requester_name', e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                        placeholder="Masukkan nama lengkap Anda..."
                                        required
                                    />
                                    {errors.requester_name && <p className="text-xs text-rose-500">{errors.requester_name}</p>}
                                </div>

                                {/* Target Room */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <Building className="w-3.5 h-3.5 text-indigo-400" />
                                        Ruangan Dituju
                                    </label>
                                    <input
                                        type="text"
                                        value={data.target_room}
                                        onChange={e => setData('target_room', e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                        placeholder="Contoh: Lab Komputer 3, Ruang Kajur..."
                                        required
                                    />
                                    {errors.target_room && <p className="text-xs text-rose-500">{errors.target_room}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {/* Title */}
                                <div className="sm:col-span-1 space-y-2">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <FileText className="w-3.5 h-3.5 text-indigo-400" />
                                        Judul Tugas / Laporan
                                    </label>
                                    <input
                                        type="text"
                                        value={data.title}
                                        onChange={e => setData('title', e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                        placeholder="Contoh: Instalasi Kabel LAN Baru..."
                                        required
                                    />
                                    {errors.title && <p className="text-xs text-rose-500">{errors.title}</p>}
                                </div>

                                {/* Campus Type */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                                        Lokasi Kampus
                                    </label>
                                    <select
                                        value={data.campus_type}
                                        onChange={e => setData('campus_type', e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                        required
                                    >
                                        <option value="Kampus 1" className="bg-slate-950">Kampus 1</option>
                                        <option value="Kampus 2" className="bg-slate-950">Kampus 2</option>
                                    </select>
                                    {errors.campus_type && <p className="text-xs text-rose-500">{errors.campus_type}</p>}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    Deskripsi & Petunjuk Masalah
                                </label>
                                <textarea
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    rows="4"
                                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors resize-none"
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
                                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/30 transition-all hover:scale-[1.01]"
                                >
                                    <Send className="w-4 h-4" />
                                    {processing ? 'Mengirim Pengajuan...' : 'Kirim Pengajuan Tugas'}
                                </button>
                            </div>
                        </form>
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
