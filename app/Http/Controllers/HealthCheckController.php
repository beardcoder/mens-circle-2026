<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Spatie\CpuLoadHealthCheck\CpuLoadCheck;
use Spatie\Health\Checks\Checks\CacheCheck;
use Spatie\Health\Checks\Checks\DatabaseCheck;
use Spatie\Health\Checks\Checks\DatabaseConnectionCountCheck;
use Spatie\Health\Checks\Checks\DebugModeCheck;
use Spatie\Health\Checks\Checks\EnvironmentCheck;
use Spatie\Health\Checks\Checks\OptimizedAppCheck;
use Spatie\Health\Checks\Checks\QueueCheck;
use Spatie\Health\Checks\Checks\ScheduleCheck;
use Spatie\Health\Checks\Checks\UsedDiskSpaceCheck;
use Spatie\Health\Facades\Health;
use Spatie\SecurityAdvisoriesHealthCheck\SecurityAdvisoriesCheck;

class HealthCheckController extends Controller
{
    /**
     * Run health checks and return results.
     * Checks are only registered when this endpoint is called (lazy loading).
     */
    public function __invoke(): JsonResponse
    {
        // Register checks only when this endpoint is called
        Health::checks([
            // Environment & Configuration Checks
            EnvironmentCheck::new(),
            DebugModeCheck::new(),
            OptimizedAppCheck::new(),

            // Infrastructure & System Checks
            CacheCheck::new(),
            DatabaseCheck::new(),
            DatabaseConnectionCountCheck::new()
                ->warnWhenMoreConnectionsThan(50)
                ->failWhenMoreConnectionsThan(100),
            UsedDiskSpaceCheck::new()
                ->warnWhenUsedSpaceIsAbovePercentage(80)
                ->failWhenUsedSpaceIsAbovePercentage(90),
            CpuLoadCheck::new()
                ->failWhenLoadIsHigherInTheLast5Minutes(2.0)
                ->failWhenLoadIsHigherInTheLast15Minutes(1.5),

            QueueCheck::new(),
            ScheduleCheck::new(),

            // Security Checks
            SecurityAdvisoriesCheck::new(),
        ]);

        // Run checks and return results
        $results = Health::check();

        return response()->json([
            'finishedAt' => $results->finishedAt->toISOString(),
            'checkResults' => $results->storedCheckResults->map(fn ($result) => [
                'name' => $result->check->getName(),
                'label' => $result->check->getLabel(),
                'status' => $result->status,
                'notificationMessage' => $result->getNotificationMessage(),
                'shortSummary' => $result->getShortSummary(),
                'meta' => $result->meta,
            ]),
        ]);
    }
}
