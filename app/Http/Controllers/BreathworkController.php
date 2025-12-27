<?php

namespace App\Http\Controllers;

use Illuminate\View\View;

class BreathworkController extends Controller
{
    public function show(): View
    {
        return view('breathwork');
    }
}
