import * as THREE from 'three';

/**
 * WaveSpikes.js
 * Mode 1: A Kinetic Sphere that deforms and spikes based on Audio FFT data.
 */

export class WaveSpikes {
    constructor() {
        this.mesh = null;
        this.init();
    }

    init() {
        // 1. Geometry: High-detail Icosahedron (The "Ball")
        // Detail level 4 gives us enough vertices for smooth spikes
        const geometry = new THREE.IcosahedronGeometry(10, 4);

        // Store original positions so we can reset them every frame
        this.originalPositions = geometry.attributes.position.clone();
        geometry.userData.originalPositions = this.originalPositions;

        // 2. Material: Wireframe style to look like the reference image
        const material = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            wireframe: true,
            transparent: true,
            opacity: 0.8
        });

        this.mesh = new THREE.Mesh(geometry, material);
    }

    /**
     * @param {Uint8Array} freqData - 512 bytes of frequency data
     * @param {string[]} palette - Current color palette
     */
    update(freqData, palette) {
        if (!this.mesh) return;

        // 1. Color Update (Smoothly adopt the primary color)
        if (palette && palette.length > 0) {
            this.mesh.material.color.set(palette[0]);
        }

        // 2. Motion Logic
        // Rotate slowly
        this.mesh.rotation.x += 0.002;
        this.mesh.rotation.y += 0.002;

        if (!freqData) return;

        // 3. Vertex Displacement (The "Spiking")
        const positions = this.mesh.geometry.attributes.position;
        const original = this.mesh.geometry.userData.originalPositions;
        const count = positions.count;

        // Calculate Audio Variables
        // Bass is usually at the start of the array (indices 0-20)
        // Mids/Highs are further up
        const bass = freqData[5];
        const trebles = freqData[100];

        // Scale factor: How much the ball pulses
        const scale = 1 + (bass / 512);
        this.mesh.scale.set(scale, scale, scale);

        for (let i = 0; i < count; i++) {
            // Get original coordinates
            const ox = original.getX(i);
            const oy = original.getY(i);
            const oz = original.getZ(i);

            // Create a "noise" pattern based on the vertex position
            // We use simple math sine waves to simulate noise for speed
            const noise = Math.sin(ox * 0.5 + Date.now() * 0.001) * Math.cos(oy * 0.5 + Date.now() * 0.002);

            // Determine spike intensity based on audio
            // If the audio is loud (bass > 100), spikes grow larger
            const spikeFactor = (bass / 255) * 5 * noise;

            // Apply new position: Original Dir + Spike
            // We normalize the vector to push strictly outwards
            const len = Math.sqrt(ox * ox + oy * oy + oz * oz);
            const nx = ox / len;
            const ny = oy / len;
            const nz = oz / len;

            positions.setXYZ(
                i,
                ox + (nx * spikeFactor),
                oy + (ny * spikeFactor),
                oz + (nz * spikeFactor)
            );
        }

        // Tell Three.js the shape has changed
        positions.needsUpdate = true;
    }
}