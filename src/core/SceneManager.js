import * as THREE from 'three';
import { WaveSpikes } from '../modes/WaveSpikes.js';
import { MeshSpikes } from '../modes/MeshSpikes.js';
import { InkFluid } from '../modes/InkFluid.js';
import { RippleWater } from '../modes/RippleWater.js';

// Dictionary of available modes
const MODES = {
    'WaveSpikes': WaveSpikes,
    'MeshSpikes': MeshSpikes,
    'InkFluid': InkFluid,
    'RippleWater': RippleWater
};

/**
 * SceneManager.js - Active Mode Version
 * Purpose: Manages the 3D environment and rendering.
 * Now driving "Mode 1: WaveSpikes"
 */

export class SceneManager {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: "high-performance"
        });

        this.currentMode = null; // Holds the active animation object
        this.currentModeName = 'RippleWater'; // Set default to RippleWater for testing
        this.currentQuality = 1; // Default quality (Balanced)
        this.init();
    }

    init() {
        // 1. Setup Renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(0x050505, 1);

        document.body.appendChild(this.renderer.domElement);

        this.renderer.domElement.style.position = 'fixed';
        this.renderer.domElement.style.top = '0';
        this.renderer.domElement.style.left = '0';
        this.renderer.domElement.style.zIndex = '1';

        // 2. Setup Camera
        this.camera.position.set(0, 0, 40);
        this.camera.lookAt(0, 0, 0);

        // 3. Initialize Default Mode: WaveSpikes
        this.switchMode('WaveSpikes');

        // 4. Lighting (Standard Setup)
        const light = new THREE.PointLight(0xffffff, 1, 100);
        light.position.set(10, 10, 10);
        this.scene.add(light);

        const ambient = new THREE.AmbientLight(0xffffff, 0.2);
        this.scene.add(ambient);

        window.addEventListener('resize', () => this.onWindowResize(), false);
        console.log("SceneManager: Initialized.");
    }

    switchMode(modeName) {
        if (!MODES[modeName]) {
            console.error(`Mode ${modeName} not found!`);
            return;
        }

        // Store active mode name so we can re-init if quality changes
        this.currentModeName = modeName;

        // 1. Cleanup old mode
        if (this.currentMode) {
            this.scene.remove(this.currentMode.mesh);
            // If the mode has a dispose/cleanup method, you'd call it here
            if (this.currentMode.dispose) this.currentMode.dispose();
        }

        // 2. Init new mode with current quality
        this.currentMode = new MODES[modeName](this.currentQuality);
        this.scene.add(this.currentMode.mesh);

        console.log(`SceneManager: Switched to ${modeName} (Quality: ${this.currentQuality})`);
    }

    setQuality(quality) {
        if (this.currentQuality === quality) return;
        this.currentQuality = quality;
        console.log(`SceneManager: Quality set to ${quality}`);

        // Reload current mode with new quality
        this.switchMode(this.currentModeName);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    update(freqData, palette, reactivity) {
        if (this.currentMode && this.currentMode.update) {
            this.currentMode.update(freqData, palette, reactivity);
        }
    }
}