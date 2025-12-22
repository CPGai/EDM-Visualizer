/**
 * ColorProcessor.js
 * Purpose: Extracts dominant color palettes from images.
 * This acts as the "Color DNA" for all our animation modes.
 */

export class ColorProcessor {
    constructor() {
        this.palette = [];
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    }

    /**
     * Extracts a 10-color palette using a simplified sampling method.
     * @param {HTMLImageElement} imgElement 
     */
    async extractPalette(imgElement, colorCount = 10) {
        // Performance trick: Downscale the image for color analysis
        const scale = Math.min(1, 200 / Math.max(imgElement.width, imgElement.height));
        this.canvas.width = imgElement.width * scale;
        this.canvas.height = imgElement.height * scale;

        this.ctx.drawImage(imgElement, 0, 0, this.canvas.width, this.canvas.height);
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height).data;

        const colorMap = {};
        // Sample pixels every 10 steps to save CPU cycles
        for (let i = 0; i < imageData.length; i += 40) {
            const r = imageData[i];
            const g = imageData[i + 1];
            const b = imageData[i + 2];

            // Group similar colors by rounding (quantization)
            const key = `${Math.round(r / 16) * 16},${Math.round(g / 16) * 16},${Math.round(b / 16) * 16}`;
            colorMap[key] = (colorMap[key] || 0) + 1;
        }

        // Sort by most frequent and convert to Hex
        this.palette = Object.entries(colorMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, colorCount)
            .map(entry => {
                const [r, g, b] = entry[0].split(',').map(Number);
                return this.rgbToHex(r, g, b);
            });

        return this.palette;
    }

    rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
}