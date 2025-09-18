import { useState, useRef, useEffect } from "react";
import { Undo, Redo, Download, Plus, Trash2, Eye, EyeOff, Grid, Save, Upload, Move, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLayeredCanvas } from "@/hooks/useLayeredCanvas";
import { CanvasTool, BrushSettings, Point } from "@/lib/canvas/tools";
import { LayerData } from "@/lib/canvas/layers";

export default function TextureCreator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLCanvasElement>(null);
  const [selectedTool, setSelectedTool] = useState<CanvasTool>('pencil');
  const [brushSize, setBrushSize] = useState([4]);
  const [brushOpacity, setBrushOpacity] = useState([100]);
  const [brushHardness, setBrushHardness] = useState([100]);
  const [selectedColor, setSelectedColor] = useState('#8b4513');
  const [showGrid, setShowGrid] = useState(true);
  const [fillShapes, setFillShapes] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  const [dragStart, setDragStart] = useState<Point | null>(null);

  // Use the new layered canvas system
  const {
    initializeCanvas,
    initializeCursorCanvas,
    updateDisplay,
    startDrawing,
    continueDrawing,
    endDrawing,
    drawShape,
    layerManager,
    textureWidth,
    textureHeight,
    displayScale,
    canUndo,
    canRedo,
    undo,
    redo,
    displayToTexture,
    resizeCanvas,
    exportTexture,
    updateCursorPosition,
    showCursor,
    hideCursor
  } = useLayeredCanvas(16, 16);

  // Get current layers from LayerManager
  const layers = layerManager?.getLayers() || [];
  const activeLayer = layerManager?.getActiveLayer();

  // Initialize canvas when component mounts
  useEffect(() => {
    if (canvasRef.current) {
      initializeCanvas(canvasRef.current);
      drawGrid();
    }
    if (cursorRef.current) {
      initializeCursorCanvas(cursorRef.current);
    }
  }, [initializeCanvas, initializeCursorCanvas]);

  // Update grid when showGrid or canvas size changes
  useEffect(() => {
    drawGrid();
  }, [showGrid, textureWidth, textureHeight, displayScale]);

  // Update display when layer manager changes
  useEffect(() => {
    updateDisplay();
  }, [layerManager, updateDisplay]);

  const drawGrid = () => {
    if (!overlayRef.current) return;
    
    const ctx = overlayRef.current.getContext('2d');
    if (!ctx) return;

    const displayWidth = textureWidth * displayScale;
    const displayHeight = textureHeight * displayScale;
    
    overlayRef.current.width = displayWidth;
    overlayRef.current.height = displayHeight;
    
    ctx.clearRect(0, 0, displayWidth, displayHeight);
    
    if (showGrid) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;

      // Draw vertical lines
      for (let x = 0; x <= textureWidth; x++) {
        const xPos = x * displayScale;
        ctx.beginPath();
        ctx.moveTo(xPos, 0);
        ctx.lineTo(xPos, displayHeight);
        ctx.stroke();
      }

      // Draw horizontal lines
      for (let y = 0; y <= textureHeight; y++) {
        const yPos = y * displayScale;
        ctx.beginPath();
        ctx.moveTo(0, yPos);
        ctx.lineTo(displayWidth, yPos);
        ctx.stroke();
      }
    }
  };

  // Mouse event handlers for proper drawing
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const displayPoint: Point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    const brushSettings: BrushSettings = {
      size: brushSize[0],
      opacity: brushOpacity[0] / 100,
      hardness: brushHardness[0] / 100,
      color: selectedColor
    };

    if (selectedTool === 'rectangle' || selectedTool === 'circle' || selectedTool === 'line') {
      // For shape tools, start drag operation
      setIsDrawing(true);
      setDragStart(displayPoint);
    } else {
      // For drawing tools, start immediate drawing
      setIsDrawing(true);
      startDrawing(displayPoint, selectedTool, brushSettings);
    }
  };

  const handleMouseMoveEvent = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const displayPoint: Point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    const brushSettings: BrushSettings = {
      size: brushSize[0],
      opacity: brushOpacity[0] / 100,
      hardness: brushHardness[0] / 100,
      color: selectedColor
    };

    // Always update cursor outline on mouse move
    updateCursorPosition(displayPoint, selectedTool, brushSettings);

    // Handle drawing if mouse is down
    if (isDrawing) {
      if (selectedTool === 'rectangle' || selectedTool === 'circle' || selectedTool === 'line') {
        // For shape tools, show preview (we'll implement this later)
        // For now, just store the current position
      } else {
        // For drawing tools, continue drawing
        continueDrawing(displayPoint, selectedTool, brushSettings);
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const displayPoint: Point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    const brushSettings: BrushSettings = {
      size: brushSize[0],
      opacity: brushOpacity[0] / 100,
      hardness: brushHardness[0] / 100,
      color: selectedColor
    };

    if ((selectedTool === 'rectangle' || selectedTool === 'circle' || selectedTool === 'line') && dragStart) {
      // For shape tools, complete the shape
      const startTexture = displayToTexture(dragStart.x, dragStart.y);
      const endTexture = displayToTexture(displayPoint.x, displayPoint.y);
      drawShape(startTexture, endTexture, selectedTool, brushSettings, fillShapes);
      setDragStart(null);
    }

    setIsDrawing(false);
    endDrawing();
  };

  const tools = [
    { id: 'brush' as CanvasTool, icon: '🖌️', name: 'Brush' },
    { id: 'pencil' as CanvasTool, icon: '✏️', name: 'Pencil' },
    { id: 'eraser' as CanvasTool, icon: '🧽', name: 'Eraser' },
    { id: 'fill' as CanvasTool, icon: '🪣', name: 'Fill' },
    { id: 'rectangle' as CanvasTool, icon: '⬛', name: 'Rectangle' },
    { id: 'circle' as CanvasTool, icon: '⭕', name: 'Circle' },
    { id: 'line' as CanvasTool, icon: '📏', name: 'Line' },
    { id: 'select' as CanvasTool, icon: '👆', name: 'Select' },
  ];

  const minecraftPalette = [
    '#000000', '#1a1a1a', '#333333', '#4a4a4a',
    '#8b4513', '#cd853f', '#daa520', '#ffd700',
    '#228b22', '#32cd32', '#90ee90', '#98fb98',
    '#0000cd', '#1e90ff', '#87ceeb', '#b0e0e6',
    '#8b0000', '#dc143c', '#ff6347', '#ff7f50',
    '#800080', '#9370db', '#dda0dd', '#ffffff'
  ];

  // Layer management functions
  const addLayer = () => {
    if (!layerManager) return;
    const layerId = layerManager.addLayer(`Layer ${layers.length + 1}`, true);
    updateDisplay();
  };

  const removeLayer = (layerId: string) => {
    if (!layerManager || layers.length <= 1) return;
    layerManager.removeLayer(layerId);
    updateDisplay();
  };

  const setActiveLayer = (layerId: string) => {
    if (!layerManager) return;
    layerManager.setActiveLayer(layerId);
    updateDisplay();
  };

  const toggleLayerVisibility = (layerId: string) => {
    if (!layerManager) return;
    layerManager.toggleLayerVisibility(layerId);
    updateDisplay();
  };

  const updateLayerOpacity = (layerId: string, opacity: number) => {
    if (!layerManager) return;
    layerManager.setLayerOpacity(layerId, opacity);
    updateDisplay();
  };

  const moveLayer = (layerId: string, direction: 'up' | 'down') => {
    if (!layerManager) return;
    layerManager.moveLayer(layerId, direction);
    updateDisplay();
  };

  const duplicateLayer = (layerId: string) => {
    if (!layerManager) return;
    layerManager.duplicateLayer(layerId);
    updateDisplay();
  };

  const handleExportTexture = async (format: 'png' | 'resource-pack') => {
    if (format === 'png') {
      const blob = await exportTexture();
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `texture_${textureWidth}x${textureHeight}.png`;
        a.style.display = 'none';
        
        document.body.appendChild(a);
        a.click();
        
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } else {
      // Resource pack export implementation can be added later
      console.log('Resource pack export will be implemented');
    }
  };

  const handleResizeCanvas = (value: string) => {
    const [width, height] = value.split('x').map(Number);
    resizeCanvas(width, height);
  };

  return (
    <section className="p-6" data-testid="texture-creator">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Tools Panel */}
          <div className="builder-form rounded-lg p-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">Tools</h3>
            
            {/* Drawing Tools */}
            <div className="space-y-3 mb-6">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Drawing</h4>
              <div className="grid grid-cols-2 gap-2">
                {tools.slice(0, 4).map((tool) => (
                  <button
                    key={tool.id}
                    className={`flex flex-col items-center p-3 rounded-lg transition-colors ${
                      selectedTool === tool.id 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted hover:bg-secondary'
                    }`}
                    onClick={() => setSelectedTool(tool.id)}
                    data-testid={`tool-${tool.id}`}
                  >
                    <span className="text-lg mb-1">{tool.icon}</span>
                    <span className="text-xs">{tool.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Shape Tools */}
            <div className="space-y-3 mb-6">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Shapes</h4>
              <div className="grid grid-cols-2 gap-2">
                {tools.slice(4).map((tool) => (
                  <button
                    key={tool.id}
                    className={`flex flex-col items-center p-3 rounded-lg transition-colors ${
                      selectedTool === tool.id 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted hover:bg-secondary'
                    }`}
                    onClick={() => setSelectedTool(tool.id)}
                    data-testid={`tool-${tool.id}`}
                  >
                    <span className="text-lg mb-1">{tool.icon}</span>
                    <span className="text-xs">{tool.name}</span>
                  </button>
                ))}
              </div>
              
              {/* Fill/Stroke toggle for shapes */}
              {(selectedTool === 'rectangle' || selectedTool === 'circle') && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Fill Shapes</span>
                  <Switch
                    checked={fillShapes}
                    onCheckedChange={setFillShapes}
                    data-testid="switch-fill-shapes"
                  />
                </div>
              )}
            </div>

            {/* Brush Settings */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Brush Settings</h4>
              <div>
                <Label>Size: {brushSize[0]}</Label>
                <Slider
                  value={brushSize}
                  onValueChange={setBrushSize}
                  min={1}
                  max={20}
                  step={1}
                  data-testid="slider-brush-size"
                />
              </div>
              <div>
                <Label>Opacity: {brushOpacity[0]}%</Label>
                <Slider
                  value={brushOpacity}
                  onValueChange={setBrushOpacity}
                  min={1}
                  max={100}
                  step={1}
                  data-testid="slider-brush-opacity"
                />
              </div>
              {selectedTool === 'brush' && (
                <div>
                  <Label>Hardness: {brushHardness[0]}%</Label>
                  <Slider
                    value={brushHardness}
                    onValueChange={setBrushHardness}
                    min={0}
                    max={100}
                    step={1}
                    data-testid="slider-brush-hardness"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Canvas Area */}
          <div className="lg:col-span-2">
            <div className="builder-form rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Canvas</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {textureWidth}x{textureHeight}
                  </span>
                  <Select
                    value={`${textureWidth}x${textureHeight}`}
                    onValueChange={handleResizeCanvas}
                  >
                    <SelectTrigger className="w-24" data-testid="select-canvas-size">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="16x16">16x16</SelectItem>
                      <SelectItem value="32x32">32x32</SelectItem>
                      <SelectItem value="64x64">64x64</SelectItem>
                      <SelectItem value="128x128">128x128</SelectItem>
                      <SelectItem value="256x256">256x256</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="texture-canvas-container rounded-lg p-4 flex items-center justify-center min-h-[400px] bg-gray-100 dark:bg-gray-800">
                <div className="relative">
                  <canvas
                    ref={canvasRef}
                    className="border border-border rounded cursor-crosshair bg-white"
                    style={{ imageRendering: 'pixelated' }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMoveEvent}
                    onMouseUp={handleMouseUp}
                    onMouseEnter={() => {
                      const brushSettings: BrushSettings = {
                        size: brushSize[0],
                        opacity: brushOpacity[0] / 100,
                        hardness: brushHardness[0] / 100,
                        color: selectedColor
                      };
                      showCursor(selectedTool, brushSettings);
                    }}
                    onMouseLeave={() => {
                      if (isDrawing) {
                        setIsDrawing(false);
                        endDrawing();
                      }
                      hideCursor();
                    }}
                    data-testid="texture-canvas"
                  />
                  <canvas
                    ref={overlayRef}
                    className="absolute top-0 left-0 pointer-events-none rounded"
                    data-testid="grid-overlay"
                  />
                  <canvas
                    ref={cursorRef}
                    className="absolute top-0 left-0 pointer-events-none rounded"
                    data-testid="cursor-overlay"
                  />
                </div>
              </div>

              {/* Canvas Controls */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={undo}
                    disabled={!canUndo}
                    data-testid="button-undo"
                  >
                    <Undo className="mr-2" size={16} />
                    Undo
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={redo}
                    disabled={!canRedo}
                    data-testid="button-redo"
                  >
                    <Redo className="mr-2" size={16} />
                    Redo
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    <Switch
                      checked={showGrid}
                      onCheckedChange={setShowGrid}
                      data-testid="switch-show-grid"
                    />
                    <span className="text-sm ml-2">Show Grid</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Layers & Colors Panel */}
          <div className="space-y-6">
            {/* Color Palette */}
            <div className="builder-form rounded-lg p-4">
              <h3 className="text-lg font-semibold text-foreground mb-4">Colors</h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-8 h-8 border border-border rounded cursor-pointer"
                    style={{ backgroundColor: selectedColor }}
                    data-testid="current-color"
                  />
                  <input
                    type="color"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-8 h-8 border-none rounded cursor-pointer bg-transparent"
                    data-testid="color-picker"
                  />
                  <span className="text-sm font-mono">{selectedColor.toUpperCase()}</span>
                </div>
                
                {/* Palette Grid */}
                <div className="grid grid-cols-6 gap-1">
                  {minecraftPalette.map((color, index) => (
                    <div
                      key={index}
                      className={`w-8 h-8 border rounded cursor-pointer hover:scale-110 transition-transform ${
                        selectedColor === color ? 'border-primary border-2' : 'border-border'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(color)}
                      data-testid={`palette-color-${index}`}
                      title={color.toUpperCase()}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Layers Panel */}
            <div className="builder-form rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Layers</h3>
                <Button
                  size="sm"
                  onClick={addLayer}
                  data-testid="button-add-layer"
                >
                  <Plus size={16} />
                </Button>
              </div>
              
              <div className="space-y-2">
                {layers.slice().reverse().map((layer, index) => (
                  <div
                    key={layer.id}
                    className={`p-3 rounded-lg border transition-colors ${
                      activeLayer?.id === layer.id 
                        ? 'bg-primary/10 border-primary' 
                        : 'bg-muted border-border hover:bg-muted/80'
                    }`}
                    onClick={() => setActiveLayer(layer.id)}
                    data-testid={`layer-${layer.id}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLayerVisibility(layer.id);
                          }}
                          className="mr-2 hover:text-primary"
                          data-testid={`button-toggle-layer-${layer.id}`}
                        >
                          {layer.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                        <Input
                          value={layer.name}
                          onChange={(e) => {
                            if (layerManager) {
                              layerManager.updateLayerProperty(layer.id, 'name', e.target.value);
                              updateDisplay();
                            }
                          }}
                          className="text-sm border-none p-0 h-auto bg-transparent"
                          data-testid={`input-layer-name-${layer.id}`}
                        />
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveLayer(layer.id, 'up');
                          }}
                          className="hover:text-primary"
                          disabled={index === 0}
                          data-testid={`button-move-layer-up-${layer.id}`}
                        >
                          <ChevronUp size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveLayer(layer.id, 'down');
                          }}
                          className="hover:text-primary"
                          disabled={index === layers.length - 1}
                          data-testid={`button-move-layer-down-${layer.id}`}
                        >
                          <ChevronDown size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeLayer(layer.id);
                          }}
                          className="hover:text-destructive"
                          disabled={layers.length === 1}
                          data-testid={`button-remove-layer-${layer.id}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Opacity</span>
                        <span className="text-xs">{layer.opacity}%</span>
                      </div>
                      <Slider
                        value={[layer.opacity]}
                        onValueChange={(value) => updateLayerOpacity(layer.id, value[0])}
                        min={0}
                        max={100}
                        step={1}
                        className="w-full"
                        data-testid={`slider-layer-opacity-${layer.id}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Export Options */}
            <div className="builder-form rounded-lg p-4">
              <h3 className="text-lg font-semibold text-foreground mb-4">Export</h3>
              <div className="space-y-3">
                <Button
                  className="w-full"
                  onClick={() => handleExportTexture('png')}
                  data-testid="button-export-png"
                >
                  <Download className="mr-2" size={16} />
                  Export PNG
                </Button>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => handleExportTexture('resource-pack')}
                  data-testid="button-export-resource-pack"
                >
                  <Save className="mr-2" size={16} />
                  Save to Resource Pack
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}