<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['title', 'description', 'reporter_id', 'quota', 'status', 'is_assisted', 'proof_photo'])]
class Task extends Model
{
    use HasFactory;

    public function reporter()
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }

    public function students()
    {
        return $this->belongsToMany(User::class);
    }
}
