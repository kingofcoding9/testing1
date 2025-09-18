import { useState, useMemo } from "react";
import { Mountain, Download, Copy, Save, RotateCcw, Info, Settings, AlertCircle, FileText, Plus, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { useCollapsible } from "@/hooks/useCollapsible";
import { CollapsibleSection, CollapsibleGroup } from "@/components/ui/collapsible-section";
import { validateBiomeJSON } from "@/lib/minecraft/validation";
import { 
  ComponentInstance, 
  generateComponentsJSON, 
  applyPreset, 
  getRecommendedComponents,
  checkComponentCompatibility,
  validateComponentProperties 
} from "@/lib/minecraft/componentUtils";

// Import the comprehensive biome and spawn rule registries
import { biomeComponents, spawnRuleComponents, generateBiomeJSON, generateSpawnRulesJSON } from "@shared/gameplayRegistry";

interface SpawnEntity {
  type: string;
  weight: number;
  minGroupSize: number;
  maxGroupSize: number;
  components: ComponentInstance[];
}

export default function BiomeBuilder() {
  const { toast } = useToast();

  // Basic biome properties
  const [identifier, setIdentifier] = useLocalStorage('biome-identifier-v2', '');
  const [displayName, setDisplayName] = useLocalStorage('biome-display-name-v2', '');
  const [description, setDescription] = useLocalStorage('biome-description-v2', '');

  // Component management for biome
  const [biomeComponentInstances, setBiomeComponentInstances] = useLocalStorage<ComponentInstance[]>('biome-components-v2', [
    {
      name: 'minecraft:climate',
      enabled: true,
      properties: { temperature: 0.8, downfall: 0.4 },
      metadata: { addedAt: Date.now(), category: 'Climate', difficulty: 'intermediate' }
    },
    {
      name: 'minecraft:surface_parameters',
      enabled: true,
      properties: { 
        top_material: 'minecraft:grass',
        mid_material: 'minecraft:dirt'
      },
      metadata: { addedAt: Date.now(), category: 'Surface', difficulty: 'advanced' }
    }
  ]);

  // Spawn entity management
  const [spawnEntities, setSpawnEntities] = useLocalStorage<SpawnEntity[]>('biome-spawn-entities-v2', [
    {
      type: 'minecraft:cow',
      weight: 10,
      minGroupSize: 4,
      maxGroupSize: 4,
      components: [
        {
          name: 'minecraft:spawns_on_surface',
          enabled: true,
          properties: {},
          metadata: { addedAt: Date.now(), category: 'Surface', difficulty: 'intermediate' }
        },
        {
          name: 'minecraft:weight',
          enabled: true,
          properties: { default: 10 },
          metadata: { addedAt: Date.now(), category: 'Probability', difficulty: 'beginner' }
        }
      ]
    }
  ]);

  // UI state
  const [activeTab, setActiveTab] = useState('basic');
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [showComponentSelector, setShowComponentSelector] = useState(false);
  const [showComponentForm, setShowComponentForm] = useState(false);
  const [editingComponent, setEditingComponent] = useState<ComponentInstance | null>(null);
  const [componentTargetType, setComponentTargetType] = useState<'biome' | 'spawn'>('biome');
  const [selectedEntityIndex, setSelectedEntityIndex] = useState<number>(0);

  // Convert registry components to ComponentItem format
  const availableBiomeComponents: ComponentItem[] = useMemo(() => {
    return biomeComponents.map(comp => ({
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

  const availableSpawnComponents: ComponentItem[] = useMemo(() => {
    return spawnRuleComponents.map(comp => ({
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

  // Get selected component names
  const selectedBiomeComponentNames = biomeComponentInstances.map(c => c.name);

  // Generate JSON for biome
  const biomeJSON = useMemo(() => {
    const componentsJSON = generateComponentsJSON(biomeComponentInstances);
    
    return {
      format_version: "1.21.0",
      "minecraft:biome": {
        description: {
          identifier: identifier || "my_addon:custom_biome"
        },
        components: componentsJSON
      }
    };
  }, [identifier, biomeComponentInstances]);

  // Generate JSON for spawn rules
  const spawnRulesJSON = useMemo(() => {
    if (spawnEntities.length === 0) return null;

    const spawnRules = spawnEntities.map(entity => {
      const entityComponents = generateComponentsJSON(entity.components);
      
      return {
        description: {
          identifier: `${identifier || "my_addon:custom_biome"}_${entity.type.replace('minecraft:', '')}_spawn`
        },
        conditions: [
          {
            ...entityComponents,
            "minecraft:permute_type": [
              {
                entity_type: entity.type,
                weight: entity.weight,
                min_count: entity.minGroupSize,
                max_count: entity.maxGroupSize
              }
            ]
          }
        ]
      };
    });

    return {
      format_version: "1.21.0",
      "minecraft:spawn_rules": spawnRules
    };
  }, [identifier, spawnEntities]);

  const biomeValidation = validateBiomeJSON(biomeJSON);
  const spawnValidation = spawnRulesJSON ? validateBiomeJSON(spawnRulesJSON) : { isValid: true, errors: [] };

  const recommendedBiomeComponents = getRecommendedComponents(biomeComponentInstances, availableBiomeComponents, 3);

  // Component management functions
  const addBiomeComponent = (componentName: string) => {
    const componentDef = availableBiomeComponents.find(c => c.name === componentName);
    if (!componentDef) return;

    // Check compatibility
    const compatibility = checkComponentCompatibility(componentDef, biomeComponentInstances, availableBiomeComponents);
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

    setBiomeComponentInstances([...biomeComponentInstances, newComponent]);
    setShowComponentSelector(false);

    toast({
      title: "Component added",
      description: `${componentName} has been added to the biome.`
    });
  };

  const removeBiomeComponent = (componentName: string) => {
    setBiomeComponentInstances(biomeComponentInstances.filter(c => c.name !== componentName));
  };

  const updateBiomeComponent = (componentName: string, newProperties: Record<string, any>) => {
    setBiomeComponentInstances(biomeComponentInstances.map(comp => 
      comp.name === componentName 
        ? { ...comp, properties: newProperties }
        : comp
    ));
  };

  const toggleBiomeComponent = (componentName: string) => {
    setBiomeComponentInstances(biomeComponentInstances.map(comp =>
      comp.name === componentName 
        ? { ...comp, enabled: !comp.enabled }
        : comp
    ));
  };

  // Spawn entity management
  const addSpawnEntity = () => {
    const newEntity: SpawnEntity = {
      type: 'minecraft:cow',
      weight: 10,
      minGroupSize: 1,
      maxGroupSize: 4,
      components: [
        {
          name: 'minecraft:spawns_on_surface',
          enabled: true,
          properties: {},
          metadata: { addedAt: Date.now(), category: 'Surface', difficulty: 'intermediate' }
        }
      ]
    };
    setSpawnEntities([...spawnEntities, newEntity]);
  };

  const removeSpawnEntity = (index: number) => {
    setSpawnEntities(spawnEntities.filter((_, i) => i !== index));
    if (selectedEntityIndex >= spawnEntities.length - 1) {
      setSelectedEntityIndex(Math.max(0, index - 1));
    }
  };

  const updateSpawnEntity = (index: number, updates: Partial<SpawnEntity>) => {
    setSpawnEntities(spawnEntities.map((entity, i) => 
      i === index ? { ...entity, ...updates } : entity
    ));
  };

  const openComponentForm = (component: ComponentInstance) => {
    setEditingComponent(component);
    setShowComponentForm(true);
  };

  const handleComponentFormSubmit = (values: Record<string, any>) => {
    if (editingComponent) {
      if (componentTargetType === 'biome') {
        updateBiomeComponent(editingComponent.name, values);
      } else {
        // Update spawn component for selected entity
        const entity = spawnEntities[selectedEntityIndex];
        const updatedComponents = entity.components.map(comp =>
          comp.name === editingComponent.name ? { ...comp, properties: values } : comp
        );
        updateSpawnEntity(selectedEntityIndex, { components: updatedComponents });
      }
      
      setShowComponentForm(false);
      setEditingComponent(null);
      
      toast({
        title: "Component updated",
        description: `${editingComponent.name} has been updated successfully.`
      });
    }
  };

  const resetBiome = () => {
    setBiomeComponentInstances([
      {
        name: 'minecraft:climate',
        enabled: true,
        properties: { temperature: 0.8, downfall: 0.4 },
        metadata: { addedAt: Date.now(), category: 'Climate', difficulty: 'intermediate' }
      }
    ]);
    setSpawnEntities([]);
    setIdentifier('');
    setDisplayName('');
    setDescription('');
    
    toast({
      title: "Biome reset",
      description: "Biome has been reset to default state."
    });
  };

  const exportToClipboard = (content: any, type: string) => {
    navigator.clipboard.writeText(JSON.stringify(content, null, 2));
    toast({
      title: "Copied to clipboard",
      description: `${type} JSON has been copied to your clipboard.`
    });
  };

  const biomeComponentsByCategory = useMemo(() => {
    const grouped: Record<string, ComponentInstance[]> = {};
    biomeComponentInstances.forEach(comp => {
      const category = comp.metadata?.category || 'Other';
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(comp);
    });
    return grouped;
  }, [biomeComponentInstances]);

  const getComponentDefinition = (componentName: string, isSpawnComponent: boolean = false): ComponentDefinition | null => {
    const components = isSpawnComponent ? availableSpawnComponents : availableBiomeComponents;
    const def = components.find(c => c.name === componentName);
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
      <section className="p-6" data-testid="biome-builder">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Builder Form */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mountain className="w-5 h-5" />
                    Biome Configuration
                  </CardTitle>
                  <CardDescription>
                    Create comprehensive Minecraft Bedrock biomes with spawn rules
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="basic" data-testid="tab-basic">Basic</TabsTrigger>
                      <TabsTrigger value="components" data-testid="tab-components">
                        Components ({biomeComponentInstances.length})
                      </TabsTrigger>
                      <TabsTrigger value="spawning" data-testid="tab-spawning">
                        Spawning ({spawnEntities.length})
                      </TabsTrigger>
                      <TabsTrigger value="advanced" data-testid="tab-advanced">Advanced</TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="space-y-4">
                      <div className="grid gap-4">
                        <div>
                          <Label htmlFor="biome-identifier">Biome Identifier *</Label>
                          <Input
                            id="biome-identifier"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            placeholder="my_addon:custom_biome"
                            data-testid="input-identifier"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Must include namespace (e.g., my_addon:biome_name)
                          </p>
                        </div>

                        <div>
                          <Label htmlFor="biome-display-name">Display Name</Label>
                          <Input
                            id="biome-display-name"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Custom Biome"
                            data-testid="input-display-name"
                          />
                        </div>

                        <div>
                          <Label htmlFor="biome-description">Description</Label>
                          <Input
                            id="biome-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="A custom biome for my addon"
                            data-testid="input-description"
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="components" className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Biome Components</h4>
                        <Button 
                          onClick={() => {
                            setComponentTargetType('biome');
                            setShowComponentSelector(true);
                          }}
                          data-testid="button-add-component"
                        >
                          Add Component
                        </Button>
                      </div>

                      {recommendedBiomeComponents.length > 0 && (
                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertDescription>
                            <div className="space-y-2">
                              <p className="font-medium">Recommended components:</p>
                              <div className="flex flex-wrap gap-1">
                                {recommendedBiomeComponents.map(comp => (
                                  <Button
                                    key={comp.name}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addBiomeComponent(comp.name)}
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
                          {Object.entries(biomeComponentsByCategory).map(([category, categoryComponents]) => (
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
                                                onCheckedChange={() => toggleBiomeComponent(component.name)}
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
                                                  onClick={() => {
                                                    setComponentTargetType('biome');
                                                    openComponentForm(component);
                                                  }}
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
                                                  onClick={() => removeBiomeComponent(component.name)}
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

                    <TabsContent value="spawning" className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Spawn Entities</h4>
                        <Button onClick={addSpawnEntity} data-testid="button-add-spawn-entity">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Entity
                        </Button>
                      </div>

                      <ScrollArea className="h-[400px]">
                        {spawnEntities.map((entity, index) => (
                          <Card key={index} className="p-4 mb-4">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h5 className="font-medium">Entity {index + 1}</h5>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => removeSpawnEntity(index)}
                                  data-testid={`button-remove-entity-${index}`}
                                >
                                  <AlertCircle className="w-3 h-3" />
                                </Button>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <Label className="text-xs">Entity Type</Label>
                                  <Input
                                    value={entity.type}
                                    onChange={(e) => updateSpawnEntity(index, { type: e.target.value })}
                                    placeholder="minecraft:cow"
                                    data-testid={`input-entity-type-${index}`}
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs">Weight</Label>
                                  <Input
                                    type="number"
                                    value={entity.weight}
                                    onChange={(e) => updateSpawnEntity(index, { weight: parseInt(e.target.value) || 10 })}
                                    data-testid={`input-entity-weight-${index}`}
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs">Min Group Size</Label>
                                  <Input
                                    type="number"
                                    value={entity.minGroupSize}
                                    onChange={(e) => updateSpawnEntity(index, { minGroupSize: parseInt(e.target.value) || 1 })}
                                    data-testid={`input-entity-min-group-${index}`}
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs">Max Group Size</Label>
                                  <Input
                                    type="number"
                                    value={entity.maxGroupSize}
                                    onChange={(e) => updateSpawnEntity(index, { maxGroupSize: parseInt(e.target.value) || 4 })}
                                    data-testid={`input-entity-max-group-${index}`}
                                  />
                                </div>
                              </div>

                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <Label className="text-xs">Spawn Components ({entity.components.length})</Label>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedEntityIndex(index);
                                      setComponentTargetType('spawn');
                                      setShowComponentSelector(true);
                                    }}
                                    data-testid={`button-add-spawn-component-${index}`}
                                  >
                                    <Plus className="w-3 h-3 mr-1" />
                                    Add Component
                                  </Button>
                                </div>
                                {entity.components.map((component, compIndex) => (
                                  <div key={compIndex} className="flex items-center gap-2 p-2 bg-muted rounded text-xs mb-1">
                                    <Switch
                                      checked={component.enabled}
                                      onCheckedChange={(enabled) => {
                                        const newComponents = [...entity.components];
                                        newComponents[compIndex] = { ...component, enabled };
                                        updateSpawnEntity(index, { components: newComponents });
                                      }}
                                    />
                                    <span className="flex-1 font-mono">{component.name}</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedEntityIndex(index);
                                        setComponentTargetType('spawn');
                                        openComponentForm(component);
                                      }}
                                      data-testid={`button-configure-spawn-component-${index}-${compIndex}`}
                                    >
                                      <Settings className="w-3 h-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </Card>
                        ))}
                      </ScrollArea>
                    </TabsContent>

                    <TabsContent value="advanced" className="space-y-4">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Actions</h4>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              onClick={resetBiome}
                              data-testid="button-reset"
                            >
                              <RotateCcw className="w-4 h-4 mr-2" />
                              Reset
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => exportToClipboard(biomeJSON, 'Biome')}
                              data-testid="button-export-biome"
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Copy Biome JSON
                            </Button>
                            {spawnRulesJSON && (
                              <Button
                                variant="outline"
                                onClick={() => exportToClipboard(spawnRulesJSON, 'Spawn Rules')}
                                data-testid="button-export-spawn"
                              >
                                <FileText className="w-4 h-4 mr-2" />
                                Copy Spawn Rules JSON
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-medium">Biome Statistics</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="bg-muted p-3 rounded">
                              <div className="font-medium">Biome Components</div>
                              <div className="text-2xl font-bold">{biomeComponentInstances.length}</div>
                            </div>
                            <div className="bg-muted p-3 rounded">
                              <div className="font-medium">Spawn Entities</div>
                              <div className="text-2xl font-bold">{spawnEntities.length}</div>
                            </div>
                            <div className="bg-muted p-3 rounded">
                              <div className="font-medium">Enabled Components</div>
                              <div className="text-2xl font-bold">{biomeComponentInstances.filter(c => c.enabled).length}</div>
                            </div>
                            <div className="bg-muted p-3 rounded">
                              <div className="font-medium">Total Spawn Weight</div>
                              <div className="text-2xl font-bold">{spawnEntities.reduce((sum, entity) => sum + entity.weight, 0)}</div>
                            </div>
                          </div>
                        </div>

                        <ValidationStatus validation={biomeValidation} />
                        {spawnRulesJSON && (
                          <div>
                            <h5 className="font-medium mb-2">Spawn Rules Validation</h5>
                            <ValidationStatus validation={spawnValidation} />
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* JSON Preview */}
            <div className="space-y-6">
              <CodePreview 
                code={JSON.stringify(biomeJSON, null, 2)}
                language="json"
                title="Biome JSON"
                validation={biomeValidation}
              />
              
              {spawnRulesJSON && (
                <CodePreview 
                  code={JSON.stringify(spawnRulesJSON, null, 2)}
                  language="json"
                  title="Spawn Rules JSON"
                  validation={spawnValidation}
                />
              )}
            </div>
          </div>
        </div>

        {/* Component Selector Modal */}
        {showComponentSelector && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <ComponentSelector
                components={componentTargetType === 'biome' ? availableBiomeComponents : availableSpawnComponents}
                selectedComponents={componentTargetType === 'biome' ? selectedBiomeComponentNames : []}
                onAddComponent={componentTargetType === 'biome' ? addBiomeComponent : (componentName) => {
                  // Add spawn component to selected entity
                  const entity = spawnEntities[selectedEntityIndex];
                  const componentDef = availableSpawnComponents.find(c => c.name === componentName);
                  if (componentDef) {
                    const newComponent: ComponentInstance = {
                      name: componentName,
                      enabled: true,
                      properties: {},
                      metadata: {
                        addedAt: Date.now(),
                        category: componentDef.category,
                        difficulty: componentDef.difficulty
                      }
                    };
                    updateSpawnEntity(selectedEntityIndex, {
                      components: [...entity.components, newComponent]
                    });
                    setShowComponentSelector(false);
                  }
                }}
                onRemoveComponent={() => {}}
                title={`Add ${componentTargetType === 'biome' ? 'Biome' : 'Spawn Rule'} Components`}
                description={`Choose from official Minecraft Bedrock ${componentTargetType} components`}
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
                const def = getComponentDefinition(editingComponent.name, componentTargetType === 'spawn');
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