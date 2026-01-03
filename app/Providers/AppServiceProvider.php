<?php

declare(strict_types=1);

namespace App\Providers;

use App\Listeners\ClearSettingsCache;
use App\Models\Event;
use App\Models\EventRegistration;
use App\Observers\EventObserver;
use App\Observers\EventRegistrationObserver;
use Illuminate\Support\Facades\Event as EventFacade;
use Illuminate\Support\ServiceProvider;
use Spatie\LaravelSettings\Events\SettingsSaved;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Event::observe(EventObserver::class);
        EventRegistration::observe(EventRegistrationObserver::class);

        EventFacade::listen(SettingsSaved::class, ClearSettingsCache::class);
    }
}
