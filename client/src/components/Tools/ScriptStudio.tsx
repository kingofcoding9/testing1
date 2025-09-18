import { useState, useMemo, useCallback } from "react";
import { 
  Copy, 
  Download, 
  Play, 
  Search, 
  ChevronRight, 
  ChevronDown, 
  Book, 
  Code2, 
  Zap, 
  FileCode, 
  Settings,
  Package,
  FunctionSquare,
  Layers,
  X,
  Plus,
  Filter,
  Star,
  Box,
  Target,
  Cpu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import CodePreview from "@/components/Common/CodePreview";
import { minecraftRegistry } from "@shared/minecraftRegistry";
import { cn } from "@/lib/utils";

// Types for the enhanced Script Studio
interface ScriptTab {
  id: string;
  name: string;
  content: string;
  language: 'javascript' | 'typescript';
}

interface SelectedElement {
  id: string;
  name: string;
  type: string;
  module: string;
  element: any;
}

interface ParameterValues {
  [paramName: string]: string;
}

interface FilterState {
  modules: string[];
  types: string[];
  complexity: 'all' | 'beginner' | 'intermediate' | 'advanced';
  favorites: boolean;
}

export default function ScriptStudio() {
  // Core state
  const [activeTab, setActiveTab] = useState("browser");
  const [scripts, setScripts] = useState<ScriptTab[]>([
    { id: "1", name: "Main Script", content: "// Your Minecraft script starts here\n", language: "typescript" }
  ]);
  const [activeScriptId, setActiveScriptId] = useState("1");
  
  // Browser state
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(["@minecraft/server"]));
  const [expandedElements, setExpandedElements] = useState<Set<string>>(new Set());
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    modules: [],
    types: [],
    complexity: 'all',
    favorites: false
  });
  
  // Parameter state
  const [parameterValues, setParameterValues] = useState<ParameterValues>({});
  const [showParameterHelper, setShowParameterHelper] = useState(true);
  
  // UI state
  const [splitView, setSplitView] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Process registry data
  const registryData = useMemo(() => {
    const modules = Object.keys(minecraftRegistry.modules);
    const elements = Object.values(minecraftRegistry.modules).flatMap(module => module.elements || []);
    
    // Group elements by type and module
    const elementsByModule = modules.reduce((acc, moduleName) => {
      const moduleData = minecraftRegistry.modules[moduleName];
      acc[moduleName] = {
        ...moduleData,
        elementsByType: (moduleData.elements || []).reduce((typeAcc: any, element: any) => {
          if (!typeAcc[element.type]) typeAcc[element.type] = [];
          typeAcc[element.type].push(element);
          return typeAcc;
        }, {})
      };
      return acc;
    }, {} as any);

    return {
      modules,
      elements,
      elementsByModule,
      totalElements: elements.length
    };
  }, []);

  // Search and filter logic
  const filteredElements = useMemo(() => {
    let filtered = registryData.elements;

    // Text search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((element: any) => 
        element.name.toLowerCase().includes(searchLower) ||
        element.description?.toLowerCase().includes(searchLower) ||
        element.module.toLowerCase().includes(searchLower)
      );
    }

    // Module filter
    if (filters.modules.length > 0) {
      filtered = filtered.filter((element: any) => filters.modules.includes(element.module));
    }

    // Type filter
    if (filters.types.length > 0) {
      filtered = filtered.filter((element: any) => filters.types.includes(element.type));
    }

    // Favorites filter
    if (filters.favorites) {
      filtered = filtered.filter((element: any) => favorites.has(element.id));
    }

    return filtered;
  }, [registryData.elements, searchTerm, filters, favorites]);

  // Toggle functions
  const toggleModule = useCallback((moduleName: string) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleName)) {
        newSet.delete(moduleName);
      } else {
        newSet.add(moduleName);
      }
      return newSet;
    });
  }, []);

  const toggleElement = useCallback((elementId: string) => {
    setExpandedElements(prev => {
      const newSet = new Set(prev);
      if (newSet.has(elementId)) {
        newSet.delete(elementId);
      } else {
        newSet.add(elementId);
      }
      return newSet;
    });
  }, []);

  const toggleFavorite = useCallback((elementId: string) => {
    setFavorites(prev => {
      const newSet = new Set(prev);
      if (newSet.has(elementId)) {
        newSet.delete(elementId);
      } else {
        newSet.add(elementId);
      }
      return newSet;
    });
  }, []);

  // Element selection
  const selectElement = useCallback((element: any) => {
    setSelectedElement({
      id: element.id,
      name: element.name,
      type: element.type,
      module: element.module,
      element
    });
    setParameterValues({});
  }, []);

  // Code generation
  const generateCode = useCallback(() => {
    if (!selectedElement) return;

    const element = selectedElement.element;
    let code = "";

    // Add imports
    const imports = new Set<string>();
    imports.add(selectedElement.module);
    
    code += `import { ${element.name} } from '${selectedElement.module}';\n\n`;

    // Generate code based on element type
    switch (element.type) {
      case 'class':
        if (element.methods && element.methods.length > 0) {
          const constructor = element.methods.find((m: any) => m.name === 'constructor');
          if (constructor) {
            const params = constructor.parameters.map((p: any) => {
              const value = parameterValues[p.name] || getDefaultValue(p.type);
              return formatParameterValue(p.type, value);
            }).join(', ');
            code += `// Create instance of ${element.name}\n`;
            code += `const instance = new ${element.name}(${params});\n\n`;
          }
        }
        break;
        
      case 'function':
        const params = (element.parameters || []).map((p: any) => {
          const value = parameterValues[p.name] || getDefaultValue(p.type);
          return formatParameterValue(p.type, value);
        }).join(', ');
        code += `// Call ${element.name} function\n`;
        code += `const result = ${element.name}(${params});\n`;
        break;
        
      case 'enum':
        if (element.enumValues && element.enumValues.length > 0) {
          code += `// Using ${element.name} enum values\n`;
          element.enumValues.slice(0, 3).forEach((enumVal: any) => {
            code += `console.log(${element.name}.${enumVal.name}); // ${enumVal.value}\n`;
          });
        }
        break;
        
      default:
        code += `// ${element.description || `Using ${element.name}`}\n`;
        code += `// Type: ${element.type}\n`;
        code += `// Module: ${element.module}\n`;
    }

    // Update active script
    setScripts(prev => prev.map(script => 
      script.id === activeScriptId 
        ? { ...script, content: script.content + '\n' + code }
        : script
    ));
  }, [selectedElement, parameterValues, activeScriptId]);

  // Helper functions
  const getDefaultValue = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'string': return '"example"';
      case 'number': return '1';
      case 'boolean': return 'true';
      case 'vector3': return '{ x: 0, y: 0, z: 0 }';
      default: return 'undefined';
    }
  };

  const formatParameterValue = (type: string, value: string): string => {
    if (!value) return getDefaultValue(type);
    
    switch (type.toLowerCase()) {
      case 'string':
        return `"${value}"`;
      case 'number':
        return value;
      case 'boolean':
        return value;
      case 'vector3':
        const coords = value.split(',').map(s => s.trim());
        return `{ x: ${coords[0] || '0'}, y: ${coords[1] || '0'}, z: ${coords[2] || '0'} }`;
      default:
        return value;
    }
  };

  const getElementIcon = (type: string) => {
    switch (type) {
      case 'class': return <Box className="w-4 h-4 text-blue-500" />;
      case 'interface': return <Layers className="w-4 h-4 text-green-500" />;
      case 'enum': return <Target className="w-4 h-4 text-yellow-500" />;
      case 'function': return <FunctionSquare className="w-4 h-4 text-purple-500" />;
      case 'type': return <Code2 className="w-4 h-4 text-cyan-500" />;
      default: return <Cpu className="w-4 h-4 text-gray-500" />;
    }
  };

  // Script management
  const addScript = () => {
    const newId = Date.now().toString();
    const newScript: ScriptTab = {
      id: newId,
      name: `Script ${scripts.length + 1}`,
      content: "// New Minecraft script\n",
      language: "typescript"
    };
    setScripts(prev => [...prev, newScript]);
    setActiveScriptId(newId);
  };

  const removeScript = (scriptId: string) => {
    if (scripts.length <= 1) return;
    setScripts(prev => prev.filter(s => s.id !== scriptId));
    if (activeScriptId === scriptId) {
      setActiveScriptId(scripts.find(s => s.id !== scriptId)?.id || scripts[0].id);
    }
  };

  const updateScript = (scriptId: string, updates: Partial<ScriptTab>) => {
    setScripts(prev => prev.map(script => 
      script.id === scriptId ? { ...script, ...updates } : script
    ));
  };

  const activeScript = scripts.find(s => s.id === activeScriptId) || scripts[0];

  // Export functionality
  const exportScript = (scriptId: string) => {
    const script = scripts.find(s => s.id === scriptId);
    if (!script) return;

    const blob = new Blob([script.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${script.name.replace(/\s+/g, '_')}.${script.language === 'typescript' ? 'ts' : 'js'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyScript = async (scriptId: string) => {
    const script = scripts.find(s => s.id === scriptId);
    if (!script) return;

    try {
      await navigator.clipboard.writeText(script.content);
    } catch (err) {
      console.error('Failed to copy script:', err);
    }
  };

  return (
    <section className="p-6 h-full flex flex-col" data-testid="script-studio">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Script Studio</h2>
        <p className="text-muted-foreground">
          Comprehensive Minecraft Bedrock Script API explorer with {registryData.totalElements} elements across {registryData.modules.length} modules
        </p>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* Left Panel - API Browser */}
        <div className="w-1/3 flex flex-col min-h-0">
          <div className="builder-form p-4 rounded-lg flex-1 flex flex-col">
            {/* Search Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">API Browser</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                  data-testid="button-toggle-advanced-search"
                >
                  <Filter className="w-4 h-4" />
                </Button>
                <Badge variant="secondary">{filteredElements.length}</Badge>
              </div>
            </div>

            {/* Search Input */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search APIs, methods, classes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-api-search"
                />
              </div>
            </div>

            {/* Advanced Search Filters */}
            {showAdvancedSearch && (
              <div className="mb-4 p-3 bg-muted rounded-lg space-y-3">
                <div>
                  <Label className="text-xs font-medium">Modules</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {registryData.modules.map(module => (
                      <Badge
                        key={module}
                        variant={filters.modules.includes(module) ? "default" : "outline"}
                        className="cursor-pointer text-xs"
                        onClick={() => {
                          setFilters(prev => ({
                            ...prev,
                            modules: prev.modules.includes(module)
                              ? prev.modules.filter(m => m !== module)
                              : [...prev.modules, module]
                          }));
                        }}
                      >
                        {module.replace('@minecraft/', '')}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label className="text-xs font-medium">Types</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {['class', 'interface', 'enum', 'function', 'type'].map(type => (
                      <Badge
                        key={type}
                        variant={filters.types.includes(type) ? "default" : "outline"}
                        className="cursor-pointer text-xs"
                        onClick={() => {
                          setFilters(prev => ({
                            ...prev,
                            types: prev.types.includes(type)
                              ? prev.types.filter(t => t !== type)
                              : [...prev.types, type]
                          }));
                        }}
                      >
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={filters.favorites}
                    onCheckedChange={(checked) => setFilters(prev => ({ ...prev, favorites: checked }))}
                  />
                  <Label className="text-xs">Favorites only</Label>
                </div>
              </div>
            )}

            {/* Module Tree */}
            <ScrollArea className="flex-1">
              {searchTerm ? (
                // Search Results
                <div className="space-y-2">
                  {filteredElements.map((element: any) => (
                    <div
                      key={element.id}
                      className={cn(
                        "p-2 rounded-lg cursor-pointer transition-colors",
                        "hover:bg-muted border",
                        selectedElement?.id === element.id ? "bg-accent border-accent-foreground" : "border-border"
                      )}
                      onClick={() => selectElement(element)}
                      data-testid={`element-${element.name}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getElementIcon(element.type)}
                          <span className="font-medium text-sm">{element.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="text-xs">
                            {element.type}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-6 h-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(element.id);
                            }}
                          >
                            <Star
                              className={cn(
                                "w-3 h-3",
                                favorites.has(element.id) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                              )}
                            />
                          </Button>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {element.module} • {element.description?.slice(0, 60)}...
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Module Tree View
                <Accordion type="multiple" value={Array.from(expandedModules)}>
                  {registryData.modules.map(moduleName => {
                    const moduleData = registryData.elementsByModule[moduleName];
                    if (!moduleData) return null;

                    return (
                      <AccordionItem key={moduleName} value={moduleName} className="border border-border rounded-lg mb-2">
                        <AccordionTrigger
                          className="px-3 py-2 hover:bg-muted rounded-lg"
                          onClick={() => toggleModule(moduleName)}
                        >
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-blue-500" />
                            <span className="font-medium">{moduleName.replace('@minecraft/', '')}</span>
                            <Badge variant="secondary" className="text-xs">
                              {(moduleData.elements || []).length}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-3 pb-2">
                          {Object.entries(moduleData.elementsByType || {}).map(([type, elements]: [string, any]) => (
                            <div key={type} className="mb-3">
                              <div className="flex items-center gap-2 mb-2 px-2 py-1 bg-muted rounded">
                                {getElementIcon(type)}
                                <span className="text-sm font-medium capitalize">{type}s</span>
                                <Badge variant="outline" className="text-xs">{elements.length}</Badge>
                              </div>
                              <div className="space-y-1 ml-6">
                                {elements.slice(0, 10).map((element: any) => (
                                  <div
                                    key={element.id}
                                    className={cn(
                                      "flex items-center justify-between p-2 rounded cursor-pointer transition-colors",
                                      "hover:bg-muted",
                                      selectedElement?.id === element.id ? "bg-accent" : ""
                                    )}
                                    onClick={() => selectElement(element)}
                                    data-testid={`element-${element.name}`}
                                  >
                                    <span className="text-sm">{element.name}</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="w-6 h-6 p-0"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleFavorite(element.id);
                                      }}
                                    >
                                      <Star
                                        className={cn(
                                          "w-3 h-3",
                                          favorites.has(element.id) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                                        )}
                                      />
                                    </Button>
                                  </div>
                                ))}
                                {elements.length > 10 && (
                                  <div className="text-xs text-muted-foreground px-2">
                                    +{elements.length - 10} more...
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              )}
            </ScrollArea>
          </div>
        </div>

        {/* Right Panel - Documentation & Code Editor */}
        <div className="flex-1 flex flex-col min-h-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="browser" className="flex items-center gap-2">
                <Book className="w-4 h-4" />
                Documentation
              </TabsTrigger>
              <TabsTrigger value="builder" className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Code Builder
              </TabsTrigger>
              <TabsTrigger value="editor" className="flex items-center gap-2">
                <FileCode className="w-4 h-4" />
                Script Editor
              </TabsTrigger>
              <TabsTrigger value="templates" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Templates
              </TabsTrigger>
            </TabsList>

            {/* Documentation Tab */}
            <TabsContent value="browser" className="flex-1 flex flex-col mt-4">
              {selectedElement ? (
                <div className="builder-form p-4 rounded-lg flex-1 overflow-auto">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getElementIcon(selectedElement.type)}
                      <div>
                        <h3 className="text-lg font-semibold">{selectedElement.name}</h3>
                        <p className="text-sm text-muted-foreground">{selectedElement.module}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{selectedElement.type}</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFavorite(selectedElement.id)}
                      >
                        <Star
                          className={cn(
                            "w-4 h-4",
                            favorites.has(selectedElement.id) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                          )}
                        />
                      </Button>
                    </div>
                  </div>

                  {selectedElement.element.description && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Description</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedElement.element.description}
                      </p>
                    </div>
                  )}

                  {selectedElement.element.definition && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Definition</h4>
                      <CodePreview
                        code={selectedElement.element.definition}
                        language="typescript"
                        className="text-xs"
                      />
                    </div>
                  )}

                  {selectedElement.element.enumValues && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Enum Values</h4>
                      <div className="space-y-2">
                        {selectedElement.element.enumValues.map((enumVal: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded">
                            <span className="font-mono text-sm">{enumVal.name}</span>
                            <Badge variant="outline" className="text-xs">{enumVal.value}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedElement.element.methods && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Methods</h4>
                      <div className="space-y-2">
                        {selectedElement.element.methods.slice(0, 5).map((method: any, idx: number) => (
                          <div key={idx} className="p-2 bg-muted rounded">
                            <div className="font-mono text-sm">{method.name}</div>
                            {method.description && (
                              <div className="text-xs text-muted-foreground mt-1">{method.description}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="builder-form p-8 rounded-lg flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <Book className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Select an API Element</h3>
                    <p className="text-muted-foreground">
                      Choose any class, method, enum, or interface from the browser to view detailed documentation
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Code Builder Tab */}
            <TabsContent value="builder" className="flex-1 flex flex-col mt-4">
              {selectedElement ? (
                <div className="builder-form p-4 rounded-lg flex-1 overflow-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Code Builder</h3>
                    <Button onClick={generateCode} data-testid="button-generate-code">
                      <Code2 className="w-4 h-4 mr-2" />
                      Generate Code
                    </Button>
                  </div>

                  {selectedElement.element.parameters && selectedElement.element.parameters.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-medium">Parameters</h4>
                      {selectedElement.element.parameters.map((param: any, idx: number) => (
                        <div key={idx} className="space-y-2">
                          <Label className="text-sm font-medium">
                            {param.name}
                            {!param.optional && <span className="text-red-500 ml-1">*</span>}
                          </Label>
                          <div className="text-xs text-muted-foreground mb-1">
                            Type: {param.type} {param.description && `• ${param.description}`}
                          </div>
                          <Input
                            placeholder={getDefaultValue(param.type)}
                            value={parameterValues[param.name] || ''}
                            onChange={(e) => setParameterValues(prev => ({
                              ...prev,
                              [param.name]: e.target.value
                            }))}
                            data-testid={`input-param-${param.name}`}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedElement.element.type === 'enum' && selectedElement.element.enumValues && (
                    <div className="space-y-4">
                      <h4 className="font-medium">Enum Values</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedElement.element.enumValues.map((enumVal: any, idx: number) => (
                          <Button
                            key={idx}
                            variant="outline"
                            className="justify-start"
                            onClick={() => {
                              const code = `${selectedElement.name}.${enumVal.name}`;
                              setScripts(prev => prev.map(script => 
                                script.id === activeScriptId 
                                  ? { ...script, content: script.content + code + '\n' }
                                  : script
                              ));
                            }}
                          >
                            <span className="font-mono text-sm">{enumVal.name}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="builder-form p-8 rounded-lg flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Interactive Code Builder</h3>
                    <p className="text-muted-foreground">
                      Select an API element to build code with guided parameter input and examples
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Script Editor Tab */}
            <TabsContent value="editor" className="flex-1 flex flex-col mt-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {scripts.map(script => (
                    <div key={script.id} className="flex items-center">
                      <Button
                        variant={script.id === activeScriptId ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveScriptId(script.id)}
                        className="rounded-r-none"
                      >
                        {script.name}
                      </Button>
                      {scripts.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeScript(script.id)}
                          className="rounded-l-none border-l-0 px-2"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addScript}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={activeScript.language}
                    onValueChange={(value: 'javascript' | 'typescript') => 
                      updateScript(activeScriptId, { language: value })
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="typescript">TypeScript</SelectItem>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyScript(activeScriptId)}
                    data-testid="button-copy-script"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportScript(activeScriptId)}
                    data-testid="button-export-script"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="builder-form p-4 rounded-lg flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <Input
                    value={activeScript.name}
                    onChange={(e) => updateScript(activeScriptId, { name: e.target.value })}
                    className="font-medium"
                    data-testid="input-script-name"
                  />
                </div>
                <Textarea
                  value={activeScript.content}
                  onChange={(e) => updateScript(activeScriptId, { content: e.target.value })}
                  className="flex-1 font-mono text-sm resize-none"
                  placeholder="Write your Minecraft script here..."
                  data-testid="textarea-script-content"
                />
              </div>
            </TabsContent>

            {/* Templates Tab */}
            <TabsContent value="templates" className="flex-1 mt-4">
              <div className="builder-form p-4 rounded-lg h-full">
                <h3 className="text-lg font-semibold mb-4">Script Templates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      name: "Hello World",
                      description: "Basic message sending example",
                      code: `import { world } from '@minecraft/server';\n\nworld.sendMessage("Hello, Minecraft!");`
                    },
                    {
                      name: "Entity Spawner",
                      description: "Spawn entities at coordinates",
                      code: `import { world } from '@minecraft/server';\n\nconst location = { x: 0, y: 64, z: 0 };\nconst entity = world.spawnEntity("minecraft:pig", location);\nworld.sendMessage("Spawned a pig!");`
                    },
                    {
                      name: "Player Tracker",
                      description: "Track player movements",
                      code: `import { world, system } from '@minecraft/server';\n\nsystem.runInterval(() => {\n  const players = world.getPlayers();\n  players.forEach(player => {\n    const location = player.location;\n    console.log(\`Player \${player.name} at \${location.x}, \${location.y}, \${location.z}\`);\n  });\n}, 20);`
                    },
                    {
                      name: "Block Placer",
                      description: "Place blocks in the world",
                      code: `import { world, BlockPermutation } from '@minecraft/server';\n\nconst location = { x: 0, y: 64, z: 0 };\nconst block = BlockPermutation.resolve("minecraft:diamond_block");\nworld.setBlock(location, block);`
                    }
                  ].map((template, idx) => (
                    <div key={idx} className="p-4 border border-border rounded-lg hover:bg-muted transition-colors cursor-pointer"
                         onClick={() => updateScript(activeScriptId, { content: activeScript.content + '\n' + template.code })}>
                      <h4 className="font-medium mb-2">{template.name}</h4>
                      <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                      <CodePreview code={template.code} language="typescript" className="text-xs" />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
}