import * as THREE from 'three';

/**
 * WaveSpikes.js - Pure Color High-Density Version
 * Mode 1: A Kinetic Sphere using dense point-cloud rendering.
 * Update: Removed white saturation on high peaks to maintain pure palette colors.
 */

export class WaveSpikes {
    constructor(quality = 1) {
        this.mesh = null;
        this.uniforms = null;
        this.init(quality);
    }

    init(quality) {
        // 1. Geometry: "Ultra Fine Mesh"
        // Detail 14 creates a very dense surface (~250k vertices at quality 2)
        let detail = 14;
        switch (quality) {
            case 0: detail = 4; break;  // ~2k verts (Low Power)
            case 1: detail = 10; break; // ~100k verts (Balanced)
            case 2: detail = 14; break; // ~250k verts (High)
            case 3: detail = 22; break; // Ultra (~10B+ vertices - Extreme)
        }
        const geometry = new THREE.IcosahedronGeometry(14, detail);

        // 2. Uniforms
        this.uniforms = {
            uTime: { value: 0 },
            uBass: { value: 0.0 },
            uTreble: { value: 0.0 },
            uColor1: { value: new THREE.Color(0x00ffff) },
            uColor2: { value: new THREE.Color(0xff00ff) },
            uColor3: { value: new THREE.Color(0xffff00) }
        };

        // 3. Shader Material
        const material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            wireframe: false,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,

            vertexShader: `
                uniform float uTime;
                uniform float uBass;
                uniform float uTreble;
                varying float vDisplacement;
                varying float vDistance;

                // Simplex Noise (Optimized)
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
                    // High-Definition Noise (RTX 3060+)
                    float noise = snoise(position * 0.15 + uTime * 0.3);
                    
                    noise += snoise(position * 0.6 + uTime * 0.4) * 0.25;
                    noise += snoise(position * 1.2 + uTime * 0.7) * 0.15;
                    
                    float displacement = (uBass * 6.0) + (noise * uTreble * 10.0);
                    vDisplacement = displacement;

                    vec3 newPosition = position + normal * displacement;
                    vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);
                    
                    gl_Position = projectionMatrix * mvPosition;

                    // Point Size Logic (Thicker Lines)
                    gl_PointSize = (4.0 + (uBass * 2.0)) * (50.0 / -mvPosition.z);
                    
                    vDistance = -mvPosition.z;
                }
            `,

            fragmentShader: `
                uniform vec3 uColor1;
                uniform vec3 uColor2;
                uniform vec3 uColor3;
                varying float vDisplacement;
                varying float vDistance;

                void main() {
                    vec2 cxy = 2.0 * gl_PointCoord - 1.0;
                    float r = dot(cxy, cxy);
                    if (r > 1.0) discard;

                    // Intense Color Mixing
                    float mixStr = smoothstep(-2.0, 12.0, vDisplacement);
                    
                    vec3 finalColor = mix(uColor1, uColor2, mixStr);
                    
                    // Add a "Hot" core using the 3rd palette color (Highlight)
                    if(mixStr > 0.5) {
                        finalColor = mix(finalColor, uColor3, (mixStr - 0.5) * 2.0);
                    }

                    // REMOVED: The logic that forced 'finalColor' to vec3(1.0) (White) at > 0.95 intensity.
                    // This ensures the particles stay colored (e.g., pure Cyan/Pink/Yellow) even at max volume.

                    float alpha = (1.0 - r) * (0.6 + mixStr * 0.4); 
                    
                    gl_FragColor = vec4(finalColor, alpha);
                }
            `
        });

        this.mesh = new THREE.Points(geometry, material);
    }

    update(freqData, palette, reactivity = 2.0) {
        if (!this.mesh) return;

        this.uniforms.uTime.value += 0.01;

        if (freqData) {
            const bass = (freqData[5] / 255) * (reactivity * 0.6);
            const treble = (freqData[100] / 255) * (reactivity * 0.75);

            this.uniforms.uBass.value += (bass - this.uniforms.uBass.value) * 0.2;
            this.uniforms.uTreble.value += (treble - this.uniforms.uTreble.value) * 0.2;
        }

        if (palette && palette.length >= 3) {
            this.uniforms.uColor1.value.set(palette[0]);
            this.uniforms.uColor2.value.set(palette[1]);
            this.uniforms.uColor3.value.set(palette[2]);
        }

        this.mesh.rotation.y += 0.002;
        this.mesh.rotation.z += 0.001;
    }
}