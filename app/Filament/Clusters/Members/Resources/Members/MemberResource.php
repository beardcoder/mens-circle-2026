<?php

declare(strict_types=1);

namespace App\Filament\Clusters\Members\Resources\Members;

use App\Filament\Clusters\Members\MembersCluster;
use App\Filament\Clusters\Members\Resources\Members\Pages\CreateMember;
use App\Filament\Clusters\Members\Resources\Members\Pages\EditMember;
use App\Filament\Clusters\Members\Resources\Members\Pages\ListMembers;
use App\Filament\Clusters\Members\Resources\Members\Pages\ViewMember;
use App\Filament\Clusters\Members\Resources\Members\Schemas\MemberForm;
use App\Filament\Clusters\Members\Resources\Members\Tables\MemberTable;
use App\Models\Member;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables\Table;

class MemberResource extends Resource
{
    protected static ?string $model = Member::class;

    protected static ?string $cluster = MembersCluster::class;

    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-user';

    protected static ?string $modelLabel = 'Mitglied';

    protected static ?string $pluralModelLabel = 'Mitglieder';

    protected static ?int $navigationSort = 10;

    public static function form(Schema $schema): Schema
    {
        return MemberForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return MemberTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            \App\Filament\Clusters\Members\Resources\Members\RelationManagers\EventRegistrationsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListMembers::route('/'),
            'create' => CreateMember::route('/create'),
            'view' => ViewMember::route('/{record}'),
            'edit' => EditMember::route('/{record}/edit'),
        ];
    }
}
