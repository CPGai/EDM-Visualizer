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
const modeSelect = document.getElementById('modeSelect');
const reactivityInput = document.getElementById('reactivity');
const reactivityValue = document.getElementById('reactivityValue');
const qualityInput = document.getElementById('quality');
const qualityValue = document.getElementById('qualityValue');

// --- 1. Color Logic ---
// --- 1. Color Logic ---
const imgPreview = document.getElementById('imgPreview');

uploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        // Show Image Preview
        imgPreview.style.display = 'block';
        imgPreview.src = event.target.result;

        const img = new Image();
        img.onload = async () => {
            const colors = await cp.extractPalette(img, 10);

            // Set first 3 as default active
            // We use a custom property on the ColorProcessor or just modify the array
            // Since SceneManager reads cp.palette[0..2], we just need to ensure 
            // the user's "selections" move to the front of this array.
            cp.palette = colors;
            displayPalette(colors);
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
});

function displayPalette(colors) {
    paletteContainer.innerHTML = '';
    colors.forEach((color, index) => {
        const div = document.createElement('div');
        div.className = 'swatch';
        div.style.backgroundColor = color;

        // Highlight the first 3 by default
        if (index < 3) div.classList.add('selected');

        div.addEventListener('click', () => {
            // Primitive Selection Logic: Rotate selections.
            // Move clicked color to the start of the array to make it Priority 1
            // This is a simple satisfying way to "pick" a color.

            const selectedColor = colors.splice(index, 1)[0]; // Remove from current spot
            colors.unshift(selectedColor); // Add to front

            // Update the source of truth
            cp.palette = colors;

            // Redraw to show new order and selection state
            displayPalette(colors);
        });

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

// --- 3. UI Toggle Logic (Collapse/Expand) ---
const uiRoot = document.getElementById('ui-root');
const btnClose = document.getElementById('btnClose');
const uiGear = document.getElementById('ui-gear');

btnClose.addEventListener('click', () => {
    uiRoot.classList.add('collapsed');
});

uiGear.addEventListener('click', () => {
    uiRoot.classList.remove('collapsed');
});

// --- 4. Mode Switching Logic ---
modeSelect.addEventListener('change', (e) => {
    scene.switchMode(e.target.value);
});

reactivityInput.addEventListener('input', (e) => {
    reactivityValue.textContent = parseFloat(e.target.value).toFixed(1);
});

qualityInput.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    const labels = ["0: LOW POWER", "1: BALANCED", "2: HIGH", "3: ULTRA"];
    qualityValue.textContent = labels[val] || "1: BALANCED";

    // De-bounce or just set it? Setting quality re-creates meshes, so maybe debounce?
    // For now, let's just do it. If performance is bad, we can debounce.
    scene.setQuality(val);
});

// --- 4. The Main Render Loop (The Heartbeat) ---
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
    const reactivity = parseFloat(reactivityInput.value);
    scene.update(freqData, palette, reactivity);
    scene.render();
}

// Start the loop immediately
animate();