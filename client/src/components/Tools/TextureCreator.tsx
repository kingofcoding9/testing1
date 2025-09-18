import { useState, useRef, useEffect } from "react";
import { Undo, Redo, Download, Plus, Trash2, Eye, EyeOff, Grid, Save, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCanvas } from "@/hooks/useCanvas";
import { CanvasTool, BrushSettings } from "@/lib/canvas/tools";
import { LayerManager, LayerData } from "@/lib/canvas/layers";

export default function TextureCreator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const [selectedTool, setSelectedTool] = useState<CanvasTool>('brush');
  const [brushSize, setBrushSize] = useState([5]);
  const [brushOpacity, setBrushOpacity] = useState([100]);
  const [brushHardness, setBrushHardness] = useState([100]);
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const [showGrid, setShowGrid] = useState(true);
  const [canvasSize, setCanvasSize] = useState({ width: 16, height: 16 });
  const [layers, setLayers] = useState<LayerData[]>([
    { id: 'background', name: 'Background', visible: true, opacity: 100 },
    { id: 'details', name: 'Details', visible: true, opacity: 75 }
  ]);
  const [activeLayer, setActiveLayer] = useState('background');

  const {
    canvasData,
    history,
    historyIndex,
    initializeCanvas,
    drawOnCanvas,
    undo,
    redo,
    clearCanvas,
    exportCanvas
  } = useCanvas(canvasSize.width, canvasSize.height);

  useEffect(() => {
    if (canvasRef.current) {
      initializeCanvas(canvasRef.current);
      drawGrid();
    }
  }, [canvasSize, initializeCanvas]);

  useEffect(() => {
    drawGrid();
  }, [showGrid]);

  const drawGrid = () => {
    if (!overlayRef.current) return;
    
    const ctx = overlayRef.current.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height);
    
    if (showGrid) {
      const scale = 320 / canvasSize.width;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;

      for (let x = 0; x <= canvasSize.width; x++) {
        ctx.beginPath();
        ctx.moveTo(x * scale, 0);
        ctx.lineTo(x * scale, overlayRef.current.height);
        ctx.stroke();
      }

      for (let y = 0; y <= canvasSize.height; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * scale);
        ctx.lineTo(overlayRef.current.width, y * scale);
        ctx.stroke();
      }
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / (320 / canvasSize.width));
    const y = Math.floor((e.clientY - rect.top) / (320 / canvasSize.height));

    const brushSettings: BrushSettings = {
      size: brushSize[0],
      opacity: brushOpacity[0] / 100,
      hardness: brushHardness[0] / 100,
      color: selectedColor
    };

    drawOnCanvas(x, y, selectedTool, brushSettings);
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
    '#000000', '#1a1a1a', '#0d47a1', '#1976d2',
    '#388e3c', '#689f38', '#fbc02d', '#ff8f00',
    '#d32f2f', '#7b1fa2', '#5d4037', '#424242',
    '#37474f', '#263238', '#ffffff', '#f5f5f5'
  ];

  const addLayer = () => {
    const newLayer: LayerData = {
      id: `layer-${Date.now()}`,
      name: `Layer ${layers.length + 1}`,
      visible: true,
      opacity: 100
    };
    setLayers([...layers, newLayer]);
    setActiveLayer(newLayer.id);
  };

  const removeLayer = (layerId: string) => {
    if (layers.length === 1) return;
    setLayers(layers.filter(layer => layer.id !== layerId));
    if (activeLayer === layerId) {
      setActiveLayer(layers.find(layer => layer.id !== layerId)?.id || layers[0].id);
    }
  };

  const toggleLayerVisibility = (layerId: string) => {
    setLayers(layers.map(layer =>
      layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
    ));
  };

  const updateLayerOpacity = (layerId: string, opacity: number) => {
    setLayers(layers.map(layer =>
      layer.id === layerId ? { ...layer, opacity } : layer
    ));
  };

  const exportTexture = async (format: 'png' | 'resource-pack') => {
    if (format === 'png') {
      const blob = await exportCanvas('png');
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'texture.png';
        a.click();
        URL.revokeObjectURL(url);
      }
    } else {
      // Export as resource pack structure
      console.log('Resource pack export will be implemented');
    }
  };

  const resizeCanvas = (width: number, height: number) => {
    setCanvasSize({ width, height });
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
                  max={50}
                  step={1}
                  data-testid="slider-brush-size"
                />
              </div>
              <div>
                <Label>Opacity: {brushOpacity[0]}%</Label>
                <Slider
                  value={brushOpacity}
                  onValueChange={setBrushOpacity}
                  min={0}
                  max={100}
                  step={1}
                  data-testid="slider-brush-opacity"
                />
              </div>
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
            </div>
          </div>

          {/* Canvas Area */}
          <div className="lg:col-span-2">
            <div className="builder-form rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Canvas</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {canvasSize.width}x{canvasSize.height}
                  </span>
                  <Select
                    value={`${canvasSize.width}x${canvasSize.height}`}
                    onValueChange={(value) => {
                      const [width, height] = value.split('x').map(Number);
                      resizeCanvas(width, height);
                    }}
                  >
                    <SelectTrigger className="w-24" data-testid="select-canvas-size">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="16x16">16x16</SelectItem>
                      <SelectItem value="32x32">32x32</SelectItem>
                      <SelectItem value="64x64">64x64</SelectItem>
                      <SelectItem value="128x128">128x128</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="texture-canvas-container rounded-lg p-4 flex items-center justify-center min-h-[400px]">
                <div className="relative">
                  <canvas
                    ref={canvasRef}
                    width={320}
                    height={320}
                    className="border border-border rounded cursor-crosshair"
                    style={{ imageRendering: 'pixelated' }}
                    onClick={handleCanvasClick}
                    data-testid="texture-canvas"
                  />
                  <canvas
                    ref={overlayRef}
                    width={320}
                    height={320}
                    className="absolute top-0 left-0 pointer-events-none rounded"
                    data-testid="grid-overlay"
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
                    disabled={historyIndex === 0}
                    data-testid="button-undo"
                  >
                    <Undo className="mr-2" size={16} />
                    Undo
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={redo}
                    disabled={historyIndex === history.length - 1}
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
                </div>
                
                {/* Palette Grid */}
                <div className="grid grid-cols-8 gap-1">
                  {minecraftPalette.map((color, index) => (
                    <div
                      key={index}
                      className="w-6 h-6 border border-border rounded cursor-pointer hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(color)}
                      data-testid={`palette-color-${index}`}
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
                {layers.map((layer) => (
                  <div
                    key={layer.id}
                    className={`p-2 rounded flex items-center justify-between ${
                      activeLayer === layer.id 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}
                    data-testid={`layer-${layer.id}`}
                  >
                    <div className="flex items-center">
                      <button
                        onClick={() => toggleLayerVisibility(layer.id)}
                        className="mr-2"
                        data-testid={`button-toggle-layer-${layer.id}`}
                      >
                        {layer.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                      <span className="text-sm">{layer.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs">{layer.opacity}%</span>
                      <button
                        onClick={() => removeLayer(layer.id)}
                        className="text-xs hover:text-destructive"
                        disabled={layers.length === 1}
                        data-testid={`button-remove-layer-${layer.id}`}
                      >
                        <Trash2 size={12} />
                      </button>
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
                  onClick={() => exportTexture('png')}
                  data-testid="button-export-png"
                >
                  <Download className="mr-2" size={16} />
                  Export PNG
                </Button>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => exportTexture('resource-pack')}
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
