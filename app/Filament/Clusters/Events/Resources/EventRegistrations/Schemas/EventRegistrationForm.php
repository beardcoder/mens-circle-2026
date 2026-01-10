<?php

declare(strict_types=1);

namespace App\Filament\Clusters\Events\Resources\EventRegistrations\Schemas;

use App\Models\Member;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Get;
use Filament\Forms\Set;
use Filament\Schemas\Schema;

class EventRegistrationForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Veranstaltung')
                    ->schema([
                        Select::make('event_id')
                            ->label('Veranstaltung')
                            ->relationship('event', 'title')
                            ->required()
                            ->searchable()
                            ->preload(),
                    ]),

                Section::make('Mitglied')
                    ->schema([
                        Select::make('member_id')
                            ->label('Bestehendes Mitglied auswählen')
                            ->relationship('member', 'email')
                            ->getOptionLabelFromRecordUsing(fn (Member $record) => "{$record->full_name} ({$record->email})")
                            ->searchable(['first_name', 'last_name', 'email'])
                            ->preload()
                            ->live()
                            ->afterStateUpdated(function (Get $get, Set $set, ?string $state): void {
                                if ($state) {
                                    $member = Member::find($state);
                                    if ($member) {
                                        $set('first_name', $member->first_name);
                                        $set('last_name', $member->last_name);
                                        $set('email', $member->email);
                                        $set('phone_number', $member->phone_number);
                                    }
                                }
                            })
                            ->helperText('Wähle ein bestehendes Mitglied oder gib die Daten manuell ein.'),
                    ]),

                Section::make('Kontaktdaten')
                    ->description('Diese Daten werden bei der Anmeldung gespeichert.')
                    ->schema([
                        TextInput::make('first_name')
                            ->label('Vorname')
                            ->required()
                            ->maxLength(255),
                        TextInput::make('last_name')
                            ->label('Nachname')
                            ->required()
                            ->maxLength(255),
                        TextInput::make('email')
                            ->label('E-Mail')
                            ->email()
                            ->required()
                            ->maxLength(255),
                        TextInput::make('phone_number')
                            ->label('Handynummer')
                            ->tel()
                            ->maxLength(30),
                    ])
                    ->columns(2),

                Section::make('Status')
                    ->schema([
                        Toggle::make('privacy_accepted')
                            ->label('Datenschutz akzeptiert')
                            ->default(false),
                        Select::make('status')
                            ->label('Status')
                            ->options([
                                'confirmed' => 'Bestätigt',
                                'cancelled' => 'Abgesagt',
                                'waitlist' => 'Warteliste',
                            ])
                            ->required()
                            ->default('confirmed'),
                        DateTimePicker::make('confirmed_at')
                            ->label('Bestätigt am')
                            ->native(false),
                    ])
                    ->columns(3),
            ]);
    }
}
