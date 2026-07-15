<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SimlabService
{
    protected string $baseUrl;
    protected string $apiKey;

    public function __construct()
    {
        $this->baseUrl = config('services.simlab.base_url') ?: 'http://lab.poltekindonusa.ac.id/api';
        $this->apiKey = config('services.simlab.api_key') ?: 'simlab_secret_key_230398';
    }

    /**
     * Common HTTP client instance with X-API-KEY and Accept headers.
     */
    protected function request()
    {
        return Http::withoutVerifying()->timeout(5)->withHeaders([
            'X-API-KEY' => $this->apiKey,
            'Accept' => 'application/json',
        ]);
    }

    /**
     * Get list of laboratories.
     * URL: GET /laboratoriums
     */
    public function getLaboratoriums()
    {
        try {
            $response = $this->request()->get("{$this->baseUrl}/laboratoriums");
            return $response->json();
        } catch (\Exception $e) {
            Log::error("SIMLAB API Error (getLaboratoriums): " . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage(), 'data' => []];
        }
    }

    /**
     * Get list of assets.
     * URL: GET /asets?laboratorium_id={id}&kondisi={kondisi}
     */
    public function getAsets(array $filters = [])
    {
        try {
            $response = $this->request()->get("{$this->baseUrl}/asets", $filters);
            return $response->json();
        } catch (\Exception $e) {
            Log::error("SIMLAB API Error (getAsets): " . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage(), 'data' => []];
        }
    }

    /**
     * Create a new asset.
     * URL: POST /asets
     */
    public function createAset(array $payload)
    {
        try {
            $response = $this->request()->post("{$this->baseUrl}/asets", $payload);
            return $response->json();
        } catch (\Exception $e) {
            Log::error("SIMLAB API Error (createAset): " . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Create a new damage report/ticket.
     * URL: POST /tickets
     */
    public function createTicket(array $payload)
    {
        try {
            $response = $this->request()->post("{$this->baseUrl}/tickets", $payload);
            return $response->json();
        } catch (\Exception $e) {
            Log::error("SIMLAB API Error (createTicket): " . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Create a new loan request.
     * URL: POST /peminjamans
     */
    public function createPeminjaman(array $payload)
    {
        try {
            $response = $this->request()->post("{$this->baseUrl}/peminjamans", $payload);
            return $response->json();
        } catch (\Exception $e) {
            Log::error("SIMLAB API Error (createPeminjaman): " . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
}
