import { useState, useMemo, useEffect } from "react";
import { Sparkles, Download, Copy, Save, RotateCcw, Info, Zap, AlertCircle, X, Settings, FileText, Layers } from "lucide-react";
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import CodePreview from "@/components/Common/CodePreview";
import ValidationStatus from "@/components/Common/ValidationStatus";
import ComponentSelector, { ComponentItem } from "@/components/Common/ComponentSelector";
import ComponentForm, { ComponentDefinition } from "@/components/Common/ComponentForm";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useToast } from "@/hooks/use-toast";
import { validateEntityJSON } from "@/lib/minecraft/validation";
import { 
  ComponentInstance, 
  generateComponentsJSON, 
  applyPreset, 
  getRecommendedComponents,
  checkComponentCompatibility,
  validateComponentProperties,
  ENTITY_PRESETS 
} from "@/lib/minecraft/componentUtils";

// Import the comprehensive entity registry
import { entityComponents } from "@shared/entityRegistry";
import ComponentIndex from "@shared/componentIndex";

export default function EntityBuilder() {
  const { toast } = useToast();

  // Basic entity properties
  const [identifier, setIdentifier] = useLocalStorage('entity-identifier', '');
  const [displayName, setDisplayName] = useLocalStorage('entity-display-name', '');
  const [description, setDescription] = useLocalStorage('entity-description', '');
  const [isSpawnable, setIsSpawnable] = useLocalStorage('entity-spawnable', true);
  const [isSummonable, setIsSummonable] = useLocalStorage('entity-summonable', true);
  const [isExperimental, setIsExperimental] = useLocalStorage('entity-experimental', false);

  // Component management
  const [components, setComponents] = useLocalStorage<ComponentInstance[]>('entity-components-v2', [
    {
      name: 'minecraft:health',
      enabled: true,
      properties: { value: 20, max: 20 },
      metadata: { addedAt: Date.now(), category: 'Core', difficulty: 'beginner' }
    },
    {
      name: 'minecraft:physics',
      enabled: true,
      properties: {},
      metadata: { addedAt: Date.now(), category: 'Core', difficulty: 'beginner' }
    }
  ]);

  // UI state
  const [activeTab, setActiveTab] = useState('basic');
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [showComponentSelector, setShowComponentSelector] = useState(false);
  const [showComponentForm, setShowComponentForm] = useState(false);
  const [editingComponent, setEditingComponent] = useState<ComponentInstance | null>(null);
  
  // Group current components by category
  const componentsByCategory = useMemo(() => {
    const grouped: Record<string, ComponentInstance[]> = {};
    components.forEach(comp => {
      const category = comp.metadata?.category || 'Other';
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(comp);
    });
    return grouped;
  }, [components]);

  // Convert registry components to ComponentItem format
  const availableComponents: ComponentItem[] = useMemo(() => {
    return entityComponents.map(comp => ({
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
  const entityJSON = useMemo(() => {
    const componentsJSON = generateComponentsJSON(components);
    
    return {
      format_version: "1.21.0",
      "minecraft:entity": {
        description: {
          identifier: identifier || "my_addon:custom_entity",
          is_spawnable: isSpawnable,
          is_summonable: isSummonable,
          is_experimental: isExperimental
        },
        component_groups: {},
        components: {
          "minecraft:type_family": {
            family: ["custom", "mob"]
          },
          "minecraft:collision_box": {
            width: 0.6,
            height: 1.8
          },
          ...componentsJSON
        },
        events: {}
      }
    };
  }, [identifier, isSpawnable, isSummonable, isExperimental, components]);

  const validation = validateEntityJSON(entityJSON);
  const recommendedComponents = getRecommendedComponents(components, availableComponents);

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

  const applyEntityPreset = (presetName: string) => {
    const presetComponents = applyPreset(presetName, 'entity', availableComponents);
    setComponents(presetComponents);
    
    toast({
      title: "Preset applied",
      description: `Applied ${presetName} preset with ${presetComponents.length} components.`
    });
  };

  const resetEntity = () => {
    setComponents([
      {
        name: 'minecraft:health',
        enabled: true,
        properties: { value: 20, max: 20 },
        metadata: { addedAt: Date.now(), category: 'Core', difficulty: 'beginner' }
      }
    ]);
    setIdentifier('');
    setDisplayName('');
    setDescription('');
    
    toast({
      title: "Entity reset",
      description: "Entity has been reset to default state."
    });
  };

  const exportToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(entityJSON, null, 2));
    toast({
      title: "Copied to clipboard",
      description: "Entity JSON has been copied to your clipboard."
    });
  };


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

  // Tab label functions
  const getComponentsTabLabel = () => {
    const enabledCount = components.filter(c => c.enabled).length;
    return `Components (${enabledCount})`;
  };

  const getAdvancedTabLabel = () => "Advanced";

  // Components display in categories
  const renderComponentsByCategory = () => (
    <div className="space-y-3">
      {Object.entries(componentsByCategory).map(([category, categoryComponents]) => (
        <Accordion key={category} type="single" collapsible>
          <AccordionItem value={category}>
            <AccordionTrigger className="text-sm">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                {category}
                <Badge variant="outline">{categoryComponents.length}</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pt-2">
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
                                <Zap className="w-3 h-3" />
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
        </Accordion>
      ))}
    </div>
  );


  return (
    <TooltipProvider>
      <section className="p-6" data-testid="entity-builder">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Builder Form */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Entity Configuration
                  </CardTitle>
                  <CardDescription>
                    Create comprehensive Minecraft Bedrock entities with all official components
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="basic" data-testid="tab-basic">Basic</TabsTrigger>
                      <TabsTrigger value="components" data-testid="tab-components">
                        {getComponentsTabLabel()}
                      </TabsTrigger>
                      <TabsTrigger value="presets" data-testid="tab-presets">Presets</TabsTrigger>
                      <TabsTrigger value="advanced" data-testid="tab-advanced">
                        {getAdvancedTabLabel()}
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="space-y-4">
                      <div className="grid gap-4">
                        <div>
                          <Label htmlFor="entity-identifier">Entity Identifier *</Label>
                          <Input
                            id="entity-identifier"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            placeholder="my_addon:custom_entity"
                            data-testid="input-identifier"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Must include namespace (e.g., my_addon:entity_name)
                          </p>
                        </div>

                        <div>
                          <Label htmlFor="entity-display-name">Display Name</Label>
                          <Input
                            id="entity-display-name"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Custom Entity"
                            data-testid="input-display-name"
                          />
                        </div>

                        <div>
                          <Label htmlFor="entity-description">Description</Label>
                          <Input
                            id="entity-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="A custom entity for my addon"
                            data-testid="input-description"
                          />
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="is-spawnable"
                              checked={isSpawnable}
                              onCheckedChange={setIsSpawnable}
                              data-testid="switch-spawnable"
                            />
                            <Label htmlFor="is-spawnable">Spawnable</Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Switch
                              id="is-summonable"
                              checked={isSummonable}
                              onCheckedChange={setIsSummonable}
                              data-testid="switch-summonable"
                            />
                            <Label htmlFor="is-summonable">Summonable</Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Switch
                              id="is-experimental"
                              checked={isExperimental}
                              onCheckedChange={setIsExperimental}
                              data-testid="switch-experimental"
                            />
                            <Label htmlFor="is-experimental">Experimental</Label>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="components" className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Entity Components</h4>
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
                                {recommendedComponents.slice(0, 3).map(comp => (
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
                        {renderComponentsByCategory()}
                      </ScrollArea>
                    </TabsContent>

                    <TabsContent value="presets" className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-3">Entity Presets</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          Quick start with common entity configurations
                        </p>
                        <div className="grid gap-3">
                          {Object.entries(ENTITY_PRESETS).map(([presetName, componentList]) => (
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
                                  onClick={() => applyEntityPreset(presetName)}
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
                          <h4 className="font-medium mb-3">Entity Actions</h4>
                          <div className="flex gap-2 mb-3">
                            <Button
                              variant="outline"
                              onClick={resetEntity}
                              data-testid="button-reset"
                            >
                              <RotateCcw className="w-4 h-4 mr-2" />
                              Reset Entity
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
                          <p className="text-xs text-muted-foreground">
                            Reset will clear all components and properties. Copy JSON exports the current entity configuration.
                          </p>
                        </div>

                        <div>
                          <h4 className="font-medium mb-3">Validation Status</h4>
                          <ValidationStatus validation={validation} />
                        </div>

                        <div>
                          <h4 className="font-medium mb-3">Export Options</h4>
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            <Button variant="outline" size="sm">
                              <Download className="w-3 h-3 mr-2" />
                              Download .json
                            </Button>
                            <Button variant="outline" size="sm">
                              <Save className="w-3 h-3 mr-2" />
                              Save Template
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Export your entity as a .json file or save as a reusable template.
                          </p>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* JSON Preview */}
            <div className="space-y-6">
              <CodePreview 
                code={JSON.stringify(entityJSON, null, 2)}
                language="json"
                title="Entity JSON"
              />
            </div>
          </div>
        </div>

        {/* Component Selector Modal */}
        <Dialog open={showComponentSelector} onOpenChange={setShowComponentSelector}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden" data-testid="component-selector-modal">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                Add Entity Components
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowComponentSelector(false)}
                  data-testid="button-close-selector-x"
                >
                  <X className="w-4 h-4" />
                </Button>
              </DialogTitle>
              <DialogDescription>
                Choose from 50+ official Minecraft Bedrock entity components
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh]">
              <ComponentSelector
                components={availableComponents}
                selectedComponents={selectedComponentNames}
                onAddComponent={addComponent}
                onRemoveComponent={removeComponent}
                title="Add Entity Components"
                description="Choose from 50+ official Minecraft Bedrock entity components"
                showCategories={true}
                showCompatibility={true}
              />
            </ScrollArea>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setShowComponentSelector(false)}
                data-testid="button-close-selector"
              >
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Component Form Modal */}
        <Dialog open={showComponentForm && !!editingComponent} onOpenChange={(open) => {
          if (!open) {
            setShowComponentForm(false);
            setEditingComponent(null);
          }
        }}>
          <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden" data-testid="component-form-modal">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                Configure Component: {editingComponent?.name}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setShowComponentForm(false);
                    setEditingComponent(null);
                  }}
                  data-testid="button-close-form-x"
                >
                  <X className="w-4 h-4" />
                </Button>
              </DialogTitle>
              <DialogDescription>
                Configure the properties for this component
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[75vh] pr-4">
              {(() => {
                if (!editingComponent) return null;
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
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </section>
    </TooltipProvider>
  );
}