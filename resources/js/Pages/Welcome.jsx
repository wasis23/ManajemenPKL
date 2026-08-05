import { Head, Link } from '@inertiajs/react';
import React from 'react';
import { Compass, Trophy, ClipboardList, Shield, Key, ArrowRight, Star, Crown, Award, Sparkles, Medal, GraduationCap, Flame } from 'lucide-react';

export default function Welcome({ auth, topStudent = null, showTopStudent = true }) {
    return (
        <>
            <Head title="Sistem Geofencing PKL - Landing Page" />
            <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-600 selection:text-white">
                
                {/* Header/Navbar */}
                <header className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between border-b border-slate-900">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <Compass className="w-6 h-6 text-white animate-spin-slow" />
                        </div>
                        <span className="text-xl font-black bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
                            Geofence PKL
                        </span>
                    </div>

                    <nav className="flex gap-4">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-950 transition-all flex items-center gap-1"
                            >
                                Buka Dashboard <ArrowRight className="w-4 h-4" />
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
                                    className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold border border-slate-700 transition-colors"
                                >
                                    Daftar PKL
                                </Link>
                            </>
                        )}
                    </nav>
                </header>

                {/* Hero / Main Section */}
                <main className="max-w-7xl mx-auto w-full px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center flex-1">
                    
                    {/* Left Panel: Introduction & Showcase */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-800 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                            <Star className="w-3.5 h-3.5 fill-indigo-400" /> Geofencing & Reward System
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white">
                            Kelola Magang & Penugasan Dengan <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Presisi GPS</span>
                        </h1>

                        <p className="text-base text-slate-400 max-w-xl leading-relaxed">
                            Aplikasi monitoring PKL yang memvalidasi absensi masuk/pulang harian menggunakan radar Geofencing 50 meter dan memotivasi kinerja dengan gamifikasi papan peringkat (leaderboard) berbasis tugas aduan.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                            <div className="p-4 bg-slate-900/60 border border-slate-900 rounded-xl space-y-2">
                                <Compass className="w-6 h-6 text-indigo-400" />
                                <h4 className="font-bold text-sm text-white">Radar 50m</h4>
                                <p className="text-xs text-slate-500">Validasi presisi jarak koordinat di sisi server.</p>
                            </div>
                            <div className="p-4 bg-slate-900/60 border border-slate-900 rounded-xl space-y-2">
                                <ClipboardList className="w-6 h-6 text-purple-400" />
                                <h4 className="font-bold text-sm text-white">Tugas Aduan</h4>
                                <p className="text-xs text-slate-500">Kuota pengambilan dinamis & upload bukti foto.</p>
                            </div>
                            <div className="p-4 bg-slate-900/60 border border-slate-900 rounded-xl space-y-2">
                                <Trophy className="w-6 h-6 text-amber-400" />
                                <h4 className="font-bold text-sm text-white">Leaderboard</h4>
                                <p className="text-xs text-slate-500">Poin reward khusus tugas mandiri vs dibantu.</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Premium Call-to-Action & System Status Preview */}
                    <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 to-slate-950 p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
                        <div className="flex items-center gap-2 border-b border-slate-850 pb-4">
                            <Shield className="w-5 h-5 text-indigo-400" />
                            <h3 className="font-bold text-base text-white">Portal Akses Sistem</h3>
                        </div>

                        <p className="text-sm text-slate-400 leading-relaxed">
                            Silakan masuk ke akun Anda untuk mulai melakukan presensi berbasis lokasi atau mengelola tugas magang Anda.
                        </p>

                        {/* Interactive Status Mockup for Rich Aesthetics */}
                        <div className="p-5 bg-slate-950/80 rounded-2xl border border-slate-850 space-y-4">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400 font-medium">Status Geofence</span>
                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                                    Aktif (Radius 50m)
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-xs border-t border-slate-900 pt-3">
                                <span className="text-slate-400 font-medium">Akurasi GPS</span>
                                <span className="text-indigo-400 font-semibold">Tinggi (~5 meter)</span>
                            </div>
                            <div className="flex justify-between items-center text-xs border-t border-slate-900 pt-3">
                                <span className="text-slate-400 font-medium">Toleransi Terlambat</span>
                                <span className="text-amber-400 font-semibold">60 Menit</span>
                            </div>
                        </div>

                        <div className="space-y-3 pt-4">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-900/30 transition-all hover:scale-[1.02]"
                                >
                                    Masuk ke Dashboard <ArrowRight className="w-4 h-4" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('tasks.public.create')}
                                        className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-900/30 transition-all hover:scale-[1.02]"
                                    >
                                        Ajukan Tugas Baru <ArrowRight className="w-4 h-4" />
                                    </Link>
                                    <Link
                                        href={route('tasks.public.list')}
                                        className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 border border-slate-700 transition-all hover:scale-[1.02]"
                                    >
                                        Pantau Daftar Tugas
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                </main>

                {/* Best PKL Student of the Month Section (Controlled by Admin toggle) */}
                {showTopStudent && (
                    <section className="max-w-7xl mx-auto w-full px-6 py-16 border-t border-slate-900/80">
                        <div className="text-center space-y-4 mb-12">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-transparent border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-widest shadow-lg shadow-amber-500/5">
                                <Trophy className="w-4 h-4 text-amber-400 animate-pulse" />
                                <span>Hall of Fame & Award</span>
                            </div>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                                Anak PKL Terbaik <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent">Bulan Ini</span>
                            </h2>
                            <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
                                Apresiasi tertinggi atas dedikasi kinerja luar biasa, kedisiplinan presensi, dan akumulasi poin terbanyak bagi peserta magang berprestasi.
                            </p>
                        </div>

                        {topStudent ? (
                            <div className="max-w-md mx-auto">
                                {/* Single Spotlight Card */}
                                <div className="bg-gradient-to-b from-amber-950/60 via-slate-900/90 to-slate-950 p-8 rounded-3xl border-2 border-amber-500/60 shadow-[0_0_60px_rgba(245,158,11,0.3)] relative group hover:border-amber-400 hover:shadow-[0_0_80px_rgba(245,158,11,0.45)] transition-all duration-300">
                                    {/* Glowing Background Blur Orb */}
                                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/20 blur-3xl pointer-events-none"></div>

                                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 text-xs font-black px-5 py-1.5 rounded-full flex items-center gap-2 shadow-lg shadow-amber-500/30 uppercase tracking-wider whitespace-nowrap">
                                        <Crown className="w-4 h-4 fill-slate-950" /> Student of the Month
                                    </div>

                                    <div className="text-center pt-5 space-y-5">
                                        <div className="relative inline-block">
                                            <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 p-1 shadow-2xl shadow-amber-500/30 overflow-hidden">
                                                {topStudent.photo_path ? (
                                                    <img src={topStudent.photo_path} alt={topStudent.name} className="w-full h-full rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-4xl font-black text-amber-300">
                                                        {topStudent.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="absolute -bottom-2 -right-1 bg-amber-500 text-slate-950 p-2 rounded-full shadow-lg">
                                                <Sparkles className="w-5 h-5 fill-slate-950 animate-spin-slow" />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <span className="inline-block px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-extrabold uppercase tracking-widest">
                                                ⭐ {topStudent.period ? `Periode ${topStudent.period}` : 'Champion #1'}
                                            </span>
                                            <h3 className="font-extrabold text-2xl text-white group-hover:text-amber-200 transition-colors line-clamp-1">{topStudent.name}</h3>
                                            <p className="text-sm text-slate-300 font-medium line-clamp-1">{topStudent.school_name || 'Peserta PKL'}</p>
                                            {topStudent.major && (
                                                <p className="text-xs text-slate-400">Jurusan: {topStudent.major}</p>
                                            )}
                                        </div>

                                        {topStudent.description && (
                                            <p className="text-xs text-slate-300 italic bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                                                "{topStudent.description}"
                                            </p>
                                        )}

                                        <div className="p-4 bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 rounded-2xl border border-amber-500/30 flex items-center justify-between text-sm shadow-inner">
                                            <span className="text-slate-400 font-medium">Akumulasi Poin Kinerja</span>
                                            <span className="font-black text-lg text-amber-400 flex items-center gap-1.5">
                                                <Flame className="w-5 h-5 text-amber-500 fill-amber-500 animate-bounce" />
                                                {topStudent.points} Poin
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="max-w-md mx-auto p-8 bg-slate-900/60 rounded-3xl border border-slate-800 text-center space-y-3 shadow-xl">
                                <Trophy className="w-10 h-10 text-amber-400/50 mx-auto" />
                                <h4 className="font-bold text-slate-300 text-base">Papan Peringkat Bulan Ini</h4>
                                <p className="text-xs text-slate-500 leading-relaxed">Penilaian poin reward sedang berjalan. Tingkatkan penyelesaian tugas magang Anda untuk menjadi Student of the Month!</p>
                            </div>
                        )}
                    </section>
                )}

                {/* Footer */}
                <footer className="py-6 text-center text-xs text-slate-600 border-t border-slate-900 max-w-7xl mx-auto w-full">
                    Sistem Monitoring Geofencing & Gamifikasi PKL © 2026. Made with Tailwind & Inertia.js.
                </footer>

            </div>
        </>
    );
}
