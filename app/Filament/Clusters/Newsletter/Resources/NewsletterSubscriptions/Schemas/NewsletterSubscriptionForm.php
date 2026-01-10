<?php

declare(strict_types=1);

namespace App\Filament\Clusters\Newsletter\Resources\NewsletterSubscriptions\Schemas;

use App\Models\Member;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Get;
use Filament\Forms\Set;
use Filament\Schemas\Schema;

class NewsletterSubscriptionForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Mitglied')
                    ->schema([
                        Select::make('member_id')
                            ->label('Mitglied')
                            ->relationship('member', 'email')
                            ->getOptionLabelFromRecordUsing(fn (Member $record) => "{$record->full_name} ({$record->email})")
                            ->searchable(['first_name', 'last_name', 'email'])
                            ->preload()
                            ->live()
                            ->afterStateUpdated(function (Get $get, Set $set, ?string $state): void {
                                if ($state) {
                                    $member = Member::find($state);
                                    if ($member) {
                                        $set('email', $member->email);
                                    }
                                }
                            })
                            ->helperText('Wähle ein Mitglied für diese Subscription.'),
                    ]),

                Section::make('Subscription')
                    ->schema([
                        TextInput::make('email')
                            ->label('E-Mail')
                            ->email()
                            ->required()
                            ->maxLength(255)
                            ->unique(ignoreRecord: true),
                        Select::make('status')
                            ->label('Status')
                            ->options([
                                'active' => 'Aktiv',
                                'unsubscribed' => 'Abgemeldet',
                            ])
                            ->required()
                            ->default('active'),
                    ])
                    ->columns(2),

                Section::make('Zeitstempel')
                    ->schema([
                        DateTimePicker::make('subscribed_at')
                            ->label('Angemeldet am')
                            ->disabled()
                            ->displayFormat('d.m.Y H:i'),
                        DateTimePicker::make('unsubscribed_at')
                            ->label('Abgemeldet am')
                            ->disabled()
                            ->displayFormat('d.m.Y H:i'),
                    ])
                    ->columns(2)
                    ->collapsed(),
            ]);
    }
}
