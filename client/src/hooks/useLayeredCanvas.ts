import { useState, useCallback, useRef, useEffect } from 'react';
import { LayerManager, LayerData } from '@/lib/canvas/layers';
import { CanvasTool, BrushSettings, Point } from '@/lib/canvas/tools';

interface LayeredCanvasState {
  textureWidth: number;
  textureHeight: number;
  displayScale: number;
  layerManager: LayerManager | null;
  history: LayerHistoryState[];
  historyIndex: number;
}

interface LayerHistoryState {
  timestamp: number;
  layersData: any[];
  activeLayerId: string | null;
}

export function useLayeredCanvas(initialWidth: number = 16, initialHeight: number = 16) {
  const [state, setState] = useState<LayeredCanvasState>({
    textureWidth: initialWidth,
    textureHeight: initialHeight,
    displayScale: 320 / Math.max(initialWidth, initialHeight), // Keep display at 320px
    layerManager: null,
    history: [],
    historyIndex: -1
  });

  const displayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<Point | null>(null);

  // Initialize LayerManager when dimensions change
  useEffect(() => {
    const manager = new LayerManager(state.textureWidth, state.textureHeight);
    setState(prev => ({ ...prev, layerManager: manager }));
    
    // Add initial history state
    const initialHistory: LayerHistoryState = {
      timestamp: Date.now(),
      layersData: manager.exportLayers(),
      activeLayerId: manager.getActiveLayer()?.id || null
    };
    
    setState(prev => ({
      ...prev,
      history: [initialHistory],
      historyIndex: 0
    }));
    
    // Update display
    updateDisplay();
  }, [state.textureWidth, state.textureHeight]);

  // Update display canvas when layers change
  const updateDisplay = useCallback(() => {
    if (!displayCanvasRef.current || !state.layerManager) return;

    const canvas = displayCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match display scale
    const displayWidth = state.textureWidth * state.displayScale;
    const displayHeight = state.textureHeight * state.displayScale;
    
    canvas.width = displayWidth;
    canvas.height = displayHeight;

    // Clear and draw composite
    ctx.clearRect(0, 0, displayWidth, displayHeight);
    
    // Disable anti-aliasing for pixel-perfect rendering
    ctx.imageSmoothingEnabled = false;
    
    // Get composite from layer manager and scale it up
    const composite = state.layerManager.getCompositeCanvas();
    ctx.drawImage(composite, 0, 0, displayWidth, displayHeight);
  }, [state.layerManager, state.textureWidth, state.textureHeight, state.displayScale]);

  // Add to history
  const addToHistory = useCallback(() => {
    if (!state.layerManager) return;

    const historyState: LayerHistoryState = {
      timestamp: Date.now(),
      layersData: state.layerManager.exportLayers(),
      activeLayerId: state.layerManager.getActiveLayer()?.id || null
    };

    setState(prev => {
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push(historyState);
      
      // Keep only last 50 states
      if (newHistory.length > 50) {
        newHistory.shift();
      }

      return {
        ...prev,
        history: newHistory,
        historyIndex: newHistory.length - 1
      };
    });
  }, [state.layerManager]);

  // Convert display coordinates to texture coordinates
  const displayToTexture = useCallback((displayX: number, displayY: number): Point => {
    return {
      x: Math.floor(displayX / state.displayScale),
      y: Math.floor(displayY / state.displayScale)
    };
  }, [state.displayScale]);

  // Convert texture coordinates to display coordinates
  const textureToDisplay = useCallback((textureX: number, textureY: number): Point => {
    return {
      x: textureX * state.displayScale,
      y: textureY * state.displayScale
    };
  }, [state.displayScale]);

  // Draw pixel-perfect on active layer
  const drawOnActiveLayer = useCallback((texturePoint: Point, tool: CanvasTool, settings: BrushSettings) => {
    if (!state.layerManager) return;

    const activeLayer = state.layerManager.getActiveLayer();
    if (!activeLayer || !activeLayer.canvas) return;

    const ctx = activeLayer.canvas.getContext('2d');
    if (!ctx) return;

    // Disable anti-aliasing for pixel-perfect drawing
    ctx.imageSmoothingEnabled = false;

    switch (tool) {
      case 'pencil':
        // Pixel-perfect rectangular brush
        drawPixelRectangle(ctx, texturePoint, 1, settings.color, settings.opacity);
        break;
      
      case 'brush':
        // Larger rectangular brush based on size
        const brushSize = Math.max(1, Math.floor(settings.size / 4)); // Scale brush size for texture
        drawPixelRectangle(ctx, texturePoint, brushSize, settings.color, settings.opacity);
        break;
      
      case 'eraser':
        erasePixelRectangle(ctx, texturePoint, Math.max(1, Math.floor(settings.size / 4)));
        break;
      
      case 'fill':
        floodFill(ctx, texturePoint, settings.color, state.textureWidth, state.textureHeight);
        break;
      
      case 'rectangle':
        // This will be handled differently for shape tools
        break;
      
      case 'circle':
        // This will be handled differently for shape tools
        break;
    }

    updateDisplay();
  }, [state.layerManager, state.textureWidth, state.textureHeight, updateDisplay]);

  // Draw filled shapes
  const drawShape = useCallback((startPoint: Point, endPoint: Point, tool: CanvasTool, settings: BrushSettings, filled: boolean = true) => {
    if (!state.layerManager) return;

    const activeLayer = state.layerManager.getActiveLayer();
    if (!activeLayer || !activeLayer.canvas) return;

    const ctx = activeLayer.canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.globalAlpha = settings.opacity;

    if (tool === 'rectangle') {
      const width = endPoint.x - startPoint.x;
      const height = endPoint.y - startPoint.y;
      
      if (filled) {
        ctx.fillStyle = settings.color;
        ctx.fillRect(startPoint.x, startPoint.y, width, height);
      } else {
        ctx.strokeStyle = settings.color;
        ctx.lineWidth = 1;
        ctx.strokeRect(startPoint.x, startPoint.y, width, height);
      }
    } else if (tool === 'circle') {
      const centerX = (startPoint.x + endPoint.x) / 2;
      const centerY = (startPoint.y + endPoint.y) / 2;
      const radius = Math.sqrt(
        Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2)
      ) / 2;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      
      if (filled) {
        ctx.fillStyle = settings.color;
        ctx.fill();
      } else {
        ctx.strokeStyle = settings.color;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    } else if (tool === 'line') {
      ctx.strokeStyle = settings.color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(endPoint.x, endPoint.y);
      ctx.stroke();
    }

    ctx.restore();
    updateDisplay();
  }, [state.layerManager, updateDisplay]);

  // Helper function to draw pixel-perfect rectangles
  const drawPixelRectangle = (ctx: CanvasRenderingContext2D, center: Point, size: number, color: string, opacity: number) => {
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;
    
    const halfSize = Math.floor(size / 2);
    const x = center.x - halfSize;
    const y = center.y - halfSize;
    
    ctx.fillRect(x, y, size, size);
    ctx.restore();
  };

  // Helper function to erase pixel-perfect rectangles
  const erasePixelRectangle = (ctx: CanvasRenderingContext2D, center: Point, size: number) => {
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    
    const halfSize = Math.floor(size / 2);
    const x = center.x - halfSize;
    const y = center.y - halfSize;
    
    ctx.fillRect(x, y, size, size);
    ctx.restore();
  };

  // Pixel-perfect flood fill
  const floodFill = (ctx: CanvasRenderingContext2D, startPoint: Point, fillColor: string, width: number, height: number) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const startIndex = (startPoint.y * width + startPoint.x) * 4;
    
    const startR = data[startIndex];
    const startG = data[startIndex + 1];
    const startB = data[startIndex + 2];
    const startA = data[startIndex + 3];
    
    // Convert fill color to RGB
    const fillRGB = hexToRgb(fillColor);
    if (!fillRGB) return;
    
    // Check if we're trying to fill with the same color
    if (startR === fillRGB.r && startG === fillRGB.g && startB === fillRGB.b) {
      return;
    }
    
    const pixelStack = [startPoint.x, startPoint.y];
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
    
    ctx.putImageData(imageData, 0, 0);
  };

  // Utility function
  const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  // Public API
  const initializeCanvas = useCallback((canvas: HTMLCanvasElement) => {
    displayCanvasRef.current = canvas;
    updateDisplay();
  }, [updateDisplay]);

  const startDrawing = useCallback((displayPoint: Point, tool: CanvasTool, settings: BrushSettings) => {
    isDrawingRef.current = true;
    const texturePoint = displayToTexture(displayPoint.x, displayPoint.y);
    lastPointRef.current = texturePoint;
    
    drawOnActiveLayer(texturePoint, tool, settings);
  }, [displayToTexture, drawOnActiveLayer]);

  const continueDrawing = useCallback((displayPoint: Point, tool: CanvasTool, settings: BrushSettings) => {
    if (!isDrawingRef.current || !lastPointRef.current) return;
    
    const texturePoint = displayToTexture(displayPoint.x, displayPoint.y);
    
    // For continuous tools like brush and pencil, draw a line of pixels
    if (tool === 'brush' || tool === 'pencil') {
      drawLineBetweenPoints(lastPointRef.current, texturePoint, tool, settings);
    }
    
    lastPointRef.current = texturePoint;
  }, [displayToTexture]);

  const drawLineBetweenPoints = useCallback((from: Point, to: Point, tool: CanvasTool, settings: BrushSettings) => {
    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);
    const steps = Math.max(dx, dy);
    
    if (steps === 0) return;
    
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = Math.round(from.x + (to.x - from.x) * t);
      const y = Math.round(from.y + (to.y - from.y) * t);
      drawOnActiveLayer({ x, y }, tool, settings);
    }
  }, [drawOnActiveLayer]);

  const endDrawing = useCallback(() => {
    if (isDrawingRef.current) {
      isDrawingRef.current = false;
      lastPointRef.current = null;
      addToHistory();
    }
  }, [addToHistory]);

  const resizeCanvas = useCallback((width: number, height: number) => {
    setState(prev => ({
      ...prev,
      textureWidth: width,
      textureHeight: height,
      displayScale: 320 / Math.max(width, height)
    }));
  }, []);

  const undo = useCallback(() => {
    if (state.historyIndex > 0 && state.layerManager) {
      const newIndex = state.historyIndex - 1;
      const historyState = state.history[newIndex];
      
      state.layerManager.importLayers(historyState.layersData);
      if (historyState.activeLayerId) {
        state.layerManager.setActiveLayer(historyState.activeLayerId);
      }
      
      setState(prev => ({ ...prev, historyIndex: newIndex }));
      updateDisplay();
    }
  }, [state.historyIndex, state.history, state.layerManager, updateDisplay]);

  const redo = useCallback(() => {
    if (state.historyIndex < state.history.length - 1 && state.layerManager) {
      const newIndex = state.historyIndex + 1;
      const historyState = state.history[newIndex];
      
      state.layerManager.importLayers(historyState.layersData);
      if (historyState.activeLayerId) {
        state.layerManager.setActiveLayer(historyState.activeLayerId);
      }
      
      setState(prev => ({ ...prev, historyIndex: newIndex }));
      updateDisplay();
    }
  }, [state.historyIndex, state.history, state.layerManager, updateDisplay]);

  const exportTexture = useCallback(async (): Promise<Blob | null> => {
    if (!state.layerManager) return null;
    
    const flattened = state.layerManager.flattenImage();
    
    return new Promise((resolve) => {
      flattened.toBlob((blob) => {
        resolve(blob);
      }, 'image/png');
    });
  }, [state.layerManager]);

  return {
    // Canvas management
    initializeCanvas,
    updateDisplay,
    
    // Drawing operations
    startDrawing,
    continueDrawing,
    endDrawing,
    drawShape,
    
    // Layer management
    layerManager: state.layerManager,
    
    // Canvas state
    textureWidth: state.textureWidth,
    textureHeight: state.textureHeight,
    displayScale: state.displayScale,
    
    // History
    canUndo: state.historyIndex > 0,
    canRedo: state.historyIndex < state.history.length - 1,
    undo,
    redo,
    
    // Utilities
    displayToTexture,
    textureToDisplay,
    resizeCanvas,
    exportTexture
  };
}