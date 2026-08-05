<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

class SettingController extends Controller
{
    /**
     * Ensure show_top_student & hero_bg_path columns exist on database table
     */
    private function ensureColumnsExist()
    {
        if (!Schema::hasColumn('settings', 'show_top_student')) {
            Schema::table('settings', function (Blueprint $table) {
                $table->boolean('show_top_student')->default(true);
            });
        }
        if (!Schema::hasColumn('settings', 'hero_bg_path')) {
            Schema::table('settings', function (Blueprint $table) {
                $table->string('hero_bg_path')->nullable();
            });
        }
        if (!Schema::hasColumn('settings', 'hero_button_position')) {
            Schema::table('settings', function (Blueprint $table) {
                $table->string('hero_button_position')->nullable()->default('bottom-left');
            });
        }
        if (!Schema::hasColumn('settings', 'hero_button_top')) {
            Schema::table('settings', function (Blueprint $table) {
                $table->float('hero_button_top')->nullable()->default(50);
            });
        }
        if (!Schema::hasColumn('settings', 'hero_button_left')) {
            Schema::table('settings', function (Blueprint $table) {
                $table->float('hero_button_left')->nullable()->default(20);
            });
        }
    }

    /**
     * Update geofencing configurations & Hero Background (Admin only)
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
            'hero_bg_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'remove_hero_bg' => 'nullable|boolean',
            'hero_button_position' => 'nullable|string|in:bottom-left,bottom-center,bottom-right,middle-left,middle-center,middle-right,top-left,top-center,top-right',
            'hero_button_top' => 'nullable|numeric|min:0|max:100',
            'hero_button_left' => 'nullable|numeric|min:0|max:100',
        ]);

        $user = auth()->user();
        if ($user->role !== 'admin') {
            return redirect()->back()->with('error', 'Hanya administrator yang dapat mengubah pengaturan.');
        }

        $this->ensureColumnsExist();

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
        if ($request->has('hero_button_position')) {
            $settings->hero_button_position = $request->hero_button_position;
        }
        if ($request->has('hero_button_top')) {
            $settings->hero_button_top = (float) $request->hero_button_top;
        }
        if ($request->has('hero_button_left')) {
            $settings->hero_button_left = (float) $request->hero_button_left;
        }

        // Handle Background Image Reset/Delete
        if ($request->boolean('remove_hero_bg')) {
            if ($settings->hero_bg_path) {
                $oldPath = str_replace('/storage/', '', $settings->hero_bg_path);
                \Illuminate\Support\Facades\Storage::disk('public')->delete($oldPath);
                $settings->hero_bg_path = null;
            }
        }

        // Handle New Background Image Upload
        if ($request->hasFile('hero_bg_image')) {
            if ($settings->hero_bg_path) {
                $oldPath = str_replace('/storage/', '', $settings->hero_bg_path);
                \Illuminate\Support\Facades\Storage::disk('public')->delete($oldPath);
            }
            $bgPath = $request->file('hero_bg_image')->store('settings', 'public');
            $settings->hero_bg_path = '/storage/' . $bgPath;
        }

        $settings->save();

        return redirect()->back()->with('success', 'Pengaturan geofencing, jam kerja, dan Hero Background berhasil diperbarui.');
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

        $this->ensureColumnsExist();

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
