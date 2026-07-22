<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\InstitutionChatController;
use App\Http\Controllers\InstitutionController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/institutions', [InstitutionController::class, 'index']);
Route::post('/institutions/{slug}/chat', [InstitutionChatController::class, 'chat']);