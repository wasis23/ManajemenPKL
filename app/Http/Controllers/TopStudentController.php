<?php

namespace App\Http\Controllers;

use App\Models\TopStudent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class TopStudentController extends Controller
{
    /**
     * Ensure top_students database table exists on production
     */
    private function ensureTopStudentsTableExists()
    {
        if (!Schema::hasTable('top_students')) {
            Schema::create('top_students', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('school_name');
                $table->string('major')->nullable();
                $table->string('period')->nullable();
                $table->integer('points')->default(0);
                $table->string('photo_path')->nullable();
                $table->text('description')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }
    }

    /**
     * Display a listing of the top students for Admin.
     */
    public function index()
    {
        $this->ensureTopStudentsTableExists();

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
        $this->ensureTopStudentsTableExists();

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
        $this->ensureTopStudentsTableExists();

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
        $this->ensureTopStudentsTableExists();

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
        $this->ensureTopStudentsTableExists();

        if ($topStudent->photo_path) {
            $oldPath = str_replace('/storage/', '', $topStudent->photo_path);
            Storage::disk('public')->delete($oldPath);
        }

        $topStudent->delete();

        return redirect()->back()->with('success', 'Data Anak PKL Terbaik berhasil dihapus.');
    }
}
