<?php

use App\Http\Controllers\Auth\EmailVerificationController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/chat', fn () => view('chat'));

Route::get('/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])
    ->middleware('signed')
    ->name('verification.verify');