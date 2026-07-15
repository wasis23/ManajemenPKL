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

        $errorMessage = $response['message'] ?? 'Gagal menambahkan aset ke SIMLAB.';
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
