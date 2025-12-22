// FluidFrag.glsl
precision highp float;
varying vec2 vUv;
uniform float uTime;
void main() {
    gl_FragColor = vec4(vUv, 0.5 + 0.5 * sin(uTime), 1.0);
}
