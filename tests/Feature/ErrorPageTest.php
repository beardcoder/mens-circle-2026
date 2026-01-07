<?php

declare(strict_types=1);

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ErrorPageTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that 404 error page renders without errors.
     */
    public function test_404_page_renders_without_errors(): void
    {
        $response = $this->get('/non-existent-page-that-should-trigger-404');

        $response->assertStatus(404);
        $response->assertSee('404');
        $response->assertSee('Seite nicht gefunden');
    }

    /**
     * Test that 404 error page renders correctly without hasNextEvent variable.
     */
    public function test_404_page_handles_missing_has_next_event_variable(): void
    {
        // This test ensures the view doesn't crash when $hasNextEvent is undefined
        // The view should use the null coalescing operator to handle this gracefully
        $response = $this->get('/another-non-existent-page');

        $response->assertStatus(404);
        $response->assertViewIs('errors.404');
    }
}
