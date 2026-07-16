<?php

namespace App\Http\Controllers;

use App\Services\SimlabService;
use Illuminate\Http\Request;

class SimlabController extends Controller
{
    protected SimlabService $simlabService;

    public function __construct(SimlabService $simlabService)
    {
        $this->simlabService = $simlabService;
    }

    /**
     * Store a new asset in SIMLAB.
     */
    public function storeAsset(Request $request)
    {
        $validated = $request->validate([
            'laboratorium_id' => 'required|integer',
            'kode_aset' => 'required|string',
            'nama_aset' => 'required|string',
            'jenis_aset' => 'required|in:statis,consumable,loanable',
            'kondisi' => 'nullable|in:baik,rusak_ringan,rusak_berat',
            'stok' => 'nullable|integer|min:1',
            'posisi_meja' => 'nullable|integer',
            'spesifikasi' => 'nullable|array',
            'spesifikasi.cpu' => 'nullable|string',
            'spesifikasi.ram' => 'nullable|string',
        ]);

        // Clean up empty fields in spesifikasi
        if (isset($validated['spesifikasi'])) {
            $validated['spesifikasi'] = array_filter($validated['spesifikasi']);
            if (empty($validated['spesifikasi'])) {
                unset($validated['spesifikasi']);
            }
        }

        $response = $this->simlabService->createAset(array_filter($validated, fn($value) => !is_null($value)));

        if (isset($response['success']) && $response['success']) {
            return back()->with('success', 'Aset baru berhasil ditambahkan ke SIMLAB.');
        }

        if (isset($response['errors']) && is_array($response['errors'])) {
            throw \Illuminate\Validation\ValidationException::withMessages($response['errors']);
        }

        $errorMessage = $response['message'] ?? 'Gagal menambahkan aset ke SIMLAB.';
        return back()->with('error', $errorMessage);
    }

    /**
     * Update an asset in SIMLAB.
     */
    public function updateAsset(Request $request, $id)
    {
        $validated = $request->validate([
            'laboratorium_id' => 'sometimes|integer',
            'kode_aset' => 'sometimes|string',
            'nama_aset' => 'sometimes|string',
            'jenis_aset' => 'sometimes|in:statis,consumable,loanable',
            'kondisi' => 'sometimes|nullable|in:baik,rusak_ringan,rusak_berat',
            'stok' => 'sometimes|nullable|integer|min:0',
            'posisi_meja' => 'sometimes|nullable|integer|min:1',
            'spesifikasi' => 'sometimes|nullable|array',
            'spesifikasi.cpu' => 'sometimes|nullable|string',
            'spesifikasi.ram' => 'sometimes|nullable|string',
        ]);

        // Clean up empty fields in spesifikasi
        if (isset($validated['spesifikasi'])) {
            $validated['spesifikasi'] = array_filter($validated['spesifikasi']);
            if (empty($validated['spesifikasi'])) {
                unset($validated['spesifikasi']);
            }
        }

        $payload = array_filter($validated, fn($value) => !is_null($value));

        $response = $this->simlabService->updateAset($id, $payload);

        if (isset($response['success']) && $response['success']) {
            return back()->with('success', 'Aset berhasil diperbarui di SIMLAB.');
        }

        if (isset($response['errors']) && is_array($response['errors'])) {
            throw \Illuminate\Validation\ValidationException::withMessages($response['errors']);
        }

        $errorMessage = $response['message'] ?? 'Gagal memperbarui aset di SIMLAB.';
        return back()->with('error', $errorMessage);
    }

    /**
     * Store a new damage report/ticket in SIMLAB.
     */
    public function storeTicket(Request $request)
    {
        $validated = $request->validate([
            'aset_id' => 'required|integer',
            'nama_pelapor' => 'required|string|max:255',
            'deskripsi_kerusakan' => 'required|string',
            'email_pelapor' => 'nullable|email|max:255',
        ]);

        $response = $this->simlabService->createTicket(array_filter($validated, fn($value) => !is_null($value)));

        if (isset($response['success']) && $response['success']) {
            return back()->with('success', 'Laporan kerusakan berhasil dikirim ke SIMLAB.');
        }

        $errorMessage = $response['message'] ?? 'Gagal mengirim laporan kerusakan ke SIMLAB.';
        return back()->with('error', $errorMessage);
    }

    /**
     * Store a new loan request in SIMLAB.
     */
    public function storeLoan(Request $request)
    {
        $validated = $request->validate([
            'email_peminjam' => 'required|email|max:255',
            'aset_id' => 'required|integer',
            'jumlah' => 'required|integer|min:1',
            'tanggal_pinjam' => 'required|date_format:Y-m-d',
            'tanggal_kembali_rencana' => 'required|date_format:Y-m-d|after_or_equal:tanggal_pinjam',
            'catatan' => 'nullable|string',
        ]);

        $response = $this->simlabService->createPeminjaman(array_filter($validated, fn($value) => !is_null($value)));

        if (isset($response['success']) && $response['success']) {
            return back()->with('success', 'Permintaan peminjaman berhasil dikirim ke SIMLAB.');
        }

        $errorMessage = $response['message'] ?? 'Gagal mengirim permintaan peminjaman ke SIMLAB.';
        return back()->with('error', $errorMessage);
    }
}
