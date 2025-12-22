\# Gemini CLI - Project Structure \& Agent Instructions



\### Project Metadata

\* \*\*Project Name:\*\* EDM-Visualizer-Pro

\* \*\*Target Platform:\*\* Web (Vite + Three.js)

\* \*\*GPU Target:\*\* NVIDIA RTX 3060 (12GB)



\### Antigravity File Structure

Execute the following structure to initialize the "Christmas Tree":



\* `/src`

&nbsp;   \* `/core` -> AudioEngine.js, ColorProcessor.js, SceneManager.js

&nbsp;   \* `/modes` -> Fireworks.js, WaveSpikes.js, RippleWater.js, InkFluid.js, HoliSplash.js

&nbsp;   \* `/ui` -> Controls.js, PalettePicker.js

&nbsp;   \* `/shaders` -> BaseVertex.glsl, FluidFrag.glsl, SplashFrag.glsl

\* `/public` -> Assets, sample-images

\* `index.html`

\* `main.js`



\### Agent Prompt Snippet (Branch Building)

When asking Gemini to build a specific branch, use the following context:



> "Act as a Graphics Engineer. We are building the \[MODE\_NAME] branch of the EDM Visualizer. Use Three.js and GLSL. Target high vertex counts to utilize the 12GB VRAM on an RTX 3060. Ensure the mode accepts the global `palette` array and `audioData` object."



\### Quality Metrics to Monitor

\* \*\*Draw Calls:\*\* Keep under 50 for complex scenes.

\* \*\*Memory Leak Check:\*\* Ensure geometries and textures are disposed of when switching modes.

\* \*\*Responsiveness:\*\* Visuals must have < 16ms latency relative to audio peaks.





