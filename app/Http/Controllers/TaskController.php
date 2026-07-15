<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Http;

class TaskController extends Controller
{
    private function sendTelegramNotification(Task $task, $isPublic = false) {
        try {
            $settings = \App\Models\Setting::first();
            $token = $settings?->telegram_bot_token ?? env('TELEGRAM_BOT_TOKEN');
            $chatId = $settings?->telegram_chat_id ?? env('TELEGRAM_CHAT_ID');

            if (!$token || !$chatId) {
                \Log::warning('Telegram Bot Token or Chat ID is missing. Notification will not be sent.');
                return;
            }

            $title = $isPublic ? "📢 <b>TUGAS ADAUAN BARU</b> 📢" : "🆕 <b>TUGAS BARU</b> 🆕";
            
            $message = "{$title}\n\n";
            $message .= "📌 <b>Judul:</b> " . htmlspecialchars($task->title) . "\n";
            $message .= "📝 <b>Deskripsi:</b> " . htmlspecialchars($task->description) . "\n";
            $message .= "📍 <b>Lokasi:</b> " . htmlspecialchars($task->campus_type) . " - " . htmlspecialchars($task->target_room) . "\n";
            $message .= "👤 <b>Pengaju:</b> " . htmlspecialchars($task->requester_name) . "\n";
            $message .= "👥 <b>Kuota:</b> " . htmlspecialchars($task->quota) . " orang\n\n";
            
            $appUrl = env('APP_URL', 'http://localhost');
            $message .= "🔗 <a href=\"{$appUrl}/dashboard\">Buka Website PKL untuk Mengambil Tugas</a>";

            $url = "https://api.telegram.org/bot{$token}/sendMessage";
            
            $response = Http::post($url, [
                'chat_id' => $chatId,
                'text' => $message,
                'parse_mode' => 'HTML',
                'disable_web_page_preview' => true,
            ]);

            if ($response->failed()) {
                \Log::error('Telegram API Error: ' . $response->body());
            }
        } catch (\Exception $e) {
            \Log::error('Telegram Notification Error: ' . $e->getMessage());
        }
    }
    /**
     * Create a new task (Admin, Dosen, Staf)
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'quota' => 'required|integer|min:1',
            'requester_name' => 'required|string|max:255',
            'target_room' => 'required|string|max:255',
            'campus_type' => 'required|string|in:Kampus 1,Kampus 2',
        ]);

        $user = auth()->user();
        if ($user->role === 'anak_pkl') {
            return redirect()->back()->with('error', 'Hanya dosen, staf, atau admin yang dapat membuat tugas.');
        }

        $task = Task::create([
            'title' => $request->title,
            'description' => $request->description,
            'reporter_id' => $user->id,
            'quota' => $request->quota,
            'status' => 'pending',
            'requester_name' => $request->requester_name,
            'target_room' => $request->target_room,
            'campus_type' => $request->campus_type,
        ]);

        $this->sendTelegramNotification($task, false);

        return redirect()->back()->with('success', 'Tugas berhasil dilaporkan.');
    }

    /**
     * Student takes a task (Anak PKL)
     */
    public function take(Task $task)
    {
        $user = auth()->user();
        if ($user->role !== 'anak_pkl') {
            return redirect()->back()->with('error', 'Hanya anak PKL yang dapat mengambil tugas.');
        }

        // Check if student has checked in today and has not checked out today
        $today = now()->toDateString();
        $attendance = \App\Models\Attendance::where('user_id', $user->id)
            ->where('date', $today)
            ->first();

        if (!$attendance || !$attendance->check_in || $attendance->status === 'rejected') {
            return redirect()->back()->with('error', 'Anda harus melakukan absen masuk hari ini sebelum dapat mengambil tugas.');
        }

        if ($attendance->check_out) {
            return redirect()->back()->with('error', 'Anda tidak dapat mengambil tugas setelah melakukan absen pulang.');
        }

        if ($task->status !== 'pending') {
            return redirect()->back()->with('error', 'Tugas ini tidak lagi tersedia.');
        }

        // Check if student already has a pending or in-progress task
        $hasActiveTask = $user->tasks()->whereIn('status', ['pending', 'proses'])->exists();
        if ($hasActiveTask) {
            return redirect()->back()->with('error', 'Anda hanya dapat mengambil satu tugas aktif pada satu waktu.');
        }

        // Check if student already took this task
        if ($task->students()->where('user_id', $user->id)->exists()) {
            return redirect()->back()->with('error', 'Anda sudah mengambil tugas ini.');
        }

        // Check quota before assigning
        $currentAssigned = $task->students()->count();
        if ($currentAssigned >= $task->quota) {
            $task->update(['status' => 'proses']);
            return redirect()->back()->with('error', 'Kuota tugas ini sudah penuh.');
        }

        // Assign student to task
        $task->students()->attach($user->id);
        
        // Re-evaluate quota count
        $newAssigned = $task->students()->count();
        if ($newAssigned >= $task->quota) {
            $task->update(['status' => 'proses']);
        }

        return redirect()->back()->with('success', 'Tugas berhasil diambil. Silakan kerjakan bersama tim Anda.');
    }

    /**
     * Student cancels a pending task (Anak PKL)
     */
    public function cancel(Task $task)
    {
        $user = auth()->user();
        if ($user->role !== 'anak_pkl') {
            return redirect()->back()->with('error', 'Hanya anak PKL yang dapat membatalkan tugas.');
        }

        // Check if student is assigned to this task
        if (!$task->students()->where('user_id', $user->id)->exists()) {
            return redirect()->back()->with('error', 'Anda tidak ditugaskan pada tugas ini.');
        }

        // Can only cancel if task status is pending
        if ($task->status !== 'pending') {
            return redirect()->back()->with('error', 'Tugas yang sedang dikerjakan tidak dapat dibatalkan.');
        }

        // Detach user
        $task->students()->detach($user->id);

        return redirect()->back()->with('success', 'Pengambilan tugas berhasil dibatalkan.');
    }

    /**
     * Student completes a task (Anak PKL)
     */
    public function complete(Request $request, Task $task)
    {
        $request->validate([
            'is_assisted' => 'required|boolean',
            'proof_photo' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120', // max 5MB
        ]);

        $user = auth()->user();
        if ($user->role !== 'anak_pkl') {
            return redirect()->back()->with('error', 'Hanya anak PKL yang dapat menyelesaikan tugas.');
        }

        // Check if student is assigned to this task
        if (!$task->students()->where('user_id', $user->id)->exists()) {
            return redirect()->back()->with('error', 'Anda tidak ditugaskan pada tugas ini.');
        }

        if ($task->status !== 'proses') {
            return redirect()->back()->with('error', 'Tugas ini tidak dalam proses pengerjaan.');
        }

        // Upload proof photo
        $path = null;
        if ($request->hasFile('proof_photo')) {
            $path = $request->file('proof_photo')->store('proofs', 'public');
        }

        // Update task status
        $task->update([
            'status' => 'sukses',
            'is_assisted' => $request->is_assisted,
            'proof_photo' => $path,
        ]);

        // Award points to all assigned students
        $points = $request->is_assisted ? 1 : 2;
        foreach ($task->students as $student) {
            $student->increment('points', $points);
        }

        return redirect()->back()->with('success', 'Tugas berhasil diselesaikan! Poin Anda telah ditambahkan.');
    }

    /**
     * Delete a task (Admin, Dosen, Staf)
     */
    public function destroy(Task $task)
    {
        $user = auth()->user();
        
        // Tasks with status 'proses' or 'sukses' cannot be deleted except by admin
        if (in_array($task->status, ['proses', 'sukses']) && $user->role !== 'admin') {
            return redirect()->back()->with('error', 'Tugas yang sedang dalam proses atau selesai hanya dapat dihapus oleh admin.');
        }

        // Check permissions: admin can delete anything, reporter can delete their own task
        if ($user->role === 'admin' || ($user->role !== 'anak_pkl' && $task->reporter_id === $user->id)) {
            // Delete photo if exists
            if ($task->proof_photo) {
                \Storage::disk('public')->delete($task->proof_photo);
            }
            $task->delete();
            return redirect()->back()->with('success', 'Tugas berhasil dihapus.');
        }

        return redirect()->back()->with('error', 'Anda tidak memiliki hak akses untuk menghapus tugas ini.');
    }

    /**
     * Display public page for creating a new task.
     */
    public function publicCreate()
    {
        $today = now()->toDateString();
        $totalStudentsCount = User::where('role', 'anak_pkl')->count();
        $absentPermitsCount = \App\Models\Permission::where('date', $today)
            ->where('type', 'tidak_masuk')
            ->where('status', 'approved')
            ->count();
        $activeStudentsCount = \DB::table('task_user')
            ->join('tasks', 'task_user.task_id', '=', 'tasks.id')
            ->whereIn('tasks.status', ['pending', 'proses'])
            ->distinct('task_user.user_id')
            ->count('task_user.user_id');

        $availableStudents = max(0, $totalStudentsCount - $absentPermitsCount - $activeStudentsCount);

        return \Inertia\Inertia::render('Tasks/PublicCreate', [
            'availableStudentsCount' => $availableStudents,
        ]);
    }

    /**
     * Store a publicly submitted task.
     */
    public function publicStore(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'requester_name' => 'required|string|max:255',
            'target_room' => 'required|string|max:255',
            'campus_type' => 'required|string|in:Kampus 1,Kampus 2',
            'quota' => 'required|integer|min:1',
        ]);

        $task = Task::create([
            'title' => $request->title,
            'description' => $request->description,
            'requester_name' => $request->requester_name,
            'target_room' => $request->target_room,
            'campus_type' => $request->campus_type,
            'quota' => $request->quota,
            'status' => 'pending',
            'reporter_id' => null, // Publicly submitted task
        ]);

        $this->sendTelegramNotification($task, true);

        return redirect()->route('tasks.public.list')->with('success', 'Tugas aduan baru berhasil diajukan!');
    }

    /**
     * Display public page for listing all tasks.
     */
    public function publicList()
    {
        $tasks = Task::with('students:id,name,school_name')
            ->orderBy('created_at', 'desc')
            ->get();

        return \Inertia\Inertia::render('Tasks/PublicList', [
            'tasks' => $tasks,
        ]);
    }
}
