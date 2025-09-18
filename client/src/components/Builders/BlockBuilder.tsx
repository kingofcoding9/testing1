import { useState, useMemo } from "react";
import { Package, Download, Copy, Save, RotateCcw, Info, Zap, AlertCircle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import CodePreview from "@/components/Common/CodePreview";
import ValidationStatus from "@/components/Common/ValidationStatus";
import ComponentSelector, { ComponentItem } from "@/components/Common/ComponentSelector";
import ComponentForm, { ComponentDefinition } from "@/components/Common/ComponentForm";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useToast } from "@/hooks/use-toast";
import { validateBlockJSON } from "@/lib/minecraft/validation";
import { 
  ComponentInstance, 
  generateComponentsJSON, 
  applyPreset, 
  getRecommendedComponents,
  checkComponentCompatibility,
  validateComponentProperties,
  BLOCK_PRESETS 
} from "@/lib/minecraft/componentUtils";

// Import the comprehensive block registry
import { blockComponents } from "@shared/blockRegistry";

export default function BlockBuilder() {
  const { toast } = useToast();

  // Basic block properties
  const [identifier, setIdentifier] = useLocalStorage('block-identifier', '');
  const [displayName, setDisplayName] = useLocalStorage('block-display-name', '');
  const [description, setDescription] = useLocalStorage('block-description', '');
  const [registerToCreative, setRegisterToCreative] = useLocalStorage('block-creative', true);
  const [creativeCategory, setCreativeCategory] = useLocalStorage('block-category', 'construction');

  // Component management
  const [components, setComponents] = useLocalStorage<ComponentInstance[]>('block-components-v2', [
    {
      name: 'minecraft:destructible_by_mining',
      enabled: true,
      properties: { seconds_to_destroy: 1.5 },
      metadata: { addedAt: Date.now(), category: 'Core', difficulty: 'beginner' }
    },
    {
      name: 'minecraft:destructible_by_explosion',
      enabled: true,
      properties: { explosion_resistance: 6.0 },
      metadata: { addedAt: Date.now(), category: 'Core', difficulty: 'beginner' }
    },
    {
      name: 'minecraft:material_instances',
      enabled: true,
      properties: {
        "*": {
          texture: "custom_block",
          render_method: "opaque"
        }
      },
      metadata: { addedAt: Date.now(), category: 'Visual', difficulty: 'beginner' }
    }
  ]);

  // UI state
  const [activeTab, setActiveTab] = useState('basic');
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [showComponentSelector, setShowComponentSelector] = useState(false);
  const [showComponentForm, setShowComponentForm] = useState(false);
  const [editingComponent, setEditingComponent] = useState<ComponentInstance | null>(null);

  // Convert registry components to ComponentItem format
  const availableComponents: ComponentItem[] = useMemo(() => {
    return blockComponents.map(comp => ({
      name: comp.name,
      description: comp.description,
      category: comp.category,
      subcategory: comp.subcategory,
      version: comp.version,
      difficulty: comp.difficulty,
      properties: comp.properties,
      example: comp.example,
      keywords: comp.keywords,
      stability: comp.stability,
      dependencies: comp.dependencies,
      conflicts: comp.conflicts
    }));
  }, []);

  // Get selected component names for ComponentSelector
  const selectedComponentNames = components.map(c => c.name);

  // Generate JSON
  const blockJSON = useMemo(() => {
    const componentsJSON = generateComponentsJSON(components);
    
    return {
      format_version: "1.21.0",
      "minecraft:block": {
        description: {
          identifier: identifier || "my_addon:custom_block",
          register_to_creative_menu: registerToCreative,
          ...(registerToCreative && {
            menu_category: {
              category: creativeCategory
            }
          })
        },
        components: componentsJSON
      }
    };
  }, [identifier, registerToCreative, creativeCategory, components]);

  const validation = validateBlockJSON(blockJSON);
  const recommendedComponents = getRecommendedComponents(components, availableComponents, 3);

  // Creative menu categories
  const creativeCategories = [
    { value: 'construction', label: 'Construction' },
    { value: 'nature', label: 'Nature' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'items', label: 'Items' }
  ];

  // Component management functions
  const addComponent = (componentName: string) => {
    const componentDef = availableComponents.find(c => c.name === componentName);
    if (!componentDef) return;

    // Check compatibility
    const compatibility = checkComponentCompatibility(componentDef, components, availableComponents);
    if (!compatibility.compatible) {
      toast({
        title: "Cannot add component",
        description: compatibility.issues.join(', '),
        variant: "destructive"
      });
      return;
    }

    // Generate default properties
    const defaultProperties: Record<string, any> = {};
    componentDef.properties.forEach(prop => {
      if (prop.default !== undefined) {
        defaultProperties[prop.name] = prop.default;
      } else {
        switch (prop.type) {
          case 'number':
            defaultProperties[prop.name] = prop.min ?? prop.example ?? 0;
            break;
          case 'boolean':
            defaultProperties[prop.name] = prop.example ?? false;
            break;
          case 'string':
            defaultProperties[prop.name] = prop.options?.[0] ?? prop.example ?? '';
            break;
          case 'range':
            defaultProperties[prop.name] = prop.example ?? { min: 0, max: 1 };
            break;
          case 'vector3':
            defaultProperties[prop.name] = prop.example ?? { x: 0, y: 0, z: 0 };
            break;
          case 'array':
            defaultProperties[prop.name] = prop.example ?? [];
            break;
          case 'object':
            defaultProperties[prop.name] = prop.example ?? {};
            break;
        }
      }
    });

    const newComponent: ComponentInstance = {
      name: componentName,
      enabled: true,
      properties: defaultProperties,
      metadata: {
        addedAt: Date.now(),
        category: componentDef.category,
        difficulty: componentDef.difficulty
      }
    };

    setComponents([...components, newComponent]);
    setShowComponentSelector(false);

    // Show warnings if any
    if (compatibility.warnings.length > 0) {
      toast({
        title: "Component added with warnings",
        description: compatibility.warnings.join(', '),
        variant: "default"
      });
    }
  };

  const removeComponent = (componentName: string) => {
    setComponents(components.filter(c => c.name !== componentName));
    if (selectedComponent === componentName) {
      setSelectedComponent(null);
    }
  };

  const updateComponent = (componentName: string, newProperties: Record<string, any>) => {
    setComponents(components.map(comp => 
      comp.name === componentName 
        ? { ...comp, properties: newProperties }
        : comp
    ));
  };

  const toggleComponent = (componentName: string) => {
    setComponents(components.map(comp =>
      comp.name === componentName 
        ? { ...comp, enabled: !comp.enabled }
        : comp
    ));
  };

  const openComponentForm = (component: ComponentInstance) => {
    setEditingComponent(component);
    setShowComponentForm(true);
  };

  const handleComponentFormSubmit = (values: Record<string, any>) => {
    if (editingComponent) {
      updateComponent(editingComponent.name, values);
      setShowComponentForm(false);
      setEditingComponent(null);
      
      toast({
        title: "Component updated",
        description: `${editingComponent.name} has been updated successfully.`
      });
    }
  };

  const applyBlockPreset = (presetName: string) => {
    const presetComponents = applyPreset(presetName, 'block', availableComponents);
    setComponents(presetComponents);
    
    toast({
      title: "Preset applied",
      description: `Applied ${presetName} preset with ${presetComponents.length} components.`
    });
  };

  const resetBlock = () => {
    setComponents([
      {
        name: 'minecraft:destructible_by_mining',
        enabled: true,
        properties: { seconds_to_destroy: 1.5 },
        metadata: { addedAt: Date.now(), category: 'Core', difficulty: 'beginner' }
      }
    ]);
    setIdentifier('');
    setDisplayName('');
    setDescription('');
    
    toast({
      title: "Block reset",
      description: "Block has been reset to default state."
    });
  };

  const exportToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(blockJSON, null, 2));
    toast({
      title: "Copied to clipboard",
      description: "Block JSON has been copied to your clipboard."
    });
  };

  const componentsByCategory = useMemo(() => {
    const grouped: Record<string, ComponentInstance[]> = {};
    components.forEach(comp => {
      const category = comp.metadata?.category || 'Other';
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(comp);
    });
    return grouped;
  }, [components]);

  const getComponentDefinition = (componentName: string): ComponentDefinition | null => {
    const def = availableComponents.find(c => c.name === componentName);
    if (!def) return null;
    
    return {
      name: def.name,
      description: def.description,
      category: def.category,
      subcategory: def.subcategory,
      version: def.version,
      difficulty: def.difficulty,
      properties: def.properties,
      example: def.example,
      keywords: def.keywords,
      stability: def.stability,
      dependencies: def.dependencies,
      conflicts: def.conflicts
    };
  };

  return (
    <TooltipProvider>
      <section className="p-6" data-testid="block-builder">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Builder Form */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Block Configuration
                  </CardTitle>
                  <CardDescription>
                    Create comprehensive Minecraft Bedrock blocks with all official components
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="basic" data-testid="tab-basic">Basic</TabsTrigger>
                      <TabsTrigger value="components" data-testid="tab-components">
                        Components ({components.length})
                      </TabsTrigger>
                      <TabsTrigger value="presets" data-testid="tab-presets">Presets</TabsTrigger>
                      <TabsTrigger value="advanced" data-testid="tab-advanced">Advanced</TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="space-y-4">
                      <div className="grid gap-4">
                        <div>
                          <Label htmlFor="block-identifier">Block Identifier *</Label>
                          <Input
                            id="block-identifier"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            placeholder="my_addon:custom_block"
                            data-testid="input-identifier"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Must include namespace (e.g., my_addon:block_name)
                          </p>
                        </div>

                        <div>
                          <Label htmlFor="block-display-name">Display Name</Label>
                          <Input
                            id="block-display-name"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Custom Block"
                            data-testid="input-display-name"
                          />
                        </div>

                        <div>
                          <Label htmlFor="block-description">Description</Label>
                          <Input
                            id="block-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="A custom block for my addon"
                            data-testid="input-description"
                          />
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="register-creative"
                              checked={registerToCreative}
                              onCheckedChange={setRegisterToCreative}
                              data-testid="switch-creative"
                            />
                            <Label htmlFor="register-creative">Register to Creative Menu</Label>
                          </div>

                          {registerToCreative && (
                            <div>
                              <Label htmlFor="creative-category">Creative Category</Label>
                              <Select value={creativeCategory} onValueChange={setCreativeCategory}>
                                <SelectTrigger data-testid="select-creative-category">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {creativeCategories.map(cat => (
                                    <SelectItem key={cat.value} value={cat.value}>
                                      {cat.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="components" className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Block Components</h4>
                        <Button 
                          onClick={() => setShowComponentSelector(true)}
                          data-testid="button-add-component"
                        >
                          Add Component
                        </Button>
                      </div>

                      {recommendedComponents.length > 0 && (
                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertDescription>
                            <div className="space-y-2">
                              <p className="font-medium">Recommended components:</p>
                              <div className="flex flex-wrap gap-1">
                                {recommendedComponents.map(comp => (
                                  <Button
                                    key={comp.name}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addComponent(comp.name)}
                                    data-testid={`button-add-recommended-${comp.name}`}
                                  >
                                    {comp.name}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          </AlertDescription>
                        </Alert>
                      )}

                      <ScrollArea className="h-[400px]">
                        <Accordion type="single" collapsible className="space-y-2">
                          {Object.entries(componentsByCategory).map(([category, categoryComponents]) => (
                            <AccordionItem key={category} value={category}>
                              <AccordionTrigger className="text-sm" data-testid={`accordion-${category}`}>
                                {category} ({categoryComponents.length})
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-2">
                                  {categoryComponents.map((component) => {
                                    const def = getComponentDefinition(component.name);
                                    return (
                                      <Card key={component.name} className="p-3">
                                        <div className="flex items-start justify-between gap-2">
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                              <Switch
                                                checked={component.enabled}
                                                onCheckedChange={() => toggleComponent(component.name)}
                                                data-testid={`switch-${component.name}`}
                                              />
                                              <span className="font-medium text-sm truncate">
                                                {component.name}
                                              </span>
                                              {def && (
                                                <Badge 
                                                  variant="outline" 
                                                  className={`text-xs ${
                                                    def.difficulty === 'beginner' ? 'border-green-500' :
                                                    def.difficulty === 'intermediate' ? 'border-yellow-500' :
                                                    'border-red-500'
                                                  }`}
                                                >
                                                  {def.difficulty}
                                                </Badge>
                                              )}
                                            </div>
                                            {def && (
                                              <p className="text-xs text-muted-foreground line-clamp-2">
                                                {def.description}
                                              </p>
                                            )}
                                          </div>
                                          <div className="flex gap-1">
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={() => openComponentForm(component)}
                                                  disabled={!component.enabled}
                                                  data-testid={`button-configure-${component.name}`}
                                                >
                                                  <Settings className="w-3 h-3" />
                                                </Button>
                                              </TooltipTrigger>
                                              <TooltipContent>Configure properties</TooltipContent>
                                            </Tooltip>
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={() => removeComponent(component.name)}
                                                  data-testid={`button-remove-${component.name}`}
                                                >
                                                  <AlertCircle className="w-3 h-3" />
                                                </Button>
                                              </TooltipTrigger>
                                              <TooltipContent>Remove component</TooltipContent>
                                            </Tooltip>
                                          </div>
                                        </div>
                                      </Card>
                                    );
                                  })}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </ScrollArea>
                    </TabsContent>

                    <TabsContent value="presets" className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-3">Block Presets</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          Quick start with common block configurations
                        </p>
                        <div className="grid gap-3">
                          {Object.entries(BLOCK_PRESETS).map(([presetName, componentList]) => (
                            <Card key={presetName} className="p-4 cursor-pointer hover:bg-muted/50">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h5 className="font-medium capitalize">
                                    {presetName.replace(/_/g, ' ')}
                                  </h5>
                                  <p className="text-xs text-muted-foreground">
                                    {componentList.length} components
                                  </p>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => applyBlockPreset(presetName)}
                                  data-testid={`button-preset-${presetName}`}
                                >
                                  Apply
                                </Button>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="advanced" className="space-y-4">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Actions</h4>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              onClick={resetBlock}
                              data-testid="button-reset"
                            >
                              <RotateCcw className="w-4 h-4 mr-2" />
                              Reset
                            </Button>
                            <Button
                              variant="outline"
                              onClick={exportToClipboard}
                              data-testid="button-export"
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Copy JSON
                            </Button>
                          </div>
                        </div>

                        <ValidationStatus validation={validation} />
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* JSON Preview */}
            <div className="space-y-6">
              <CodePreview 
                code={JSON.stringify(blockJSON, null, 2)}
                language="json"
                title="Block JSON"
                validation={validation}
              />
            </div>
          </div>
        </div>

        {/* Component Selector Modal */}
        {showComponentSelector && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <ComponentSelector
                components={availableComponents}
                selectedComponents={selectedComponentNames}
                onAddComponent={addComponent}
                onRemoveComponent={removeComponent}
                title="Add Block Components"
                description="Choose from 25+ official Minecraft Bedrock block components"
                showCategories={true}
                showCompatibility={true}
              />
              <div className="p-4 border-t flex justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setShowComponentSelector(false)}
                  data-testid="button-close-selector"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Component Form Modal */}
        {showComponentForm && editingComponent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
              {(() => {
                const def = getComponentDefinition(editingComponent.name);
                return def ? (
                  <ComponentForm
                    component={def}
                    initialValues={editingComponent.properties}
                    onSubmit={handleComponentFormSubmit}
                    onCancel={() => {
                      setShowComponentForm(false);
                      setEditingComponent(null);
                    }}
                    isEditing={true}
                    showExample={true}
                  />
                ) : null;
              })()}
            </div>
          </div>
        )}
      </section>
    </TooltipProvider>
  );
}