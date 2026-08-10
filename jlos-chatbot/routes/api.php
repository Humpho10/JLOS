<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\AdminInstitutionController;
use App\Http\Controllers\Admin\AdminInstitutionPageController;
use App\Http\Controllers\Admin\AdminLogoController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\EmailVerificationController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\ConversationController;
use App\Http\Controllers\InstitutionChatController;
use App\Http\Controllers\InstitutionController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/email/verification-notification', [EmailVerificationController::class, 'resend'])
        ->middleware('throttle:6,1');
});

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/institutions', [AdminInstitutionController::class, 'index']);
    Route::post('/institutions', [AdminInstitutionController::class, 'store']);
    Route::put('/institutions/{institution}', [AdminInstitutionController::class, 'update']);
    Route::delete('/institutions/{institution}', [AdminInstitutionController::class, 'destroy']);
    Route::post('/institutions/{institution}/scrape', [AdminInstitutionController::class, 'scrape']);
    Route::get('/institutions/{institution}/scrape-runs/latest', [AdminInstitutionController::class, 'latestScrapeRun']);

    Route::get('/institutions/{institution}/pages', [AdminInstitutionPageController::class, 'index']);
    Route::post('/institutions/{institution}/pages', [AdminInstitutionPageController::class, 'store']);
    Route::put('/institutions/{institution}/pages/{page}', [AdminInstitutionPageController::class, 'update']);
    Route::delete('/institutions/{institution}/pages/{page}', [AdminInstitutionPageController::class, 'destroy']);

    Route::post('/logo-candidates', [AdminLogoController::class, 'candidates']);
    Route::post('/logo-fetch', [AdminLogoController::class, 'fetchLogo']);
});

Route::get('/conversations/current', [ConversationController::class, 'current']);
Route::delete('/conversations/{conversation}/messages', [ConversationController::class, 'truncate']);
Route::get('/institutions', [InstitutionController::class, 'index']);
Route::post('/institutions/{slug}/chat', [InstitutionChatController::class, 'chat']);
Route::post('/institutions/{slug}/chat/stream', [InstitutionChatController::class, 'stream']);
Route::post('/chat', [ChatController::class, 'chat']);
Route::post('/chat/stream', [ChatController::class, 'stream']);
Route::post('/chat/interpret-attachment', [ChatController::class, 'interpretAttachment']);