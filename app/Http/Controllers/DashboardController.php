<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use App\Models\Task;
use App\Models\Attendance;
use App\Models\User;
use App\Models\Permission;
use App\Models\School;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $today = now()->toDateString();

        // 1. Fetch current settings
        $settings = Setting::first() ?? Setting::create([
            'latitude' => -7.5619,
            'longitude' => 110.8540,
            'latitude_2' => -7.5620,
            'longitude_2' => 110.8550,
            'radius' => 50,
        ]);

        if (is_null($settings->latitude_2) || is_null($settings->longitude_2)) {
            $settings->latitude_2 = -7.5620;
            $settings->longitude_2 = 110.8550;
            $settings->save();
        }

        // 2. Fetch Leaderboard Data
        $allStudents = User::where('role', 'anak_pkl')
            ->orderBy('points', 'desc')
            ->orderBy('name', 'asc')
            ->get();
        
        $podium = $allStudents->take(3);
        $evaluation = $allStudents->filter(function ($student) {
            return $student->points <= 5;
        })->values();

        // 3. Fetch Student Attendance for Today
        $todayAttendance = null;
        if ($user->role === 'anak_pkl') {
            $todayAttendance = Attendance::where('user_id', $user->id)
                ->where('date', $today)
                ->first();
        }

        // 4. Fetch Tasks Data depending on role
        $tasksData = [];
        if ($user->role === 'anak_pkl') {
            // Available tasks on the job board (pending)
            $tasksData['available'] = Task::with(['reporter', 'students'])
                ->where('status', 'pending')
                ->get();

            // Pending tasks where the student has taken it but status is still pending (waiting for quota)
            $tasksData['pending'] = Task::with('reporter')
                ->where('status', 'pending')
                ->whereHas('students', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                ->get();

            // Active tasks the student is working on (proses and belongs to student)
            $tasksData['active'] = Task::with('reporter')
                ->where('status', 'proses')
                ->whereHas('students', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                ->get();

            // Completed tasks by the student
            $tasksData['completed'] = Task::with('reporter')
                ->where('status', 'sukses')
                ->whereHas('students', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                ->get();
        } else {
            // Admin, Dosen, Staf can see all tasks
            $tasksData['all'] = Task::with(['reporter', 'students'])
                ->orderBy('created_at', 'desc')
                ->get();

            // Admin can see list of students to manage accounts
            if ($user->role === 'admin') {
                $tasksData['students'] = $allStudents;
                $tasksData['staff'] = User::whereIn('role', ['dosen', 'staf'])->get();
            }
        }

        $permissions = [];
        if ($user->role === 'admin') {
            $permissions = Permission::with('user')->orderBy('created_at', 'desc')->get();
        } elseif ($user->role === 'anak_pkl') {
            $permissions = Permission::where('user_id', $user->id)->orderBy('created_at', 'desc')->get();
        }

        $attendancesList = [];
        if ($user->role === 'admin') {
            $uniqueDates = Attendance::select('date')
                ->distinct()
                ->orderBy('date', 'desc')
                ->pluck('date')
                ->toArray();

            if (empty($uniqueDates)) {
                $uniqueDates = [now()->toDateString()];
            }

            $studentsList = User::where('role', 'anak_pkl')
                ->orderBy('name', 'asc')
                ->get();

            $realAttendances = Attendance::with('user')->get();
            $approvedPermissions = Permission::where('status', 'approved')->get()->groupBy(['date', 'user_id']);

            $groupedAttendances = [];
            foreach ($realAttendances as $att) {
                $groupedAttendances[$att->date][$att->user_id] = $att;
            }

            foreach ($uniqueDates as $date) {
                foreach ($studentsList as $student) {
                    $permitForDay = isset($approvedPermissions[$date][$student->id]) 
                        ? $approvedPermissions[$date][$student->id]->first() 
                        : null;

                    if (isset($groupedAttendances[$date][$student->id])) {
                        $att = $groupedAttendances[$date][$student->id];
                        if ($permitForDay) {
                            $att->permit = $permitForDay;
                        }
                        $attendancesList[] = $att;
                    } else {
                        $status = 'belum_absen';
                        if ($permitForDay && $permitForDay->type === 'tidak_masuk') {
                            $status = 'izin_tidak_masuk';
                        }

                        $attendancesList[] = [
                            'id' => 'v_' . $student->id . '_' . str_replace('-', '', $date),
                            'user_id' => $student->id,
                            'user' => $student,
                            'date' => $date,
                            'check_in' => null,
                            'check_out' => null,
                            'status' => $status,
                            'in_latitude' => null,
                            'in_longitude' => null,
                            'out_latitude' => null,
                            'out_longitude' => null,
                            'permit' => $permitForDay,
                        ];
                    }
                }
            }
        }

        // Calculate available PKL students count for task submission section by campus
        $availableStudentsCount = User::getAvailableStudentsCountByCampus($today);

        $agendas = \App\Models\Agenda::with('creator')->orderBy('date', 'desc')->orderBy('start_time', 'asc')->get();

        // 5. Fetch SIMLAB Data
        $simlabService = app(\App\Services\SimlabService::class);
        $labResponse = $simlabService->getLaboratoriums();
        $rawSimlabLabs = isset($labResponse['success']) && $labResponse['success'] && isset($labResponse['data']) 
            ? $labResponse['data'] 
            : [];
            
        $userPicLabs = $user->pic_labs ?? [];
        $hasRestrictedLabs = !empty($userPicLabs);
        
        // Filter available labs based on user's PIC rights (unless user is admin with no pic_labs specified)
        if ($hasRestrictedLabs) {
            $simlabLabs = array_values(array_filter($rawSimlabLabs, function ($lab) use ($userPicLabs) {
                $labId = is_array($lab) ? ($lab['id'] ?? null) : ($lab->id ?? null);
                return in_array((string)$labId, array_map('strval', $userPicLabs));
            }));
        } else {
            $simlabLabs = $rawSimlabLabs;
        }

        $filters = [];
        if ($request->filled('simlab_lab_id')) {
            $reqLabId = $request->query('simlab_lab_id');
            if ($hasRestrictedLabs && !in_array((string)$reqLabId, array_map('strval', $userPicLabs))) {
                $filters['laboratorium_id'] = $userPicLabs[0] ?? null;
            } else {
                $filters['laboratorium_id'] = $reqLabId;
            }
        } elseif ($hasRestrictedLabs && count($userPicLabs) === 1) {
            $filters['laboratorium_id'] = $userPicLabs[0];
        }

        if ($request->filled('simlab_kondisi')) {
            $filters['kondisi'] = $request->query('simlab_kondisi');
        }

        $assetResponse = $simlabService->getAsets($filters);
        $simlabAssets = isset($assetResponse['success']) && $assetResponse['success'] && isset($assetResponse['data']) 
            ? $assetResponse['data'] 
            : [];

        return Inertia::render('Dashboard', [
            'settings' => $settings,
            'leaderboard' => [
                'podium' => $podium,
                'evaluation' => $evaluation,
                'all' => $allStudents,
            ],
            'todayAttendance' => $todayAttendance,
            'tasks' => $tasksData,
            'attendances' => $attendancesList,
            'permissions' => $permissions,
            'availableStudentsCount' => $availableStudentsCount,
            'schools' => $user->role === 'admin' ? School::orderBy('name', 'asc')->get() : [],
            'agendas' => $agendas,
            'simlabLabs' => $simlabLabs,
            'simlabAssets' => $simlabAssets,
            'simlabFilters' => [
                'laboratorium_id' => $filters['laboratorium_id'] ?? $request->query('simlab_lab_id', ''),
                'kondisi' => $request->query('simlab_kondisi', ''),
            ],
            'simlabError' => (isset($labResponse['success']) && !$labResponse['success'] ? ($labResponse['message'] ?? 'Gagal mengambil data laboratorium.') : null) 
                ?? (isset($assetResponse['success']) && !$assetResponse['success'] ? ($assetResponse['message'] ?? 'Gagal mengambil data aset.') : null),
        ]);
    }
}
