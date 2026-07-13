<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Setting;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    /**
     * Calculate Haversine distance between two points in meters
     */
    private function getDistance($lat1, $lon1, $lat2, $lon2)
    {
        $earthRadius = 6371000; // in meters
        $latDelta = deg2rad($lat2 - $lat1);
        $lonDelta = deg2rad($lon2 - $lon1);

        $a = sin($latDelta / 2) * sin($latDelta / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($lonDelta / 2) * sin($lonDelta / 2);
        
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        return $earthRadius * $c; // in meters
    }

    public function checkIn(Request $request)
    {
        $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'selfie' => 'required|image|mimes:jpeg,png,jpg|max:5120',
        ]);

        $selfiePath = null;
        if ($request->hasFile('selfie')) {
            $selfiePath = $request->file('selfie')->store('selfies', 'public');
        }

        $user = auth()->user();
        if ($user->role !== 'anak_pkl') {
            return redirect()->back()->with('error', 'Hanya anak PKL yang dapat melakukan absensi.');
        }

        $today = now()->toDateString();

        // Check if already checked in
        $existing = Attendance::where('user_id', $user->id)
            ->where('date', $today)
            ->first();

        if ($existing && $existing->check_in) {
            return redirect()->back()->with('error', 'Anda sudah melakukan absen masuk hari ini.');
        }

        // Fetch settings
        $settings = Setting::first() ?? Setting::create([
            'latitude' => -7.5619,
            'longitude' => 110.8540,
            'radius' => 50,
            'work_hour_start' => '08:00:00',
            'work_hour_end' => '16:00:00',
        ]);

        // Block attendance during work hours (unless has approved masuk_terlambat permit or is within 60 minutes tolerance)
        $nowTime = now()->toTimeString();
        $hasMasukTerlambatPermit = \App\Models\Permission::where('user_id', $user->id)
            ->where('date', $today)
            ->where('type', 'masuk_terlambat')
            ->where('status', 'approved')
            ->exists();

        // Calculate time difference in minutes
        $startTime = \Illuminate\Support\Carbon::parse($settings->work_hour_start);
        $now = \Illuminate\Support\Carbon::now();
        $diffInMinutes = $startTime->diffInMinutes($now, false);

        $isLate = false;
        $blocked = false;

        if ($nowTime >= $settings->work_hour_start && $nowTime <= $settings->work_hour_end) {
            // It is during work hours.
            if ($diffInMinutes >= 0 && $diffInMinutes <= 60) {
                // Within 60 minutes tolerance: not blocked, but status is late
                $isLate = true;
            } elseif (!$hasMasukTerlambatPermit) {
                // Outside tolerance and no permit: blocked
                $blocked = true;
            }
        }

        if ($blocked) {
            return redirect()->back()->with('error', sprintf(
                'Absensi diblokir! Anda tidak dapat melakukan absensi pada jam kerja (%s s/d %s). Silakan lakukan absensi di luar jam tersebut.',
                substr($settings->work_hour_start, 0, 5),
                substr($settings->work_hour_end, 0, 5)
            ));
        }

        $distance1 = $this->getDistance(
            $request->latitude,
            $request->longitude,
            $settings->latitude,
            $settings->longitude
        );

        $distance2 = $this->getDistance(
            $request->latitude,
            $request->longitude,
            $settings->latitude_2 ?? $settings->latitude,
            $settings->longitude_2 ?? $settings->longitude
        );

        $distance = min($distance1, $distance2);
        $inRange = $distance <= $settings->radius;
        $status = $inRange ? ($isLate ? 'late' : 'present') : 'rejected';

        Attendance::create([
            'user_id' => $user->id,
            'date' => $today,
            'check_in' => now()->toTimeString(),
            'in_latitude' => $request->latitude,
            'in_longitude' => $request->longitude,
            'in_selfie' => $selfiePath,
            'status' => $status,
        ]);

        if (!$inRange) {
            return redirect()->back()->with('error', sprintf(
                'Absen masuk ditolak! Anda berada di luar radius area kampus (Kampus 1: %.2f m, Kampus 2: %.2f m).',
                $distance1,
                $distance2
            ));
        }

        return redirect()->back()->with('success', 'Absen masuk berhasil! Anda berada di dalam radius area kampus.');
    }

    public function checkOut(Request $request)
    {
        $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'selfie' => 'required|image|mimes:jpeg,png,jpg|max:5120',
        ]);

        $selfiePath = null;
        if ($request->hasFile('selfie')) {
            $selfiePath = $request->file('selfie')->store('selfies', 'public');
        }

        $user = auth()->user();
        if ($user->role !== 'anak_pkl') {
            return redirect()->back()->with('error', 'Hanya anak PKL yang dapat melakukan absensi.');
        }

        $today = now()->toDateString();

        // Fetch settings
        $settings = Setting::first() ?? Setting::create([
            'latitude' => -7.5619,
            'longitude' => 110.8540,
            'radius' => 50,
            'work_hour_start' => '08:00:00',
            'work_hour_end' => '16:00:00',
        ]);

        $nowTime = now()->toTimeString();

        // Find today's attendance record
        $attendance = Attendance::where('user_id', $user->id)
            ->where('date', $today)
            ->first();

        // If attendance exists and check_out is already filled
        if ($attendance && $attendance->check_out) {
            return redirect()->back()->with('error', 'Anda sudah melakukan absen pulang hari ini.');
        }

        $hasPulangCepatPermit = \App\Models\Permission::where('user_id', $user->id)
            ->where('date', $today)
            ->where('type', 'pulang_cepat')
            ->where('status', 'approved')
            ->exists();

        // If student has not checked in
        if (!$attendance || !$attendance->check_in) {
            // They can only check out directly if past work_hour_end or has approved pulang_cepat permit
            if (!$hasPulangCepatPermit && $nowTime <= $settings->work_hour_end) {
                return redirect()->back()->with('error', 'Anda harus melakukan absen masuk terlebih dahulu.');
            }
        }

        // If check-in exists but was rejected
        if ($attendance && $attendance->status === 'rejected') {
            return redirect()->back()->with('error', 'Absen masuk Anda sebelumnya ditolak, tidak dapat melakukan absen pulang.');
        }

        // Block attendance during work hours (unless has approved pulang_cepat permit)
        if (!$hasPulangCepatPermit && $nowTime >= $settings->work_hour_start && $nowTime <= $settings->work_hour_end) {
            return redirect()->back()->with('error', sprintf(
                'Absensi diblokir! Anda tidak dapat melakukan absensi pada jam kerja (%s s/d %s). Silakan lakukan absensi di luar jam tersebut.',
                substr($settings->work_hour_start, 0, 5),
                substr($settings->work_hour_end, 0, 5)
            ));
        }

        $distance1 = $this->getDistance(
            $request->latitude,
            $request->longitude,
            $settings->latitude,
            $settings->longitude
        );

        $distance2 = $this->getDistance(
            $request->latitude,
            $request->longitude,
            $settings->latitude_2 ?? $settings->latitude,
            $settings->longitude_2 ?? $settings->longitude
        );

        $distance = min($distance1, $distance2);
        $inRange = $distance <= $settings->radius;

        if (!$inRange) {
            return redirect()->back()->with('error', sprintf(
                'Absen pulang ditolak! Anda berada di luar radius area kampus (Kampus 1: %.2f m, Kampus 2: %.2f m).',
                $distance1,
                $distance2
            ));
        }

        // Create record if it does not exist
        if (!$attendance) {
            $attendance = new Attendance();
            $attendance->user_id = $user->id;
            $attendance->date = $today;
            $attendance->status = 'present';
        }

        $attendance->check_out = now()->toTimeString();
        $attendance->out_latitude = $request->latitude;
        $attendance->out_longitude = $request->longitude;
        $attendance->out_selfie = $selfiePath;
        $attendance->save();

        return redirect()->back()->with('success', 'Absen pulang berhasil! Selamat beristirahat.');
    }
}
