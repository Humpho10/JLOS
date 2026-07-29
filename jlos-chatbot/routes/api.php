<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\InstitutionChatController;
use App\Http\Controllers\InstitutionContactController;
use App\Http\Controllers\InstitutionController;
use App\Http\Controllers\Admin\AuthController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/institutions', [InstitutionController::class, 'index']);
Route::post('/institutions/{slug}/chat', [InstitutionChatController::class, 'chat']);
Route::post('/institutions/{slug}/chat/stream', [InstitutionChatController::class, 'stream']);
Route::post('/institutions/{slug}/contact', [InstitutionContactController::class, 'store']);
Route::post('/chat', [ChatController::class, 'chat']);
Route::post('/chat/stream', [ChatController::class, 'stream']);
Route::post('/chat/interpret-attachment', [ChatController::class, 'interpretAttachment']);

Route::prefix('admin')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);

        require __DIR__.'/admin.php';
    });
});