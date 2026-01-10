<?php

declare(strict_types=1);

namespace App\Filament\Clusters\Members\Resources\Members\RelationManagers;

use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class EventRegistrationsRelationManager extends RelationManager
{
    protected static string $relationship = 'eventRegistrations';

    protected static ?string $title = 'Event-Anmeldungen';

    protected static ?string $modelLabel = 'Anmeldung';

    protected static ?string $pluralModelLabel = 'Anmeldungen';

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('event.event_date')
                    ->label('Datum')
                    ->dateTime('d.m.Y')
                    ->sortable(),
                TextColumn::make('event.title')
                    ->label('Veranstaltung')
                    ->searchable()
                    ->limit(40),
                TextColumn::make('status')
                    ->label('Status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'confirmed' => 'success',
                        'cancelled' => 'danger',
                        'waitlist' => 'warning',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'confirmed' => 'Bestätigt',
                        'cancelled' => 'Abgesagt',
                        'waitlist' => 'Warteliste',
                        default => $state,
                    }),
                TextColumn::make('confirmed_at')
                    ->label('Bestätigt am')
                    ->dateTime('d.m.Y H:i')
                    ->placeholder('-'),
                TextColumn::make('created_at')
                    ->label('Angemeldet am')
                    ->dateTime('d.m.Y H:i')
                    ->sortable(),
            ])
            ->defaultSort('event.event_date', 'desc')
            ->paginated([10, 25, 50]);
    }
}
