<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    /**
     * Update geofencing configurations (Admin only)
     */
    public function update(Request $request)
    {
        $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'latitude_2' => 'required|numeric',
            'longitude_2' => 'required|numeric',
            'radius' => 'required|integer|min:10|max:1000',
            'work_hour_start' => 'required|date_format:H:i',
            'work_hour_end' => 'required|date_format:H:i',
            'telegram_bot_token' => 'nullable|string',
            'telegram_chat_id' => 'nullable|string',
            'telegram_channel_link' => 'nullable|string',
            'show_top_student' => 'nullable|boolean',
        ]);

        $user = auth()->user();
        if ($user->role !== 'admin') {
            return redirect()->back()->with('error', 'Hanya administrator yang dapat mengubah pengaturan.');
        }

        $settings = Setting::first() ?? new Setting();
        $settings->latitude = $request->latitude;
        $settings->longitude = $request->longitude;
        $settings->latitude_2 = $request->latitude_2;
        $settings->longitude_2 = $request->longitude_2;
        $settings->radius = $request->radius;
        $settings->work_hour_start = $request->work_hour_start;
        $settings->work_hour_end = $request->work_hour_end;
        $settings->telegram_bot_token = $request->telegram_bot_token;
        $settings->telegram_chat_id = $request->telegram_chat_id;
        $settings->telegram_channel_link = $request->telegram_channel_link;
        if ($request->has('show_top_student')) {
            $settings->show_top_student = (bool) $request->show_top_student;
        }
        $settings->save();

        return redirect()->back()->with('success', 'Pengaturan geofencing, jam kerja, dan notifikasi Telegram berhasil diperbarui.');
    }

    /**
     * Toggle Best PKL Student display on front page ON/OFF (Admin only)
     */
    public function toggleTopStudent(Request $request)
    {
        $user = auth()->user();
        if ($user->role !== 'admin') {
            return redirect()->back()->with('error', 'Hanya administrator yang dapat mengubah pengaturan.');
        }

        $settings = Setting::first() ?? Setting::create([
            'latitude' => -7.2574719,
            'longitude' => 112.7520883,
            'latitude_2' => -7.2574719,
            'longitude_2' => 112.7520883,
            'radius' => 50,
            'work_hour_start' => '08:00',
            'work_hour_end' => '17:00',
            'show_top_student' => true,
        ]);

        $currentValue = $settings->show_top_student ?? true;
        $settings->show_top_student = !$currentValue;
        $settings->save();

        $status = $settings->show_top_student ? 'diaktifkan' : 'dinonaktifkan';
        return redirect()->back()->with('success', "Tampilan Anak PKL Terbaik di halaman depan berhasil {$status}.");
    }
}
