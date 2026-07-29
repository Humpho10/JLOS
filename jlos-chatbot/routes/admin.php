<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\InstitutionController;
use App\Http\Controllers\Admin\InstitutionPageController;
use App\Http\Controllers\Admin\InstitutionSyncController;
use App\Http\Controllers\Admin\MessageController;

// Routes in this file are already behind auth:sanctum (see routes/api.php),
// grouped under the /api/admin prefix. Phase-specific route groups
// (messages, institutions, institution pages/sync) are added here as
// their controllers are built.

Route::get('/messages', [MessageController::class, 'index']);
Route::get('/messages/{message}', [MessageController::class, 'show']);
Route::post('/messages/{message}/reply', [MessageController::class, 'reply']);

Route::middleware('role:super_admin')->group(function () {
    Route::get('/institutions', [InstitutionController::class, 'index']);
    Route::post('/institutions', [InstitutionController::class, 'store']);
    Route::put('/institutions/{institution}', [InstitutionController::class, 'update']);

    Route::get('/institutions/{institution}/pages', [InstitutionPageController::class, 'index']);
    Route::post('/institutions/{institution}/pages', [InstitutionPageController::class, 'store']);
    Route::put('/institutions/{institution}/pages/{page}', [InstitutionPageController::class, 'update']);
    Route::delete('/institutions/{institution}/pages/{page}', [InstitutionPageController::class, 'destroy']);

    Route::post('/institutions/{institution}/sync', [InstitutionSyncController::class, 'sync']);
    Route::get('/institutions/{institution}/sync-status', [InstitutionSyncController::class, 'status']);
});
