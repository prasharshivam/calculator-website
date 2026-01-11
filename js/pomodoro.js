// Basic Pomodoro logic for Your Simple Calculator pomodoro tool

const displayEl = document.getElementById("pomodoroDisplay");
const startPauseBtn = document.getElementById("startPauseBtn");
const resetBtn = document.getElementById("resetBtn");
const soundToggleBtn = document.getElementById("soundToggleBtn");
const statusEl = document.getElementById("pomodoroStatus");
const modeButtons = document.querySelectorAll(".mode-btn");
const heroSection = document.querySelector(".pomodoro-hero");
const citySelect = document.getElementById("citySelect");

let currentMode = "focus25";
let remainingSeconds = 25 * 60;
let timerId = null;
let isRunning = false;
let soundEnabled = true;

// Simple beep using AudioContext (no external files)
let audioContext;
function playBeep() {
  if (!soundEnabled) return;
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    const duration = 0.2;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = "sine";
    oscillator.frequency.value = 880;
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  } catch (e) {
    // fail silently if AudioContext not allowed
  }
}

function updateDisplay() {
  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  displayEl.textContent =
    String(mins).padStart(2, "0") + ":" + String(secs).padStart(2, "0");
}

function setMode(mode) {
  currentMode = mode;
  if (mode === "focus25") {
    remainingSeconds = 25 * 60;
    statusEl.textContent =
      "25 minute deep work session. Focus on one task until the timer ends.";
  } else if (mode === "focus30") {
    remainingSeconds = 30 * 60;
    statusEl.textContent =
      "30 minute focus block for slightly longer tasks. Stay with one task only.";
  } else if (mode === "shortBreak") {
    remainingSeconds = 5 * 60;
    statusEl.textContent =
      "Short 5 minute break. Stand up, stretch, drink water and rest your eyes.";
  } else if (mode === "longBreak") {
    remainingSeconds = 15 * 60;
    statusEl.textContent =
      "Long 15 minute break after several Pomodoro sessions. Relax away from your screen.";
  }
  updateDisplay();
  highlightActiveModeButton();
}

function highlightActiveModeButton() {
  modeButtons.forEach((btn) => {
    if (btn.dataset.mode === currentMode) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

function startTimer() {
  if (isRunning) return;
  isRunning = true;
  startPauseBtn.textContent = "Pause";

  timerId = setInterval(() => {
    remainingSeconds--;
    if (remainingSeconds <= 0) {
      remainingSeconds = 0;
      updateDisplay();
      clearInterval(timerId);
      timerId = null;
      isRunning = false;
      startPauseBtn.textContent = "Start";
      playBeep();
      statusEl.textContent =
        "Time is up. Take a break or switch to the next session.";
    } else {
      updateDisplay();
    }
  }, 1000);
}

function pauseTimer() {
  if (!isRunning) return;
  isRunning = false;
  startPauseBtn.textContent = "Resume";
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
}

function resetTimer() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
  isRunning = false;
  startPauseBtn.textContent = "Start";
  setMode(currentMode);
}

// Event listeners
startPauseBtn.addEventListener("click", () => {
  if (!isRunning) {
    startTimer();
  } else {
    pauseTimer();
  }
});

resetBtn.addEventListener("click", () => {
  resetTimer();
});

soundToggleBtn.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  soundToggleBtn.textContent = soundEnabled ? "🔔 On" : "🔕 Off";
});

modeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const newMode = btn.dataset.mode;
    currentMode = newMode;
    resetTimer();
  });
});

// Wallpaper selection
function setCityBackground(city) {
  heroSection.setAttribute("data-city", city);
}

citySelect.addEventListener("change", (e) => {
  setCityBackground(e.target.value);
});

// Initial state
setMode("focus25");
setCityBackground("bangalore");
updateDisplay();
