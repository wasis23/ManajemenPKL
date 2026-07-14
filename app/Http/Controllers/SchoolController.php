<?php

namespace App\Http\Controllers;

use App\Models\School;
use Illuminate\Http\Request;

class SchoolController extends Controller
{
    /**
     * Store a new school name.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|unique:schools,name|max:255',
        ]);

        if (auth()->user()->role !== 'admin') {
            return redirect()->back()->with('error', 'Hanya administrator yang dapat menambah sekolah.');
        }

        School::create([
            'name' => $request->name,
        ]);

        return redirect()->back()->with('success', 'Nama sekolah berhasil ditambahkan.');
    }

    /**
     * Remove the specified school.
     */
    public function destroy(School $school)
    {
        if (auth()->user()->role !== 'admin') {
            return redirect()->back()->with('error', 'Hanya administrator yang dapat menghapus sekolah.');
        }

        $school->delete();

        return redirect()->back()->with('success', 'Nama sekolah berhasil dihapus.');
    }
}
