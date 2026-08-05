import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { 
    Trophy, Plus, Pencil, Trash2, CheckCircle, XCircle, 
    Star, Flame, UploadCloud, User, GraduationCap, Calendar, 
    Sparkles, ShieldCheck, Search
} from 'lucide-react';

export default function TopStudentsIndex({ auth, topStudents = [] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [imagePreview, setImagePreview] = useState(null);

    const form = useForm({
        name: '',
        school_name: '',
        major: '',
        period: dateToMonthYear(new Date()),
        points: 100,
        description: '',
        photo: null,
        is_active: true,
    });

    function dateToMonthYear(d) {
        const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        return `${months[d.getMonth()]} ${d.getFullYear()}`;
    }

    const openAddModal = () => {
        setEditingItem(null);
        setImagePreview(null);
        form.reset();
        form.setData({
            name: '',
            school_name: '',
            major: '',
            period: dateToMonthYear(new Date()),
            points: 100,
            description: '',
            photo: null,
            is_active: true,
        });
        setIsModalOpen(true);
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setImagePreview(item.photo_path || null);
        form.setData({
            name: item.name || '',
            school_name: item.school_name || '',
            major: item.major || '',
            period: item.period || '',
            points: item.points || 0,
            description: item.description || '',
            photo: null,
            is_active: Boolean(item.is_active),
        });
        setIsModalOpen(true);
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            form.setData('photo', file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingItem) {
            form.post(route('top-students.update', editingItem.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setIsModalOpen(false);
                    form.reset();
                },
            });
        } else {
            form.post(route('top-students.store'), {
                preserveScroll: true,
                onSuccess: () => {
                    setIsModalOpen(false);
                    form.reset();
                },
            });
        }
    };

    const handleToggleActive = (item) => {
        router.patch(route('top-students.toggle', item.id), {}, {
            preserveScroll: true,
        });
    };

    const handleDelete = (item) => {
        if (confirm(`Apakah Anda yakin ingin menghapus data PKL Terbaik "${item.name}"?`)) {
            router.delete(route('top-students.destroy', item.id), {
                preserveScroll: true,
            });
        }
    };

    const filteredStudents = topStudents.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.school_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.period && s.period.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const activeStudent = topStudents.find(s => s.is_active);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-tr from-amber-500 to-yellow-400 rounded-2xl shadow-lg shadow-amber-500/20 text-slate-950">
                            <Trophy className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="font-extrabold text-xl text-gray-900 dark:text-white tracking-tight">
                                Kelola PKL Terbaik (Student of the Month)
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Input dan atur peserta magang berprestasi secara manual untuk ditampilkan di panggung penghargaan landing page.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={openAddModal}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-bold rounded-xl text-sm shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02]"
                    >
                        <Plus className="w-4 h-4 stroke-[3]" /> Input PKL Terbaik Baru
                    </button>
                </div>
            }
        >
            <Head title="Kelola PKL Terbaik" />

            <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                
                {/* Active Spotlight Summary Banner */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                {activeStudent?.photo_path ? (
                                    <img 
                                        src={activeStudent.photo_path} 
                                        alt={activeStudent.name} 
                                        className="w-16 h-16 rounded-full object-cover border-2 border-amber-400 shadow-md"
                                    />
                                ) : (
                                    <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-300 font-black text-2xl">
                                        {activeStudent?.name ? activeStudent.name.charAt(0).toUpperCase() : '?'}
                                    </div>
                                )}
                                <div className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 p-1 rounded-full">
                                    <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                                    <Star className="w-3 h-3 fill-amber-400" /> Tampil Aktif di Landing Page
                                </div>
                                <h3 className="font-extrabold text-xl text-white">
                                    {activeStudent ? activeStudent.name : 'Belum Ada PKL Terbaik Aktif'}
                                </h3>
                                <p className="text-xs text-slate-300">
                                    {activeStudent ? `${activeStudent.school_name} ${activeStudent.major ? `• ${activeStudent.major}` : ''} (${activeStudent.period || 'Bulan Ini'})` : 'Pilih/aktifkan salah satu data di bawah untuk ditampilkan ke publik.'}
                                </p>
                            </div>
                        </div>

                        {activeStudent && (
                            <div className="bg-amber-500/10 border border-amber-500/30 px-5 py-3 rounded-2xl flex items-center gap-3">
                                <Flame className="w-6 h-6 text-amber-400 fill-amber-400 animate-bounce" />
                                <div>
                                    <div className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">Poin Kinerja</div>
                                    <div className="text-xl font-black text-white">{activeStudent.points} Poin</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Table & Controls Section */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="relative w-full sm:w-72">
                            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                            <input 
                                type="text"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder="Cari nama, sekolah, periode..."
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none dark:text-white"
                            />
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                            Total {topStudents.length} Data Tersimpan
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                            <thead className="bg-gray-50 dark:bg-gray-900/50 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
                                <tr>
                                    <th className="py-3.5 px-4">Peserta</th>
                                    <th className="py-3.5 px-4">Sekolah / Jurusan</th>
                                    <th className="py-3.5 px-4">Periode</th>
                                    <th className="py-3.5 px-4">Poin</th>
                                    <th className="py-3.5 px-4">Status Display</th>
                                    <th className="py-3.5 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {filteredStudents.length > 0 ? (
                                    filteredStudents.map((item) => (
                                        <tr key={item.id} className={`hover:bg-gray-50/50 dark:hover:bg-gray-750/50 transition-colors ${item.is_active ? 'bg-amber-50/30 dark:bg-amber-950/10' : ''}`}>
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-3">
                                                    {item.photo_path ? (
                                                        <img src={item.photo_path} alt={item.name} className="w-10 h-10 rounded-full object-cover border border-amber-300 shadow-sm" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-bold flex items-center justify-center">
                                                            {item.name.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                                                            {item.name}
                                                            {item.is_active && (
                                                                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 inline" />
                                                            )}
                                                        </div>
                                                        {item.description && (
                                                            <div className="text-xs text-gray-400 max-w-xs truncate">{item.description}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="font-semibold text-gray-800 dark:text-gray-200">{item.school_name}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">{item.major || '-'}</div>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                    <Calendar className="w-3 h-3 text-gray-400" />
                                                    {item.period || 'Bulan Ini'}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span className="font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                                    <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                                                    {item.points}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <button
                                                    onClick={() => handleToggleActive(item)}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                                                        item.is_active 
                                                            ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/30 hover:bg-amber-600' 
                                                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    {item.is_active ? (
                                                        <>
                                                            <CheckCircle className="w-3.5 h-3.5" />
                                                            AKTIF (Spotlight)
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle className="w-3.5 h-3.5 text-gray-400" />
                                                            Set Aktif
                                                        </>
                                                    )}
                                                </button>
                                            </td>
                                            <td className="py-3.5 px-4 text-right space-x-1">
                                                <button
                                                    onClick={() => openEditModal(item)}
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-colors"
                                                    title="Edit Data"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item)}
                                                    className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="py-12 text-center text-gray-400">
                                            <Trophy className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                                            Belum ada data PKL Terbaik yang diinputkan. Klik tombol "Input PKL Terbaik Baru" di atas.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Input & Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4 mb-5">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-amber-500" />
                                {editingItem ? 'Edit Data PKL Terbaik' : 'Input Data PKL Terbaik Baru'}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Photo Picker */}
                            <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50/50 dark:bg-gray-900/40">
                                {imagePreview ? (
                                    <div className="relative group">
                                        <img src={imagePreview} alt="Preview" className="w-24 h-24 rounded-full object-cover border-2 border-amber-500 shadow-md" />
                                        <label htmlFor="photo_upload" className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white text-xs font-bold opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                                            Ganti Foto
                                        </label>
                                    </div>
                                ) : (
                                    <label htmlFor="photo_upload" className="flex flex-col items-center cursor-pointer space-y-1">
                                        <div className="p-3 bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-full">
                                            <UploadCloud className="w-6 h-6" />
                                        </div>
                                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Unggah Foto Peserta (Opsional)</span>
                                        <span className="text-[10px] text-gray-400">PNG, JPG, WEBP hingga 2MB</span>
                                    </label>
                                )}
                                <input
                                    id="photo_upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                    className="hidden"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                        Nama Lengkap *
                                    </label>
                                    <input
                                        type="text"
                                        value={form.data.name}
                                        onChange={e => form.setData('name', e.target.value)}
                                        placeholder="Contoh: Ahmad Fauzi"
                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none dark:text-white"
                                        required
                                    />
                                    {form.errors.name && <p className="text-xs text-rose-500 mt-1">{form.errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                        Asal Sekolah / Universitas *
                                    </label>
                                    <input
                                        type="text"
                                        value={form.data.school_name}
                                        onChange={e => form.setData('school_name', e.target.value)}
                                        placeholder="Contoh: SMKN 1 Surakarta"
                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none dark:text-white"
                                        required
                                    />
                                    {form.errors.school_name && <p className="text-xs text-rose-500 mt-1">{form.errors.school_name}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                        Jurusan / Keahlian
                                    </label>
                                    <input
                                        type="text"
                                        value={form.data.major}
                                        onChange={e => form.setData('major', e.target.value)}
                                        placeholder="Contoh: Rekayasa Perangkat Lunak"
                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                        Periode Apresiasi
                                    </label>
                                    <input
                                        type="text"
                                        value={form.data.period}
                                        onChange={e => form.setData('period', e.target.value)}
                                        placeholder="Contoh: Agustus 2026"
                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                        Poin / Skor *
                                    </label>
                                    <input
                                        type="number"
                                        value={form.data.points}
                                        onChange={e => form.setData('points', parseInt(e.target.value) || 0)}
                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none dark:text-white"
                                        min="0"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                    Catatan Apresiasi / Alasan Terpilih
                                </label>
                                <textarea
                                    value={form.data.description}
                                    onChange={e => form.setData('description', e.target.value)}
                                    placeholder="Contoh: Atas kedisiplinan absensi 100% dan penyelesaian 25 tugas aduan lab dengan sempurna."
                                    rows="3"
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none dark:text-white"
                                ></textarea>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200/50 dark:border-amber-900/30">
                                <input
                                    id="is_active_checkbox"
                                    type="checkbox"
                                    checked={form.data.is_active}
                                    onChange={e => form.setData('is_active', e.target.checked)}
                                    className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500 border-gray-300"
                                />
                                <label htmlFor="is_active_checkbox" className="text-xs font-bold text-gray-700 dark:text-gray-300 cursor-pointer">
                                    Tampilkan langsung sebagai "Student of the Month" aktif di landing page
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-800"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-sm shadow-md shadow-amber-500/20"
                                >
                                    {editingItem ? 'Simpan Perubahan' : 'Tambah PKL Terbaik'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
