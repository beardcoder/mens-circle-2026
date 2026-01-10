<?php

declare(strict_types=1);

namespace App\Filament\Clusters\Members\Resources\Members\Pages;

use App\Filament\Clusters\Members\Resources\Members\MemberResource;
use Filament\Actions\EditAction;
use Filament\Resources\Pages\ViewRecord;

class ViewMember extends ViewRecord
{
    protected static string $resource = MemberResource::class;

    protected function getHeaderActions(): array
    {
        return [
            EditAction::make(),
        ];
    }
}
