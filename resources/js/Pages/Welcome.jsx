import { Head, Link } from '@inertiajs/react';
import React from 'react';
import { Compass, Trophy, Shield, ArrowRight, Crown, Sparkles, Flame, MapPin, Activity, CheckCircle2 } from 'lucide-react';

export default function Welcome({ auth, topStudent = null, showTopStudent = true }) {
    return (
        <>
            <Head title="Sistem Geofencing PKL - Landing Page" />
            <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-600 selection:text-white relative overflow-hidden font-sans">
                
                {/* Background Ambient Glows & Grid Mesh */}
                <div className="absolute -top-24 left-1/4 w-[700px] h-[700px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none"></div>
                <div className="absolute top-1/2 right-10 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[160px] pointer-events-none"></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"></div>

                {/* Header / Navbar */}
                <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-900">
                    <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
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

                {/* Main Hero & Seamless Content Layout */}
                <main className="max-w-7xl mx-auto w-full px-6 py-16 flex-1 relative z-10 flex flex-col justify-center">
                    
                    <div className={`grid grid-cols-1 ${showTopStudent ? 'lg:grid-cols-12' : 'max-w-3xl mx-auto'} gap-12 lg:gap-16 items-center`}>
                        
                        {/* Portal Akses Sistem (Fluid Layout - No Box Containers) */}
                        <div className={`${showTopStudent ? 'lg:col-span-6' : 'w-full'} space-y-8`}>
                            
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold tracking-wider uppercase">
                                    <Shield className="w-4 h-4 text-indigo-400" />
                                    <span>Portal Akses Sistem</span>
                                </div>
                                <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                                    Presensi Real-time & <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">Manajemen Tugas Magang</span>
                                </h1>
                                <p className="text-base text-slate-400 leading-relaxed max-w-xl">
                                    Silakan masuk ke akun Anda untuk mulai melakukan presensi berbasis lokasi atau mengelola tugas magang Anda.
                                </p>
                            </div>

                            {/* Fluid Live Specs Indicator (No Box) */}
                            <div className="py-4 border-y border-slate-900 grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div className="space-y-1">
                                    <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Geofence
                                    </div>
                                    <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                        Radius 50m
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                                        <Activity className="w-3.5 h-3.5 text-indigo-400" /> GPS Sensor
                                    </div>
                                    <div className="text-sm font-bold text-indigo-300">
                                        Akurasi ~5m
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Toleransi
                                    </div>
                                    <div className="text-sm font-bold text-amber-300">
                                        60 Menit
                                    </div>
                                </div>
                            </div>

                            {/* CTAs */}
                            <div className="flex flex-col sm:flex-row gap-4 pt-2">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white rounded-2xl text-base font-bold flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(99,102,241,0.35)] hover:shadow-[0_0_45px_rgba(168,85,247,0.5)] transition-all duration-300 hover:-translate-y-0.5"
                                    >
                                        Masuk ke Dashboard <ArrowRight className="w-5 h-5" />
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('tasks.public.create')}
                                            className="px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-600 text-white rounded-2xl text-base font-bold flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(99,102,241,0.35)] hover:shadow-[0_0_45px_rgba(99,102,241,0.5)] transition-all duration-300 hover:-translate-y-0.5"
                                        >
                                            Ajukan Tugas Baru <ArrowRight className="w-5 h-5" />
                                        </Link>
                                        <Link
                                            href={route('tasks.public.list')}
                                            className="px-6 py-4 bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white rounded-2xl text-base font-bold flex items-center justify-center gap-2 border border-slate-800 transition-all duration-300 hover:-translate-y-0.5"
                                        >
                                            Pantau Daftar Tugas
                                        </Link>
                                    </>
                                )}
                            </div>

                        </div>

                        {/* Hall of Fame & Award (Spotlight Showcase - Fluid & Borderless) */}
                        {showTopStudent && (
                            <div className="lg:col-span-6 relative flex flex-col justify-center">
                                
                                {/* Background Glow behind Spotlight */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/15 blur-[120px] pointer-events-none"></div>

                                <div className="space-y-6 relative z-10">
                                    <div className="space-y-3 text-left">
                                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold tracking-wider uppercase">
                                            <Trophy className="w-4 h-4 text-amber-400" />
                                            <span>Hall of Fame & Award</span>
                                        </div>
                                        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                            Student of the Month
                                        </h2>
                                        <p className="text-sm text-slate-400 leading-relaxed max-w-lg">
                                            Apresiasi tertinggi atas dedikasi kinerja luar biasa, kedisiplinan presensi, dan akumulasi poin terbanyak bagi peserta magang berprestasi.
                                        </p>
                                    </div>

                                    {topStudent ? (
                                        <div className="relative pt-4">
                                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                                                
                                                {/* Profile Photo / Avatar */}
                                                <div className="relative shrink-0">
                                                    <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-200 p-1 shadow-[0_0_40px_rgba(245,158,11,0.3)] overflow-hidden">
                                                        {topStudent.photo_path ? (
                                                            <img src={topStudent.photo_path} alt={topStudent.name} className="w-full h-full rounded-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-4xl font-black text-amber-300">
                                                                {topStudent.name?.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="absolute -bottom-1 -right-1 bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 p-2 rounded-full shadow-lg">
                                                        <Crown className="w-5 h-5 fill-slate-950" />
                                                    </div>
                                                </div>

                                                {/* Details */}
                                                <div className="space-y-3 text-center sm:text-left flex-1">
                                                    <div className="space-y-1">
                                                        <span className="inline-block px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-extrabold uppercase tracking-wider">
                                                            ⭐ {topStudent.period ? `Periode ${topStudent.period}` : 'Champion #1'}
                                                        </span>
                                                        <h3 className="text-2xl font-black text-white bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
                                                            {topStudent.name}
                                                        </h3>
                                                        <p className="text-sm font-semibold text-slate-300">
                                                            {topStudent.school_name || 'Peserta PKL'}
                                                            {topStudent.major && <span className="text-slate-500"> • {topStudent.major}</span>}
                                                        </p>
                                                    </div>

                                                    {topStudent.description && (
                                                        <p className="text-xs text-slate-400 italic leading-relaxed">
                                                            "{topStudent.description}"
                                                        </p>
                                                    )}

                                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 font-bold text-sm">
                                                        <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-bounce" />
                                                        <span>{topStudent.points} Poin Kinerja</span>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    ) : (
                                        <div className="py-6 space-y-2">
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
