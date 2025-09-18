import { useState, useRef, useEffect } from "react";
import { ExternalLink, Loader2, AlertTriangle, RefreshCw, Maximize2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

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

  // Initialize iframe states
  useEffect(() => {
    const initialStates = externalTools.reduce((acc, tool) => {
      acc[tool.id] = { loading: true, error: false, loaded: false };
      return acc;
    }, {} as IframeState);
    setIframeStates(initialStates);
  }, []);

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
      <div className="relative w-full h-full min-h-[600px] bg-muted rounded-lg overflow-hidden">
        {/* Loading State */}
        {state.loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
            <p className="text-sm text-muted-foreground">Loading {tool.name}...</p>
          </div>
        )}

        {/* Error State */}
        {state.error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm z-10">
            <AlertTriangle className="w-8 h-8 text-destructive mb-3" />
            <p className="text-sm text-foreground mb-4">Failed to load {tool.name}</p>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => reloadIframe(tool.id)}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
              <Button variant="outline" size="sm" onClick={() => openInNewWindow(tool)}>
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
          className="w-full h-full border-0"
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
    <div className="mb-4 p-4 bg-muted/50 rounded-lg border">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{tool.icon}</span>
          <div>
            <h3 className="font-semibold text-foreground">{tool.name}</h3>
            <p className="text-sm text-muted-foreground">{tool.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={tool.category === 'modeling' ? 'default' : tool.category === 'editing' ? 'secondary' : 'outline'}>
            {tool.category}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => openInNewWindow(tool)}
            data-testid={`button-open-external-${tool.id}`}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open External
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {tool.features.map((feature, index) => (
          <div key={index} className="flex items-center space-x-2 text-sm">
            <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
            <span className="text-muted-foreground">{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <section className="p-6 h-full flex flex-col" data-testid="external-tools">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">External Tools</h2>
            <p className="text-muted-foreground">
              Professional tools for complete Minecraft Bedrock Edition development workflow
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={autoReload}
                onCheckedChange={setAutoReload}
                data-testid="switch-auto-reload"
              />
              <Label className="text-sm">Auto-reload on error</Label>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFullscreenMode(!fullscreenMode)}
              data-testid="button-fullscreen-toggle"
            >
              <Maximize2 className="w-4 h-4 mr-2" />
              {fullscreenMode ? 'Exit' : 'Fullscreen'}
            </Button>
          </div>
        </div>

        <Alert className="mb-4">
          <Info className="h-4 w-4" />
          <AlertDescription>
            These tools run in secure sandboxed iframes. Some features may require opening in a new window for full functionality.
          </AlertDescription>
        </Alert>
      </div>

      <div className="flex-1 min-h-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            {externalTools.map((tool) => (
              <TabsTrigger 
                key={tool.id} 
                value={tool.id} 
                className="flex items-center space-x-2"
                data-testid={`tab-${tool.id}`}
              >
                <span>{tool.icon}</span>
                <span>{tool.name}</span>
                {iframeStates[tool.id]?.loading && (
                  <Loader2 className="w-3 h-3 animate-spin" />
                )}
                {iframeStates[tool.id]?.error && (
                  <AlertTriangle className="w-3 h-3 text-destructive" />
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {externalTools.map((tool) => (
            <TabsContent 
              key={tool.id} 
              value={tool.id} 
              className="flex-1 min-h-0 mt-0"
              data-testid={`content-${tool.id}`}
            >
              <div className={`h-full flex flex-col ${fullscreenMode ? 'fixed inset-0 z-50 bg-background p-6' : ''}`}>
                {!fullscreenMode && renderToolOverview(tool)}
                
                <div className="flex-1 min-h-0">
                  <Card className="h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center space-x-2">
                            <span>{tool.icon}</span>
                            <span>{tool.name}</span>
                          </CardTitle>
                          <CardDescription>
                            Integrated {tool.name.toLowerCase()} workspace
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => reloadIframe(tool.id)}
                            disabled={iframeStates[tool.id]?.loading}
                            data-testid={`button-reload-${tool.id}`}
                          >
                            <RefreshCw className={`w-4 h-4 ${iframeStates[tool.id]?.loading ? 'animate-spin' : ''}`} />
                          </Button>
                          {fullscreenMode && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setFullscreenMode(false)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0 h-full pb-6">
                      <div className="h-full px-6">
                        {renderIframe(tool)}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}