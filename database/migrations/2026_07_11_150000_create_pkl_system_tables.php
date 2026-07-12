<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Table settings for campus coordinates configuration
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->decimal('latitude', 10, 8)->default(-7.5619); // Default near Politeknik Indonusa Surakarta if needed
            $table->decimal('longitude', 11, 8)->default(110.8540);
            $table->integer('radius')->default(50); // Default 50 meters
            $table->time('work_hour_start')->default('08:00:00');
            $table->time('work_hour_end')->default('16:00:00');
            $table->timestamps();
        });

        // 2. Table tasks for problems reported by Staf & Dosen
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description');
            $table->foreignId('reporter_id')->constrained('users')->onDelete('cascade');
            $table->integer('quota')->default(1);
            $table->string('status')->default('pending'); // pending, proses, sukses
            $table->boolean('is_assisted')->default(false); // true if assisted by supervisor, false if mandiri
            $table->string('proof_photo')->nullable(); // path to the uploaded proof photo
            $table->timestamps();
        });

        // 3. Table task_user (pivot table between tasks and PKL students)
        Schema::create('task_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->constrained('tasks')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });

        // 4. Table attendances for recording PKL students daily logs
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->date('date');
            $table->time('check_in')->nullable();
            $table->time('check_out')->nullable();
            $table->decimal('in_latitude', 10, 8)->nullable();
            $table->decimal('in_longitude', 11, 8)->nullable();
            $table->decimal('out_latitude', 10, 8)->nullable();
            $table->decimal('out_longitude', 11, 8)->nullable();
            $table->string('status')->default('present'); // present, rejected
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendances');
        Schema::dropIfExists('task_user');
        Schema::dropIfExists('tasks');
        Schema::dropIfExists('settings');
    }
};
