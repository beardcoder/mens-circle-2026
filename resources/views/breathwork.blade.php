@extends('layouts.app')

@section('title', 'Breathwork – ' . ($siteName ?? 'Männerkreis Straubing'))
@section('meta_description', 'Wim Hof Methode Breathwork-Trainer. Übe angeleitete Atemübungen mit visueller Unterstützung.')

@section('content')
<div class="breathwork">
    <div class="breathwork__container">
        <!-- Header -->
        <div class="breathwork__header">
            <h1 class="breathwork__title">Breathwork</h1>
            <p class="breathwork__subtitle">Wim Hof Methode Atemtraining</p>
        </div>

        <!-- Settings Panel -->
        <div class="breathwork__settings" id="breathworkSettings">
            <div class="breathwork__setting">
                <label for="breathsPerCycle" class="breathwork__label">
                    <span>Atemzüge pro Zyklus</span>
                    <span class="breathwork__value" id="breathsValue">30</span>
                </label>
                <input
                    type="range"
                    id="breathsPerCycle"
                    class="breathwork__range"
                    min="15"
                    max="60"
                    step="5"
                    value="30"
                />
            </div>

            <div class="breathwork__setting">
                <label for="inhaleTime" class="breathwork__label">
                    <span>Einatmen (Sekunden)</span>
                    <span class="breathwork__value" id="inhaleValue">1.5</span>
                </label>
                <input
                    type="range"
                    id="inhaleTime"
                    class="breathwork__range"
                    min="1"
                    max="4"
                    step="0.5"
                    value="1.5"
                />
            </div>

            <div class="breathwork__setting">
                <label for="exhaleTime" class="breathwork__label">
                    <span>Ausatmen (Sekunden)</span>
                    <span class="breathwork__value" id="exhaleValue">1</span>
                </label>
                <input
                    type="range"
                    id="exhaleTime"
                    class="breathwork__range"
                    min="0.5"
                    max="3"
                    step="0.5"
                    value="1"
                />
            </div>

            <div class="breathwork__setting">
                <label for="cycleCount" class="breathwork__label">
                    <span>Anzahl Zyklen</span>
                    <span class="breathwork__value" id="cycleValue">3</span>
                </label>
                <input
                    type="range"
                    id="cycleCount"
                    class="breathwork__range"
                    min="1"
                    max="5"
                    step="1"
                    value="3"
                />
            </div>

            <button class="breathwork__start-btn" id="startBreathwork">
                Starten
            </button>
        </div>

        <!-- Breathing Visualization -->
        <div class="breathwork__visualization" id="breathworkVisualization" style="display: none;">
            <!-- Progress Info -->
            <div class="breathwork__progress">
                <div class="breathwork__progress-item">
                    <span class="breathwork__progress-label">Zyklus</span>
                    <span class="breathwork__progress-value" id="currentCycle">1</span>
                    <span class="breathwork__progress-total">/ <span id="totalCycles">3</span></span>
                </div>
                <div class="breathwork__progress-item">
                    <span class="breathwork__progress-label">Atemzug</span>
                    <span class="breathwork__progress-value" id="currentBreath">0</span>
                    <span class="breathwork__progress-total">/ <span id="totalBreaths">30</span></span>
                </div>
            </div>

            <!-- Main Circle -->
            <div class="breathwork__circle-container">
                <div class="breathwork__circle" id="breathCircle">
                    <div class="breathwork__circle-inner">
                        <div class="breathwork__instruction" id="breathInstruction">Einatmen</div>
                        <div class="breathwork__timer" id="breathTimer"></div>
                    </div>
                </div>
            </div>

            <!-- Phase Indicator -->
            <div class="breathwork__phase" id="breathPhase">
                Atemphase
            </div>

            <!-- Controls -->
            <div class="breathwork__controls">
                <button class="breathwork__control-btn breathwork__control-btn--secondary" id="pauseBreathwork">
                    Pausieren
                </button>
                <button class="breathwork__control-btn breathwork__control-btn--danger" id="stopBreathwork">
                    Beenden
                </button>
            </div>
        </div>

        <!-- Info Section -->
        <div class="breathwork__info">
            <h2 class="breathwork__info-title">Über die Wim Hof Methode</h2>
            <div class="breathwork__info-content">
                <p>
                    Die Wim Hof Methode kombiniert spezielle Atemtechniken, Kälteexposition und mentale Fokussierung.
                    Diese Breathwork-Übung konzentriert sich auf die Atemtechnik.
                </p>
                <h3>Ablauf:</h3>
                <ol>
                    <li><strong>Atemphase:</strong> Schnelle, tiefe Ein- und Ausatmung für die eingestellte Anzahl von Atemzügen</li>
                    <li><strong>Atem anhalten:</strong> Nach dem letzten Ausatmen hältst du den Atem an, so lange wie angenehm möglich</li>
                    <li><strong>Erholungsphase:</strong> Tief einatmen und 15 Sekunden halten</li>
                    <li><strong>Wiederholung:</strong> Der Zyklus wiederholt sich basierend auf deiner Einstellung</li>
                </ol>
                <p class="breathwork__warning">
                    <strong>Wichtig:</strong> Übe diese Atemtechnik nur in einer sicheren Umgebung im Sitzen oder Liegen.
                    Niemals beim Autofahren, Schwimmen oder in anderen potenziell gefährlichen Situationen!
                </p>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
    @vite(['resources/js/breathwork.js', 'resources/css/breathwork.css'])
@endpush
