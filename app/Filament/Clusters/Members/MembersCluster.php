<?php

declare(strict_types=1);

namespace App\Filament\Clusters\Members;

use BackedEnum;
use Filament\Clusters\Cluster;

class MembersCluster extends Cluster
{
    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-user-group';

    protected static ?string $navigationLabel = 'Mitglieder';

    protected static ?int $navigationSort = 5;
}
