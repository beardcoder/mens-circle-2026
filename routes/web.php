<?php

use App\Http\Controllers\BreathworkController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\LlmsController;
use App\Http\Controllers\NewsletterController;
use App\Http\Controllers\PageController;
use Illuminate\Support\Facades\Route;

Route::get('/llms.txt', [LlmsController::class, 'show'])->name('llms.txt');

Route::get('/', [PageController::class, 'home'])->name('home');
Route::get('/event', [EventController::class, 'showNext'])->name('event.show');
Route::get('/event/{slug}', [EventController::class, 'show'])->name('event.show.slug');
Route::get('/breathwork', [BreathworkController::class, 'show'])->name('breathwork');

// Non-cached routes
Route::middleware('doNotCacheResponse')->group(function () {
    Route::post('/event/register', [EventController::class, 'register'])->name('event.register');
    Route::post('/newsletter/subscribe', [NewsletterController::class, 'subscribe'])->name('newsletter.subscribe');
    Route::get('/newsletter/unsubscribe/{token}', [NewsletterController::class, 'unsubscribe'])->name('newsletter.unsubscribe');
});

// Dynamic pages (must be last to avoid conflicts)
Route::get('/{slug}', [PageController::class, 'show'])->name('page.show');
