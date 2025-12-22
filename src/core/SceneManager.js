import * as THREE from 'three';
import { WaveSpikes } from '../modes/WaveSpikes.js';

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

        // 3. Initialize Mode 1: WaveSpikes
        this.currentMode = new WaveSpikes();
        this.scene.add(this.currentMode.mesh);

        // 4. Lighting (Standard Setup)
        const light = new THREE.PointLight(0xffffff, 1, 100);
        light.position.set(10, 10, 10);
        this.scene.add(light);

        const ambient = new THREE.AmbientLight(0xffffff, 0.2);
        this.scene.add(ambient);

        window.addEventListener('resize', () => this.onWindowResize(), false);
        console.log("SceneManager: Switched to WaveSpikes Mode.");
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    update(freqData, palette) {
        if (this.currentMode && this.currentMode.update) {
            this.currentMode.update(freqData, palette);
        }
    }
}