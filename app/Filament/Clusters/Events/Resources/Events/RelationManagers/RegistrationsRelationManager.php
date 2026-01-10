<?php

declare(strict_types=1);

namespace App\Filament\Clusters\Events\Resources\Events\RelationManagers;

use App\Filament\Clusters\Members\Resources\Members\MemberResource;
use App\Models\Member;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\CreateAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Get;
use Filament\Forms\Set;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class RegistrationsRelationManager extends RelationManager
{
    protected static string $relationship = 'registrations';

    protected static ?string $title = 'Anmeldungen';

    protected static ?string $recordTitleAttribute = 'email';

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Mitglied')
                    ->schema([
                        Select::make('member_id')
                            ->label('Bestehendes Mitglied')
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
                            ->default('confirmed')
                            ->required(),
                        DateTimePicker::make('confirmed_at')
                            ->label('Bestätigt am')
                            ->native(false),
                    ])
                    ->columns(3),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('member.full_name')
                    ->label('Mitglied')
                    ->searchable(['member.first_name', 'member.last_name'])
                    ->url(fn ($record) => $record->member ? MemberResource::getUrl('view', ['record' => $record->member]) : null)
                    ->color('primary'),
                TextColumn::make('email')
                    ->label('E-Mail')
                    ->searchable()
                    ->sortable()
                    ->copyable(),
                TextColumn::make('phone_number')
                    ->label('Handynummer')
                    ->searchable()
                    ->sortable()
                    ->copyable()
                    ->toggleable(isToggledHiddenByDefault: true),
                IconColumn::make('member.newsletterSubscription.status')
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
                    })
                    ->sortable(),
                TextColumn::make('created_at')
                    ->label('Angemeldet am')
                    ->dateTime('d.m.Y H:i')
                    ->sortable(),
            ])
            ->filters([
                SelectFilter::make('status')
                    ->label('Status')
                    ->options([
                        'confirmed' => 'Bestätigt',
                        'cancelled' => 'Abgesagt',
                        'waitlist' => 'Warteliste',
                    ]),
            ])
            ->headerActions([
                CreateAction::make(),
            ])
            ->actions([
                EditAction::make(),
            ])
            ->bulkActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('created_at', 'desc');
    }
}
