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
                <main className="max-w-7xl mx-auto w-full px-6 py-12 flex-1 space-y-12">
                    
                    {/* Main Content Grid: Portal Akses Sistem (Left) & Hall of Fame & Award (Right) */}
                    <div className={`grid grid-cols-1 ${showTopStudent ? 'lg:grid-cols-2' : 'max-w-xl mx-auto'} gap-8 items-stretch`}>
                        
                        {/* Left Panel: Portal Akses Sistem */}
                        <div className="bg-gradient-to-b from-slate-900 to-slate-950 p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6 flex flex-col justify-between">
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
                                    <Shield className="w-5 h-5 text-indigo-400" />
                                    <h3 className="font-bold text-base text-white">Portal Akses Sistem</h3>
                                </div>

                                <p className="text-sm text-slate-400 leading-relaxed">
                                    Silakan masuk ke akun Anda untuk mulai melakukan presensi berbasis lokasi atau mengelola tugas magang Anda.
                                </p>

                                {/* Interactive Status Mockup */}
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

                        {/* Right Panel: Hall of Fame & Award */}
                        {showTopStudent && (
                            <div className="bg-gradient-to-b from-slate-900 to-slate-950 p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6 flex flex-col justify-between">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                                        <div className="flex items-center gap-2">
                                            <Trophy className="w-5 h-5 text-amber-400" />
                                            <h3 className="font-bold text-base text-white">Hall of Fame & Award</h3>
                                        </div>
                                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 text-[10px] font-bold border border-amber-500/20 uppercase tracking-wider">
                                            Student of the Month
                                        </span>
                                    </div>

                                    <p className="text-sm text-slate-400 leading-relaxed">
                                        Apresiasi tertinggi atas dedikasi kinerja luar biasa, kedisiplinan presensi, dan akumulasi poin terbanyak bagi peserta magang berprestasi.
                                    </p>

                                    {topStudent ? (
                                        <div className="bg-gradient-to-b from-amber-950/40 via-slate-900/90 to-slate-950 p-6 rounded-2xl border border-amber-500/40 shadow-lg relative group hover:border-amber-400 transition-all duration-300">
                                            <div className="text-center space-y-4">
                                                <div className="relative inline-block">
                                                    <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 p-1 shadow-xl shadow-amber-500/20 overflow-hidden">
                                                        {topStudent.photo_path ? (
                                                            <img src={topStudent.photo_path} alt={topStudent.name} className="w-full h-full rounded-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-3xl font-black text-amber-300">
                                                                {topStudent.name?.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 p-1.5 rounded-full shadow">
                                                        <Crown className="w-4 h-4 fill-slate-950" />
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <span className="inline-block px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-extrabold uppercase tracking-wider">
                                                        ⭐ {topStudent.period ? `Periode ${topStudent.period}` : 'Champion #1'}
                                                    </span>
                                                    <h4 className="font-extrabold text-xl text-white group-hover:text-amber-200 transition-colors line-clamp-1">{topStudent.name}</h4>
                                                    <p className="text-xs text-slate-300 font-medium line-clamp-1">{topStudent.school_name || 'Peserta PKL'}</p>
                                                    {topStudent.major && (
                                                        <p className="text-[11px] text-slate-400">Jurusan: {topStudent.major}</p>
                                                    )}
                                                </div>

                                                {topStudent.description && (
                                                    <p className="text-xs text-slate-300 italic bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                                                        "{topStudent.description}"
                                                    </p>
                                                )}

                                                <div className="p-3 bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 rounded-xl border border-amber-500/30 flex items-center justify-between text-xs">
                                                    <span className="text-slate-400 font-medium">Akumulasi Poin Kinerja</span>
                                                    <span className="font-black text-base text-amber-400 flex items-center gap-1">
                                                        <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-bounce" />
                                                        {topStudent.points} Poin
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-6 bg-slate-950/80 rounded-2xl border border-slate-850 text-center space-y-2">
                                            <Trophy className="w-8 h-8 text-amber-400/50 mx-auto" />
                                            <h4 className="font-bold text-slate-300 text-sm">Papan Peringkat Bulan Ini</h4>
                                            <p className="text-xs text-slate-500 leading-relaxed">Penilaian poin reward sedang berjalan. Tingkatkan penyelesaian tugas magang Anda untuk menjadi Student of the Month!</p>
                                        </div>
                                    )}
                                </div>
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
