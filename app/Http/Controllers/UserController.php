<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Create a new user account (Admin only)
     */
    public function store(Request $request)
    {
        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'role' => 'required|string|in:admin,anak_pkl',
        ];

        if ($request->role === 'anak_pkl') {
            $rules['school_name'] = 'required|string|max:255';
        }

        $request->validate($rules);

        if (auth()->user()->role !== 'admin') {
            return redirect()->back()->with('error', 'Hanya administrator yang dapat mengelola pengguna.');
        }

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'school_name' => $request->role === 'anak_pkl' ? $request->school_name : null,
        ]);

        return redirect()->back()->with('success', 'Akun pengguna berhasil dibuat.');
    }

    /**
     * Update user account (Admin only)
     */
    public function update(Request $request, User $user)
    {
        if (auth()->user()->role !== 'admin') {
            return redirect()->back()->with('error', 'Hanya administrator yang dapat mengelola pengguna.');
        }

        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'role' => 'required|string|in:admin,anak_pkl',
            'password' => 'nullable|string|min:6',
        ];

        if ($request->role === 'anak_pkl') {
            $rules['school_name'] = 'required|string|max:255';
        }

        $request->validate($rules);

        $data = [
            'name' => $request->name,
            'email' => $request->email,
            'role' => $request->role,
        ];

        if ($request->password) {
            $data['password'] = Hash::make($request->password);
        }

        if ($request->role === 'anak_pkl') {
            $data['school_name'] = $request->school_name;
        } else {
            $data['school_name'] = null;
        }

        $user->update($data);

        return redirect()->back()->with('success', 'Akun pengguna berhasil diperbarui.');
    }

    /**
     * Update student points (Admin only)
     */
    public function updatePoints(Request $request, User $user)
    {
        $request->validate([
            'points' => 'required|integer|min:0',
        ]);

        if (auth()->user()->role !== 'admin') {
            return redirect()->back()->with('error', 'Hanya administrator yang dapat mengubah poin.');
        }

        if ($user->role !== 'anak_pkl') {
            return redirect()->back()->with('error', 'Hanya anak PKL yang memiliki akumulasi poin.');
        }

        $user->update([
            'points' => $request->points,
        ]);

        return redirect()->back()->with('success', 'Poin pengguna berhasil diperbarui.');
    }

    /**
     * Delete user account (Admin only)
     */
    public function destroy(User $user)
    {
        if (auth()->user()->role !== 'admin') {
            return redirect()->back()->with('error', 'Hanya administrator yang dapat mengelola pengguna.');
        }

        if ($user->id === auth()->id()) {
            return redirect()->back()->with('error', 'Anda tidak dapat menghapus akun Anda sendiri.');
        }

        $user->delete();

        return redirect()->back()->with('success', 'Akun pengguna berhasil dihapus.');
    }
}
