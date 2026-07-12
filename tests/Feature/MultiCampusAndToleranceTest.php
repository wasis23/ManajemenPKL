<?php

namespace Tests\Feature;

use App\Models\Setting;
use App\Models\User;
use App\Models\Task;
use App\Models\Attendance;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MultiCampusAndToleranceTest extends TestCase
{
    use RefreshDatabase;

    protected $reporter;

    protected function setUp(): void
    {
        parent::setUp();

        // Create setting
        Setting::create([
            'latitude' => -7.5619,
            'longitude' => 110.8540,
            'radius' => 50,
            'work_hour_start' => '08:00:00',
            'work_hour_end' => '16:00:00',
        ]);

        // Create reporter (Dosen)
        $this->reporter = User::create([
            'name' => 'Dr. Advisor',
            'email' => 'dosen@pkl.com',
            'password' => bcrypt('password'),
            'role' => 'dosen',
        ]);
    }

    public function test_student_cannot_take_task_before_checking_in()
    {
        $student = User::create([
            'name' => 'Student Test',
            'email' => 'student@pkl.com',
            'password' => bcrypt('password'),
            'role' => 'anak_pkl',
        ]);

        $task = Task::create([
            'title' => 'Test Task',
            'description' => 'Test Description',
            'quota' => 1,
            'status' => 'pending',
            'reporter_id' => $this->reporter->id,
        ]);

        $response = $this->actingAs($student)->post(route('tasks.take', $task));
        
        $response->assertRedirect();
        $response->assertSessionHas('error', 'Anda harus melakukan absen masuk hari ini sebelum dapat mengambil tugas.');
    }

    public function test_late_check_in_within_tolerance()
    {
        $student = User::create([
            'name' => 'Student Test',
            'email' => 'student@pkl.com',
            'password' => bcrypt('password'),
            'role' => 'anak_pkl',
        ]);

        // Mock current time to be 08:30:00 (within 60 minutes of 08:00:00 start time)
        $this->travelTo(now()->setDate(2026, 7, 12)->setTime(8, 30, 0));

        $response = $this->actingAs($student)->post(route('attendance.check-in'), [
            'latitude' => -7.5619,
            'longitude' => 110.8540,
        ]);

        $response->assertRedirect();
        
        // Assert attendance record exists and status is 'late'
        $attendance = Attendance::where('user_id', $student->id)->first();
        $this->assertNotNull($attendance);
        $this->assertEquals('late', $attendance->status);
    }

    public function test_cannot_take_task_after_checking_out()
    {
        $student = User::create([
            'name' => 'Student Test',
            'email' => 'student@pkl.com',
            'password' => bcrypt('password'),
            'role' => 'anak_pkl',
        ]);

        $task = Task::create([
            'title' => 'Test Task',
            'description' => 'Test Description',
            'quota' => 1,
            'status' => 'pending',
            'reporter_id' => $this->reporter->id,
        ]);

        // Mock current time to be 07:30:00 (before work_hour_start)
        $this->travelTo(now()->setDate(2026, 7, 12)->setTime(7, 30, 0));

        // 1. Check in
        $responseCheckIn = $this->actingAs($student)->post(route('attendance.check-in'), [
            'latitude' => -7.5619,
            'longitude' => 110.8540,
        ]);
        $responseCheckIn->assertRedirect();

        $attendance = Attendance::where('user_id', $student->id)->first();
        $this->assertEquals('present', $attendance->status);

        // 2. Check out (travel to after work_hour_end to allow checkout without block)
        $this->travelTo(now()->setDate(2026, 7, 12)->setTime(16, 30, 0));
        $responseCheckOut = $this->actingAs($student)->post(route('attendance.check-out'), [
            'latitude' => -7.5619,
            'longitude' => 110.8540,
        ]);
        $responseCheckOut->assertRedirect();

        // 3. Attempt to take task
        $responseTake = $this->actingAs($student)->post(route('tasks.take', $task));
        $responseTake->assertRedirect();
        $responseTake->assertSessionHas('error', 'Anda tidak dapat mengambil tugas setelah melakukan absen pulang.');
    }

    public function test_student_can_take_task_after_successful_check_in()
    {
        $student = User::create([
            'name' => 'Student Test',
            'email' => 'student@pkl.com',
            'password' => bcrypt('password'),
            'role' => 'anak_pkl',
        ]);

        $task = Task::create([
            'title' => 'Test Task',
            'description' => 'Test Description',
            'quota' => 1,
            'status' => 'pending',
            'reporter_id' => $this->reporter->id,
        ]);

        // Mock current time to be 07:30:00 (before work_hour_start)
        $this->travelTo(now()->setDate(2026, 7, 12)->setTime(7, 30, 0));

        // 1. Check in
        $responseCheckIn = $this->actingAs($student)->post(route('attendance.check-in'), [
            'latitude' => -7.5619,
            'longitude' => 110.8540,
        ]);
        $responseCheckIn->assertRedirect();

        // 2. Take task
        $responseTake = $this->actingAs($student)->post(route('tasks.take', $task));
        $responseTake->assertRedirect();
        $responseTake->assertSessionHas('success', 'Tugas berhasil diambil. Silakan kerjakan bersama tim Anda.');
    }
}
