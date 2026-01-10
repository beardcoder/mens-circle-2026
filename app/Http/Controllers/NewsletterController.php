<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\NewsletterSubscriptionRequest;
use App\Mail\NewsletterWelcome;
use App\Models\NewsletterSubscription;
use App\Services\MemberService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\View\View;

class NewsletterController extends Controller
{
    public function __construct(
        private readonly MemberService $memberService
    ) {}

    public function subscribe(NewsletterSubscriptionRequest $request): JsonResponse
    {
        $validated = $request->validated();

        // Find or create member
        $member = $this->memberService->findOrCreate(
            email: $validated['email']
        );

        // Check if already subscribed
        if ($this->memberService->isSubscribedToNewsletter($member)) {
            return response()->json([
                'success' => false,
                'message' => 'Diese E-Mail-Adresse ist bereits für den Newsletter angemeldet.',
            ], 409);
        }

        // Subscribe member to newsletter
        $subscription = $this->memberService->subscribeToNewsletter($member);

        // Send welcome email
        try {
            Mail::to($subscription->email)->queue(new NewsletterWelcome($subscription));
        } catch (Exception $exception) {
            Log::error('Failed to send newsletter welcome email', [
                'subscription_id' => $subscription->id,
                'member_id' => $member->id,
                'email' => $subscription->email,
                'error' => $exception->getMessage(),
            ]);
            // Don't fail the subscription if email fails
        }

        return response()->json([
            'success' => true,
            'message' => 'Vielen Dank! Du wurdest erfolgreich für den Newsletter angemeldet.',
        ]);
    }

    public function unsubscribe(string $token): View
    {
        $subscription = NewsletterSubscription::where('token', $token)->firstOrFail();

        if ($subscription->status === 'unsubscribed') {
            return view('newsletter.unsubscribed', [
                'message' => 'Diese E-Mail-Adresse wurde bereits vom Newsletter abgemeldet.',
            ]);
        }

        $subscription->update([
            'status' => 'unsubscribed',
            'unsubscribed_at' => now(),
        ]);

        return view('newsletter.unsubscribed', [
            'message' => 'Du wurdest erfolgreich vom Newsletter abgemeldet.',
        ]);
    }
}
