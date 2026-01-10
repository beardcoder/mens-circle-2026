<?php

declare(strict_types=1);

use App\Models\EventRegistration;
use App\Models\Member;
use App\Models\NewsletterSubscription;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Step 1: Add member_id to event_registrations (nullable for now)
        Schema::table('event_registrations', function (Blueprint $table): void {
            $table->foreignId('member_id')->nullable()->after('event_id')->constrained()->cascadeOnDelete();
        });

        // Step 2: Add member_id to newsletter_subscriptions (nullable for now)
        Schema::table('newsletter_subscriptions', function (Blueprint $table): void {
            $table->foreignId('member_id')->nullable()->after('id')->constrained()->cascadeOnDelete();
        });

        // Step 3: Migrate existing data
        $this->migrateExistingData();

        // Step 4: Drop old unique constraint and add new one for event_registrations
        Schema::table('event_registrations', function (Blueprint $table): void {
            $table->dropUnique(['event_id', 'email']);
            $table->unique(['event_id', 'member_id']);
        });

        // Step 5: Make member_id required for event_registrations
        // (newsletter_subscriptions keeps it nullable because not everyone registers for events)
        Schema::table('event_registrations', function (Blueprint $table): void {
            $table->foreignId('member_id')->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('event_registrations', function (Blueprint $table): void {
            $table->dropUnique(['event_id', 'member_id']);
            $table->unique(['event_id', 'email']);
            $table->dropConstrainedForeignId('member_id');
        });

        Schema::table('newsletter_subscriptions', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('member_id');
        });
    }

    private function migrateExistingData(): void
    {
        // Create members from event registrations
        $registrations = DB::table('event_registrations')->get();

        foreach ($registrations as $registration) {
            $member = Member::firstOrCreate(
                ['email' => $registration->email],
                [
                    'first_name' => $registration->first_name,
                    'last_name' => $registration->last_name,
                    'phone_number' => $registration->phone_number,
                ]
            );

            // Update phone number if member exists but doesn't have one
            if (empty($member->phone_number) && ! empty($registration->phone_number)) {
                $member->update(['phone_number' => $registration->phone_number]);
            }

            DB::table('event_registrations')
                ->where('id', $registration->id)
                ->update(['member_id' => $member->id]);
        }

        // Link newsletter subscriptions to members (or create new members)
        $subscriptions = DB::table('newsletter_subscriptions')->get();

        foreach ($subscriptions as $subscription) {
            $member = Member::where('email', $subscription->email)->first();

            if ($member) {
                // Member already exists from event registration
                DB::table('newsletter_subscriptions')
                    ->where('id', $subscription->id)
                    ->update(['member_id' => $member->id]);
            } else {
                // Create a new member from newsletter subscription
                // Note: We don't have first_name/last_name, so we use email parts
                $emailParts = explode('@', $subscription->email);
                $member = Member::create([
                    'email' => $subscription->email,
                    'first_name' => ucfirst($emailParts[0]),
                    'last_name' => '',
                ]);

                DB::table('newsletter_subscriptions')
                    ->where('id', $subscription->id)
                    ->update(['member_id' => $member->id]);
            }
        }
    }
};
