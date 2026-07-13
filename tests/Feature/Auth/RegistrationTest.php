<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_can_be_rendered(): void
    {
        $response = $this->get('/register');

        $response->assertStatus(200);
    }

    public function test_new_users_can_register(): void
    {
        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'school_name' => 'SMK Indonusa',
            'major' => 'Rekayasa Perangkat Lunak',
            'whatsapp_number' => '08123456789',
            'address' => 'Surakarta',
            'date_of_birth' => '2005-05-15',
            'start_date' => '2026-07-01',
            'end_date' => '2026-12-31',
            'social_media' => '@test',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
    }
}
