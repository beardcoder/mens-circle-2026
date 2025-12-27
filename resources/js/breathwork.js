/**
 * Breathwork Application - Wim Hof Method
 * ========================================
 *
 * Features:
 * - Configurable breathing cycles
 * - Visual breath guidance with animations
 * - Audio cues for phase transitions
 * - Hold breath timer with tap-to-end
 * - Recovery phase with countdown
 * - Pause/Resume functionality
 */

class BreathworkApp {
    constructor() {
        // Settings
        this.settings = {
            breathsPerCycle: 30,
            inhaleTime: 1.5,
            exhaleTime: 1.0,
            cycleCount: 3,
            recoveryHoldTime: 15
        };

        // State
        this.state = {
            isRunning: false,
            isPaused: false,
            currentCycle: 1,
            currentBreath: 0,
            phase: 'idle', // 'breathing', 'holding', 'recovery'
            breathPhase: 'inhale' // 'inhale', 'exhale'
        };

        // Timers
        this.breathTimer = null;
        this.phaseTimer = null;
        this.holdStartTime = null;

        // Audio Context
        this.audioContext = null;

        // DOM Elements
        this.initElements();
        this.attachEventListeners();
        this.updateSettingDisplays();
    }

    initElements() {
        // Settings
        this.breathsPerCycleInput = document.getElementById('breathsPerCycle');
        this.inhaleTimeInput = document.getElementById('inhaleTime');
        this.exhaleTimeInput = document.getElementById('exhaleTime');
        this.cycleCountInput = document.getElementById('cycleCount');

        // Setting displays
        this.breathsValue = document.getElementById('breathsValue');
        this.inhaleValue = document.getElementById('inhaleValue');
        this.exhaleValue = document.getElementById('exhaleValue');
        this.cycleValue = document.getElementById('cycleValue');

        // Panels
        this.settingsPanel = document.getElementById('breathworkSettings');
        this.visualizationPanel = document.getElementById('breathworkVisualization');

        // Visualization elements
        this.breathCircle = document.getElementById('breathCircle');
        this.breathInstruction = document.getElementById('breathInstruction');
        this.breathTimerDisplay = document.getElementById('breathTimer');
        this.breathPhaseDisplay = document.getElementById('breathPhase');
        this.currentCycleDisplay = document.getElementById('currentCycle');
        this.totalCyclesDisplay = document.getElementById('totalCycles');
        this.currentBreathDisplay = document.getElementById('currentBreath');
        this.totalBreathsDisplay = document.getElementById('totalBreaths');

        // Buttons
        this.startBtn = document.getElementById('startBreathwork');
        this.pauseBtn = document.getElementById('pauseBreathwork');
        this.stopBtn = document.getElementById('stopBreathwork');
    }

    attachEventListeners() {
        // Setting changes
        this.breathsPerCycleInput.addEventListener('input', () => this.updateSetting('breathsPerCycle'));
        this.inhaleTimeInput.addEventListener('input', () => this.updateSetting('inhaleTime'));
        this.exhaleTimeInput.addEventListener('input', () => this.updateSetting('exhaleTime'));
        this.cycleCountInput.addEventListener('input', () => this.updateSetting('cycleCount'));

        // Controls
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.stopBtn.addEventListener('click', () => this.stop());

        // Tap to end hold phase
        this.breathCircle.addEventListener('click', () => this.handleCircleClick());
    }

    updateSetting(settingName) {
        const input = this[`${settingName}Input`];
        const value = parseFloat(input.value);
        this.settings[settingName] = value;
        this.updateSettingDisplays();
    }

    updateSettingDisplays() {
        this.breathsValue.textContent = this.settings.breathsPerCycle;
        this.inhaleValue.textContent = this.settings.inhaleTime;
        this.exhaleValue.textContent = this.settings.exhaleTime;
        this.cycleValue.textContent = this.settings.cycleCount;
    }

    async start() {
        // Initialize audio context (requires user interaction)
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        // Reset state
        this.state.currentCycle = 1;
        this.state.currentBreath = 0;
        this.state.isRunning = true;
        this.state.isPaused = false;

        // Update UI
        this.settingsPanel.style.display = 'none';
        this.visualizationPanel.style.display = 'block';
        this.updateProgressDisplay();

        // Start first cycle
        await this.startBreathingPhase();
    }

    async startBreathingPhase() {
        this.state.phase = 'breathing';
        this.state.currentBreath = 0;
        this.breathPhaseDisplay.textContent = 'Atemphase: Schnell & Tief atmen';
        this.breathCircle.classList.remove('breathwork__circle--holding', 'breathwork__circle--recovery');
        this.breathCircle.classList.add('breathwork__circle--breathing');

        this.playSound(440, 0.1, 0.1); // Start beep

        await this.breathCycle();
    }

    async breathCycle() {
        while (this.state.currentBreath < this.settings.breathsPerCycle && this.state.isRunning && !this.state.isPaused) {
            // Inhale
            this.state.breathPhase = 'inhale';
            this.breathInstruction.textContent = 'Einatmen';
            this.breathCircle.style.setProperty('--breath-duration', `${this.settings.inhaleTime}s`);
            this.breathCircle.classList.add('breathwork__circle--inhale');

            await this.wait(this.settings.inhaleTime * 1000);

            if (!this.state.isRunning || this.state.isPaused) {
                break;
            }

            // Exhale
            this.state.breathPhase = 'exhale';
            this.breathInstruction.textContent = 'Ausatmen';
            this.breathCircle.style.setProperty('--breath-duration', `${this.settings.exhaleTime}s`);
            this.breathCircle.classList.remove('breathwork__circle--inhale');

            await this.wait(this.settings.exhaleTime * 1000);

            this.state.currentBreath++;
            this.updateProgressDisplay();
        }

        if (this.state.isRunning && !this.state.isPaused) {
            // Finished breathing phase - start hold phase
            this.playSound(660, 0.15, 0.2); // Phase change beep
            await this.startHoldingPhase();
        }
    }

    async startHoldingPhase() {
        this.state.phase = 'holding';
        this.breathPhaseDisplay.textContent = 'Atem anhalten - Tippe zum Beenden';
        this.breathInstruction.textContent = 'Atem anhalten';
        this.breathCircle.classList.remove('breathwork__circle--breathing', 'breathwork__circle--inhale');
        this.breathCircle.classList.add('breathwork__circle--holding');

        this.holdStartTime = Date.now();

        // Update timer display
        const updateHoldTimer = () => {
            if (this.state.phase === 'holding' && this.state.isRunning) {
                const elapsed = Math.floor((Date.now() - this.holdStartTime) / 1000);
                this.breathTimerDisplay.textContent = `${elapsed}s`;
                requestAnimationFrame(updateHoldTimer);
            }
        };
        updateHoldTimer();
    }

    async handleCircleClick() {
        if (this.state.phase === 'holding' && this.state.isRunning) {
            // End hold phase
            const holdTime = Math.floor((Date.now() - this.holdStartTime) / 1000);
            this.playSound(880, 0.15, 0.2); // End hold beep
            await this.startRecoveryPhase();
        }
    }

    async startRecoveryPhase() {
        this.state.phase = 'recovery';
        this.breathPhaseDisplay.textContent = 'Erholungsphase: Tief einatmen & halten';
        this.breathInstruction.textContent = 'Tief einatmen & halten';
        this.breathCircle.classList.remove('breathwork__circle--holding');
        this.breathCircle.classList.add('breathwork__circle--recovery', 'breathwork__circle--inhale');

        // Deep inhale animation
        this.breathCircle.style.setProperty('--breath-duration', '2s');
        await this.wait(2000);

        // Hold for recovery time
        let remainingTime = this.settings.recoveryHoldTime;
        this.breathInstruction.textContent = 'Halten';

        while (remainingTime > 0 && this.state.isRunning && !this.state.isPaused) {
            this.breathTimerDisplay.textContent = `${remainingTime}s`;
            await this.wait(1000);
            remainingTime--;
        }

        this.breathTimerDisplay.textContent = '';

        if (this.state.isRunning && !this.state.isPaused) {
            // Move to next cycle or finish
            if (this.state.currentCycle < this.settings.cycleCount) {
                this.state.currentCycle++;
                this.updateProgressDisplay();
                this.playSound(550, 0.15, 0.2); // New cycle beep
                await this.startBreathingPhase();
            } else {
                // Finished all cycles
                this.finish();
            }
        }
    }

    togglePause() {
        this.state.isPaused = !this.state.isPaused;
        this.pauseBtn.textContent = this.state.isPaused ? 'Fortsetzen' : 'Pausieren';

        if (!this.state.isPaused && this.state.phase === 'breathing') {
            // Resume breathing cycle
            this.breathCycle();
        }
    }

    stop() {
        this.state.isRunning = false;
        this.state.isPaused = false;
        this.clearTimers();

        // Reset UI
        this.settingsPanel.style.display = 'block';
        this.visualizationPanel.style.display = 'none';
        this.breathCircle.className = 'breathwork__circle';
        this.breathTimerDisplay.textContent = '';
        this.pauseBtn.textContent = 'Pausieren';
    }

    finish() {
        this.playSound(880, 0.3, 0.5); // Success sound
        this.breathPhaseDisplay.textContent = 'Abgeschlossen! Gut gemacht! 🎉';
        this.breathInstruction.textContent = 'Fertig';
        this.breathCircle.classList.remove('breathwork__circle--breathing', 'breathwork__circle--holding', 'breathwork__circle--recovery', 'breathwork__circle--inhale');

        setTimeout(() => {
            this.stop();
        }, 3000);
    }

    updateProgressDisplay() {
        this.currentCycleDisplay.textContent = this.state.currentCycle;
        this.totalCyclesDisplay.textContent = this.settings.cycleCount;
        this.currentBreathDisplay.textContent = this.state.currentBreath;
        this.totalBreathsDisplay.textContent = this.settings.breathsPerCycle;
    }

    clearTimers() {
        if (this.breathTimer) {
            clearTimeout(this.breathTimer);
        }
        if (this.phaseTimer) {
            clearTimeout(this.phaseTimer);
        }
    }

    wait(ms) {
        return new Promise(resolve => {
            this.breathTimer = setTimeout(resolve, ms);
        });
    }

    // Simple beep sound using Web Audio API
    playSound(frequency, duration, volume = 0.1) {
        if (!this.audioContext) {
            return;
        }

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (error) {
            console.warn('Audio playback failed:', error);
        }
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new BreathworkApp();
    });
} else {
    new BreathworkApp();
}
