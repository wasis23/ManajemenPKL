<?php

namespace App\Http\Controllers;

use App\Models\TopStudent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class TopStudentController extends Controller
{
    /**
     * Display a listing of the top students for Admin.
     */
    public function index()
    {
        $topStudents = TopStudent::orderBy('created_at', 'desc')->get();

        return Inertia::render('TopStudents/Index', [
            'topStudents' => $topStudents,
        ]);
    }

    /**
     * Store a newly created top student in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'school_name' => 'required|string|max:255',
            'major' => 'nullable|string|max:255',
            'period' => 'nullable|string|max:255',
            'points' => 'required|integer|min:0',
            'description' => 'nullable|string',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'is_active' => 'boolean',
        ]);

        $photoPath = null;
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('top_students', 'public');
        }

        // If setting this one as active, deactivate previous ones to ensure single spotlight
        if ($request->boolean('is_active', true)) {
            TopStudent::query()->update(['is_active' => false]);
        }

        TopStudent::create([
            'name' => $request->name,
            'school_name' => $request->school_name,
            'major' => $request->major,
            'period' => $request->period ?? date('F Y'),
            'points' => $request->points,
            'description' => $request->description,
            'photo_path' => $photoPath ? '/storage/' . $photoPath : null,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()->back()->with('success', 'Data Anak PKL Terbaik berhasil ditambahkan.');
    }

    /**
     * Update the specified top student in storage.
     */
    public function update(Request $request, TopStudent $topStudent)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'school_name' => 'required|string|max:255',
            'major' => 'nullable|string|max:255',
            'period' => 'nullable|string|max:255',
            'points' => 'required|integer|min:0',
            'description' => 'nullable|string',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'is_active' => 'boolean',
        ]);

        if ($request->hasFile('photo')) {
            // Delete old photo if exists
            if ($topStudent->photo_path) {
                $oldPath = str_replace('/storage/', '', $topStudent->photo_path);
                Storage::disk('public')->delete($oldPath);
            }
            $photoPath = $request->file('photo')->store('top_students', 'public');
            $topStudent->photo_path = '/storage/' . $photoPath;
        }

        if ($request->boolean('is_active')) {
            TopStudent::where('id', '!=', $topStudent->id)->update(['is_active' => false]);
        }

        $topStudent->update([
            'name' => $request->name,
            'school_name' => $request->school_name,
            'major' => $request->major,
            'period' => $request->period,
            'points' => $request->points,
            'description' => $request->description,
            'is_active' => $request->boolean('is_active'),
        ]);

        return redirect()->back()->with('success', 'Data Anak PKL Terbaik berhasil diperbarui.');
    }

    /**
     * Toggle active status of a top student record.
     */
    public function toggleActive(TopStudent $topStudent)
    {
        $newStatus = !$topStudent->is_active;

        if ($newStatus) {
            // Deactivate all others so only 1 spotlight is active
            TopStudent::query()->update(['is_active' => false]);
        }

        $topStudent->is_active = $newStatus;
        $topStudent->save();

        $statusText = $newStatus ? 'diaktifkan sebagai Student of the Month' : 'dinonaktifkan';
        return redirect()->back()->with('success', "Data {$topStudent->name} berhasil {$statusText}.");
    }

    /**
     * Remove the specified top student from storage.
     */
    public function destroy(TopStudent $topStudent)
    {
        if ($topStudent->photo_path) {
            $oldPath = str_replace('/storage/', '', $topStudent->photo_path);
            Storage::disk('public')->delete($oldPath);
        }

        $topStudent->delete();

        return redirect()->back()->with('success', 'Data Anak PKL Terbaik berhasil dihapus.');
    }
}
