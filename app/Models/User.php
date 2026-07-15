<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password', 'role', 'points', 'school_name', 'major', 'whatsapp_number', 'address', 'date_of_birth', 'start_date', 'end_date', 'social_media'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    public function tasks()
    {
        return $this->belongsToMany(Task::class);
    }

    public function reportedTasks()
    {
        return $this->hasMany(Task::class, 'reporter_id');
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }

    public function permissions()
    {
        return $this->hasMany(Permission::class);
    }
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public static function getAvailableStudentsCountByCampus($today = null)
    {
        if (!$today) {
            $today = now()->toDateString();
        }

        $activeStudentIds = \DB::table('task_user')
            ->join('tasks', 'task_user.task_id', '=', 'tasks.id')
            ->whereIn('tasks.status', ['pending', 'proses'])
            ->distinct()
            ->pluck('task_user.user_id')
            ->toArray();

        $attendances = Attendance::where('date', $today)
            ->whereNotNull('check_in')
            ->whereHas('user', function ($query) {
                $query->where('role', 'anak_pkl')
                      ->where('major', 'TKJ');
            })
            ->get();

        $kampus1Count = $attendances->filter(function ($att) use ($activeStudentIds) {
            return $att->in_campus === 'Kampus 1' 
                && !in_array($att->user_id, $activeStudentIds) 
                && is_null($att->check_out);
        })->count();

        $kampus2Count = $attendances->filter(function ($att) use ($activeStudentIds) {
            return $att->in_campus === 'Kampus 2' 
                && !in_array($att->user_id, $activeStudentIds) 
                && is_null($att->check_out);
        })->count();

        return [
            'Kampus 1' => $kampus1Count,
            'Kampus 2' => $kampus2Count,
        ];
    }
}
