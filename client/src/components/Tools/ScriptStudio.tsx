import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { 
  Copy, 
  Download, 
  Play, 
  Search, 
  ChevronRight, 
  ChevronDown, 
  ChevronLeft, 
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
  Cpu,
  Maximize2,
  Minimize2,
  Save,
  RotateCcw,
  Terminal,
  Lightbulb
} from "lucide-react";
import Editor from '@monaco-editor/react';
import type * as Monaco from 'monaco-editor';
import { useCollapsible } from "@/hooks/useCollapsible";
import { CollapsibleSection, CollapsibleGroup } from "@/components/ui/collapsible-section";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

interface AutocompleteItem {
  label: string;
  kind: Monaco.languages.CompletionItemKind;
  detail?: string;
  documentation?: string;
  insertText: string;
  range: Monaco.IRange;
}

interface MonacoEditorRef {
  editor: Monaco.editor.IStandaloneCodeEditor | null;
  monaco: typeof Monaco | null;
}

export default function ScriptStudio() {
  // Core state
  const [scripts, setScripts] = useState<ScriptTab[]>([
    { 
      id: "1", 
      name: "Main Script", 
      content: `// Welcome to the enhanced Script Studio!
// Professional Monaco Editor with intelligent autocomplete

import { world } from '@minecraft/server';

// Start typing to see VS Code-style suggestions
// Try typing "world." to see available methods
world.sendMessage("Hello from Script Studio!");

// The editor now features:
// ✓ Syntax highlighting
// ✓ Intelligent autocomplete with 476+ API elements  
// ✓ Parameter hints and type information
// ✓ JSDoc documentation in suggestions
// ✓ Error detection and warnings
// ✓ Bracket matching and auto-closing

`, 
      language: "typescript" 
    }
  ]);
  const [activeScriptId, setActiveScriptId] = useState("1");
  const [editorExpanded, setEditorExpanded] = useState(false);
  const editorRef = useRef<MonacoEditorRef>({ editor: null, monaco: null });
  
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [documentationOpen, setDocumentationOpen] = useState(true);
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

  // Monaco Editor setup and autocomplete provider
  const setupMonacoEditor = useCallback((editor: Monaco.editor.IStandaloneCodeEditor, monaco: typeof Monaco) => {
    editorRef.current = { editor, monaco };

    // Register completion provider for TypeScript
    monaco.languages.registerCompletionItemProvider('typescript', {
      provideCompletionItems: (model, position) => {
        const suggestions: Monaco.languages.CompletionItem[] = [];
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        // Get line content to analyze context
        const lineContent = model.getLineContent(position.lineNumber);
        const beforeCursor = lineContent.substring(0, position.column - 1);
        
        // Check if we're after a dot (for method completion)
        const dotMatch = beforeCursor.match(/(\\w+)\\.$/) || beforeCursor.match(/(\\w+\\.\\w+)\\.$/) ;
        
        if (dotMatch) {
          // Provide method/property completions for specific objects
          const objectName = dotMatch[1];
          
          // Find elements that could be methods/properties of this object
          registryData.elements.forEach((element: any) => {
            if (element.type === 'class' && element.name.toLowerCase().includes(objectName.toLowerCase())) {
              // Add methods if available
              if (element.methods) {
                element.methods.forEach((method: any) => {
                  const params = method.parameters 
                    ? method.parameters.map((p: any) => `${p.name}: ${p.type}`).join(', ')
                    : '';
                  
                  suggestions.push({
                    label: method.name,
                    kind: monaco.languages.CompletionItemKind.Method,
                    detail: `${method.name}(${params}): ${method.returnType || 'void'}`,
                    documentation: method.description || `Method from ${element.name}`,
                    insertText: method.parameters 
                      ? `${method.name}(\\${1})`
                      : `${method.name}()`,
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    range,
                  });
                });
              }
              
              // Add properties if available
              if (element.properties) {
                element.properties.forEach((prop: any) => {
                  suggestions.push({
                    label: prop.name,
                    kind: monaco.languages.CompletionItemKind.Property,
                    detail: `${prop.name}: ${prop.type}`,
                    documentation: prop.description || `Property from ${element.name}`,
                    insertText: prop.name,
                    range,
                  });
                });
              }
            }
          });
        } else {
          // General completions - classes, functions, enums
          registryData.elements.forEach((element: any) => {
            const shouldInclude = !word.word || element.name.toLowerCase().includes(word.word.toLowerCase());
            
            if (shouldInclude) {
              let kind: Monaco.languages.CompletionItemKind;
              let detail = '';
              let insertText = element.name;
              
              switch (element.type) {
                case 'class':
                  kind = monaco.languages.CompletionItemKind.Class;
                  detail = `class ${element.name}`;
                  break;
                case 'interface':
                  kind = monaco.languages.CompletionItemKind.Interface;
                  detail = `interface ${element.name}`;
                  break;
                case 'enum':
                  kind = monaco.languages.CompletionItemKind.Enum;
                  detail = `enum ${element.name}`;
                  break;
                case 'function':
                  kind = monaco.languages.CompletionItemKind.Function;
                  const params = element.parameters 
                    ? element.parameters.map((p: any) => `${p.name}: ${p.type}`).join(', ')
                    : '';
                  detail = `function ${element.name}(${params})`;
                  insertText = element.parameters ? `${element.name}(\\${1})` : `${element.name}()`;
                  break;
                default:
                  kind = monaco.languages.CompletionItemKind.Variable;
                  detail = `${element.type} ${element.name}`;
              }
              
              suggestions.push({
                label: element.name,
                kind,
                detail: `${detail} - ${element.module}`,
                documentation: element.description || `${element.type} from ${element.module}`,
                insertText,
                insertTextRules: insertText.includes('${') 
                  ? monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet 
                  : undefined,
                range,
              });
            }
          });
          
          // Add common imports
          if (beforeCursor.includes('import')) {
            registryData.modules.forEach(moduleName => {
              suggestions.push({
                label: moduleName,
                kind: monaco.languages.CompletionItemKind.Module,
                detail: `Import from ${moduleName}`,
                documentation: `Minecraft module: ${moduleName}`,
                insertText: moduleName,
                range,
              });
            });
          }
        }

        return { suggestions };
      },
    });

    // Register the same provider for JavaScript
    monaco.languages.registerCompletionItemProvider('javascript', {
      provideCompletionItems: (model, position) => {
        return monaco.languages.getLanguages().find(lang => lang.id === 'typescript')
          ?.completionProvider?.provideCompletionItems?.(model, position) || { suggestions: [] };
      },
    });

    // Configure editor options for better experience
    editor.updateOptions({
      fontSize: 14,
      lineHeight: 20,
      fontFamily: 'JetBrains Mono, Consolas, Monaco, Courier New, monospace',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      roundedSelection: false,
      padding: { top: 16, bottom: 16 },
      suggest: {
        showIcons: true,
        showSnippets: true,
        showWords: true,
        showTypeParameters: true,
      },
      quickSuggestions: {
        other: true,
        comments: true,
        strings: true,
      },
      quickSuggestionsDelay: 100,
      suggestOnTriggerCharacters: true,
      acceptSuggestionOnEnter: 'on',
      tabCompletion: 'on',
      wordBasedSuggestions: 'allDocuments',
      parameterHints: {
        enabled: true,
        cycle: true,
      },
    });
  }, [registryData]);

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

  // Helper functions
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
      content: "// New Minecraft script\\nimport { world } from '@minecraft/server';\\n\\n",
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

  // Toggle functions
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

  // Export functionality
  const exportScript = (scriptId: string) => {
    const script = scripts.find(s => s.id === scriptId);
    if (!script) return;

    const blob = new Blob([script.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${script.name.replace(/\\s+/g, '_')}.${script.language === 'typescript' ? 'ts' : 'js'}`;
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

  const insertCode = (code: string) => {
    if (editorRef.current.editor) {
      const editor = editorRef.current.editor;
      const selection = editor.getSelection();
      const range = selection || editor.getModel()?.getFullModelRange();
      
      if (range) {
        editor.executeEdits('insert-code', [{
          range,
          text: code,
          forceMoveMarkers: true,
        }]);
        editor.focus();
      }
    }
  };

  return (
    <section className="h-full flex flex-col" data-testid="script-studio">
      {/* Header - Compact */}
      <div className="p-3 border-b bg-background">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">Script Studio</h2>
            <p className="text-xs text-muted-foreground">
              Professional Monaco Editor • {registryData.totalElements} API elements • VS Code-style autocomplete
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              data-testid="button-toggle-sidebar"
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              <span className="ml-1 hidden sm:inline">API</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditorExpanded(!editorExpanded)}
              data-testid="button-toggle-fullscreen"
            >
              {editorExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - Editor Prominent Layout */}
      <div className="flex-1 flex overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left Sidebar - API Browser (Collapsible) */}
          {!sidebarCollapsed && (
            <>
              <ResizablePanel defaultSize={25} minSize={15} maxSize={40}>
                <div className="h-full flex flex-col border-r bg-muted/20">
                  <div className="p-3 border-b">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-sm">API Browser</h3>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                          data-testid="button-toggle-advanced-search"
                        >
                          <Filter className="w-3 h-3" />
                        </Button>
                        <Badge variant="secondary" className="text-xs">{filteredElements.length}</Badge>
                      </div>
                    </div>

                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                      <Input
                        placeholder="Search APIs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-7 h-8 text-sm"
                        data-testid="input-api-search"
                      />
                    </div>

                    {showAdvancedSearch && (
                      <div className="mt-2 p-2 bg-muted rounded space-y-2">
                        <div>
                          <Label className="text-xs font-medium">Modules</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {registryData.modules.map(module => (
                              <Badge
                                key={module}
                                variant={filters.modules.includes(module) ? "default" : "outline"}
                                className="cursor-pointer text-xs h-5"
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
                      </div>
                    )}
                  </div>

                  <ScrollArea className="flex-1">
                    <div className="p-2 space-y-1">
                      {filteredElements.map((element: any) => (
                        <div
                          key={element.id}
                          className={cn(
                            "p-2 rounded cursor-pointer transition-colors hover:bg-muted",
                            selectedElement?.id === element.id ? "bg-accent" : ""
                          )}
                          onClick={() => selectElement(element)}
                          data-testid={`element-${element.name}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 min-w-0">
                              {getElementIcon(element.type)}
                              <span className="font-medium text-sm truncate">{element.name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Badge variant="outline" className="text-xs">
                                {element.type}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-5 h-5 p-0"
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
                          <div className="text-xs text-muted-foreground mt-1 truncate">
                            {element.module} • {element.description?.slice(0, 40)}...
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
            </>
          )}

          {/* Main Panel - Editor Focused */}
          <ResizablePanel defaultSize={sidebarCollapsed ? 100 : 75}>
            <div className="h-full flex flex-col">
              {/* Script Tabs - Compact */}
              <div className="flex items-center justify-between p-2 border-b bg-muted/10">
                <div className="flex items-center gap-1">
                  {scripts.map(script => (
                    <div key={script.id} className="flex items-center">
                      <Button
                        variant={script.id === activeScriptId ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setActiveScriptId(script.id)}
                        className="rounded-r-none h-8 text-xs"
                      >
                        {script.name}
                      </Button>
                      {scripts.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeScript(script.id)}
                          className="rounded-l-none border-l-0 px-1 h-8"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button variant="ghost" size="sm" onClick={addScript} className="h-8">
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-1">
                  <Select
                    value={activeScript.language}
                    onValueChange={(value: 'javascript' | 'typescript') => 
                      updateScript(activeScriptId, { language: value })
                    }
                  >
                    <SelectTrigger className="w-20 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="typescript">TS</SelectItem>
                      <SelectItem value="javascript">JS</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyScript(activeScriptId)}
                    data-testid="button-copy-script"
                    className="h-8"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => exportScript(activeScriptId)}
                    data-testid="button-export-script"
                    className="h-8"
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* Monaco Editor - PROMINENT POSITION */}
              <div className="flex-1 flex flex-col bg-editor">
                <div className="flex-1">
                  <Editor
                    height="100%"
                    defaultLanguage={activeScript.language}
                    language={activeScript.language}
                    value={activeScript.content}
                    onChange={(value) => updateScript(activeScriptId, { content: value || '' })}
                    onMount={setupMonacoEditor}
                    options={{
                      theme: 'vs-dark',
                      fontSize: 14,
                      lineHeight: 20,
                      fontFamily: 'JetBrains Mono, Consolas, Monaco, Courier New, monospace',
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      roundedSelection: false,
                      padding: { top: 16, bottom: 16 },
                      automaticLayout: true,
                    }}
                    data-testid="monaco-editor"
                  />
                </div>
              </div>

              {/* Bottom Panel - Documentation & Tools (Collapsible) */}
              {documentationOpen && (
                <>
                  <ResizableHandle withHandle />
                  <div className="h-48 border-t bg-muted/10">
                    <Tabs defaultValue="docs" className="h-full flex flex-col">
                      <TabsList className="grid w-full grid-cols-3 h-8">
                        <TabsTrigger value="docs" className="text-xs">
                          <Book className="w-3 h-3 mr-1" />
                          Docs
                        </TabsTrigger>
                        <TabsTrigger value="tools" className="text-xs">
                          <Zap className="w-3 h-3 mr-1" />
                          Tools
                        </TabsTrigger>
                        <TabsTrigger value="templates" className="text-xs">
                          <Settings className="w-3 h-3 mr-1" />
                          Templates
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="docs" className="flex-1 p-3 overflow-auto">
                        {selectedElement ? (
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                {getElementIcon(selectedElement.type)}
                                <div>
                                  <h4 className="font-semibold text-sm">{selectedElement.name}</h4>
                                  <p className="text-xs text-muted-foreground">{selectedElement.module}</p>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => insertCode(`${selectedElement.name}`)}
                                data-testid="button-insert-code"
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Insert
                              </Button>
                            </div>
                            <p className="text-sm">{selectedElement.element.description}</p>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Book className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Select an API element to view documentation</p>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="tools" className="flex-1 p-3">
                        <div className="text-center py-8">
                          <Terminal className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Code tools and utilities</p>
                        </div>
                      </TabsContent>

                      <TabsContent value="templates" className="flex-1 p-3 overflow-auto">
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            {
                              name: "Hello World",
                              code: `import { world } from '@minecraft/server';\\nworld.sendMessage("Hello!");`
                            },
                            {
                              name: "Player Events",
                              code: `import { world } from '@minecraft/server';\\nworld.afterEvents.playerJoin.subscribe((event) => {\\n  world.sendMessage(\`Welcome \${event.player.name}!\`);\\n});`
                            }
                          ].map((template, idx) => (
                            <Card key={idx} className="cursor-pointer hover:bg-muted/50" onClick={() => insertCode(template.code)}>
                              <CardHeader className="p-2">
                                <CardTitle className="text-xs">{template.name}</CardTitle>
                              </CardHeader>
                            </Card>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </>
              )}

              {/* Toggle Documentation Panel */}
              <div className="absolute bottom-2 right-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDocumentationOpen(!documentationOpen)}
                  className="h-8"
                >
                  {documentationOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </Button>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </section>
  );
}