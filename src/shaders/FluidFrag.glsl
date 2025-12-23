
uniform float uTime;
uniform float uBass;
uniform float uTreble;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
varying vec2 vUv;

// -------------------------------------------------------------------------------- //
// FBM (Fractal Brownian Motion) & Domain Warping Logic
// -------------------------------------------------------------------------------- //

float random (in vec2 _st) {
    return fract(sin(dot(_st.xy, vec2(12.9898,78.233)))*43758.5453123);
}

// Gradient Noise
float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

#define OCTAVES 6
float fbm (in vec2 st) {
    // Initial values
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 0.0;
    //
    // Loop of octaves
    for (int i = 0; i < OCTAVES; i++) {
        value += amplitude * noise(st);
        st *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

void main() {
    vec2 st = vUv * 3.0;
    
    // Domain Warping Logic:
    // We displace the coordinate 'q' with FBM, then displance 'r' with THAT 'q'.
    // This creates the swirling "smoke/ink" look.
    
    // 1. First layer
    vec2 q = vec2(0.);
    q.x = fbm( st + 0.00 * uTime);
    q.y = fbm( st + vec2(1.0));

    // 2. Second layer (distorted by the first)
    vec2 r = vec2(0.);
    r.x = fbm( st + 1.0*q + vec2(1.7,9.2)+ 0.15*uTime );
    r.y = fbm( st + 1.0*q + vec2(8.3,2.8)+ 0.126*uTime);

    // 3. Final Noise Value (distorted by r)
    float f = fbm(st+r);

    // 4. Color Mixing based on noise value 'f'
    // 'f' is 0.0 to 1.0 (roughly).
    
    // Mix 1: Deep Base (Color1) to Mid (Color2)
    // Use smoothstep for a more natural ink blend, allowing Color1 to be seen in low-noise areas
    vec3 color = mix(uColor1, uColor2, smoothstep(0.2, 0.8, f));

    // Mix 2: Add Highlights (Color3) - Use 'r' which is more swirly than 'q'
    // This creates "veins" of the third color
    color = mix(color, uColor3, smoothstep(0.4, 0.9, length(r)) * 0.6);

    // 5. Audio Reactivity
    
    // Bass: Deepens the contrast (makes darks darker)
    color *= 0.6 + (uBass * 0.6); 
    
    // Treble: Adds a soft glow instead of harsh white clipping
    float brightness = smoothstep(0.5, 1.1, f + uTreble * 0.4);
    color += vec3(brightness * 0.4); // Additive glow

    gl_FragColor = vec4((f*f*f+.6*f*f+.5*f)*color, 1.);
}
