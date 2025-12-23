import * as THREE from 'three';
import vertexShader from '../shaders/BaseVertex.glsl?raw';
import fragmentShader from '../shaders/FluidFrag.glsl?raw';

/**
 * InkFluid.js
 * Mode 3: Fluid dispersion simulation using Domain Warping shaders.
 * Simulates ink dropping into water and swirling with audio reactivity.
 */

export class InkFluid {
    constructor(quality = 1) {
        this.mesh = null;
        this.uniforms = null;
        this.init(quality);
    }

    init(quality) {
        // 1. Geometry: Full Screen Plane
        // We Use a large plane to ensure it covers the camera frustum at Z=40
        const geometry = new THREE.PlaneGeometry(100, 100);

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
        // Bass increases flow speed
        let timeSpeed = 0.005;
        if (this.uniforms.uBass.value > 0.1) timeSpeed += 0.01;
        this.uniforms.uTime.value += timeSpeed;

        // 2. Update Audio
        if (freqData) {
            // Apply reactivity multiplier
            const bass = (freqData[5] / 255) * (reactivity * 0.8);
            const treble = (freqData[100] / 255) * (reactivity * 0.8);

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
