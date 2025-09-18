/**
 * Layer management system for the texture creator
 */

export interface LayerData {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  blendMode?: BlendMode;
  locked?: boolean;
  canvas?: HTMLCanvasElement;
}

export type BlendMode = 
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'soft-light'
  | 'hard-light'
  | 'color-dodge'
  | 'color-burn'
  | 'darken'
  | 'lighten'
  | 'difference'
  | 'exclusion';

export class LayerManager {
  private layers: LayerData[] = [];
  private activeLayerId: string | null = null;
  private compositeCanvas: HTMLCanvasElement;
  private compositeCtx: CanvasRenderingContext2D;
  private updateScheduled = false;
  private compositeUpdateCallbacks: (() => void)[] = [];

  constructor(width: number, height: number) {
    this.compositeCanvas = document.createElement('canvas');
    this.compositeCanvas.width = width;
    this.compositeCanvas.height = height;
    this.compositeCtx = this.compositeCanvas.getContext('2d')!;

    // Create default background layer
    this.addLayer('Background', true);
  }

  addLayer(name: string, setAsActive = false): string {
    const id = `layer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create canvas for this layer
    const canvas = document.createElement('canvas');
    canvas.width = this.compositeCanvas.width;
    canvas.height = this.compositeCanvas.height;
    
    // Fill with transparent pixels
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const layer: LayerData = {
      id,
      name,
      visible: true,
      opacity: 100,
      blendMode: 'normal',
      locked: false,
      canvas
    };

    this.layers.push(layer);
    
    if (setAsActive || this.activeLayerId === null) {
      this.activeLayerId = id;
    }

    this.scheduleCompositeUpdate();
    return id;
  }

  removeLayer(layerId: string): boolean {
    if (this.layers.length <= 1) {
      return false; // Can't remove the last layer
    }

    const index = this.layers.findIndex(layer => layer.id === layerId);
    if (index === -1) {
      return false;
    }

    this.layers.splice(index, 1);

    // Update active layer if needed
    if (this.activeLayerId === layerId) {
      this.activeLayerId = this.layers.length > 0 ? this.layers[Math.max(0, index - 1)].id : null;
    }

    this.scheduleCompositeUpdate();
    return true;
  }

  duplicateLayer(layerId: string): string | null {
    const layer = this.getLayer(layerId);
    if (!layer) return null;

    const newId = this.addLayer(`${layer.name} Copy`);
    const newLayer = this.getLayer(newId);
    
    if (newLayer && newLayer.canvas && layer.canvas) {
      // Copy canvas content
      const newCtx = newLayer.canvas.getContext('2d')!;
      newCtx.drawImage(layer.canvas, 0, 0);
      
      // Copy other properties
      newLayer.opacity = layer.opacity;
      newLayer.blendMode = layer.blendMode;
      newLayer.visible = layer.visible;
    }

    this.scheduleCompositeUpdate();
    return newId;
  }

  moveLayer(layerId: string, direction: 'up' | 'down'): boolean {
    const index = this.layers.findIndex(layer => layer.id === layerId);
    if (index === -1) return false;

    const newIndex = direction === 'up' ? index + 1 : index - 1;
    if (newIndex < 0 || newIndex >= this.layers.length) return false;

    // Swap layers
    [this.layers[index], this.layers[newIndex]] = [this.layers[newIndex], this.layers[index]];
    
    this.scheduleCompositeUpdate();
    return true;
  }

  getLayer(layerId: string): LayerData | null {
    return this.layers.find(layer => layer.id === layerId) || null;
  }

  getLayers(): LayerData[] {
    return [...this.layers];
  }

  getActiveLayer(): LayerData | null {
    return this.activeLayerId ? this.getLayer(this.activeLayerId) : null;
  }

  setActiveLayer(layerId: string): boolean {
    const layer = this.getLayer(layerId);
    if (!layer) return false;

    this.activeLayerId = layerId;
    return true;
  }

  updateLayerProperty(layerId: string, property: keyof LayerData, value: any): boolean {
    const layer = this.getLayer(layerId);
    if (!layer) return false;

    (layer as any)[property] = value;
    this.scheduleCompositeUpdate();
    return true;
  }

  toggleLayerVisibility(layerId: string): boolean {
    const layer = this.getLayer(layerId);
    if (!layer) return false;

    layer.visible = !layer.visible;
    this.scheduleCompositeUpdate();
    return true;
  }

  setLayerOpacity(layerId: string, opacity: number): boolean {
    const layer = this.getLayer(layerId);
    if (!layer) return false;

    layer.opacity = Math.max(0, Math.min(100, opacity));
    this.scheduleCompositeUpdate();
    return true;
  }

  setLayerBlendMode(layerId: string, blendMode: BlendMode): boolean {
    const layer = this.getLayer(layerId);
    if (!layer) return false;

    layer.blendMode = blendMode;
    this.scheduleCompositeUpdate();
    return true;
  }

  mergeDown(layerId: string): boolean {
    const layerIndex = this.layers.findIndex(layer => layer.id === layerId);
    if (layerIndex <= 0) return false; // Can't merge bottom layer or layer not found

    const currentLayer = this.layers[layerIndex];
    const belowLayer = this.layers[layerIndex - 1];

    if (!currentLayer.canvas || !belowLayer.canvas) return false;

    // Merge current layer into the layer below
    const belowCtx = belowLayer.canvas.getContext('2d')!;
    belowCtx.save();
    belowCtx.globalAlpha = currentLayer.opacity / 100;
    belowCtx.globalCompositeOperation = this.getCanvasBlendMode(currentLayer.blendMode || 'normal');
    belowCtx.drawImage(currentLayer.canvas, 0, 0);
    belowCtx.restore();

    // Remove the merged layer
    this.removeLayer(layerId);
    return true;
  }

  flattenImage(): HTMLCanvasElement {
    const flattened = document.createElement('canvas');
    flattened.width = this.compositeCanvas.width;
    flattened.height = this.compositeCanvas.height;
    const ctx = flattened.getContext('2d')!;

    // Draw white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, flattened.width, flattened.height);

    // Draw all visible layers
    this.layers.forEach(layer => {
      if (layer.visible && layer.canvas) {
        ctx.save();
        ctx.globalAlpha = layer.opacity / 100;
        ctx.globalCompositeOperation = this.getCanvasBlendMode(layer.blendMode || 'normal');
        ctx.drawImage(layer.canvas, 0, 0);
        ctx.restore();
      }
    });

    return flattened;
  }

  private updateComposite(): void {
    // Clear composite
    this.compositeCtx.clearRect(0, 0, this.compositeCanvas.width, this.compositeCanvas.height);
    
    // Draw white background
    this.compositeCtx.fillStyle = '#FFFFFF';
    this.compositeCtx.fillRect(0, 0, this.compositeCanvas.width, this.compositeCanvas.height);

    // Render all visible layers in order
    this.layers.forEach(layer => {
      if (layer.visible && layer.canvas) {
        this.compositeCtx.save();
        this.compositeCtx.globalAlpha = layer.opacity / 100;
        this.compositeCtx.globalCompositeOperation = this.getCanvasBlendMode(layer.blendMode || 'normal');
        this.compositeCtx.drawImage(layer.canvas, 0, 0);
        this.compositeCtx.restore();
      }
    });
    
    // Notify callbacks
    this.compositeUpdateCallbacks.forEach(callback => callback());
  }
  
  private scheduleCompositeUpdate(): void {
    if (this.updateScheduled) return;
    
    this.updateScheduled = true;
    requestAnimationFrame(() => {
      this.updateComposite();
      this.updateScheduled = false;
    });
  }

  private getCanvasBlendMode(blendMode: BlendMode): GlobalCompositeOperation {
    const blendModeMap: Record<BlendMode, GlobalCompositeOperation> = {
      'normal': 'source-over',
      'multiply': 'multiply',
      'screen': 'screen',
      'overlay': 'overlay',
      'soft-light': 'soft-light',
      'hard-light': 'hard-light',
      'color-dodge': 'color-dodge',
      'color-burn': 'color-burn',
      'darken': 'darken',
      'lighten': 'lighten',
      'difference': 'difference',
      'exclusion': 'exclusion'
    };

    return blendModeMap[blendMode] || 'source-over';
  }

  getCompositeCanvas(): HTMLCanvasElement {
    return this.compositeCanvas;
  }
  
  // Subscribe to composite updates for external components
  onCompositeUpdate(callback: () => void): () => void {
    this.compositeUpdateCallbacks.push(callback);
    return () => {
      const index = this.compositeUpdateCallbacks.indexOf(callback);
      if (index > -1) {
        this.compositeUpdateCallbacks.splice(index, 1);
      }
    };
  }
  
  // Force immediate update for cases where we need synchronous rendering
  forceCompositeUpdate(): void {
    this.updateComposite();
  }

  // Export/Import functionality
  exportLayers(): any {
    return this.layers.map(layer => ({
      id: layer.id,
      name: layer.name,
      visible: layer.visible,
      opacity: layer.opacity,
      blendMode: layer.blendMode,
      locked: layer.locked,
      imageData: layer.canvas ? layer.canvas.toDataURL() : null
    }));
  }

  importLayers(layersData: any[]): void {
    this.layers = [];
    this.activeLayerId = null;

    layersData.forEach((layerData, index) => {
      const canvas = document.createElement('canvas');
      canvas.width = this.compositeCanvas.width;
      canvas.height = this.compositeCanvas.height;
      
      if (layerData.imageData) {
        const img = new Image();
        img.onload = () => {
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0);
          this.updateComposite();
        };
        img.src = layerData.imageData;
      }

      const layer: LayerData = {
        id: layerData.id,
        name: layerData.name,
        visible: layerData.visible,
        opacity: layerData.opacity,
        blendMode: layerData.blendMode || 'normal',
        locked: layerData.locked || false,
        canvas
      };

      this.layers.push(layer);
      
      if (index === 0) {
        this.activeLayerId = layer.id;
      }
    });

    this.updateComposite();
  }

  // Utility methods
  clear(layerId?: string): void {
    if (layerId) {
      const layer = this.getLayer(layerId);
      if (layer && layer.canvas) {
        const ctx = layer.canvas.getContext('2d')!;
        ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
        this.updateComposite();
      }
    } else {
      // Clear active layer
      const activeLayer = this.getActiveLayer();
      if (activeLayer && activeLayer.canvas) {
        const ctx = activeLayer.canvas.getContext('2d')!;
        ctx.clearRect(0, 0, activeLayer.canvas.width, activeLayer.canvas.height);
        this.updateComposite();
      }
    }
  }

  fill(color: string, layerId?: string): void {
    const layer = layerId ? this.getLayer(layerId) : this.getActiveLayer();
    if (layer && layer.canvas) {
      const ctx = layer.canvas.getContext('2d')!;
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, layer.canvas.width, layer.canvas.height);
      this.updateComposite();
    }
  }

  resize(width: number, height: number): void {
    const oldLayers = this.exportLayers();
    
    this.compositeCanvas.width = width;
    this.compositeCanvas.height = height;
    
    // Resize all layer canvases
    this.layers.forEach(layer => {
      if (layer.canvas) {
        const oldImageData = layer.canvas.toDataURL();
        layer.canvas.width = width;
        layer.canvas.height = height;
        
        const img = new Image();
        img.onload = () => {
          const ctx = layer.canvas!.getContext('2d')!;
          ctx.drawImage(img, 0, 0);
          this.updateComposite();
        };
        img.src = oldImageData;
      }
    });
  }
}

// Layer effects and filters
export class LayerEffects {
  static applyGaussianBlur(canvas: HTMLCanvasElement, radius: number): void {
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const blurredData = this.gaussianBlur(imageData, radius);
    ctx.putImageData(blurredData, 0, 0);
  }

  static adjustBrightness(canvas: HTMLCanvasElement, brightness: number): void {
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.max(0, Math.min(255, data[i] + brightness));     // R
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + brightness)); // G
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + brightness)); // B
    }

    ctx.putImageData(imageData, 0, 0);
  }

  static adjustContrast(canvas: HTMLCanvasElement, contrast: number): void {
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.max(0, Math.min(255, factor * (data[i] - 128) + 128));     // R
      data[i + 1] = Math.max(0, Math.min(255, factor * (data[i + 1] - 128) + 128)); // G
      data[i + 2] = Math.max(0, Math.min(255, factor * (data[i + 2] - 128) + 128)); // B
    }

    ctx.putImageData(imageData, 0, 0);
  }

  private static gaussianBlur(imageData: ImageData, radius: number): ImageData {
    const data = new Uint8ClampedArray(imageData.data);
    const width = imageData.width;
    const height = imageData.height;
    
    // Simple box blur approximation
    const kernel = this.createGaussianKernel(radius);
    const kernelSize = kernel.length;
    const halfKernel = Math.floor(kernelSize / 2);
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0, g = 0, b = 0, a = 0;
        let weightSum = 0;
        
        for (let ky = -halfKernel; ky <= halfKernel; ky++) {
          for (let kx = -halfKernel; kx <= halfKernel; kx++) {
            const py = Math.max(0, Math.min(height - 1, y + ky));
            const px = Math.max(0, Math.min(width - 1, x + kx));
            const pi = (py * width + px) * 4;
            const weight = kernel[ky + halfKernel] * kernel[kx + halfKernel];
            
            r += imageData.data[pi] * weight;
            g += imageData.data[pi + 1] * weight;
            b += imageData.data[pi + 2] * weight;
            a += imageData.data[pi + 3] * weight;
            weightSum += weight;
          }
        }
        
        const i = (y * width + x) * 4;
        data[i] = r / weightSum;
        data[i + 1] = g / weightSum;
        data[i + 2] = b / weightSum;
        data[i + 3] = a / weightSum;
      }
    }
    
    return new ImageData(data, width, height);
  }

  private static createGaussianKernel(radius: number): number[] {
    const size = Math.ceil(radius) * 2 + 1;
    const kernel = new Array(size);
    const sigma = radius / 3;
    const twoSigmaSquared = 2 * sigma * sigma;
    const center = Math.floor(size / 2);
    let sum = 0;
    
    for (let i = 0; i < size; i++) {
      const distance = i - center;
      kernel[i] = Math.exp(-(distance * distance) / twoSigmaSquared);
      sum += kernel[i];
    }
    
    // Normalize
    for (let i = 0; i < size; i++) {
      kernel[i] /= sum;
    }
    
    return kernel;
  }
}
