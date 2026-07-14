<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['latitude', 'longitude', 'latitude_2', 'longitude_2', 'radius', 'work_hour_start', 'work_hour_end', 'telegram_bot_token', 'telegram_chat_id', 'telegram_channel_link'])]
class Setting extends Model
{
    use HasFactory;
}
