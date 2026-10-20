/**
 * NumberQuest - Core Interactive Logic & Audio Engine
 * Author: Antigravity AI
 */

(function () {
  'use strict';

  // ==========================================================================
  // Sound Engine (Web Audio API Synthesizer)
  // ==========================================================================
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.enabled = localStorage.getItem('numberquest_sound') !== 'false';
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggle() {
      this.enabled = !this.enabled;
      localStorage.setItem('numberquest_sound', this.enabled ? 'true' : 'false');
      return this.enabled;
    }

    playClick() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    }

    playTone(freq, type = 'sine', duration = 0.15, vol = 0.12) {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    }

    playHighGuess() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(580, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.22);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(now + 0.22);
    }

    playLowGuess() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.22);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(now + 0.22);
    }

    playWinFanfare() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          this.playTone(freq, 'triangle', 0.35, 0.15);
        }, idx * 110);
      });
    }

    playGameOver() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const notes = [440, 392, 349.23, 293.66]; // A4, G4, F4, D4
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          this.playTone(freq, 'sawtooth', 0.28, 0.08);
        }, idx * 120);
      });
    }

    playHint() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const notes = [659.25, 880];
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          this.playTone(freq, 'sine', 0.18, 0.1);
        }, idx * 90);
      });
    }
  }

  // ==========================================================================
  // Visual Effects Engine (Ambient Background & Confetti)
  // ==========================================================================
  class FXEngine {
    constructor() {
      this.particlesCanvas = document.getElementById('particles-canvas');
      this.confettiCanvas = document.getElementById('confetti-canvas');
      this.pCtx = this.particlesCanvas ? this.particlesCanvas.getContext('2d') : null;
      this.cCtx = this.confettiCanvas ? this.confettiCanvas.getContext('2d') : null;

      this.particles = [];
      this.confetti = [];
      this.isConfettiActive = false;

      this.resize();
      window.addEventListener('resize', () => this.resize());
      this.initParticles();
      this.loop();
    }

    resize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (this.particlesCanvas) {
        this.particlesCanvas.width = w;
        this.particlesCanvas.height = h;
      }
      if (this.confettiCanvas) {
        this.confettiCanvas.width = w;
        this.confettiCanvas.height = h;
      }
    }

    initParticles() {
      const count = Math.min(45, Math.floor(window.innerWidth / 30));
      this.particles = [];
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          r: Math.random() * 1.8 + 0.6,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          alpha: Math.random() * 0.6 + 0.2
        });
      }
    }

    triggerConfetti(durationMs = 3500) {
      this.confetti = [];
      this.isConfettiActive = true;
      const count = 120;
      const colors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#ffffff'];

      for (let i = 0; i < count; i++) {
        this.confetti.push({
          x: window.innerWidth / 2 + (Math.random() - 0.5) * 200,
          y: window.innerHeight * 0.45,
          vx: (Math.random() - 0.5) * 14,
          vy: Math.random() * -12 - 5,
          size: Math.random() * 8 + 5,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          vRot: (Math.random() - 0.5) * 12,
          gravity: 0.35,
          opacity: 1
        });
      }

      setTimeout(() => {
        this.isConfettiActive = false;
      }, durationMs);
    }

    loop() {
      // 1. Draw Star dust particles
      if (this.pCtx) {
        this.pCtx.clearRect(0, 0, this.particlesCanvas.width, this.particlesCanvas.height);
        this.particles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0) p.x = this.particlesCanvas.width;
          if (p.x > this.particlesCanvas.width) p.x = 0;
          if (p.y < 0) p.y = this.particlesCanvas.height;
          if (p.y > this.particlesCanvas.height) p.y = 0;

          this.pCtx.beginPath();
          this.pCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          this.pCtx.fillStyle = `rgba(148, 163, 184, ${p.alpha})`;
          this.pCtx.fill();
        });
      }

      // 2. Draw Confetti if active
      if (this.cCtx) {
        this.cCtx.clearRect(0, 0, this.confettiCanvas.width, this.confettiCanvas.height);
        if (this.confetti.length > 0) {
          for (let i = this.confetti.length - 1; i >= 0; i--) {
            const c = this.confetti[i];
            c.vy += c.gravity;
            c.x += c.vx;
            c.y += c.vy;
            c.rotation += c.vRot;
            c.vx *= 0.98;

            if (!this.isConfettiActive) {
              c.opacity -= 0.02;
            }

            if (c.y > this.confettiCanvas.height || c.opacity <= 0) {
              this.confetti.splice(i, 1);
              continue;
            }

            this.cCtx.save();
            this.cCtx.translate(c.x, c.y);
            this.cCtx.rotate((c.rotation * Math.PI) / 180);
            this.cCtx.fillStyle = c.color;
            this.cCtx.globalAlpha = Math.max(0, c.opacity);
            this.cCtx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size * 0.6);
            this.cCtx.restore();
          }
        }
      }

      requestAnimationFrame(() => this.loop());
    }
  }

  // ==========================================================================
  // NumberQuest Game Engine
  // ==========================================================================
  const DIFFICULTY_CONFIG = {
    easy: { min: 1, max: 50, attempts: 8 },
    medium: { min: 1, max: 100, attempts: 7 },
    hard: { min: 1, max: 250, attempts: 9 },
    custom: { min: 1, max: 500, attempts: 10 }
  };

  class NumberQuestGame {
    constructor() {
      this.sound = new SoundEngine();
      this.fx = new FXEngine();

      this.currentDifficulty = 'medium';
      this.min = 1;
      this.max = 100;
      this.maxAttempts = 7;
      this.attemptsLeft = 7;
      this.secretNumber = 0;

      this.searchMin = 1;
      this.searchMax = 100;
      this.guesses = [];
      this.isGameOver = false;
      this.hintsRevealed = [];

      this.stats = this.loadStats();

      this.cacheDOMElements();
      this.bindEvents();
      this.updateSoundIcon();
      this.updateStatsUI();
      this.startNewGame();
    }

    loadStats() {
      const saved = localStorage.getItem('numberquest_stats');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.warn('Failed to parse saved stats');
        }
      }
      return { wins: 0, streak: 0, bestGuesses: null };
    }

    saveStats() {
      localStorage.setItem('numberquest_stats', JSON.stringify(this.stats));
      this.updateStatsUI();
    }

    cacheDOMElements() {
      // Header controls
      this.soundToggleBtn = document.getElementById('sound-toggle-btn');
      this.soundIconOn = document.getElementById('sound-icon-on');
      this.soundIconOff = document.getElementById('sound-icon-off');
      this.howToPlayBtn = document.getElementById('how-to-play-btn');
      this.resetStatsBtn = document.getElementById('reset-stats-btn');

      // Stats
      this.statWins = document.getElementById('stat-wins');
      this.statStreak = document.getElementById('stat-streak');
      this.statBest = document.getElementById('stat-best');

      // Difficulty Tabs
      this.diffTabs = document.querySelectorAll('.diff-tab');
      this.customConfigPanel = document.getElementById('custom-config-panel');
      this.customMinInput = document.getElementById('custom-min');
      this.customMaxInput = document.getElementById('custom-max');
      this.customAttemptsInput = document.getElementById('custom-attempts');
      this.applyCustomBtn = document.getElementById('apply-custom-btn');

      // Game Stage
      this.rangeMinDisplay = document.getElementById('range-min-display');
      this.rangeMaxDisplay = document.getElementById('range-max-display');
      this.mysteryOrb = document.getElementById('mystery-orb');
      this.mysteryNumberText = document.getElementById('mystery-number-text');

      // Temp Meter
      this.tempMeterFill = document.getElementById('temp-meter-fill');
      this.proximityText = document.getElementById('proximity-text');
      this.temperatureBadge = document.getElementById('temperature-badge');

      // Attempts & Hearts
      this.attemptsLeftCount = document.getElementById('attempts-left-count');
      this.attemptsTotalCount = document.getElementById('attempts-total-count');
      this.heartsTrack = document.getElementById('hearts-track');

      // Feedback
      this.feedbackBanner = document.getElementById('feedback-banner');
      this.feedbackIcon = document.getElementById('feedback-icon');
      this.feedbackTitle = document.getElementById('feedback-title');
      this.feedbackSubtitle = document.getElementById('feedback-subtitle');

      // Inputs
      this.guessForm = document.getElementById('guess-form');
      this.guessInput = document.getElementById('guess-input');
      this.guessInputWrapper = document.querySelector('.guess-input-wrapper');
      this.decrementGuessBtn = document.getElementById('decrement-guess-btn');
      this.incrementGuessBtn = document.getElementById('increment-guess-btn');
      this.submitGuessBtn = document.getElementById('submit-guess-btn');
      this.hintBtn = document.getElementById('hint-btn');

      // Hints
      this.hintBox = document.getElementById('hint-box');
      this.hintContent = document.getElementById('hint-content');
      this.closeHintBtn = document.getElementById('close-hint-btn');

      // History
      this.guessHistoryList = document.getElementById('guess-history-list');
      this.historyCount = document.getElementById('history-count');

      // Footer
      this.newGameBtn = document.getElementById('new-game-btn');
      this.giveUpBtn = document.getElementById('give-up-btn');

      // Modals
      this.gameOverModal = document.getElementById('game-over-modal');
      this.modalBadgeIcon = document.getElementById('modal-badge-icon');
      this.modalTitle = document.getElementById('modal-title');
      this.modalSubtitle = document.getElementById('modal-subtitle');
      this.modalStars = document.getElementById('modal-stars');
      this.modalSecretNum = document.getElementById('modal-secret-num');
      this.modalGuessesUsed = document.getElementById('modal-guesses-used');
      this.modalAccuracy = document.getElementById('modal-accuracy');
      this.modalPlayAgainBtn = document.getElementById('modal-play-again-btn');
      this.modalCloseBtn = document.getElementById('modal-close-btn');

      this.howToPlayModal = document.getElementById('how-to-play-modal');
      this.htpCloseX = document.getElementById('htp-close-x');
      this.htpGotItBtn = document.getElementById('htp-got-it-btn');

      this.toastNotification = document.getElementById('toast-notification');
    }

    bindEvents() {
      // Sound toggle
      this.soundToggleBtn.addEventListener('click', () => {
        const isEnabled = this.sound.toggle();
        this.updateSoundIcon();
        this.showToast(isEnabled ? 'Sound Effects Enabled' : 'Sound Effects Muted');
      });

      // How to Play modal
      this.howToPlayBtn.addEventListener('click', () => {
        this.sound.playClick();
        this.howToPlayModal.classList.remove('hidden');
      });
      this.htpCloseX.addEventListener('click', () => {
        this.howToPlayModal.classList.add('hidden');
      });
      this.htpGotItBtn.addEventListener('click', () => {
        this.sound.playClick();
        this.howToPlayModal.classList.add('hidden');
      });

      // Reset stats
      this.resetStatsBtn.addEventListener('click', () => {
        if (confirm('Reset your score and streak statistics?')) {
          this.stats = { wins: 0, streak: 0, bestGuesses: null };
          this.saveStats();
          this.showToast('Statistics have been reset');
        }
      });

      // Difficulty selection
      this.diffTabs.forEach(tab => {
        tab.addEventListener('click', () => {
          this.sound.playClick();
          const diff = tab.dataset.difficulty;
          this.setDifficulty(diff);
        });
      });

      // Custom Range Form Apply
      this.applyCustomBtn.addEventListener('click', () => {
        this.applyCustomRange();
      });

      // Guess submission
      this.guessForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleGuessSubmit();
      });

      // Steppers
      this.decrementGuessBtn.addEventListener('click', () => {
        this.sound.playClick();
        const currentVal = parseInt(this.guessInput.value, 10) || this.searchMin;
        this.guessInput.value = Math.max(this.min, currentVal - 1);
        this.guessInput.focus();
      });

      this.incrementGuessBtn.addEventListener('click', () => {
        this.sound.playClick();
        const currentVal = parseInt(this.guessInput.value, 10) || (this.searchMin - 1);
        this.guessInput.value = Math.min(this.max, currentVal + 1);
        this.guessInput.focus();
      });

      // Detective Hint Button
      this.hintBtn.addEventListener('click', () => {
        this.handleRequestHint();
      });

      this.closeHintBtn.addEventListener('click', () => {
        this.hintBox.classList.add('hidden');
      });

      // Game restart & give up
      this.newGameBtn.addEventListener('click', () => {
        this.sound.playClick();
        this.startNewGame();
        this.showToast('New game started! Good luck.');
      });

      this.giveUpBtn.addEventListener('click', () => {
        this.handleGiveUp();
      });

      // Game Over modal buttons
      this.modalPlayAgainBtn.addEventListener('click', () => {
        this.sound.playClick();
        this.gameOverModal.classList.add('hidden');
        this.startNewGame();
      });

      this.modalCloseBtn.addEventListener('click', () => {
        this.sound.playClick();
        this.gameOverModal.classList.add('hidden');
      });

      // Keyboard shortcuts
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.gameOverModal.classList.add('hidden');
          this.howToPlayModal.classList.add('hidden');
          this.hintBox.classList.add('hidden');
        } else if ((e.key === 'r' || e.key === 'R') && document.activeElement !== this.guessInput && !this.customConfigPanel.contains(document.activeElement)) {
          this.startNewGame();
        }
      });
    }

    updateSoundIcon() {
      if (this.sound.enabled) {
        this.soundIconOn.classList.remove('hidden');
        this.soundIconOff.classList.add('hidden');
      } else {
        this.soundIconOn.classList.add('hidden');
        this.soundIconOff.classList.remove('hidden');
      }
    }

    updateStatsUI() {
      this.statWins.textContent = this.stats.wins;
      this.statStreak.textContent = `${this.stats.streak} 🔥`;
      this.statBest.textContent = this.stats.bestGuesses !== null ? `${this.stats.bestGuesses} tr${this.stats.bestGuesses === 1 ? 'y' : 'ies'}` : '—';
    }

    setDifficulty(diffKey) {
      this.diffTabs.forEach(t => t.classList.toggle('active', t.dataset.difficulty === diffKey));
      this.currentDifficulty = diffKey;

      if (diffKey === 'custom') {
        this.customConfigPanel.classList.remove('hidden');
        return;
      } else {
        this.customConfigPanel.classList.add('hidden');
      }

      const cfg = DIFFICULTY_CONFIG[diffKey];
      this.min = cfg.min;
      this.max = cfg.max;
      this.maxAttempts = cfg.attempts;
      this.startNewGame();
    }

    applyCustomRange() {
      const minVal = parseInt(this.customMinInput.value, 10);
      const maxVal = parseInt(this.customMaxInput.value, 10);
      const attVal = parseInt(this.customAttemptsInput.value, 10);

      if (isNaN(minVal) || isNaN(maxVal) || isNaN(attVal)) {
        this.showToast('Please enter valid numeric values');
        return;
      }

      if (minVal >= maxVal) {
        this.showToast('Minimum must be strictly less than Maximum!');
        return;
      }

      if (maxVal - minVal < 5) {
        this.showToast('Range must span at least 5 numbers!');
        return;
      }

      if (attVal < 1 || attVal > 50) {
        this.showToast('Attempts must be between 1 and 50');
        return;
      }

      this.min = minVal;
      this.max = maxVal;
      this.maxAttempts = attVal;
      this.sound.playClick();
      this.startNewGame();
      this.showToast(`Custom range ${this.min} - ${this.max} activated!`);
    }

    startNewGame() {
      this.secretNumber = Math.floor(Math.random() * (this.max - this.min + 1)) + this.min;
      this.attemptsLeft = this.maxAttempts;
      this.searchMin = this.min;
      this.searchMax = this.max;
      this.guesses = [];
      this.isGameOver = false;
      this.hintsRevealed = [];

      // Reset UI Elements
      this.mysteryOrb.classList.remove('reveal', 'failure');
      this.mysteryNumberText.textContent = '?';

      this.rangeMinDisplay.textContent = this.searchMin;
      this.rangeMaxDisplay.textContent = this.searchMax;

      this.attemptsLeftCount.textContent = this.attemptsLeft;
      this.attemptsTotalCount.textContent = this.maxAttempts;

      this.tempMeterFill.style.width = '0%';
      this.proximityText.textContent = 'Make your first guess!';
      this.temperatureBadge.className = 'temperature-badge hidden';

      this.feedbackBanner.className = 'feedback-banner';
      this.feedbackIcon.textContent = '🎯';
      this.feedbackTitle.textContent = `I'm thinking of a number between ${this.min} and ${this.max}`;
      this.feedbackSubtitle.textContent = `You have ${this.maxAttempts} attempts. Enter your guess to begin!`;

      this.guessInput.value = '';
      this.guessInput.min = this.min;
      this.guessInput.max = this.max;
      this.guessInput.disabled = false;
      this.submitGuessBtn.disabled = false;
      this.hintBtn.disabled = false;
      this.hintBox.classList.add('hidden');

      this.renderHearts();
      this.renderHistory();

      setTimeout(() => {
        this.guessInput.focus();
      }, 100);
    }

    renderHearts() {
      this.heartsTrack.innerHTML = '';
      for (let i = 0; i < this.maxAttempts; i++) {
        const heart = document.createElement('div');
        heart.className = 'heart-pill';
        if (i < this.attemptsLeft) {
          heart.classList.add('active');
          heart.textContent = '❤️';
        } else {
          heart.classList.add('lost');
          heart.textContent = '🖤';
        }
        this.heartsTrack.appendChild(heart);
      }
    }

    animateHeartLoss() {
      const lostIndex = this.attemptsLeft;
      const hearts = this.heartsTrack.querySelectorAll('.heart-pill');
      if (hearts[lostIndex]) {
        hearts[lostIndex].classList.remove('active');
        hearts[lostIndex].classList.add('lost', 'lost-animate');
        hearts[lostIndex].textContent = '🖤';
      }
      this.attemptsLeftCount.textContent = this.attemptsLeft;
    }

    handleGuessSubmit() {
      if (this.isGameOver) return;

      const rawVal = this.guessInput.value.trim();
      const guessNum = parseInt(rawVal, 10);

      // Validate Input
      if (isNaN(guessNum)) {
        this.triggerInputError('Please enter a valid number');
        return;
      }

      if (guessNum < this.min || guessNum > this.max) {
        this.triggerInputError(`Number must be between ${this.min} and ${this.max}`);
        return;
      }

      // Check if already guessed
      const alreadyGuessed = this.guesses.some(g => g.number === guessNum);
      if (alreadyGuessed) {
        this.triggerInputError(`You've already guessed ${guessNum}! Try a new number.`);
        return;
      }

      // Process Guess
      this.processGuess(guessNum);
    }

    processGuess(guessNum) {
      this.attemptsLeft--;
      const diff = guessNum - this.secretNumber;
      const absDiff = Math.abs(diff);
      const totalRange = this.max - this.min;
      const proximityPct = Math.max(0, Math.round((1 - absDiff / totalRange) * 100));

      let resultType = 'CORRECT';
      if (diff > 0) resultType = 'HIGH';
      if (diff < 0) resultType = 'LOW';

      // Update Search Boundaries
      if (resultType === 'HIGH' && guessNum < this.searchMax) {
        this.searchMax = guessNum - 1;
      } else if (resultType === 'LOW' && guessNum > this.searchMin) {
        this.searchMin = guessNum + 1;
      }

      // Temperature classification
      const tempInfo = this.getTemperature(absDiff, totalRange);

      const guessRecord = {
        number: guessNum,
        type: resultType,
        diff: absDiff,
        temp: tempInfo,
        proximity: proximityPct
      };

      this.guesses.unshift(guessRecord); // Add latest to top

      // Update Visuals
      this.animateHeartLoss();
      this.updateTemperatureMeter(proximityPct, tempInfo);
      this.updateBoundariesUI();
      this.renderHistory();

      // Clear input & refocus
      this.guessInput.value = '';
      this.guessInput.focus();

      // Check Victory / Defeat conditions
      if (guessNum === this.secretNumber) {
        this.handleVictory();
      } else if (this.attemptsLeft <= 0) {
        this.handleDefeat();
      } else {
        // Feedback messaging and sounds
        if (resultType === 'HIGH') {
          this.sound.playHighGuess();
          this.feedbackBanner.className = 'feedback-banner too-high';
          this.feedbackIcon.textContent = '📉';
          this.feedbackTitle.textContent = `${guessNum} is Too High!`;
          this.feedbackSubtitle.textContent = `Try aiming lower. ${tempInfo.text}`;
        } else {
          this.sound.playLowGuess();
          this.feedbackBanner.className = 'feedback-banner too-low';
          this.feedbackIcon.textContent = '📈';
          this.feedbackTitle.textContent = `${guessNum} is Too Low!`;
          this.feedbackSubtitle.textContent = `Try aiming higher. ${tempInfo.text}`;
        }
      }
    }

    getTemperature(absDiff, totalRange) {
      if (absDiff === 0) return { label: 'BOILING', class: 'boiling', text: 'You hit the bullseye!' };
      const ratio = absDiff / totalRange;

      if (ratio <= 0.03 || absDiff <= 2) {
        return { label: 'BOILING', class: 'boiling', text: 'Boiling hot! You are so close!' };
      } else if (ratio <= 0.1) {
        return { label: 'VERY HOT', class: 'hot', text: 'Super hot! Extremely close now!' };
      } else if (ratio <= 0.22) {
        return { label: 'WARM', class: 'warm', text: 'Getting warm! Heading in the right direction.' };
      } else if (ratio <= 0.45) {
        return { label: 'CHILLY', class: 'cold', text: 'Cold. Still a decent distance away.' };
      } else {
        return { label: 'FREEZING', class: 'freezing', text: 'Freezing cold! Way off mark.' };
      }
    }

    updateTemperatureMeter(pct, tempInfo) {
      this.tempMeterFill.style.width = `${pct}%`;
      this.temperatureBadge.className = `temperature-badge ${tempInfo.class}`;
      this.temperatureBadge.textContent = tempInfo.label;
      this.proximityText.textContent = `Proximity: ${pct}% Match`;
    }

    updateBoundariesUI() {
      this.rangeMinDisplay.textContent = Math.max(this.min, this.searchMin);
      this.rangeMaxDisplay.textContent = Math.min(this.max, this.searchMax);
    }

    renderHistory() {
      this.historyCount.textContent = `${this.guesses.length} guess${this.guesses.length === 1 ? '' : 'es'}`;

      if (this.guesses.length === 0) {
        this.guessHistoryList.innerHTML = `<div class="empty-history-placeholder">No guesses made yet. Go ahead and take your shot!</div>`;
        return;
      }

      this.guessHistoryList.innerHTML = '';
      this.guesses.forEach((g, idx) => {
        const item = document.createElement('div');
        item.className = 'history-item';

        const totalGuesses = this.guesses.length;
        const guessIndexDisplay = totalGuesses - idx;

        let badgeClass = 'low';
        let badgeIcon = '⬇️ Low';
        if (g.type === 'HIGH') {
          badgeClass = 'high';
          badgeIcon = '⬆️ High';
        } else if (g.type === 'CORRECT') {
          badgeClass = 'correct';
          badgeIcon = '🎯 Exact';
        }

        item.innerHTML = `
          <div class="history-item-left">
            <span class="history-item-number">#${guessIndexDisplay}</span>
            <span class="history-item-guess">${g.number}</span>
          </div>
          <div class="history-item-right">
            <span class="history-badge ${badgeClass}">${badgeIcon}</span>
            <span class="temperature-badge ${g.temp.class}" style="padding: 0.15rem 0.45rem; font-size: 0.65rem;">${g.temp.label}</span>
          </div>
        `;
        this.guessHistoryList.appendChild(item);
      });
    }

    handleVictory() {
      this.isGameOver = true;
      this.sound.playWinFanfare();
      this.fx.triggerConfetti();

      // Reveal mystery number
      this.mysteryOrb.classList.add('reveal');
      this.mysteryNumberText.textContent = this.secretNumber;

      // Update feedback banner
      this.feedbackBanner.className = 'feedback-banner correct';
      this.feedbackIcon.textContent = '🎉';
      this.feedbackTitle.textContent = `Bingo! The secret number is ${this.secretNumber}!`;
      this.feedbackSubtitle.textContent = `You solved the puzzle in ${this.guesses.length} attempts!`;

      // Update stats
      this.stats.wins++;
      this.stats.streak++;
      const guessesTaken = this.guesses.length;
      if (this.stats.bestGuesses === null || guessesTaken < this.stats.bestGuesses) {
        this.stats.bestGuesses = guessesTaken;
      }
      this.saveStats();

      // Calculate Stars (3 stars for <= half attempts, 2 stars for <= 80%, 1 star otherwise)
      const ratio = guessesTaken / this.maxAttempts;
      let starsCount = 1;
      if (ratio <= 0.5) starsCount = 3;
      else if (ratio <= 0.8) starsCount = 2;

      // Populate & open Victory Modal
      this.modalBadgeIcon.textContent = '🏆';
      this.modalTitle.textContent = 'Code Cracked!';
      this.modalSubtitle.textContent = `Superb deduction! You uncovered the secret number in ${guessesTaken} attempt${guessesTaken === 1 ? '' : 's'}.`;

      this.modalStars.innerHTML = '';
      for (let s = 0; s < 3; s++) {
        const starSpan = document.createElement('span');
        starSpan.className = `star ${s < starsCount ? 'filled' : ''}`;
        starSpan.textContent = '★';
        this.modalStars.appendChild(starSpan);
      }

      this.modalSecretNum.textContent = this.secretNumber;
      this.modalGuessesUsed.textContent = `${guessesTaken} / ${this.maxAttempts}`;
      this.modalAccuracy.textContent = `${Math.round(((this.maxAttempts - guessesTaken + 1) / this.maxAttempts) * 100)}%`;

      this.guessInput.disabled = true;
      this.submitGuessBtn.disabled = true;
      this.hintBtn.disabled = true;

      setTimeout(() => {
        this.gameOverModal.classList.remove('hidden');
      }, 700);
    }

    handleDefeat() {
      this.isGameOver = true;
      this.sound.playGameOver();

      this.mysteryOrb.classList.add('failure');
      this.mysteryNumberText.textContent = this.secretNumber;

      this.feedbackBanner.className = 'feedback-banner too-high';
      this.feedbackIcon.textContent = '💥';
      this.feedbackTitle.textContent = `Game Over! The secret number was ${this.secretNumber}`;
      this.feedbackSubtitle.textContent = `You ran out of attempts. Click Restart to try again!`;

      // Reset Streak
      this.stats.streak = 0;
      this.saveStats();

      // Show Defeat Modal
      this.modalBadgeIcon.textContent = '💀';
      this.modalTitle.textContent = 'Out of Attempts!';
      this.modalSubtitle.textContent = `The secret number slipped away this time. Don't worry, every grandmaster has lost a few rounds!`;

      this.modalStars.innerHTML = `
        <span class="star">★</span>
        <span class="star">★</span>
        <span class="star">★</span>
      `;

      this.modalSecretNum.textContent = this.secretNumber;
      this.modalGuessesUsed.textContent = `${this.maxAttempts} / ${this.maxAttempts}`;
      this.modalAccuracy.textContent = '0%';

      this.guessInput.disabled = true;
      this.submitGuessBtn.disabled = true;
      this.hintBtn.disabled = true;

      setTimeout(() => {
        this.gameOverModal.classList.remove('hidden');
      }, 700);
    }

    handleGiveUp() {
      if (this.isGameOver) return;
      if (confirm(`Give up and reveal the secret number? This will reset your win streak.`)) {
        this.handleDefeat();
      }
    }

    handleRequestHint() {
      if (this.isGameOver) return;

      if (this.attemptsLeft <= 1) {
        this.triggerInputError('Hints cost 1 attempt! You cannot afford this with only 1 attempt remaining.');
        return;
      }

      // Generate a fresh unique hint
      const possibleHints = [];

      // Hint 1: Parity
      if (!this.hintsRevealed.includes('parity')) {
        const isEven = this.secretNumber % 2 === 0;
        possibleHints.push({
          id: 'parity',
          text: `The secret number is ${isEven ? 'EVEN (divisible by 2)' : 'ODD (not divisible by 2)'}.`
        });
      }

      // Hint 2: Divisibility
      if (!this.hintsRevealed.includes('divisibility')) {
        const divisors = [3, 5, 7, 10].filter(d => this.secretNumber % d === 0);
        if (divisors.length > 0) {
          const chosenDiv = divisors[Math.floor(Math.random() * divisors.length)];
          possibleHints.push({
            id: 'divisibility',
            text: `The secret number is cleanly divisible by ${chosenDiv}!`
          });
        } else {
          possibleHints.push({
            id: 'divisibility',
            text: `The secret number is NOT divisible by 2, 3, or 5.`
          });
        }
      }

      // Hint 3: Digit sum
      if (!this.hintsRevealed.includes('digitsum') && this.secretNumber >= 10) {
        const sumDigits = String(this.secretNumber).split('').reduce((acc, d) => acc + parseInt(d, 10), 0);
        possibleHints.push({
          id: 'digitsum',
          text: `The sum of the digits in the secret number is ${sumDigits}.`
        });
      }

      // Hint 4: Tight bracket
      if (!this.hintsRevealed.includes('bracket')) {
        const spread = Math.max(4, Math.floor((this.max - this.min) * 0.15));
        const bMin = Math.max(this.min, this.secretNumber - Math.floor(Math.random() * spread));
        const bMax = Math.min(this.max, bMin + spread + 2);
        possibleHints.push({
          id: 'bracket',
          text: `Narrowed Scope: The secret number is strictly between ${bMin} and ${bMax}.`
        });
      }

      if (possibleHints.length === 0) {
        this.showToast('No more hints available for this round!');
        return;
      }

      // Deduct 1 attempt for the hint
      this.attemptsLeft--;
      this.animateHeartLoss();
      this.sound.playHint();

      const selectedHint = possibleHints[0];
      this.hintsRevealed.push(selectedHint.id);

      this.hintContent.textContent = selectedHint.text;
      this.hintBox.classList.remove('hidden');

      this.showToast('Intel unlocked! -1 attempt deducted.');

      if (this.attemptsLeft <= 0) {
        this.handleDefeat();
      }
    }

    triggerInputError(msg) {
      this.sound.playHighGuess();
      this.guessInputWrapper.classList.add('shake');
      setTimeout(() => {
        this.guessInputWrapper.classList.remove('shake');
      }, 450);
      this.showToast(msg);
    }

    showToast(message) {
      if (!this.toastNotification) return;
      this.toastNotification.textContent = message;
      this.toastNotification.classList.remove('hidden');

      clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => {
        this.toastNotification.classList.add('hidden');
      }, 3000);
    }
  }

  // Initialize Game when DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    window.numberQuest = new NumberQuestGame();
  });
})();
