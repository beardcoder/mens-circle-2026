<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Member;
use App\Models\NewsletterSubscription;

class MemberService
{
    /**
     * Find or create a member based on email.
     * Updates member data if new information is provided.
     */
    public function findOrCreate(
        string $email,
        ?string $firstName = null,
        ?string $lastName = null,
        ?string $phoneNumber = null
    ): Member {
        $member = Member::where('email', $email)->first();

        if ($member) {
            $this->updateMemberData($member, $firstName, $lastName, $phoneNumber);

            return $member;
        }

        return Member::create([
            'email' => $email,
            'first_name' => $firstName ?? $this->extractNameFromEmail($email),
            'last_name' => $lastName ?? '',
            'phone_number' => $phoneNumber,
        ]);
    }

    /**
     * Update member data with new information if fields are empty or outdated.
     */
    private function updateMemberData(
        Member $member,
        ?string $firstName,
        ?string $lastName,
        ?string $phoneNumber
    ): void {
        $updates = [];

        // Update first_name if member has a placeholder name (extracted from email)
        if ($firstName && (empty($member->first_name) || $member->first_name === $this->extractNameFromEmail($member->email))) {
            $updates['first_name'] = $firstName;
        }

        // Update last_name if empty
        if ($lastName && empty($member->last_name)) {
            $updates['last_name'] = $lastName;
        }

        // Update phone_number if empty
        if ($phoneNumber && empty($member->phone_number)) {
            $updates['phone_number'] = $phoneNumber;
        }

        if (! empty($updates)) {
            $member->update($updates);
        }
    }

    /**
     * Extract a readable name from an email address.
     */
    private function extractNameFromEmail(string $email): string
    {
        $localPart = explode('@', $email)[0];
        // Replace common separators with spaces and capitalize
        $name = str_replace(['.', '_', '-'], ' ', $localPart);

        return ucwords($name);
    }

    /**
     * Check if a member is subscribed to the newsletter.
     */
    public function isSubscribedToNewsletter(Member $member): bool
    {
        return $member->newsletterSubscription?->status === 'active';
    }

    /**
     * Subscribe a member to the newsletter or reactivate an existing subscription.
     * Returns the subscription instance.
     */
    public function subscribeToNewsletter(Member $member): NewsletterSubscription
    {
        $subscription = NewsletterSubscription::withTrashed()
            ->where('member_id', $member->id)
            ->orWhere('email', $member->email)
            ->first();

        if ($subscription) {
            // Reactivate existing subscription
            $subscription->update([
                'member_id' => $member->id,
                'email' => $member->email,
                'status' => 'active',
                'subscribed_at' => now(),
                'unsubscribed_at' => null,
                'deleted_at' => null,
            ]);

            return $subscription->fresh();
        }

        return NewsletterSubscription::create([
            'member_id' => $member->id,
            'email' => $member->email,
            'status' => 'active',
        ]);
    }

    /**
     * Check if a member has already registered for a specific event.
     */
    public function hasRegisteredForEvent(Member $member, int $eventId): bool
    {
        return $member->eventRegistrations()
            ->where('event_id', $eventId)
            ->exists();
    }
}
