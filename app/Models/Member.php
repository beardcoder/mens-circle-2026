<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Member extends Model
{
    use HasFactory;

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone_number',
    ];

    public function eventRegistrations(): HasMany
    {
        return $this->hasMany(EventRegistration::class);
    }

    public function newsletterSubscription(): HasOne
    {
        return $this->hasOne(NewsletterSubscription::class);
    }

    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    public function isSubscribedToNewsletter(): bool
    {
        return $this->newsletterSubscription?->status === 'active';
    }

    public function confirmedEventRegistrations(): HasMany
    {
        return $this->eventRegistrations()->where('status', 'confirmed');
    }
}
