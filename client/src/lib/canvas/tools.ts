/**
 * Canvas drawing tools and utilities for the texture creator
 */

export type CanvasTool = 'brush' | 'pencil' | 'eraser' | 'fill' | 'rectangle' | 'circle' | 'line' | 'select';

export interface BrushSettings {
  size: number;
  opacity: number;
  hardness: number;
  color: string;
}

export interface Point {
  x: number;
  y: number;
}

export class CanvasDrawingTool {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private isDrawing = false;
  private lastPoint: Point | null = null;

  setCanvas(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  startDrawing(point: Point, tool: CanvasTool, settings: BrushSettings) {
    if (!this.ctx) return;
    
    this.isDrawing = true;
    this.lastPoint = point;
    
    switch (tool) {
      case 'brush':
      case 'pencil':
        this.drawBrush(point, settings, tool === 'pencil');
        break;
      case 'eraser':
        this.drawEraser(point, settings);
        break;
      case 'fill':
        this.floodFill(point, settings.color);
        break;
    }
  }

  continuDrawing(point: Point, tool: CanvasTool, settings: BrushSettings) {
    if (!this.ctx || !this.isDrawing || !this.lastPoint) return;
    
    switch (tool) {
      case 'brush':
      case 'pencil':
        this.drawLine(this.lastPoint, point, settings, tool === 'pencil');
        break;
      case 'eraser':
        this.drawEraserLine(this.lastPoint, point, settings);
        break;
    }
    
    this.lastPoint = point;
  }

  endDrawing() {
    this.isDrawing = false;
    this.lastPoint = null;
  }

  private drawBrush(point: Point, settings: BrushSettings, isPencil = false) {
    if (!this.ctx) return;
    
    this.ctx.save();
    this.ctx.globalAlpha = settings.opacity;
    this.ctx.fillStyle = settings.color;
    
    if (isPencil || settings.hardness >= 0.9) {
      // Hard brush
      this.ctx.fillRect(point.x - settings.size / 2, point.y - settings.size / 2, settings.size, settings.size);
    } else {
      // Soft brush with gradient
      const gradient = this.ctx.createRadialGradient(
        point.x, point.y, 0,
        point.x, point.y, settings.size / 2
      );
      gradient.addColorStop(0, settings.color);
      gradient.addColorStop(settings.hardness, settings.color);
      gradient.addColorStop(1, 'transparent');
      
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(point.x, point.y, settings.size / 2, 0, Math.PI * 2);
      this.ctx.fill();
    }
    
    this.ctx.restore();
  }

  private drawEraser(point: Point, settings: BrushSettings) {
    if (!this.ctx) return;
    
    this.ctx.save();
    this.ctx.globalCompositeOperation = 'destination-out';
    this.ctx.beginPath();
    this.ctx.arc(point.x, point.y, settings.size / 2, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  private drawLine(from: Point, to: Point, settings: BrushSettings, isPencil = false) {
    if (!this.ctx) return;
    
    // Calculate distance and steps
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.ceil(distance / (settings.size * 0.1));
    
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const point = {
        x: from.x + dx * t,
        y: from.y + dy * t
      };
      this.drawBrush(point, settings, isPencil);
    }
  }

  private drawEraserLine(from: Point, to: Point, settings: BrushSettings) {
    if (!this.ctx) return;
    
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.ceil(distance / (settings.size * 0.1));
    
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const point = {
        x: from.x + dx * t,
        y: from.y + dy * t
      };
      this.drawEraser(point, settings);
    }
  }

  private floodFill(startPoint: Point, fillColor: string) {
    if (!this.ctx || !this.canvas) return;
    
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;
    const width = this.canvas.width;
    const height = this.canvas.height;
    
    const startIndex = (Math.floor(startPoint.y) * width + Math.floor(startPoint.x)) * 4;
    const startR = data[startIndex];
    const startG = data[startIndex + 1];
    const startB = data[startIndex + 2];
    const startA = data[startIndex + 3];
    
    // Convert fill color to RGB
    const fillRGB = this.hexToRgb(fillColor);
    if (!fillRGB) return;
    
    // Check if we're trying to fill with the same color
    if (startR === fillRGB.r && startG === fillRGB.g && startB === fillRGB.b) {
      return;
    }
    
    const pixelStack = [Math.floor(startPoint.x), Math.floor(startPoint.y)];
    const visitedPixels = new Set<string>();
    
    while (pixelStack.length > 0) {
      const y = pixelStack.pop()!;
      const x = pixelStack.pop()!;
      
      if (x < 0 || x >= width || y < 0 || y >= height) continue;
      
      const pixelKey = `${x},${y}`;
      if (visitedPixels.has(pixelKey)) continue;
      visitedPixels.add(pixelKey);
      
      const index = (y * width + x) * 4;
      
      if (data[index] === startR && data[index + 1] === startG && 
          data[index + 2] === startB && data[index + 3] === startA) {
        
        // Fill this pixel
        data[index] = fillRGB.r;
        data[index + 1] = fillRGB.g;
        data[index + 2] = fillRGB.b;
        data[index + 3] = 255;
        
        // Add neighboring pixels to stack
        pixelStack.push(x + 1, y);
        pixelStack.push(x - 1, y);
        pixelStack.push(x, y + 1);
        pixelStack.push(x, y - 1);
      }
    }
    
    this.ctx.putImageData(imageData, 0, 0);
  }

  drawRectangle(start: Point, end: Point, settings: BrushSettings, filled = false) {
    if (!this.ctx) return;
    
    this.ctx.save();
    this.ctx.strokeStyle = settings.color;
    this.ctx.lineWidth = settings.size;
    this.ctx.globalAlpha = settings.opacity;
    
    const width = end.x - start.x;
    const height = end.y - start.y;
    
    if (filled) {
      this.ctx.fillStyle = settings.color;
      this.ctx.fillRect(start.x, start.y, width, height);
    } else {
      this.ctx.strokeRect(start.x, start.y, width, height);
    }
    
    this.ctx.restore();
  }

  drawCircle(center: Point, radius: number, settings: BrushSettings, filled = false) {
    if (!this.ctx) return;
    
    this.ctx.save();
    this.ctx.strokeStyle = settings.color;
    this.ctx.lineWidth = settings.size;
    this.ctx.globalAlpha = settings.opacity;
    
    this.ctx.beginPath();
    this.ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
    
    if (filled) {
      this.ctx.fillStyle = settings.color;
      this.ctx.fill();
    } else {
      this.ctx.stroke();
    }
    
    this.ctx.restore();
  }

  drawStraightLine(start: Point, end: Point, settings: BrushSettings) {
    if (!this.ctx) return;
    
    this.ctx.save();
    this.ctx.strokeStyle = settings.color;
    this.ctx.lineWidth = settings.size;
    this.ctx.globalAlpha = settings.opacity;
    this.ctx.lineCap = 'round';
    
    this.ctx.beginPath();
    this.ctx.moveTo(start.x, start.y);
    this.ctx.lineTo(end.x, end.y);
    this.ctx.stroke();
    
    this.ctx.restore();
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  // Utility methods for pixel manipulation
  getPixelColor(point: Point): string | null {
    if (!this.ctx || !this.canvas) return null;
    
    const imageData = this.ctx.getImageData(point.x, point.y, 1, 1);
    const data = imageData.data;
    
    return `rgb(${data[0]}, ${data[1]}, ${data[2]})`;
  }

  clearCanvas() {
    if (!this.ctx || !this.canvas) return;
    
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  // Advanced brush patterns
  createCustomBrush(pattern: 'square' | 'circle' | 'diamond' | 'star'): ImageData | null {
    if (!this.ctx) return null;
    
    const size = 20;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = size;
    tempCanvas.height = size;
    const tempCtx = tempCanvas.getContext('2d');
    
    if (!tempCtx) return null;
    
    tempCtx.fillStyle = '#000000';
    
    switch (pattern) {
      case 'square':
        tempCtx.fillRect(0, 0, size, size);
        break;
      case 'circle':
        tempCtx.beginPath();
        tempCtx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        tempCtx.fill();
        break;
      case 'diamond':
        tempCtx.beginPath();
        tempCtx.moveTo(size / 2, 0);
        tempCtx.lineTo(size, size / 2);
        tempCtx.lineTo(size / 2, size);
        tempCtx.lineTo(0, size / 2);
        tempCtx.closePath();
        tempCtx.fill();
        break;
      case 'star':
        this.drawStar(tempCtx, size / 2, size / 2, 5, size / 2, size / 4);
        tempCtx.fill();
        break;
    }
    
    return tempCtx.getImageData(0, 0, size, size);
  }

  private drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);

    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }

    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
  }
}

// Color utilities
export class ColorUtils {
  static hexToHsl(hex: string): { h: number; s: number; l: number } {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    const sum = max + min;
    const l = sum / 2;

    let h: number;
    let s: number;

    if (diff === 0) {
      h = s = 0;
    } else {
      s = l < 0.5 ? diff / sum : diff / (2 - sum);

      switch (max) {
        case r:
          h = (g - b) / diff + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / diff + 2;
          break;
        case b:
          h = (r - g) / diff + 4;
          break;
        default:
          h = 0;
      }
      h /= 6;
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
  }

  static hslToHex(h: number, s: number, l: number): string {
    h /= 360;
    s /= 100;
    l /= 100;

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    let r: number, g: number, b: number;

    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    const toHex = (c: number) => {
      const hex = Math.round(c * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  static generatePalette(baseColor: string, count: number): string[] {
    const hsl = this.hexToHsl(baseColor);
    const palette: string[] = [];

    for (let i = 0; i < count; i++) {
      const variation = {
        h: (hsl.h + (i * 360 / count)) % 360,
        s: Math.max(20, hsl.s - (i * 10)),
        l: Math.max(20, Math.min(80, hsl.l + (i % 2 === 0 ? 10 : -10)))
      };
      palette.push(this.hslToHex(variation.h, variation.s, variation.l));
    }

    return palette;
  }
}
