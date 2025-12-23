# PRD - EDM Visualizer Pro

## Project Overview
A high-performance, real-time music visualizer designed for EDM production and live performance. Optimized for high-end GPUs (target: RTX 3060 12GB) while remaining accessible for integrated graphics via scaling.

---

## Core Features

### 1. Audio Engine
- **Direct Capture:** High-fidelity system audio capture (Spotify, YouTube, DAW).
- **Latency:** < 16ms responsiveness for tight audio-visual sync.
- **Spectrum Analysis:** Segmented data for Bass (Displacement) and Treble (Definition/Spikes).

### 2. Multi-Mode Visualization
Users can switch between different visual expressions in real-time.
- **WaveSpikes (Points):** A dense point-cloud kinetic sphere using additive blending for a neon-glow effect.
- **MeshSpikes (Wireframe):** A high-density wireframe structure showing the underlying geometry grid.

### 3. Dynamic UI Control Panel
A collapsible, blur-templated UI for real-time adjustments.
- **Color Inspiration:** palette extraction from user-uploaded images.
- **Mode Selection:** Instant switching between animation types.
- **Animation Reactivity:** Adjustable sensitivity (1.0x to 5.0x) to handle varying audio volume levels. High reactivity allows shapes to project beyond the viewport.
- **GPU Strength (Quality):** 4-level LOD (Level of Detail) scaling:
    - **Lvl 0 (Low Power):** Minimal geometry (~300 verts), optimized for CPU/Integrated GPUs.
    - **Lvl 1 (Balanced):** Standard high-fidelity mode.
    - **Lvl 2 (High):** Increased triangle count for smoother surfaces.
    - **Lvl 3 (Ultra):** Maximum fidelity (~500k+ vertices), pushing RTX 30系列 GPUs to 50-80% capacity.

---

## Technical Specifications

| Feature | Low Power (Lvl 0) | Balanced (Lvl 1) | Ultra (Lvl 3) |
| :--- | :--- | :--- | :--- |
| **Geometry Detail** | Detail 2 (Subdivision) | Detail 6-10 | Detail 12-20 |
| **Vertex Count** | ~300 | ~40k - 100k | 250k - 500k+ |
| **Shader Math** | Simple Displacement | Noise + Interpolation | Multi-octave Fractal Noise |
| **GPU Target** | iGPU / Mobile | Dedicated Mid-Range | RTX 3060+ |

---

## Performance Targets
- **Framerate:** Locked 60FPS across all levels on respective target hardware.
- **VRAM Usage:** Scalable based on mode, utilizing up to 12GB on high settings.
- **User Experience:** Smooth transitions and intuitive controls with a minimalist aesthetic.
