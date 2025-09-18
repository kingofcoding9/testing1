import { useState, useRef, useEffect, useCallback } from "react";
import { ExternalLink, Loader2, AlertTriangle, RefreshCw, Maximize2, Info, X } from "lucide-react";
import { useCollapsible } from "@/hooks/useCollapsible";
import { CollapsibleSection, CollapsibleGroup } from "@/components/ui/collapsible-section";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks/use-mobile";

interface ExternalTool {
  id: string;
  name: string;
  url: string;
  description: string;
  features: string[];
  icon: string;
  category: 'modeling' | 'editing' | 'effects';
}

interface IframeState {
  [key: string]: {
    loading: boolean;
    error: boolean;
    loaded: boolean;
  };
}

const externalTools: ExternalTool[] = [
  {
    id: 'blockbench',
    name: 'Blockbench',
    url: 'https://web.blockbench.net',
    description: 'Professional 3D model editor for creating custom entities, blocks, and items',
    features: [
      'Entity & Block Modeling',
      'Texture Painting',
      'Animation Editor',
      'Bedrock Format Export',
      'Model Optimization'
    ],
    icon: '🧊',
    category: 'modeling'
  },
  {
    id: 'bridge-core',
    name: 'Bridge Core',
    url: 'https://editor.bridge-core.app',
    description: 'Advanced behavior and resource pack editor with intelligent auto-completion',
    features: [
      'Behavior Pack Editor',
      'Resource Pack Editor',
      'Auto-completion',
      'Error Detection',
      'Version Control'
    ],
    icon: '🌉',
    category: 'editing'
  },
  {
    id: 'snowstorm',
    name: 'Snowstorm',
    url: 'https://snowstorm.app',
    description: 'Powerful particle system editor for creating stunning visual effects',
    features: [
      'Particle Design',
      'Real-time Preview',
      'Parameter Tweaking',
      'Export to Bedrock',
      'Effect Library'
    ],
    icon: '❄️',
    category: 'effects'
  }
];

export default function ExternalTools() {
  const [activeTab, setActiveTab] = useState('blockbench');
  const [iframeStates, setIframeStates] = useState<IframeState>({});
  const [autoReload, setAutoReload] = useState(true);
  const [fullscreenMode, setFullscreenMode] = useState(false);
  const iframeRefs = useRef<{ [key: string]: HTMLIFrameElement | null }>({});
  const fullscreenContainerRef = useRef<HTMLDivElement | null>(null);
  const isMobile = useIsMobile();

  // Initialize iframe states
  useEffect(() => {
    const initialStates = externalTools.reduce((acc, tool) => {
      acc[tool.id] = { loading: true, error: false, loaded: false };
      return acc;
    }, {} as IframeState);
    setIframeStates(initialStates);
  }, []);

  // Enhanced fullscreen functionality
  const enterFullscreen = useCallback(async () => {
    if (fullscreenContainerRef.current) {
      try {
        await fullscreenContainerRef.current.requestFullscreen();
        setFullscreenMode(true);
      } catch (error) {
        // Fallback to CSS fullscreen if Fullscreen API fails
        setFullscreenMode(true);
      }
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      setFullscreenMode(false);
    } catch (error) {
      setFullscreenMode(false);
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (fullscreenMode) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  }, [fullscreenMode, enterFullscreen, exitFullscreen]);

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // F11 for fullscreen toggle
      if (event.key === 'F11') {
        event.preventDefault();
        toggleFullscreen();
      }
      // Escape to exit fullscreen
      if (event.key === 'Escape' && fullscreenMode) {
        exitFullscreen();
      }
    };

    const handleFullscreenChange = () => {
      // Sync state with actual fullscreen status
      if (!document.fullscreenElement && fullscreenMode) {
        setFullscreenMode(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [fullscreenMode, toggleFullscreen, exitFullscreen]);

  const updateIframeState = (toolId: string, updates: Partial<IframeState[string]>) => {
    setIframeStates(prev => ({
      ...prev,
      [toolId]: { ...prev[toolId], ...updates }
    }));
  };

  const handleIframeLoad = (toolId: string) => {
    updateIframeState(toolId, { loading: false, loaded: true, error: false });
  };

  const handleIframeError = (toolId: string) => {
    updateIframeState(toolId, { loading: false, error: true, loaded: false });
  };

  const reloadIframe = (toolId: string) => {
    const iframe = iframeRefs.current[toolId];
    if (iframe) {
      updateIframeState(toolId, { loading: true, error: false, loaded: false });
      iframe.src = iframe.src;
    }
  };

  const openInNewWindow = (tool: ExternalTool) => {
    window.open(tool.url, '_blank', 'noopener,noreferrer');
  };

  const renderIframe = (tool: ExternalTool) => {
    const state = iframeStates[tool.id] || { loading: true, error: false, loaded: false };

    return (
      <div className="relative w-full h-full overflow-hidden">
        {/* Loading State */}
        {state.loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
            <p className="text-sm text-muted-foreground">Loading {tool.name}...</p>
          </div>
        )}

        {/* Error State */}
        {state.error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm z-10 p-4">
            <AlertTriangle className="w-8 h-8 text-destructive mb-3" />
            <p className="text-sm text-foreground mb-4 text-center">Failed to load {tool.name}</p>
            <div className="flex flex-col sm:flex-row gap-2 w-full max-w-xs">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => reloadIframe(tool.id)}
                className="min-h-[44px] flex-1"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => openInNewWindow(tool)}
                className="min-h-[44px] flex-1"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Externally
              </Button>
            </div>
          </div>
        )}

        {/* Iframe */}
        <iframe
          ref={(el) => { iframeRefs.current[tool.id] = el; }}
          src={tool.url}
          className="w-full h-full border-0 bg-white"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-downloads"
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={() => handleIframeLoad(tool.id)}
          onError={() => handleIframeError(tool.id)}
          title={`${tool.name} - ${tool.description}`}
          data-testid={`iframe-${tool.id}`}
        />
      </div>
    );
  };

  const renderToolOverview = (tool: ExternalTool) => (
    <div className="mb-4 p-3 sm:p-4 bg-muted/50 rounded-lg border">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
        <div className="flex items-start space-x-3 min-w-0 flex-1">
          <span className="text-xl sm:text-2xl flex-shrink-0">{tool.icon}</span>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-foreground text-sm sm:text-base">{tool.name}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{tool.description}</p>
          </div>
        </div>
        <div className="flex items-center justify-between sm:justify-end space-x-2 flex-shrink-0">
          <Badge 
            variant={tool.category === 'modeling' ? 'default' : tool.category === 'editing' ? 'secondary' : 'outline'}
            className="text-xs"
          >
            {tool.category}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => openInNewWindow(tool)}
            data-testid={`button-open-external-${tool.id}`}
            className="min-h-[44px] text-xs sm:text-sm"
          >
            <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Open External</span>
            <span className="sm:hidden">Open</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {tool.features.map((feature, index) => (
          <div key={index} className="flex items-center space-x-2 text-xs sm:text-sm">
            <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
            <span className="text-muted-foreground">{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <section className="h-full flex flex-col" data-testid="external-tools">
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">External Tools</h2>
            <p className="text-sm sm:text-base text-muted-foreground line-clamp-2">
              Professional tools for complete Minecraft Bedrock Edition development workflow
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 flex-shrink-0">
            <div className="flex items-center space-x-2">
              <Switch
                checked={autoReload}
                onCheckedChange={setAutoReload}
                data-testid="switch-auto-reload"
              />
              <Label className="text-xs sm:text-sm">Auto-reload on error</Label>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              data-testid="button-fullscreen-toggle"
              title="Toggle fullscreen (F11)"
              className="min-h-[44px] w-full sm:w-auto"
            >
              <Maximize2 className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">
                {fullscreenMode ? 'Exit Fullscreen' : 'Fullscreen'}
              </span>
              <span className="sm:hidden">
                {fullscreenMode ? 'Exit' : 'Full'}
              </span>
            </Button>
          </div>
        </div>

        <Alert className="mb-4">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs sm:text-sm">
            These tools run in secure sandboxed iframes. Some features may require opening in a new window for full functionality.
          </AlertDescription>
        </Alert>
      </div>

      <div className="flex-1 min-h-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-3 mb-4 h-auto">
            {externalTools.map((tool) => (
              <TabsTrigger 
                key={tool.id} 
                value={tool.id} 
                className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 min-h-[44px]"
                data-testid={`tab-${tool.id}`}
              >
                <div className="flex items-center gap-1 sm:gap-2">
                  <span className="text-sm sm:text-base">{tool.icon}</span>
                  <span className="text-xs sm:text-sm font-medium truncate">{tool.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  {iframeStates[tool.id]?.loading && (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  )}
                  {iframeStates[tool.id]?.error && (
                    <AlertTriangle className="w-3 h-3 text-destructive" />
                  )}
                </div>
              </TabsTrigger>
            ))}
          </TabsList>

          {externalTools.map((tool) => (
            <TabsContent 
              key={tool.id} 
              value={tool.id} 
              className="flex-1 min-h-0 mt-0 h-full"
              data-testid={`content-${tool.id}`}
            >
              <div 
                ref={fullscreenContainerRef}
                className={`h-full flex flex-col ${
                  fullscreenMode 
                    ? 'fixed inset-0 z-50 bg-background p-0' 
                    : ''
                }`}
              >
                {!fullscreenMode && renderToolOverview(tool)}
                
                <div className="flex-1 min-h-0">
                  {fullscreenMode ? (
                    // True fullscreen mode - no card, minimal UI
                    <div className="h-full flex flex-col">
                      <div className="flex items-center justify-between p-3 sm:p-4 bg-background/95 backdrop-blur-sm border-b">
                        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                          <span className="text-xl sm:text-2xl">{tool.icon}</span>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">{tool.name}</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground">Fullscreen Mode</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => reloadIframe(tool.id)}
                            disabled={iframeStates[tool.id]?.loading}
                            data-testid={`button-reload-${tool.id}`}
                            title="Reload iframe"
                            className="min-h-[44px] min-w-[44px] p-2"
                          >
                            <RefreshCw className={`w-4 h-4 ${iframeStates[tool.id]?.loading ? 'animate-spin' : ''}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openInNewWindow(tool)}
                            title="Open in new window"
                            className="min-h-[44px] min-w-[44px] p-2"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={exitFullscreen}
                            title="Exit fullscreen (Esc)"
                            className="min-h-[44px] min-w-[44px] p-2"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex-1">
                        {renderIframe(tool)}
                      </div>
                    </div>
                  ) : (
                    // Normal card mode
                    <Card className="h-full flex flex-col">
                      <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                              <span className="text-base sm:text-lg">{tool.icon}</span>
                              <span className="truncate">{tool.name}</span>
                            </CardTitle>
                            <CardDescription className="text-xs sm:text-sm">
                              Integrated {tool.name.toLowerCase()} workspace
                            </CardDescription>
                          </div>
                          <div className="flex items-center justify-end space-x-1 sm:space-x-2 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => reloadIframe(tool.id)}
                              disabled={iframeStates[tool.id]?.loading}
                              data-testid={`button-reload-${tool.id}`}
                              title="Reload iframe"
                              className="min-h-[44px] min-w-[44px] p-2"
                            >
                              <RefreshCw className={`w-4 h-4 ${iframeStates[tool.id]?.loading ? 'animate-spin' : ''}`} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openInNewWindow(tool)}
                              title="Open in new window"
                              className="min-h-[44px] min-w-[44px] p-2"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={toggleFullscreen}
                              title="Enter fullscreen (F11)"
                              className="min-h-[44px] min-w-[44px] p-2"
                            >
                              <Maximize2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0 flex-1 min-h-0">
                        <div className="h-full min-h-[400px] md:min-h-[500px] lg:min-h-[600px]">
                          {renderIframe(tool)}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}