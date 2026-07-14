<?php

namespace App\Http\Controllers;

use App\Models\Agenda;
use Illuminate\Http\Request;

class AgendaController extends Controller
{
    /**
     * Store a newly created agenda in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'date' => 'required|date',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i|after:start_time',
        ]);

        $user = auth()->user();
        if ($user->role !== 'admin') {
            return redirect()->back()->with('error', 'Hanya administrator yang dapat menambahkan agenda.');
        }

        Agenda::create([
            'title' => $request->title,
            'description' => $request->description,
            'date' => $request->date,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'created_by' => $user->id,
        ]);

        return redirect()->back()->with('success', 'Agenda berhasil ditambahkan.');
    }

    /**
     * Update the specified agenda in storage.
     */
    public function update(Request $request, Agenda $agenda)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'date' => 'required|date',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i|after:start_time',
        ]);

        $user = auth()->user();
        if ($user->role !== 'admin') {
            return redirect()->back()->with('error', 'Hanya administrator yang dapat mengubah agenda.');
        }

        $agenda->update([
            'title' => $request->title,
            'description' => $request->description,
            'date' => $request->date,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
        ]);

        return redirect()->back()->with('success', 'Agenda berhasil diperbarui.');
    }

    /**
     * Remove the specified agenda from storage.
     */
    public function destroy(Agenda $agenda)
    {
        $user = auth()->user();
        if ($user->role !== 'admin') {
            return redirect()->back()->with('error', 'Hanya administrator yang dapat menghapus agenda.');
        }

        $agenda->delete();

        return redirect()->back()->with('success', 'Agenda berhasil dihapus.');
    }
}
