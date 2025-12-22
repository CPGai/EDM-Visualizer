/**
 * AudioEngine.js - Fixed Feedback Version
 * Purpose: Captures system audio without playing it back to prevent echoes.
 */

export class AudioEngine {
    constructor() {
        this.context = null;
        this.analyser = null;
        this.dataArray = null;
        this.source = null;
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) {
            if (this.context.state === 'suspended') {
                await this.context.resume();
            }
            return;
        }

        this.context = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.context.createAnalyser();

        // Using 512 for good EDM bass resolution
        this.analyser.fftSize = 512;

        const bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(bufferLength);
        this.isInitialized = true;

        console.log("AudioEngine: Context Initialized.");
    }

    async startMic() {
        await this.init();
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            // Keep playback FALSE for Mic to prevent squealing/feedback
            this._connectStream(stream, false);
            console.log("AudioEngine: Hardware/Mic Source Connected.");
        } catch (err) {
            console.error("AudioEngine: Mic Error:", err);
        }
    }

    async startSystemAudio() {
        await this.init();
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true
            });

            // FIX: We set shouldOutput to FALSE here.
            // Since you are already hearing Spotify, we don't want the visualizer
            // to play it again and create an echo.
            this._connectStream(stream, false);
            console.log("AudioEngine: System Audio Captured (Silent Loopback).");
        } catch (err) {
            console.error("AudioEngine: System Audio Error:", err);
        }
    }

    _connectStream(stream, shouldOutput) {
        if (this.source) this.source.disconnect();

        this.source = this.context.createMediaStreamSource(stream);
        this.source.connect(this.analyser);

        // Only connect to speakers if explicitly requested (e.g., for local files)
        if (shouldOutput) {
            this.analyser.connect(this.context.destination);
        }
    }

    getFrequencyData() {
        if (!this.analyser) return null;
        this.analyser.getByteFrequencyData(this.dataArray);
        return this.dataArray;
    }

    getAverageFrequency() {
        if (!this.dataArray) return 0;
        let sum = 0;
        for (let i = 0; i < this.dataArray.length; i++) {
            sum += this.dataArray[i];
        }
        return sum / this.dataArray.length;
    }
}