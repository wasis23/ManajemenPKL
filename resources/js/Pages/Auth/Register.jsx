import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        school_name: '',
        major: '',
        whatsapp_number: '',
        address: '',
        date_of_birth: '',
        start_date: '',
        end_date: '',
        social_media: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Daftar Akun PKL" />

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="name" value="Nama Lengkap" />

                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />

                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="school_name" value="Nama Sekolah" />

                    <TextInput
                        id="school_name"
                        name="school_name"
                        value={data.school_name}
                        className="mt-1 block w-full"
                        autoComplete="organization"
                        onChange={(e) => setData('school_name', e.target.value)}
                        required
                    />

                    <InputError message={errors.school_name} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="major" value="Jurusan Sekolah" />

                    <TextInput
                        id="major"
                        name="major"
                        value={data.major}
                        className="mt-1 block w-full"
                        placeholder="Contoh: Rekayasa Perangkat Lunak, Multimedia"
                        onChange={(e) => setData('major', e.target.value)}
                        required
                    />

                    <InputError message={errors.major} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="whatsapp_number" value="No. WhatsApp" />

                    <TextInput
                        id="whatsapp_number"
                        name="whatsapp_number"
                        value={data.whatsapp_number}
                        className="mt-1 block w-full"
                        placeholder="Contoh: 081234567890"
                        onChange={(e) => setData('whatsapp_number', e.target.value)}
                        required
                    />

                    <InputError message={errors.whatsapp_number} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="address" value="Alamat Lengkap" />

                    <textarea
                        id="address"
                        name="address"
                        value={data.address}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-750 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                        placeholder="Masukkan alamat domisili saat ini"
                        onChange={(e) => setData('address', e.target.value)}
                        required
                        rows="3"
                    />

                    <InputError message={errors.address} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="date_of_birth" value="Tanggal Lahir" />

                    <TextInput
                        id="date_of_birth"
                        type="date"
                        name="date_of_birth"
                        value={data.date_of_birth}
                        className="mt-1 block w-full"
                        onChange={(e) => setData('date_of_birth', e.target.value)}
                        required
                    />

                    <InputError message={errors.date_of_birth} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="start_date" value="Tanggal Mulai PKL" />

                    <TextInput
                        id="start_date"
                        type="date"
                        name="start_date"
                        value={data.start_date}
                        className="mt-1 block w-full"
                        onChange={(e) => setData('start_date', e.target.value)}
                        required
                    />

                    <InputError message={errors.start_date} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="end_date" value="Tanggal Selesai PKL" />

                    <TextInput
                        id="end_date"
                        type="date"
                        name="end_date"
                        value={data.end_date}
                        className="mt-1 block w-full"
                        onChange={(e) => setData('end_date', e.target.value)}
                        required
                    />

                    <InputError message={errors.end_date} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="social_media" value="Akun Media Sosial (Opsional)" />

                    <TextInput
                        id="social_media"
                        name="social_media"
                        value={data.social_media}
                        className="mt-1 block w-full"
                        placeholder="Contoh: @instagram_handle / linkedin_url"
                        onChange={(e) => setData('social_media', e.target.value)}
                    />

                    <InputError message={errors.social_media} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Konfirmasi Password"
                    />

                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        required
                    />

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                <div className="mt-6 flex items-center justify-end">
                    <Link
                        href={route('login')}
                        className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:text-gray-400 dark:hover:text-gray-100 dark:focus:ring-offset-gray-800"
                    >
                        Sudah punya akun? Masuk
                    </Link>

                    <PrimaryButton className="ms-4" disabled={processing}>
                        Daftar PKL
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
