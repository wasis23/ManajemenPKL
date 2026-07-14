<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Agenda;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AgendaTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Ensure settings exist as expected by DashboardController
        \App\Models\Setting::create([
            'latitude' => -7.5619,
            'longitude' => 110.8540,
            'radius' => 50,
        ]);
    }

    public function test_student_cannot_create_agenda()
    {
        $student = User::create([
            'name' => 'Student User',
            'email' => 'student@pkl.com',
            'password' => bcrypt('password'),
            'role' => 'anak_pkl',
        ]);

        $response = $this->actingAs($student)->post(route('agendas.store'), [
            'title' => 'Test Agenda',
            'date' => '2026-07-20',
        ]);

        $response->assertForbidden();
        $this->assertDatabaseEmpty('agendas');
    }

    public function test_admin_can_create_agenda()
    {
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@pkl.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        $response = $this->actingAs($admin)->post(route('agendas.store'), [
            'title' => 'Important Briefing',
            'description' => 'Detailed description of the briefing.',
            'date' => '2026-07-20',
            'start_time' => '09:00',
            'end_time' => '11:00',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('agendas', [
            'title' => 'Important Briefing',
            'description' => 'Detailed description of the briefing.',
            'date' => '2026-07-20',
            'start_time' => '09:00:00',
            'end_time' => '11:00:00',
            'created_by' => $admin->id,
        ]);
    }

    public function test_admin_can_update_agenda()
    {
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@pkl.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        $agenda = Agenda::create([
            'title' => 'Old Title',
            'date' => '2026-07-20',
            'created_by' => $admin->id,
        ]);

        $response = $this->actingAs($admin)->patch(route('agendas.update', $agenda->id), [
            'title' => 'Updated Title',
            'description' => 'Updated description.',
            'date' => '2026-07-21',
            'start_time' => '10:00',
            'end_time' => '12:00',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('agendas', [
            'id' => $agenda->id,
            'title' => 'Updated Title',
            'description' => 'Updated description.',
            'date' => '2026-07-21',
            'start_time' => '10:00:00',
            'end_time' => '12:00:00',
        ]);
    }

    public function test_admin_can_delete_agenda()
    {
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@pkl.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        $agenda = Agenda::create([
            'title' => 'Delete Me',
            'date' => '2026-07-20',
            'created_by' => $admin->id,
        ]);

        $response = $this->actingAs($admin)->delete(route('agendas.destroy', $agenda->id));

        $response->assertRedirect();
        $this->assertDatabaseMissing('agendas', [
            'id' => $agenda->id,
        ]);
    }

    public function test_agendas_are_visible_on_dashboard()
    {
        $student = User::create([
            'name' => 'Student User',
            'email' => 'student@pkl.com',
            'password' => bcrypt('password'),
            'role' => 'anak_pkl',
        ]);

        $agenda = Agenda::create([
            'title' => 'Public Agenda',
            'date' => '2026-07-20',
        ]);

        $response = $this->actingAs($student)->get(route('dashboard'));

        $response->assertOk();
        
        // Assert that the agendas prop contains the created agenda
        $response->assertInertia(fn ($page) => $page
            ->has('agendas', 1)
            ->where('agendas.0.title', 'Public Agenda')
        );
    }
}
