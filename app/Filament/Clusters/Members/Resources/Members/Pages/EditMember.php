<?php

declare(strict_types=1);

namespace App\Filament\Clusters\Members\Resources\Members\Pages;

use App\Filament\Clusters\Members\Resources\Members\MemberResource;
use Filament\Actions\DeleteAction;
use Filament\Actions\ViewAction;
use Filament\Resources\Pages\EditRecord;

class EditMember extends EditRecord
{
    protected static string $resource = MemberResource::class;

    protected function getHeaderActions(): array
    {
        return [
            ViewAction::make(),
            DeleteAction::make(),
        ];
    }
}
