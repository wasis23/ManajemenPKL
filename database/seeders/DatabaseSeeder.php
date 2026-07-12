<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed settings
        \App\Models\Setting::create([
            'latitude' => -7.5619,
            'longitude' => 110.8540,
            'radius' => 50,
            'work_hour_start' => '08:00:00',
            'work_hour_end' => '16:00:00',
        ]);

        // 2. Seed Admin
        User::create([
            'name' => 'Admin PKL',
            'email' => 'admin@pkl.com',
            'password' => \Illuminate\Support\Facades\Hash::make('admin123'),
            'role' => 'admin',
        ]);

        // 3. Seed Dosen & Staf
        User::create([
            'name' => 'Dr. Dosen Pembimbing',
            'email' => 'dosen@pkl.com',
            'password' => \Illuminate\Support\Facades\Hash::make('dosen123'),
            'role' => 'dosen',
        ]);

        User::create([
            'name' => 'Staf IT Support',
            'email' => 'staf@pkl.com',
            'password' => \Illuminate\Support\Facades\Hash::make('staf123'),
            'role' => 'staf',
        ]);

        // 4. Seed Anak PKL (Students) with points to populate the Leaderboard
        User::create([
            'name' => 'Ahmad Fauzi (Juara 1)',
            'email' => 'pkl1@pkl.com',
            'password' => \Illuminate\Support\Facades\Hash::make('pkl123'),
            'role' => 'anak_pkl',
            'points' => 50,
            'school_name' => 'SMKN 1 Jakarta',
        ]);

        User::create([
            'name' => 'Budi Santoso (Juara 2)',
            'email' => 'pkl2@pkl.com',
            'password' => \Illuminate\Support\Facades\Hash::make('pkl123'),
            'role' => 'anak_pkl',
            'points' => 30,
            'school_name' => 'SMKN 2 Bandung',
        ]);

        User::create([
            'name' => 'Citra Lestari (Juara 3)',
            'email' => 'pkl3@pkl.com',
            'password' => \Illuminate\Support\Facades\Hash::make('pkl123'),
            'role' => 'anak_pkl',
            'points' => 20,
            'school_name' => 'SMKN 1 Jakarta',
        ]);

        User::create([
            'name' => 'Dewi Sartika (Evaluasi)',
            'email' => 'pkl4@pkl.com',
            'password' => \Illuminate\Support\Facades\Hash::make('pkl123'),
            'role' => 'anak_pkl',
            'points' => 2,
            'school_name' => 'SMKN 3 Yogyakarta',
        ]);

        User::create([
            'name' => 'Eko Prasetyo (Baru)',
            'email' => 'pkl5@pkl.com',
            'password' => \Illuminate\Support\Facades\Hash::make('pkl123'),
            'role' => 'anak_pkl',
            'points' => 0,
            'school_name' => 'SMKN 2 Bandung',
        ]);
    }
}
