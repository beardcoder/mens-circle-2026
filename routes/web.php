<?php

declare(strict_types=1);

use App\Http\Controllers\EventController;
use App\Http\Controllers\HealthCheckController;
use App\Http\Controllers\LlmsController;
use App\Http\Controllers\NewsletterController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\TestimonialSubmissionController;
use Illuminate\Support\Facades\Route;

Route::passkeys();
Route::get('/llms.txt', [LlmsController::class, 'show'])->name('llms.txt');

Route::get('/', [PageController::class, 'home'])->name('home');
Route::get('/event', [EventController::class, 'showNext'])->name('event.show');
Route::get('/event/{slug}', [EventController::class, 'show'])->name('event.show.slug');
Route::get('/teile-deine-erfahrung', [TestimonialSubmissionController::class, 'show'])->name('testimonial.form');

Route::post('/event/register', [EventController::class, 'register'])->name('event.register');
Route::post('/newsletter/subscribe', [NewsletterController::class, 'subscribe'])->name('newsletter.subscribe');
Route::get('/newsletter/unsubscribe/{token}', [NewsletterController::class, 'unsubscribe'])->name('newsletter.unsubscribe');
Route::post('/testimonial/submit', [TestimonialSubmissionController::class, 'submit'])->name('testimonial.submit');

Route::get('health', HealthCheckController::class);

// Dynamic pages (must be last to avoid conflicts)
Route::get('/{slug}', [PageController::class, 'show'])->name('page.show');
