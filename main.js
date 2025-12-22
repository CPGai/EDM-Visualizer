import { ColorProcessor } from './src/core/ColorProcessor.js';
import { AudioEngine } from './src/core/AudioEngine.js';
import { SceneManager } from './src/core/SceneManager.js';

console.log("Main.js: App starting...");

const cp = new ColorProcessor();
const audio = new AudioEngine();
const scene = new SceneManager();

// UI Elements
const uploadInput = document.getElementById('imgUpload');
const paletteContainer = document.getElementById('paletteContainer');
const btnSystem = document.getElementById('btnSystem');
const btnMic = document.getElementById('btnMic');
const audioMonitor = document.getElementById('audio-monitor');

// --- 1. Color Logic ---
uploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = async () => {
            const colors = await cp.extractPalette(img, 10);
            displayPalette(colors);
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
});

function displayPalette(colors) {
    paletteContainer.innerHTML = '';
    colors.forEach(color => {
        const div = document.createElement('div');
        div.className = 'swatch';
        div.style.backgroundColor = color;
        paletteContainer.appendChild(div);
    });
}

// --- 2. Audio Logic ---
btnSystem.addEventListener('click', async () => {
    btnSystem.textContent = "WAITING FOR SELECTION...";
    try {
        await audio.startSystemAudio();
        btnSystem.textContent = "CLEAN SIGNAL ACTIVE";
        btnSystem.style.background = "#0f0";
    } catch (e) {
        btnSystem.textContent = "CAPTURE CANCELLED";
        btnSystem.style.background = "#f00";
    }
});

btnMic.addEventListener('click', async () => {
    try {
        await audio.startMic();
        btnMic.textContent = "HARDWARE ACTIVE";
        btnMic.style.background = "#0f0";
    } catch (e) {
        btnMic.textContent = "MIC ERROR";
    }
});

// --- 3. The Main Render Loop (The Heartbeat) ---
function animate() {
    requestAnimationFrame(animate);

    // Get latest data
    const freqData = audio.getFrequencyData();
    const palette = cp.palette;

    // Update UI Monitor
    if (freqData) {
        const avg = audio.getAverageFrequency();
        audioMonitor.textContent = `Audio Signal: ${avg.toFixed(2)}`;
        audioMonitor.style.boxShadow = `0 0 ${avg / 2}px rgba(0, 255, 255, 0.5)`;
    }

    // Update and Render 3D Scene
    scene.update(freqData, palette);
    scene.render();
}

// Start the loop immediately
animate();