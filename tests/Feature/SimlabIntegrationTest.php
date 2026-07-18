<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\SimlabService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SimlabIntegrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_store_asset_success(): void
    {
        $user = User::factory()->create(['role' => 'admin']);

        $this->mock(SimlabService::class, function ($mock) {
            $mock->shouldReceive('createAset')
                ->once()
                ->with(\Mockery::on(function ($payload) {
                    return $payload['kode_aset'] === 'LAB01-PC99' && $payload['nama_aset'] === 'PC Lenovo Baru';
                }))
                ->andReturn([
                    'success' => true,
                    'message' => 'Aset created successfully.',
                    'data' => []
                ]);
        });

        $response = $this->actingAs($user)
            ->post('/simlab/assets', [
                'laboratorium_id' => 1,
                'kode_aset' => 'LAB01-PC99',
                'nama_aset' => 'PC Lenovo Baru',
                'jenis_aset' => 'PC',
                'kondisi' => 'baik',
                'stok' => 5,
                'posisi_meja' => 12,
                'spesifikasi' => [
                    'cpu' => 'Intel i7',
                    'ram' => '16GB'
                ]
            ]);

        $response->assertSessionHasNoErrors();
        $response->assertStatus(302);
        $this->assertEquals('Aset baru berhasil ditambahkan ke SIMLAB.', session('success'));
    }

    public function test_store_asset_validation_error_from_api(): void
    {
        $user = User::factory()->create(['role' => 'admin']);

        $this->mock(SimlabService::class, function ($mock) {
            $mock->shouldReceive('createAset')
                ->once()
                ->andReturn([
                    'success' => false,
                    'errors' => [
                        'kode_aset' => ['The kode aset has already been taken.']
                    ]
                ]);
        });

        $response = $this->actingAs($user)
            ->post('/simlab/assets', [
                'laboratorium_id' => 1,
                'kode_aset' => 'LAB01-PC99',
                'nama_aset' => 'PC Lenovo Baru',
                'jenis_aset' => 'PC',
                'kondisi' => 'baik',
                'stok' => 5,
                'posisi_meja' => 12,
                'spesifikasi' => [
                    'cpu' => 'Intel i7',
                    'ram' => '16GB'
                ]
            ]);

        $response->assertSessionHasErrors(['kode_aset']);
    }

    public function test_update_asset_success(): void
    {
        $user = User::factory()->create(['role' => 'admin']);

        $this->mock(SimlabService::class, function ($mock) {
            $mock->shouldReceive('updateAset')
                ->once()
                ->with(42, \Mockery::on(function ($payload) {
                    return $payload['nama_aset'] === 'PC Lenovo Updated';
                }))
                ->andReturn([
                    'success' => true,
                    'message' => 'Aset updated successfully.',
                    'data' => []
                ]);
        });

        $response = $this->actingAs($user)
            ->put('/simlab/assets/42', [
                'laboratorium_id' => 1,
                'kode_aset' => 'LAB01-PC99',
                'nama_aset' => 'PC Lenovo Updated',
                'jenis_aset' => 'PC',
                'kondisi' => 'baik',
                'stok' => 5,
                'posisi_meja' => 12,
                'spesifikasi' => [
                    'cpu' => 'Intel i7',
                    'ram' => '16GB'
                ]
            ]);

        $response->assertSessionHasNoErrors();
        $response->assertStatus(302);
        $this->assertEquals('Aset berhasil diperbarui di SIMLAB.', session('success'));
    }

    public function test_update_asset_validation_error_from_api(): void
    {
        $user = User::factory()->create(['role' => 'admin']);

        $this->mock(SimlabService::class, function ($mock) {
            $mock->shouldReceive('updateAset')
                ->once()
                ->with(42, \Mockery::any())
                ->andReturn([
                    'success' => false,
                    'errors' => [
                        'kode_aset' => ['The kode aset has already been taken.']
                    ]
                ]);
        });

        $response = $this->actingAs($user)
            ->put('/simlab/assets/42', [
                'laboratorium_id' => 1,
                'kode_aset' => 'LAB01-PC99',
                'nama_aset' => 'PC Lenovo Updated',
                'jenis_aset' => 'PC',
                'kondisi' => 'baik',
                'stok' => 5,
                'posisi_meja' => 12,
                'spesifikasi' => [
                    'cpu' => 'Intel i7',
                    'ram' => '16GB'
                ]
            ]);

        $response->assertSessionHasErrors(['kode_aset']);
    }
}
