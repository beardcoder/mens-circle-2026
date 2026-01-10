<?php

declare(strict_types=1);

namespace App\Filament\Clusters\Members\Resources\Members\Tables;

use Filament\Tables\Actions\BulkActionGroup;
use Filament\Tables\Actions\DeleteBulkAction;
use Filament\Tables\Actions\EditAction;
use Filament\Tables\Actions\ViewAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;

class MemberTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('full_name')
                    ->label('Name')
                    ->searchable(['first_name', 'last_name'])
                    ->sortable(['first_name', 'last_name']),
                TextColumn::make('email')
                    ->label('E-Mail')
                    ->searchable()
                    ->copyable()
                    ->sortable(),
                TextColumn::make('phone_number')
                    ->label('Telefon')
                    ->searchable()
                    ->placeholder('-'),
                IconColumn::make('newsletterSubscription.status')
                    ->label('Newsletter')
                    ->icon(fn (?string $state): string => match ($state) {
                        'active' => 'heroicon-o-check-circle',
                        'unsubscribed' => 'heroicon-o-x-circle',
                        default => 'heroicon-o-minus-circle',
                    })
                    ->color(fn (?string $state): string => match ($state) {
                        'active' => 'success',
                        'unsubscribed' => 'danger',
                        default => 'gray',
                    })
                    ->tooltip(fn (?string $state): string => match ($state) {
                        'active' => 'Newsletter aktiv',
                        'unsubscribed' => 'Newsletter abgemeldet',
                        default => 'Nicht für Newsletter angemeldet',
                    }),
                TextColumn::make('event_registrations_count')
                    ->label('Events')
                    ->counts('eventRegistrations')
                    ->sortable(),
                TextColumn::make('created_at')
                    ->label('Erstellt')
                    ->dateTime('d.m.Y')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                TernaryFilter::make('has_newsletter')
                    ->label('Newsletter')
                    ->placeholder('Alle')
                    ->trueLabel('Mit Newsletter')
                    ->falseLabel('Ohne Newsletter')
                    ->queries(
                        true: fn ($query) => $query->whereHas('newsletterSubscription', fn ($q) => $q->where('status', 'active')),
                        false: fn ($query) => $query->whereDoesntHave('newsletterSubscription', fn ($q) => $q->where('status', 'active')),
                    ),
                TernaryFilter::make('has_registrations')
                    ->label('Event-Anmeldungen')
                    ->placeholder('Alle')
                    ->trueLabel('Mit Anmeldungen')
                    ->falseLabel('Ohne Anmeldungen')
                    ->queries(
                        true: fn ($query) => $query->has('eventRegistrations'),
                        false: fn ($query) => $query->doesntHave('eventRegistrations'),
                    ),
            ])
            ->actions([
                ViewAction::make(),
                EditAction::make(),
            ])
            ->bulkActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
