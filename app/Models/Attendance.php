<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['user_id', 'date', 'check_in', 'check_out', 'in_latitude', 'in_longitude', 'out_latitude', 'out_longitude', 'status', 'in_selfie', 'out_selfie'])]
class Attendance extends Model
{
    use HasFactory;

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
