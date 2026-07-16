<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\SchoolController;
use App\Http\Controllers\AgendaController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// Public Task Routes (No Login Required)
Route::get('/tasks/public/create', [TaskController::class, 'publicCreate'])->name('tasks.public.create');
Route::post('/tasks/public', [TaskController::class, 'publicStore'])->name('tasks.public.store');
Route::get('/tasks/public', [TaskController::class, 'publicList'])->name('tasks.public.list');

// Authenticated Routes
Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard (Main hub for all roles)
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Profile management
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Student specific actions
    Route::middleware('role:anak_pkl')->group(function () {
        Route::post('/attendance/check-in', [AttendanceController::class, 'checkIn'])->name('attendance.check-in');
        Route::post('/attendance/check-out', [AttendanceController::class, 'checkOut'])->name('attendance.check-out');
        Route::post('/tasks/{task}/take', [TaskController::class, 'take'])->name('tasks.take');
        Route::post('/tasks/{task}/cancel', [TaskController::class, 'cancel'])->name('tasks.cancel');
        Route::post('/tasks/{task}/complete', [TaskController::class, 'complete'])->name('tasks.complete');
        Route::post('/permissions', [PermissionController::class, 'store'])->name('permissions.store');
        
        Route::post('/push-subscribe', function (Illuminate\Http\Request $request) {
            $request->validate(['endpoint' => 'required']);
            \App\Models\PushSubscription::updateOrCreate(
                ['user_id' => auth()->id(), 'endpoint' => $request->endpoint],
                [
                    'public_key' => $request->keys['p256dh'] ?? null,
                    'auth_token' => $request->keys['auth'] ?? null,
                ]
            );
            return response()->json(['success' => true]);
        });
    });

    // Admin task actions
    Route::middleware('role:admin')->group(function () {
        Route::post('/tasks', [TaskController::class, 'store'])->name('tasks.store');
        Route::delete('/tasks/{task}', [TaskController::class, 'destroy'])->name('tasks.destroy');
    });

    // Admin-only configurations and user accounts management
    Route::middleware('role:admin')->group(function () {
        Route::post('/settings', [SettingController::class, 'update'])->name('settings.update');
        Route::post('/schools', [SchoolController::class, 'store'])->name('schools.store');
        Route::delete('/schools/{school}', [SchoolController::class, 'destroy'])->name('schools.destroy');
        Route::post('/users', [UserController::class, 'store'])->name('users.store');
        Route::patch('/users/{user}', [UserController::class, 'update'])->name('users.update');
        Route::patch('/users/{user}/points', [UserController::class, 'updatePoints'])->name('users.points.update');
        Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
        Route::patch('/permissions/{permission}/status', [PermissionController::class, 'updateStatus'])->name('permissions.status.update');
        
        // Agenda Management
        Route::post('/agendas', [AgendaController::class, 'store'])->name('agendas.store');
        Route::patch('/agendas/{agenda}', [AgendaController::class, 'update'])->name('agendas.update');
        Route::delete('/agendas/{agenda}', [AgendaController::class, 'destroy'])->name('agendas.destroy');
    });

    // SIMLAB Integration Routes
    Route::post('/simlab/assets', [\App\Http\Controllers\SimlabController::class, 'storeAsset'])->name('simlab.assets.store');
    Route::put('/simlab/assets/{id}', [\App\Http\Controllers\SimlabController::class, 'updateAsset'])->name('simlab.assets.update');
    Route::post('/simlab/tickets', [\App\Http\Controllers\SimlabController::class, 'storeTicket'])->name('simlab.tickets.store');
    Route::post('/simlab/loans', [\App\Http\Controllers\SimlabController::class, 'storeLoan'])->name('simlab.loans.store');
});

require __DIR__.'/auth.php';

Route::get('/storage/{filename}', function ($filename) {
    $path = storage_path('app/public/' . $filename);
    if (!file_exists($path)) {
        abort(404);
    }
    return response()->file($path);
})->where('filename', '.*');

Route::get('/run-storage-link', function () {
    try {
        Illuminate\Support\Facades\Artisan::call('storage:link');
        return 'Storage link created successfully!';
    } catch (\Exception $e) {
        return 'Error: ' . $e->getMessage();
    }
});

Route::get('/run-migration', function () {
    try {
        Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
        return 'Migration run successfully! Output:<br><pre>' . Illuminate\Support\Facades\Artisan::output() . '</pre>';
    } catch (\Exception $e) {
        return 'Error: ' . $e->getMessage();
    }
});

Route::get('/clear-cache', function () {
    try {
        Illuminate\Support\Facades\Artisan::call('config:clear');
        Illuminate\Support\Facades\Artisan::call('cache:clear');
        Illuminate\Support\Facades\Artisan::call('route:clear');
        Illuminate\Support\Facades\Artisan::call('view:clear');
        return 'Caches cleared successfully!';
    } catch (\Exception $e) {
        return 'Error: ' . $e->getMessage();
    }
});

