import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    schools = [],
    className = '',
}) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
            school_name: user.school_name || '',
            major: user.major || '',
            start_date: user.start_date || '',
            end_date: user.end_date || '',
        });

    const submit = (e) => {
        e.preventDefault();

        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Profile Information
                </h2>

                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Update your account's profile information and email address.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div>
                    <InputLabel htmlFor="name" value="Name" />

                    <TextInput
                        id="name"
                        className="mt-1 block w-full"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        isFocused
                        autoComplete="name"
                    />

                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />

                    <InputError className="mt-2" message={errors.email} />
                </div>

                {user.role === 'anak_pkl' && (
                    <>
                        <div>
                            <InputLabel htmlFor="school_name" value="Nama Sekolah" />

                            <select
                                id="school_name"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:focus:border-indigo-600 dark:focus:ring-indigo-600"
                                value={data.school_name}
                                onChange={(e) => setData('school_name', e.target.value)}
                                required
                            >
                                <option value="">Pilih Sekolah</option>
                                {schools.map((school) => (
                                    <option key={school.id} value={school.name}>
                                        {school.name}
                                    </option>
                                ))}
                                {data.school_name && !schools.some(s => s.name === data.school_name) && (
                                    <option value={data.school_name}>{data.school_name}</option>
                                )}
                            </select>

                            <InputError className="mt-2" message={errors.school_name} />
                        </div>

                        <div>
                            <InputLabel htmlFor="major" value="Jurusan Sekolah" />

                            <select
                                id="major"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:focus:border-indigo-600 dark:focus:ring-indigo-600"
                                value={data.major}
                                onChange={(e) => setData('major', e.target.value)}
                                required
                            >
                                <option value="">Pilih Jurusan</option>
                                <option value="Akuntansi">Akuntansi</option>
                                <option value="DKV">DKV</option>
                                <option value="Perkantoran">Perkantoran</option>
                                <option value="TKJ">TKJ</option>
                                {data.major && !['Akuntansi', 'DKV', 'Perkantoran', 'TKJ'].includes(data.major) && (
                                    <option value={data.major}>{data.major}</option>
                                )}
                            </select>

                            <InputError className="mt-2" message={errors.major} />
                        </div>

                        <div>
                            <InputLabel htmlFor="start_date" value="Tanggal Mulai PKL" />

                            <TextInput
                                id="start_date"
                                type="date"
                                className="mt-1 block w-full"
                                value={data.start_date}
                                onChange={(e) => setData('start_date', e.target.value)}
                                required
                            />

                            <InputError className="mt-2" message={errors.start_date} />
                        </div>

                        <div>
                            <InputLabel htmlFor="end_date" value="Tanggal Selesai PKL" />

                            <TextInput
                                id="end_date"
                                type="date"
                                className="mt-1 block w-full"
                                value={data.end_date}
                                onChange={(e) => setData('end_date', e.target.value)}
                                required
                            />

                            <InputError className="mt-2" message={errors.end_date} />
                        </div>
                    </>
                )}

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="mt-2 text-sm text-gray-800 dark:text-gray-200">
                            Your email address is unverified.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:text-gray-400 dark:hover:text-gray-100 dark:focus:ring-offset-gray-800"
                            >
                                Click here to re-send the verification email.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-green-600 dark:text-green-400">
                                A new verification link has been sent to your
                                email address.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Save</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Saved.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
