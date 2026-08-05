<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TopStudent extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'school_name',
        'major',
        'period',
        'points',
        'photo_path',
        'description',
        'is_active',
    ];

    protected $casts = [
        'points' => 'integer',
        'is_active' => 'boolean',
    ];
}
