import * as THREE from 'three';

/**
 * WaveSpikes.js - GPU Shader Version (RTX 3060 Optimized)
 * Mode 1: A High-Density Kinetic Sphere using Vertex Shaders.
 * Features: 
 * - Fine Mesh (High Subdivision)
 * - Multi-color Gradient Mapping (Uses 3 palette colors at once)
 * - GPU-based Displacement (Noise + Audio)
 */

export class MeshSpikes {
    constructor(quality = 1) {
        this.mesh = null;
        this.uniforms = null;
        this.init(quality);
    }

    init(quality) {
        // 1. Geometry: "Fine Mesh"
        // Increased radius to 15 (fills screen) and detail to 6 (very dense wireframe)
        // Detail 6 = ~40,000 triangles. Easy for RTX 3060.

        let detail = 6;

        switch (quality) {
            case 0: detail = 2; break; // Low Power (~320 faces)
            case 1: detail = 6; break; // Balanced (~81k faces)
            case 2: detail = 8; break; // High (~1.3M faces)
            case 3: detail = 14; break; // Ultra (~300M+ faces)
        }

        const geometry = new THREE.IcosahedronGeometry(15, detail);

        // 2. Uniforms: Variables we send to the GPU every frame
        this.uniforms = {
            uTime: { value: 0 },
            uBass: { value: 0.0 },
            uTreble: { value: 0.0 },
            // Default Gradient Colors (Cyan -> Pink -> Yellow)
            uColor1: { value: new THREE.Color(0x00ffff) },
            uColor2: { value: new THREE.Color(0xff00ff) },
            uColor3: { value: new THREE.Color(0xffff00) }
        };

        // 3. Shader Material: The "Brain" of the visual
        const material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            wireframe: true, // This creates the "Net/Mesh" look
            side: THREE.DoubleSide,
            transparent: true,
            blending: THREE.AdditiveBlending, // Makes overlapping lines glow

            // Vertex Shader: Moves the points (The Shape)
            vertexShader: `
                uniform float uTime;
                uniform float uBass;
                uniform float uTreble;
                varying float vDisplacement; // Send to Fragment Shader for coloring

                // Simplex Noise Function (GPU Math)
                vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
                vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
                vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
                vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
                float snoise(vec3 v) {
                    const vec2  C = vec2(1.0/6.0, 1.0/3.0);
                    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
                    vec3 i  = floor(v + dot(v, C.yyy));
                    vec3 x0 = v - i + dot(i, C.xxx);
                    vec3 g = step(x0.yzx, x0.xyz);
                    vec3 l = 1.0 - g;
                    vec3 i1 = min( g.xyz, l.zxy );
                    vec3 i2 = max( g.xyz, l.zxy );
                    vec3 x1 = x0 - i1 + C.xxx;
                    vec3 x2 = x0 - i2 + C.yyy;
                    vec3 x3 = x0 - D.yyy;
                    i = mod289(i);
                    vec4 p = permute( permute( permute(
                                i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                            + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
                            + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
                    float n_ = 0.142857142857;
                    vec3  ns = n_ * D.wyz - D.xzx;
                    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
                    vec4 x_ = floor(j * ns.z);
                    vec4 y_ = floor(j - 7.0 * x_ );
                    vec4 x = x_ *ns.x + ns.yyyy;
                    vec4 y = y_ *ns.x + ns.yyyy;
                    vec4 h = 1.0 - abs(x) - abs(y);
                    vec4 b0 = vec4( x.xy, y.xy );
                    vec4 b1 = vec4( x.zw, y.zw );
                    vec4 s0 = floor(b0)*2.0 + 1.0;
                    vec4 s1 = floor(b1)*2.0 + 1.0;
                    vec4 sh = -step(h, vec4(0.0));
                    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
                    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
                    vec3 p0 = vec3(a0.xy,h.x);
                    vec3 p1 = vec3(a0.zw,h.y);
                    vec3 p2 = vec3(a1.xy,h.z);
                    vec3 p3 = vec3(a1.zw,h.w);
                    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
                    p0 *= norm.x;
                    p1 *= norm.y;
                    p2 *= norm.z;
                    p3 *= norm.w;
                    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
                    m = m * m;
                    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
                }

                void main() {
                    // Complexity scaling based on quality
                    float noise = 0.0;
                    
                    // Lvl 0-1: Basic noise
                    noise = snoise(position * 0.1 + uTime * 0.2);
                    
                    // Lvl 2-3: Add detail layers (Definition)
                    if (uTreble > 0.05) { // Only add extra math if there's signal
                        noise += snoise(position * 0.4 + uTime * 0.5) * 0.2;
                        noise += snoise(position * 0.8 + uTime * 0.8) * 0.1;
                    }
                    
                    float displacement = (uBass * 5.0) + (noise * uTreble * 8.0);
                    vDisplacement = displacement;

                    vec3 newPosition = position + normal * displacement;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
                }
            `,

            // Fragment Shader: Colors the pixels (The Look)
            fragmentShader: `
                uniform vec3 uColor1; // Deep/Base Color
                uniform vec3 uColor2; // Mid/Main Color
                uniform vec3 uColor3; // High/Peak Color
                varying float vDisplacement;

                void main() {
                    // Map displacement to a 0.0 - 1.0 range for mixing
                    // Adjust '10.0' depending on how high the spikes get
                    float mixStr = smoothstep(-5.0, 15.0, vDisplacement);
                    
                    // Gradient Logic:
                    // Low displacement = Color 1 -> Color 2
                    // High displacement = Color 2 -> Color 3
                    vec3 finalColor = mix(uColor1, uColor2, mixStr);
                    if(mixStr > 0.5) {
                        finalColor = mix(uColor2, uColor3, (mixStr - 0.5) * 2.0);
                    }

                    // Calculate Alpha (Transparency)
                    // The "Deep" parts are more transparent, "Spikes" are solid
                    float alpha = 0.3 + (mixStr * 0.7); 
                    
                    gl_FragColor = vec4(finalColor, alpha);
                }
            `
        });

        this.mesh = new THREE.Mesh(geometry, material);
    }

    update(freqData, palette, reactivity = 2.0) {
        if (!this.mesh) return;

        // 1. Update Time (Slow flow)
        this.uniforms.uTime.value += 0.01;

        // 2. Update Audio Data
        if (freqData) {
            // Apply reactivity multiplier to audio sensitivity
            const bass = (freqData[5] / 255) * (reactivity * 0.5);
            const treble = (freqData[100] / 255) * (reactivity * 0.5);

            // Smooth interpolation (prevent jittery movement)
            this.uniforms.uBass.value += (bass - this.uniforms.uBass.value) * 0.15;
            this.uniforms.uTreble.value += (treble - this.uniforms.uTreble.value) * 0.15;
        }

        // 3. Update Gradient from Palette
        // We grab the Top 3 colors to create the gradient
        if (palette && palette.length >= 3) {
            this.uniforms.uColor1.value.set(palette[0]);
            this.uniforms.uColor2.value.set(palette[1]);
            this.uniforms.uColor3.value.set(palette[2]);
        }

        // 4. Rotate the whole system
        this.mesh.rotation.y += 0.001;
        this.mesh.rotation.z += 0.001;
    }
}