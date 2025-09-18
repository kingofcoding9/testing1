import { useState, useMemo } from "react";
import { Package, Download, Copy, Save, RotateCcw, Info, Zap, AlertCircle, Settings, FileText, Layers, Box, Cog } from "lucide-react";
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
import { validateItemJSON } from "@/lib/minecraft/validation";
import { 
  ComponentInstance, 
  generateComponentsJSON, 
  applyPreset, 
  getRecommendedComponents,
  checkComponentCompatibility,
  validateComponentProperties,
  ITEM_PRESETS 
} from "@/lib/minecraft/componentUtils";

// Import the comprehensive item registry
import { itemComponents } from "@shared/itemRegistry";

export default function ItemBuilder() {
  const { toast } = useToast();

  // Basic item properties
  const [identifier, setIdentifier] = useLocalStorage('item-identifier', '');
  const [displayName, setDisplayName] = useLocalStorage('item-display-name', '');
  const [description, setDescription] = useLocalStorage('item-description', '');
  const [menuCategory, setMenuCategory] = useLocalStorage('item-menu-category', 'items');

  // Component management
  const [components, setComponents] = useLocalStorage<ComponentInstance[]>('item-components-v2', [
    {
      name: 'minecraft:max_stack_size',
      enabled: true,
      properties: { value: 64 },
      metadata: { addedAt: Date.now(), category: 'Core', difficulty: 'beginner' }
    },
    {
      name: 'minecraft:icon',
      enabled: true,
      properties: { texture: "custom_item" },
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
    return itemComponents.map(comp => ({
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
  const itemJSON = useMemo(() => {
    const componentsJSON = generateComponentsJSON(components);
    
    return {
      format_version: "1.21.0",
      "minecraft:item": {
        description: {
          identifier: identifier || "my_addon:custom_item",
          menu_category: {
            category: menuCategory
          }
        },
        components: componentsJSON
      }
    };
  }, [identifier, menuCategory, components]);

  const validation = validateItemJSON(itemJSON);
  const recommendedComponents = getRecommendedComponents(components, availableComponents, 3);

  // Menu categories
  const menuCategories = [
    { value: 'items', label: 'Items' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'construction', label: 'Construction' },
    { value: 'nature', label: 'Nature' }
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

  const applyItemPreset = (presetName: string) => {
    const presetComponents = applyPreset(presetName, 'item', availableComponents);
    setComponents(presetComponents);
    
    toast({
      title: "Preset applied",
      description: `Applied ${presetName} preset with ${presetComponents.length} components.`
    });
  };

  const resetItem = () => {
    setComponents([
      {
        name: 'minecraft:max_stack_size',
        enabled: true,
        properties: { value: 64 },
        metadata: { addedAt: Date.now(), category: 'Core', difficulty: 'beginner' }
      }
    ]);
    setIdentifier('');
    setDisplayName('');
    setDescription('');
    
    toast({
      title: "Item reset",
      description: "Item has been reset to default state."
    });
  };

  const exportToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(itemJSON, null, 2));
    toast({
      title: "Copied to clipboard",
      description: "Item JSON has been copied to your clipboard."
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

  // Tabs configuration
  const getComponentsTabLabel = () => {
    const enabledCount = components.filter(c => c.enabled).length;
    return `Components (${enabledCount})`;
  };

  const getAdvancedTabLabel = () => "Advanced";

  const tabsConfig = [
    {
      id: 'basic',
      title: 'Basic',
      icon: <Settings className="w-4 h-4" />,
      description: 'Item identifier and basic settings',
      content: (
        <div className="space-y-4">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="item-identifier">Item Identifier *</Label>
              <Input
                id="item-identifier"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="my_addon:custom_item"
                data-testid="input-identifier"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Must include namespace (e.g., my_addon:item_name)
              </p>
            </div>

            <div>
              <Label htmlFor="item-display-name">Display Name</Label>
              <Input
                id="item-display-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Custom Item"
                data-testid="input-display-name"
              />
            </div>

            <div>
              <Label htmlFor="item-description">Description</Label>
              <Input
                id="item-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A custom item for my addon"
                data-testid="input-description"
              />
            </div>

            <div>
              <Label htmlFor="menu-category">Menu Category</Label>
              <Select value={menuCategory} onValueChange={setMenuCategory}>
                <SelectTrigger data-testid="select-menu-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {menuCategories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'components',
      title: 'Components',
      badge: components.length,
      icon: <Layers className="w-4 h-4" />,
      description: 'Manage item components and their properties',
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Item Components</h4>
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
        </div>
      ),
    },
    {
      id: 'presets',
      title: 'Presets',
      icon: <Zap className="w-4 h-4" />,
      description: 'Quick start with common item configurations',
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-3">Item Presets</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Quick start with common item configurations
            </p>
            <div className="grid gap-3">
              {Object.entries(ITEM_PRESETS).map(([presetName, componentList]) => (
                <Card key={presetName} className="p-4 cursor-pointer hover:bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium capitalize">
                        {presetName.replace(/_/g, ' ')}
                      </h5>
                      <p className="text-xs text-muted-foreground">
                        {componentList.length} components
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {presetName === 'basic_item' && 'Simple stackable item'}
                        {presetName === 'food_item' && 'Consumable food with nutrition'}
                        {presetName === 'tool_item' && 'Durable tool with mining capability'}
                        {presetName === 'weapon_item' && 'Combat weapon with damage'}
                        {presetName === 'armor_item' && 'Wearable protection gear'}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => applyItemPreset(presetName)}
                      data-testid={`button-preset-${presetName}`}
                    >
                      Apply
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'advanced',
      title: 'Advanced',
      icon: <FileText className="w-4 h-4" />,
      description: 'Advanced configuration and statistics',
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Actions</h4>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={resetItem}
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

          <div className="space-y-3">
            <h4 className="font-medium">Component Statistics</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-muted p-3 rounded">
                <div className="font-medium">Total Components</div>
                <div className="text-2xl font-bold">{components.length}</div>
              </div>
              <div className="bg-muted p-3 rounded">
                <div className="font-medium">Enabled Components</div>
                <div className="text-2xl font-bold">{components.filter(c => c.enabled).length}</div>
              </div>
            </div>
          </div>

          <ValidationStatus validation={validation} />
        </div>
      ),
    },
  ];

  return (
    <TooltipProvider>
      <section className="p-6" data-testid="item-builder">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Builder Form */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Item Configuration
                  </CardTitle>
                  <CardDescription>
                    Create comprehensive Minecraft Bedrock items with all official components
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="basic" className="space-y-4" data-testid="item-builder-tabs">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="basic" className="flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Basic
                      </TabsTrigger>
                      <TabsTrigger value="components" className="flex items-center gap-2">
                        <Box className="w-4 h-4" />
                        {getComponentsTabLabel()}
                      </TabsTrigger>
                      <TabsTrigger value="advanced" className="flex items-center gap-2">
                        <Cog className="w-4 h-4" />
                        {getAdvancedTabLabel()}
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="space-y-4">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="item-identifier">Item Identifier *</Label>
                          <Input
                            id="item-identifier"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            placeholder="my_addon:custom_item"
                            data-testid="input-identifier"
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="components" className="space-y-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Item Components</h4>
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
                      </div>
                    </TabsContent>

                    <TabsContent value="advanced" className="space-y-4">
                      <div className="space-y-4">
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
                code={JSON.stringify(itemJSON, null, 2)}
                language="json"
                title="Item JSON"
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
                title="Add Item Components"
                description="Choose from 25+ official Minecraft Bedrock item components"
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