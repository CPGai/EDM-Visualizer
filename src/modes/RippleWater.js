import * as THREE from 'three';
import vertexShader from '../shaders/BaseVertex.glsl?raw';
import fragmentShader from '../shaders/WaterFrag.glsl?raw';

/**
 * RippleWater.js
 * Mode 4: Water Surface Ripple Simulation
 * Simulates droplets creating interference patterns on a water surface.
 */

export class RippleWater {
    constructor(quality = 1) {
        this.mesh = null;
        this.uniforms = null;
        this.init(quality);
    }

    init(quality) {
        // 1. Geometry: Full Screen Plane
        // Increased size to 200x200 to ensure coverage at Camera Z=40 even on ultrawide
        const geometry = new THREE.PlaneGeometry(200, 200);

        // 2. Uniforms
        this.uniforms = {
            uTime: { value: 0 },
            uBass: { value: 0.0 },
            uTreble: { value: 0.0 },
            uColor1: { value: new THREE.Color(0x00ffff) },
            uColor2: { value: new THREE.Color(0xff00ff) },
            uColor3: { value: new THREE.Color(0xffff00) }
        };

        // 3. Material
        const material = new THREE.ShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            uniforms: this.uniforms,
            wireframe: false,
            depthWrite: false,
            depthTest: false
        });

        this.mesh = new THREE.Mesh(geometry, material);
    }

    update(freqData, palette, reactivity = 2.0) {
        if (!this.mesh) return;

        // 1. Update Time
        this.uniforms.uTime.value += 0.01;

        // 2. Update Audio
        if (freqData) {
            // Apply reactivity multiplier
            // Bass (Left Ripple Source)
            const bass = (freqData[5] / 255) * (reactivity * 0.8);
            // Treble (Right Ripple Source)
            const treble = (freqData[100] / 255) * (reactivity * 1.0);

            // Smooth interpolation
            this.uniforms.uBass.value += (bass - this.uniforms.uBass.value) * 0.1;
            this.uniforms.uTreble.value += (treble - this.uniforms.uTreble.value) * 0.1;
        }

        // 3. Update Palette
        if (palette && palette.length >= 3) {
            this.uniforms.uColor1.value.set(palette[0]);
            this.uniforms.uColor2.value.set(palette[1]);
            this.uniforms.uColor3.value.set(palette[2]);
        }
    }

    dispose() {
        if (this.mesh) {
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }
    }
}
