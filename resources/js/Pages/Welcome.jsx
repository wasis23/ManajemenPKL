import { Head, Link } from '@inertiajs/react';
import React from 'react';
import { Compass, Trophy, ClipboardList, Shield, Key, ArrowRight, Star, Crown, Award, Sparkles, Medal, GraduationCap, Flame, MapPin, Zap, CheckCircle2, Activity } from 'lucide-react';

export default function Welcome({ auth, topStudent = null, showTopStudent = true }) {
    return (
        <>
            <Head title="Sistem Geofencing PKL - Landing Page" />
            <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-600 selection:text-white relative overflow-hidden font-sans">
                
                {/* Background Ambient Glows & Grid Mesh */}
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none"></div>
                <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none"></div>
                <div className="absolute bottom-10 left-1/3 w-[550px] h-[550px] bg-amber-500/10 rounded-full blur-[150px] pointer-events-none"></div>
                
                {/* Subtle Grid Pattern Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none"></div>

                {/* Header/Navbar */}
                <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/70 border-b border-slate-800/60 transition-all">
                    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 border border-indigo-400/20">
                                <Compass className="w-5 h-5 text-white animate-spin-slow" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-lg font-black bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent tracking-tight">
                                    Geofence PKL
                                </span>
                                <span className="text-[10px] text-emerald-400 font-semibold tracking-wider flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> ONLINE
                                </span>
                            </div>
                        </div>

                        <nav className="flex items-center gap-3">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-950/50 hover:shadow-indigo-500/25 transition-all duration-300 flex items-center gap-2 border border-indigo-400/30 hover:scale-[1.02]"
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
                                        className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold border border-slate-700/80 hover:border-slate-600 transition-all shadow-sm"
                                    >
                                        Daftar PKL
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                {/* Main Hero Grid */}
                <main className="max-w-7xl mx-auto w-full px-6 py-12 flex-1 space-y-10 relative z-10">
                    
                    {/* Compact Modern Hero Title Banner */}
                    <div className="text-center space-y-4 max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold tracking-wider uppercase shadow-inner">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                            <span>Sistem Presensi Geofencing & Monitoring Magang</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                            Platform Magang Modern <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">Presisi GPS</span>
                        </h1>
                        
                        {/* Quick Feature Badges */}
                        <div className="flex flex-wrap justify-center gap-3 pt-1">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-semibold text-slate-300">
                                <MapPin className="w-3.5 h-3.5 text-indigo-400" /> Radius 50 Meter
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-semibold text-slate-300">
                                <Zap className="w-3.5 h-3.5 text-amber-400" /> Validasi Real-time
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-semibold text-slate-300">
                                <Trophy className="w-3.5 h-3.5 text-purple-400" /> Gamifikasi Poin
                            </span>
                        </div>
                    </div>

                    {/* Main Content Grid: Portal Akses Sistem (Left) & Hall of Fame & Award (Right) */}
                    <div className={`grid grid-cols-1 ${showTopStudent ? 'lg:grid-cols-2' : 'max-w-xl mx-auto'} gap-8 items-stretch`}>
                        
                        {/* Left Panel: Portal Akses Sistem */}
                        <div className="bg-slate-900/70 backdrop-blur-md p-8 rounded-3xl border border-slate-800/80 hover:border-indigo-500/40 shadow-2xl space-y-6 flex flex-col justify-between relative group transition-all duration-500 overflow-hidden">
                            {/* Glowing Inner Ambient Orb */}
                            <div className="absolute -top-24 -left-24 w-60 h-60 bg-indigo-500/10 blur-3xl group-hover:bg-indigo-500/20 transition-all duration-500 pointer-events-none"></div>

                            <div className="space-y-6 relative z-10">
                                <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                                            <Shield className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-white tracking-tight">Portal Akses Sistem</h3>
                                            <p className="text-xs text-slate-400">Presensi & Pengelolaan Tugas Magang</p>
                                        </div>
                                    </div>
                                    <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 text-[11px] font-bold border border-indigo-500/20">
                                        v2.0 Active
                                    </span>
                                </div>

                                <p className="text-sm text-slate-300 leading-relaxed">
                                    Silakan masuk ke akun Anda untuk melakukan presensi absensi berbasis GPS Geofencing atau memantau daftar penugasan magang harian secara langsung.
                                </p>

                                {/* Interactive Status Mockup */}
                                <div className="p-5 bg-slate-950/90 rounded-2xl border border-slate-800/90 space-y-3.5 shadow-inner">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-400 font-medium flex items-center gap-1.5">
                                            <MapPin className="w-4 h-4 text-emerald-400" /> Status Geofence
                                        </span>
                                        <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                                            Aktif (Radius 50m)
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center text-xs border-t border-slate-900/90 pt-3">
                                        <span className="text-slate-400 font-medium flex items-center gap-1.5">
                                            <Activity className="w-4 h-4 text-indigo-400" /> Akurasi Sensor GPS
                                        </span>
                                        <span className="text-indigo-400 font-bold bg-indigo-500/10 px-2.5 py-0.5 rounded-md border border-indigo-500/20">
                                            Tinggi (~5 Meter)
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center text-xs border-t border-slate-900/90 pt-3">
                                        <span className="text-slate-400 font-medium flex items-center gap-1.5">
                                            <CheckCircle2 className="w-4 h-4 text-amber-400" /> Toleransi Keterlambatan
                                        </span>
                                        <span className="text-amber-400 font-bold bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/20">
                                            60 Menit
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3 pt-6 relative z-10">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="w-full py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:shadow-[0_0_40px_rgba(168,85,247,0.5)] transition-all duration-300 hover:-translate-y-0.5"
                                    >
                                        Masuk ke Dashboard <ArrowRight className="w-4 h-4" />
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('tasks.public.create')}
                                            className="w-full py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-600 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:shadow-[0_0_40px_rgba(99,102,241,0.5)] transition-all duration-300 hover:-translate-y-0.5"
                                        >
                                            Ajukan Tugas Baru <ArrowRight className="w-4 h-4" />
                                        </Link>
                                        <Link
                                            href={route('tasks.public.list')}
                                            className="w-full py-3.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 hover:text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 border border-slate-700/80 transition-all duration-300 hover:-translate-y-0.5"
                                        >
                                            Pantau Daftar Tugas
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Right Panel: Hall of Fame & Award */}
                        {showTopStudent && (
                            <div className="bg-slate-900/70 backdrop-blur-md p-8 rounded-3xl border border-slate-800/80 hover:border-amber-500/40 shadow-2xl space-y-6 flex flex-col justify-between relative group transition-all duration-500 overflow-hidden">
                                {/* Glowing Amber Inner Ambient Orb */}
                                <div className="absolute -top-24 -right-24 w-60 h-60 bg-amber-500/15 blur-3xl group-hover:bg-amber-500/25 transition-all duration-500 pointer-events-none"></div>

                                <div className="space-y-6 relative z-10">
                                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                                                <Trophy className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-white tracking-tight">Hall of Fame & Award</h3>
                                                <p className="text-xs text-slate-400">Penghargaan Kinerja Magang</p>
                                            </div>
                                        </div>
                                        <span className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 text-[11px] font-black border border-amber-500/30 uppercase tracking-wider flex items-center gap-1 shadow-sm">
                                            <Crown className="w-3.5 h-3.5 text-amber-400" /> Student of the Month
                                        </span>
                                    </div>

                                    <p className="text-sm text-slate-300 leading-relaxed">
                                        Apresiasi tertinggi atas dedikasi kinerja luar biasa, kedisiplinan presensi, dan akumulasi poin terbanyak bagi peserta magang berprestasi.
                                    </p>

                                    {topStudent ? (
                                        <div className="bg-gradient-to-b from-amber-950/40 via-slate-950/90 to-slate-950 p-6 rounded-2xl border border-amber-500/40 shadow-xl relative group/card hover:border-amber-400/80 transition-all duration-300">
                                            <div className="text-center space-y-4">
                                                <div className="relative inline-block">
                                                    <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-200 p-1 shadow-[0_0_30px_rgba(245,158,11,0.3)] overflow-hidden">
                                                        {topStudent.photo_path ? (
                                                            <img src={topStudent.photo_path} alt={topStudent.name} className="w-full h-full rounded-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-3xl font-black text-amber-300">
                                                                {topStudent.name?.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="absolute -bottom-1 -right-1 bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 p-1.5 rounded-full shadow-lg">
                                                        <Crown className="w-4 h-4 fill-slate-950" />
                                                    </div>
                                                </div>

                                                <div className="space-y-1.5">
                                                    <span className="inline-block px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-extrabold uppercase tracking-wider">
                                                        ⭐ {topStudent.period ? `Periode ${topStudent.period}` : 'Champion #1'}
                                                    </span>
                                                    <h4 className="font-black text-xl text-white group-hover/card:text-amber-200 transition-colors line-clamp-1">
                                                        {topStudent.name}
                                                    </h4>
                                                    <p className="text-xs text-slate-300 font-medium line-clamp-1">
                                                        {topStudent.school_name || 'Peserta PKL'}
                                                    </p>
                                                    {topStudent.major && (
                                                        <p className="text-[11px] text-slate-400">Jurusan: {topStudent.major}</p>
                                                    )}
                                                </div>

                                                {topStudent.description && (
                                                    <p className="text-xs text-slate-300 italic bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
                                                        "{topStudent.description}"
                                                    </p>
                                                )}

                                                <div className="p-3.5 bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 rounded-xl border border-amber-500/40 flex items-center justify-between text-xs shadow-inner">
                                                    <span className="text-slate-300 font-medium flex items-center gap-1.5">
                                                        <Trophy className="w-4 h-4 text-amber-400" /> Akumulasi Poin Kinerja
                                                    </span>
                                                    <span className="font-black text-base text-amber-400 flex items-center gap-1">
                                                        <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-bounce" />
                                                        {topStudent.points} Poin
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-6 bg-slate-950/90 rounded-2xl border border-slate-800 text-center space-y-3">
                                            <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                                                <Trophy className="w-6 h-6" />
                                            </div>
                                            <h4 className="font-bold text-slate-200 text-sm">Papan Peringkat Bulan Ini</h4>
                                            <p className="text-xs text-slate-400 leading-relaxed">
                                                Penilaian poin reward sedang berjalan. Tingkatkan penyelesaian tugas magang Anda untuk menjadi Student of the Month!
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                </main>

                {/* Footer */}
                <footer className="py-6 text-center text-xs text-slate-500 border-t border-slate-900/80 max-w-7xl mx-auto w-full relative z-10 flex flex-col sm:flex-row items-center justify-between px-6 gap-2">
                    <span>Sistem Monitoring Geofencing & Gamifikasi PKL © 2026</span>
                    <span className="text-[11px] text-slate-600">Built with TailwindCSS & Inertia.js</span>
                </footer>

            </div>
        </>
    );
}
