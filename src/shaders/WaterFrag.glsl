
uniform float uTime;
uniform float uBass;
uniform float uTreble;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
varying vec2 vUv;

// -------------------------------------------------------------------------------- //
// Water Ripple Logic
// -------------------------------------------------------------------------------- //

// Calculate a ripple from a specific center point
float ripple(vec2 uv, vec2 center, float freq, float speed, float amplitude) {
    float dist = distance(uv, center);
    // The wave propagates outward: sin(dist * freq - time * speed)
    // We decay the amplitude with distance: / (dist * x + 1.0)
    float wave = sin(dist * freq - uTime * speed);
    float decay = 1.0 / (dist * 3.0 + 0.5);
    return wave * decay * amplitude;
}

void main() {
    // Center UVs to -1.0 to 1.0 for easier math
    vec2 uv = vUv * 2.0 - 1.0;
    // Aspect ratio correction (assuming roughly 16:9, but this is a rough approximation)
    uv.x *= 1.5; 

    float height = 0.0;

    // 1. Bass Ripples (Left Side)
    // Strong, slow, wide waves
    float bassAmp = uBass * 1.5; 
    height += ripple(uv, vec2(-1.2, 0.0), 10.0, 3.0, bassAmp);
    
    // 2. Treble Ripples (Right Side)
    // Fast, sharp, frequent waves
    float trebleAmp = uTreble * 1.2;
    height += ripple(uv, vec2(1.2, 0.0), 25.0, 5.0, trebleAmp);

    // 3. Ambient Rain (Center/Random subtle)
    // Always present subtle movement
    height += ripple(uv, vec2(0.0, 0.0), 15.0, 2.0, 0.05);

    // -------------------------------------------------------------------------------- //
    // Visualizing the Surface
    // -------------------------------------------------------------------------------- //
    
    // Calculate "Normal" based on height gradient (approximate derivative)
    // We sample height at slightly offset points to find the slope
    float diff = 0.01;
    float hRight = ripple(uv + vec2(diff, 0.0), vec2(-1.2, 0.0), 10.0, 3.0, bassAmp) 
                 + ripple(uv + vec2(diff, 0.0), vec2(1.2, 0.0), 25.0, 5.0, trebleAmp);
                 
    float hUp    = ripple(uv + vec2(0.0, diff), vec2(-1.2, 0.0), 10.0, 3.0, bassAmp)
                 + ripple(uv + vec2(0.0, diff), vec2(1.2, 0.0), 25.0, 5.0, trebleAmp);

    vec3 normal = normalize(vec3(height - hRight, height - hUp, 0.5)); // Z is up

    // Reflection Vector (Lighting)
    // We pretend there are colored lights around the scene
    vec3 viewDir = vec3(0.0, 0.0, 1.0); // Looking straight down
    
    // Angle of surface facing
    float facing = dot(normal, viewDir);

    // Color Mixing
    // Flat water (facing 1.0) = Deep Blue/Black (Base color)
    // Angled water (ripples) = Reflects Color1/Color2
    
    vec3 color = mix(uColor2, uColor1, smoothstep(0.8, 1.0, facing));

    // Highlights (Specular) - Toned down
    vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
    float spec = pow(max(dot(reflect(-lightDir, normal), viewDir), 0.0), 30.0); // Higher power = sharper, smaller highlight
    
    color += uColor3 * (spec * 0.6); // Reduced specular intensity
    
    // Add "Foam" or intensity at peaks
    // Reduced multiplier to prevent whiteout
    color += vec3(height * 0.15);

    gl_FragColor = vec4(color, 1.0);
}
