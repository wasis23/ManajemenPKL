<?php

namespace App\Http\Controllers;

use App\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PermissionController extends Controller
{
    /**
     * Store a newly created permission request in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
            'type' => 'required|string|in:tidak_masuk,masuk_terlambat,pulang_cepat',
            'reason' => 'required|string|max:1000',
            'proof' => 'required|file|mimes:pdf,jpg,jpeg,png|max:2048',
            'screenshot' => 'required|file|mimes:pdf,jpg,jpeg,png|max:2048',
        ]);

        $userId = auth()->id();
        $date = $request->date;

        // Check if student has already submitted a permission request for this date
        $existing = Permission::where('user_id', $userId)
            ->where('date', $date)
            ->exists();

        if ($existing) {
            return redirect()->back()->with('error', 'Anda hanya diperbolehkan mengajukan satu izin pada hari yang sama.');
        }

        $proofPath = $request->file('proof')->store('proofs', 'public');
        $screenshotPath = $request->file('screenshot')->store('screenshots', 'public');

        Permission::create([
            'user_id' => $userId,
            'date' => $date,
            'type' => $request->type,
            'reason' => $request->reason,
            'proof_path' => $proofPath,
            'screenshot_path' => $screenshotPath,
            'status' => 'pending',
        ]);

        return redirect()->back()->with('success', 'Permohonan izin berhasil dikirim.');
    }

    /**
     * Update the status of a permission request (Admin only).
     */
    public function updateStatus(Request $request, Permission $permission)
    {
        if (auth()->user()->role !== 'admin') {
            return redirect()->back()->with('error', 'Hanya administrator yang dapat memproses permohonan izin.');
        }

        $request->validate([
            'status' => 'required|string|in:approved,rejected',
        ]);

        $permission->update([
            'status' => $request->status,
        ]);

        return redirect()->back()->with('success', 'Status izin berhasil diperbarui.');
    }
}
