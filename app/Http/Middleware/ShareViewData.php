<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Models\Event;
use App\Settings\GeneralSettings;
use Closure;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\View;
use Symfony\Component\HttpFoundation\Response;

class ShareViewData
{
    /**
     * Share global view data for frontend requests only.
     * This middleware only runs for web frontend routes, not admin/health/api.
     */
    public function handle(Request $request, Closure $next): Response
    {
        try {
            // Cache check for next event (invalidated via EventObserver)
            $hasNextEvent = cache()->rememberForever('has_next_event', function () {
                return Event::query()
                    ->where('is_published', true)
                    ->where('event_date', '>=', now())
                    ->exists();
            });

            // Share data with all views
            View::share([
                'hasNextEvent' => $hasNextEvent,
                'settings' => app(GeneralSettings::class),
            ]);
        } catch (Exception $exception) {
            // During build time or when database is unavailable, skip view data sharing
            // This prevents "could not find driver" errors during composer dump-autoload
        }

        return $next($request);
    }
}
