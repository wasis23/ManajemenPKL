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
        Schema::table('tasks', function (Blueprint $table) {
            // Drop foreign key first so we can modify the column
            $table->dropForeign(['reporter_id']);
        });

        Schema::table('tasks', function (Blueprint $table) {
            $table->foreignId('reporter_id')->nullable()->change();
            $table->foreign('reporter_id')->references('id')->on('users')->onDelete('cascade');
            $table->string('requester_name')->nullable();
            $table->string('target_room')->nullable();
            $table->string('campus_type')->nullable(); // 'Kampus 1' atau 'Kampus 2'
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropForeign(['reporter_id']);
        });

        Schema::table('tasks', function (Blueprint $table) {
            $table->foreignId('reporter_id')->nullable(false)->change();
            $table->foreign('reporter_id')->references('id')->on('users')->onDelete('cascade');
            $table->dropColumn(['requester_name', 'target_room', 'campus_type']);
        });
    }
};
