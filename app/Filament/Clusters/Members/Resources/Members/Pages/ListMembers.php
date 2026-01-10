<?php

declare(strict_types=1);

namespace App\Filament\Clusters\Members\Resources\Members\Pages;

use App\Filament\Clusters\Members\Resources\Members\MemberResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListMembers extends ListRecords
{
    protected static string $resource = MemberResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
