import { useState, useCallback, useRef } from 'react';
import { CanvasTool, BrushSettings } from '@/lib/canvas/tools';

interface CanvasData {
  width: number;
  height: number;
  pixels: Uint8ClampedArray;
}

export function useCanvas(width: number, height: number) {
  const [canvasData, setCanvasData] = useState<CanvasData>({
    width,
    height,
    pixels: new Uint8ClampedArray(width * height * 4)
  });
  
  const [history, setHistory] = useState<CanvasData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const initializeCanvas = useCallback((canvas: HTMLCanvasElement) => {
    canvasRef.current = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill with transparent white
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const imageData = ctx.getImageData(0, 0, width, height);
    const newCanvasData = {
      width,
      height,
      pixels: new Uint8ClampedArray(imageData.data)
    };
    
    setCanvasData(newCanvasData);
    addToHistory(newCanvasData);
  }, [width, height]);

  const addToHistory = useCallback((data: CanvasData) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push({ ...data, pixels: new Uint8ClampedArray(data.pixels) });
      return newHistory.slice(-50); // Keep last 50 states
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [historyIndex]);

  const drawOnCanvas = useCallback((x: number, y: number, tool: CanvasTool, settings: BrushSettings) => {
    if (!canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const scale = canvasRef.current.width / width;
    const canvasX = x * scale;
    const canvasY = y * scale;

    ctx.save();

    switch (tool) {
      case 'brush':
      case 'pencil':
        ctx.globalAlpha = settings.opacity;
        ctx.fillStyle = settings.color;
        ctx.beginPath();
        ctx.arc(canvasX, canvasY, (settings.size * scale) / 2, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'eraser':
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(canvasX, canvasY, (settings.size * scale) / 2, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'fill':
        // Simple flood fill implementation
        ctx.fillStyle = settings.color;
        ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        break;

      case 'rectangle':
        ctx.strokeStyle = settings.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(canvasX - 10, canvasY - 10, 20, 20);
        break;

      case 'circle':
        ctx.strokeStyle = settings.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(canvasX, canvasY, 10, 0, Math.PI * 2);
        ctx.stroke();
        break;
    }

    ctx.restore();

    // Update canvas data
    const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
    const newCanvasData = {
      width,
      height,
      pixels: new Uint8ClampedArray(imageData.data)
    };
    
    setCanvasData(newCanvasData);
    addToHistory(newCanvasData);
  }, [width, height, addToHistory]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const previousState = history[newIndex];
      setCanvasData(previousState);
      setHistoryIndex(newIndex);
      
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          const imageData = new ImageData(previousState.pixels, width, height);
          ctx.putImageData(imageData, 0, 0);
        }
      }
    }
  }, [history, historyIndex, width, height]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const nextState = history[newIndex];
      setCanvasData(nextState);
      setHistoryIndex(newIndex);
      
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          const imageData = new ImageData(nextState.pixels, width, height);
          ctx.putImageData(imageData, 0, 0);
        }
      }
    }
  }, [history, historyIndex, width, height]);

  const clearCanvas = useCallback(() => {
    if (!canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
    const newCanvasData = {
      width,
      height,
      pixels: new Uint8ClampedArray(imageData.data)
    };
    
    setCanvasData(newCanvasData);
    addToHistory(newCanvasData);
  }, [width, height, addToHistory]);

  const exportCanvas = useCallback(async (format: 'png' | 'jpg' = 'png'): Promise<Blob | null> => {
    if (!canvasRef.current) return null;
    
    return new Promise((resolve) => {
      canvasRef.current!.toBlob((blob) => {
        resolve(blob);
      }, `image/${format}`);
    });
  }, []);

  return {
    canvasData,
    history,
    historyIndex,
    initializeCanvas,
    drawOnCanvas,
    undo,
    redo,
    clearCanvas,
    exportCanvas
  };
}
