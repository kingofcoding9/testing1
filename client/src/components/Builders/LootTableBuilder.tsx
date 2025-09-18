import { useState, useMemo } from "react";
import { Gift, Download, Copy, Save, RotateCcw, Info, Plus, Trash2, Settings, Dices, FileText, Layers } from "lucide-react";
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

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useToast } from "@/hooks/use-toast";
import { useCollapsible } from "@/hooks/useCollapsible";
import { CollapsibleSection, CollapsibleGroup } from "@/components/ui/collapsible-section";
import { validateLootTableJSON } from "@/lib/minecraft/validation";

// Import the comprehensive loot functions registry
import { lootFunctions, generateLootTableJSON } from "@shared/gameplayRegistry";

interface LootFunction {
  name: string;
  properties: Record<string, any>;
  enabled: boolean;
}

interface LootCondition {
  condition: string;
  properties: Record<string, any>;
  enabled: boolean;
}

interface LootEntry {
  type: string;
  name: string;
  weight: number;
  quality?: number;
  count?: { min: number; max: number };
  functions: LootFunction[];
  conditions: LootCondition[];
}

interface LootPool {
  rolls: { min: number; max: number };
  bonus_rolls?: { min: number; max: number };
  entries: LootEntry[];
  conditions: LootCondition[];
  functions: LootFunction[];
}

export default function LootTableBuilder() {
  const { toast } = useToast();

  // Basic loot table properties
  const [identifier, setIdentifier] = useLocalStorage('loot-identifier-v2', '');
  const [lootType, setLootType] = useLocalStorage('loot-type-v2', 'entity');
  const [description, setDescription] = useLocalStorage('loot-description-v2', '');

  // Pool management
  const [pools, setPools] = useLocalStorage<LootPool[]>('loot-pools-v2', [
    {
      rolls: { min: 1, max: 1 },
      entries: [
        {
          type: 'item',
          name: 'minecraft:iron_ingot',
          weight: 1,
          functions: [],
          conditions: []
        }
      ],
      conditions: [],
      functions: []
    }
  ]);

  // UI state
  const [activeTab, setActiveTab] = useState('basic');
  const [selectedPool, setSelectedPool] = useState<number>(0);
  const [selectedEntry, setSelectedEntry] = useState<number>(0);
  const [showFunctionSelector, setShowFunctionSelector] = useState(false);
  const [editingTarget, setEditingTarget] = useState<{ type: 'pool' | 'entry'; poolIndex: number; entryIndex?: number } | null>(null);

  // Available loot functions grouped by category
  const lootFunctionsByCategory = useMemo(() => {
    const grouped: Record<string, typeof lootFunctions> = {};
    lootFunctions.forEach(func => {
      const category = func.subcategory || func.category;
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(func);
    });
    return grouped;
  }, []);

  // Generate JSON
  const lootTableJSON = useMemo(() => {
    const processedPools = pools.map(pool => ({
      rolls: pool.rolls,
      ...(pool.bonus_rolls && { bonus_rolls: pool.bonus_rolls }),
      entries: pool.entries.map(entry => ({
        type: entry.type,
        name: entry.name,
        weight: entry.weight,
        ...(entry.quality && { quality: entry.quality }),
        ...(entry.count && { count: entry.count }),
        ...(entry.functions.length > 0 && {
          functions: entry.functions.filter(f => f.enabled).map(f => ({
            function: f.name,
            ...f.properties
          }))
        }),
        ...(entry.conditions.length > 0 && {
          conditions: entry.conditions.filter(c => c.enabled).map(c => ({
            condition: c.condition,
            ...c.properties
          }))
        })
      })),
      ...(pool.functions.length > 0 && {
        functions: pool.functions.filter(f => f.enabled).map(f => ({
          function: f.name,
          ...f.properties
        }))
      }),
      ...(pool.conditions.length > 0 && {
        conditions: pool.conditions.filter(c => c.enabled).map(c => ({
          condition: c.condition,
          ...c.properties
        }))
      })
    }));

    return {
      format_version: "1.21.0",
      pools: processedPools
    };
  }, [pools]);

  const validation = validateLootTableJSON(lootTableJSON);

  // Loot types
  const lootTypes = [
    { value: 'entity', label: 'Entity Drops', description: 'Loot from mob kills' },
    { value: 'blocks', label: 'Block Drops', description: 'Loot from block breaking' },
    { value: 'chests', label: 'Chest Loot', description: 'Loot in generated chests' },
    { value: 'fishing', label: 'Fishing Loot', description: 'Loot from fishing' },
    { value: 'archaeology', label: 'Archaeology Loot', description: 'Loot from brushing' },
    { value: 'gameplay', label: 'Gameplay Loot', description: 'Custom gameplay loot' }
  ];

  // Entry types
  const entryTypes = [
    { value: 'item', label: 'Item', description: 'Single item drop' },
    { value: 'loot_table', label: 'Loot Table', description: 'Reference to another loot table' },
    { value: 'empty', label: 'Empty', description: 'No drop (for weight balancing)' },
    { value: 'group', label: 'Group', description: 'Group of entries' }
  ];

  // Pool management functions
  const addPool = () => {
    setPools([...pools, {
      rolls: { min: 1, max: 1 },
      entries: [{ type: 'item', name: '', weight: 1, functions: [], conditions: [] }],
      conditions: [],
      functions: []
    }]);
  };

  const removePool = (poolIndex: number) => {
    setPools(pools.filter((_, i) => i !== poolIndex));
    if (selectedPool >= pools.length - 1) {
      setSelectedPool(Math.max(0, poolIndex - 1));
    }
  };

  const updatePool = (poolIndex: number, updates: Partial<LootPool>) => {
    setPools(pools.map((pool, i) => 
      i === poolIndex ? { ...pool, ...updates } : pool
    ));
  };

  // Entry management functions
  const addEntry = (poolIndex: number) => {
    const newEntry: LootEntry = {
      type: 'item',
      name: '',
      weight: 1,
      functions: [],
      conditions: []
    };
    
    updatePool(poolIndex, {
      entries: [...pools[poolIndex].entries, newEntry]
    });
  };

  const removeEntry = (poolIndex: number, entryIndex: number) => {
    updatePool(poolIndex, {
      entries: pools[poolIndex].entries.filter((_, i) => i !== entryIndex)
    });
  };

  const updateEntry = (poolIndex: number, entryIndex: number, updates: Partial<LootEntry>) => {
    updatePool(poolIndex, {
      entries: pools[poolIndex].entries.map((entry, i) =>
        i === entryIndex ? { ...entry, ...updates } : entry
      )
    });
  };

  // Function management
  const addFunctionToTarget = (functionName: string) => {
    const funcDef = lootFunctions.find(f => f.name === functionName);
    if (!funcDef || !editingTarget) return;

    // Generate default properties
    const defaultProperties: Record<string, any> = {};
    funcDef.properties.forEach(prop => {
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
            defaultProperties[prop.name] = prop.example ?? { min: 1, max: 3 };
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

    const newFunction: LootFunction = {
      name: functionName,
      properties: defaultProperties,
      enabled: true
    };

    if (editingTarget.type === 'pool') {
      const pool = pools[editingTarget.poolIndex];
      updatePool(editingTarget.poolIndex, {
        functions: [...pool.functions, newFunction]
      });
    } else if (editingTarget.type === 'entry' && editingTarget.entryIndex !== undefined) {
      const entry = pools[editingTarget.poolIndex].entries[editingTarget.entryIndex];
      updateEntry(editingTarget.poolIndex, editingTarget.entryIndex, {
        functions: [...entry.functions, newFunction]
      });
    }

    setShowFunctionSelector(false);
    setEditingTarget(null);

    toast({
      title: "Function added",
      description: `${functionName} has been added successfully.`
    });
  };

  const removeFunctionFromTarget = (functionIndex: number) => {
    if (!editingTarget) return;

    if (editingTarget.type === 'pool') {
      const pool = pools[editingTarget.poolIndex];
      updatePool(editingTarget.poolIndex, {
        functions: pool.functions.filter((_, i) => i !== functionIndex)
      });
    } else if (editingTarget.type === 'entry' && editingTarget.entryIndex !== undefined) {
      const entry = pools[editingTarget.poolIndex].entries[editingTarget.entryIndex];
      updateEntry(editingTarget.poolIndex, editingTarget.entryIndex, {
        functions: entry.functions.filter((_, i) => i !== functionIndex)
      });
    }
  };

  const resetLootTable = () => {
    setIdentifier('');
    setDescription('');
    setPools([{
      rolls: { min: 1, max: 1 },
      entries: [{ type: 'item', name: '', weight: 1, functions: [], conditions: [] }],
      conditions: [],
      functions: []
    }]);
    
    toast({
      title: "Loot table reset",
      description: "Loot table has been reset to default state."
    });
  };

  const exportToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(lootTableJSON, null, 2));
    toast({
      title: "Copied to clipboard",
      description: "Loot table JSON has been copied to your clipboard."
    });
  };

  const calculateTotalWeight = (poolIndex: number): number => {
    return pools[poolIndex]?.entries.reduce((sum, entry) => sum + entry.weight, 0) || 0;
  };

  const calculateDropProbability = (poolIndex: number, entryIndex: number): number => {
    const totalWeight = calculateTotalWeight(poolIndex);
    const entryWeight = pools[poolIndex]?.entries[entryIndex]?.weight || 0;
    return totalWeight > 0 ? (entryWeight / totalWeight) * 100 : 0;
  };

  return (
    <TooltipProvider>
      <section className="p-6" data-testid="loot-table-builder">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Builder Form */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="w-5 h-5" />
                    Loot Table Configuration
                  </CardTitle>
                  <CardDescription>
                    Create comprehensive Minecraft Bedrock loot tables with all official functions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="basic" data-testid="tab-basic">Basic</TabsTrigger>
                      <TabsTrigger value="pools" data-testid="tab-pools">
                        Pools ({pools.length})
                      </TabsTrigger>
                      <TabsTrigger value="functions" data-testid="tab-functions">Functions</TabsTrigger>
                      <TabsTrigger value="advanced" data-testid="tab-advanced">Advanced</TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="space-y-4">
                      <div className="grid gap-4">
                        <div>
                          <Label htmlFor="loot-identifier">Loot Table Identifier *</Label>
                          <Input
                            id="loot-identifier"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            placeholder="my_addon:custom_loot"
                            data-testid="input-identifier"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Must include namespace (e.g., my_addon:loot_name)
                          </p>
                        </div>

                        <div>
                          <Label htmlFor="loot-description">Description</Label>
                          <Input
                            id="loot-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="A custom loot table for my addon"
                            data-testid="input-description"
                          />
                        </div>

                        <div>
                          <Label htmlFor="loot-type">Loot Type</Label>
                          <Select value={lootType} onValueChange={setLootType}>
                            <SelectTrigger data-testid="select-loot-type">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {lootTypes.map(type => (
                                <SelectItem key={type.value} value={type.value}>
                                  <div>
                                    <div className="font-medium">{type.label}</div>
                                    <div className="text-xs text-muted-foreground">{type.description}</div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="pools" className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Loot Pools</h4>
                        <Button onClick={addPool} data-testid="button-add-pool">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Pool
                        </Button>
                      </div>

                      <ScrollArea className="h-[500px]">
                        <Accordion type="single" value={`pool-${selectedPool}`} onValueChange={(value) => {
                          const poolIndex = parseInt(value?.replace('pool-', '') || '0');
                          setSelectedPool(poolIndex);
                        }}>
                          {pools.map((pool, poolIndex) => (
                            <AccordionItem key={poolIndex} value={`pool-${poolIndex}`}>
                              <AccordionTrigger className="text-sm" data-testid={`accordion-pool-${poolIndex}`}>
                                Pool {poolIndex + 1} ({pool.entries.length} entries, weight: {calculateTotalWeight(poolIndex)})
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-4 p-2">
                                  {/* Pool Configuration */}
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <Label className="text-xs">Min Rolls</Label>
                                      <Input
                                        type="number"
                                        min="0"
                                        value={pool.rolls.min}
                                        onChange={(e) => updatePool(poolIndex, {
                                          rolls: { ...pool.rolls, min: parseInt(e.target.value) || 0 }
                                        })}
                                        data-testid={`input-pool-min-${poolIndex}`}
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-xs">Max Rolls</Label>
                                      <Input
                                        type="number"
                                        min="0"
                                        value={pool.rolls.max}
                                        onChange={(e) => updatePool(poolIndex, {
                                          rolls: { ...pool.rolls, max: parseInt(e.target.value) || 0 }
                                        })}
                                        data-testid={`input-pool-max-${poolIndex}`}
                                      />
                                    </div>
                                  </div>

                                  {/* Pool Functions */}
                                  <div>
                                    <div className="flex items-center justify-between mb-2">
                                      <Label className="text-xs">Pool Functions ({pool.functions.length})</Label>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          setEditingTarget({ type: 'pool', poolIndex });
                                          setShowFunctionSelector(true);
                                        }}
                                        data-testid={`button-add-pool-function-${poolIndex}`}
                                      >
                                        <Plus className="w-3 h-3 mr-1" />
                                        Add Function
                                      </Button>
                                    </div>
                                    {pool.functions.map((func, funcIndex) => (
                                      <div key={funcIndex} className="flex items-center gap-2 p-2 bg-muted rounded text-xs">
                                        <Switch
                                          checked={func.enabled}
                                          onCheckedChange={(enabled) => {
                                            const newFunctions = [...pool.functions];
                                            newFunctions[funcIndex] = { ...func, enabled };
                                            updatePool(poolIndex, { functions: newFunctions });
                                          }}
                                        />
                                        <span className="flex-1 font-mono">{func.name}</span>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => removeFunctionFromTarget(funcIndex)}
                                          data-testid={`button-remove-pool-function-${poolIndex}-${funcIndex}`}
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Entries */}
                                  <div>
                                    <div className="flex items-center justify-between mb-2">
                                      <Label className="text-xs">Entries</Label>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => addEntry(poolIndex)}
                                        data-testid={`button-add-entry-${poolIndex}`}
                                      >
                                        <Plus className="w-3 h-3 mr-1" />
                                        Add Entry
                                      </Button>
                                    </div>
                                    {pool.entries.map((entry, entryIndex) => (
                                      <Card key={entryIndex} className="p-3 mb-2">
                                        <div className="grid gap-2">
                                          <div className="flex items-center gap-2">
                                            <Select
                                              value={entry.type}
                                              onValueChange={(type) => updateEntry(poolIndex, entryIndex, { type })}
                                            >
                                              <SelectTrigger className="w-24">
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                {entryTypes.map(type => (
                                                  <SelectItem key={type.value} value={type.value}>
                                                    {type.label}
                                                  </SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                            <Input
                                              placeholder="Item/Table name"
                                              value={entry.name}
                                              onChange={(e) => updateEntry(poolIndex, entryIndex, { name: e.target.value })}
                                              className="flex-1"
                                              data-testid={`input-entry-name-${poolIndex}-${entryIndex}`}
                                            />
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={() => removeEntry(poolIndex, entryIndex)}
                                                  disabled={pool.entries.length === 1}
                                                  data-testid={`button-remove-entry-${poolIndex}-${entryIndex}`}
                                                >
                                                  <Trash2 className="w-3 h-3" />
                                                </Button>
                                              </TooltipTrigger>
                                              <TooltipContent>Remove entry</TooltipContent>
                                            </Tooltip>
                                          </div>

                                          <div className="grid grid-cols-3 gap-2 text-xs">
                                            <div>
                                              <Label>Weight</Label>
                                              <Input
                                                type="number"
                                                min="1"
                                                value={entry.weight}
                                                onChange={(e) => updateEntry(poolIndex, entryIndex, { weight: parseInt(e.target.value) || 1 })}
                                                data-testid={`input-entry-weight-${poolIndex}-${entryIndex}`}
                                              />
                                            </div>
                                            <div>
                                              <Label>Quality</Label>
                                              <Input
                                                type="number"
                                                value={entry.quality || ''}
                                                onChange={(e) => updateEntry(poolIndex, entryIndex, { quality: e.target.value ? parseInt(e.target.value) : undefined })}
                                                placeholder="Optional"
                                                data-testid={`input-entry-quality-${poolIndex}-${entryIndex}`}
                                              />
                                            </div>
                                            <div className="text-xs text-muted-foreground flex items-end">
                                              {calculateDropProbability(poolIndex, entryIndex).toFixed(1)}% chance
                                            </div>
                                          </div>

                                          <div>
                                            <div className="flex items-center justify-between mb-1">
                                              <Label className="text-xs">Entry Functions ({entry.functions.length})</Label>
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                  setEditingTarget({ type: 'entry', poolIndex, entryIndex });
                                                  setShowFunctionSelector(true);
                                                }}
                                                data-testid={`button-add-entry-function-${poolIndex}-${entryIndex}`}
                                              >
                                                <Settings className="w-3 h-3" />
                                              </Button>
                                            </div>
                                            {entry.functions.map((func, funcIndex) => (
                                              <div key={funcIndex} className="flex items-center gap-2 p-1 bg-muted rounded text-xs">
                                                <Switch
                                                  checked={func.enabled}
                                                  onCheckedChange={(enabled) => {
                                                    const newFunctions = [...entry.functions];
                                                    newFunctions[funcIndex] = { ...func, enabled };
                                                    updateEntry(poolIndex, entryIndex, { functions: newFunctions });
                                                  }}
                                                />
                                                <span className="flex-1 font-mono">{func.name}</span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      </Card>
                                    ))}
                                  </div>

                                  <div className="flex justify-end">
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => removePool(poolIndex)}
                                      disabled={pools.length === 1}
                                      data-testid={`button-remove-pool-${poolIndex}`}
                                    >
                                      <Trash2 className="w-3 h-3 mr-1" />
                                      Remove Pool
                                    </Button>
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </ScrollArea>
                    </TabsContent>

                    <TabsContent value="functions" className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-3">Available Loot Functions</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          Functions modify how loot is generated and distributed
                        </p>
                        <ScrollArea className="h-[400px]">
                          <Accordion type="single" collapsible>
                            {Object.entries(lootFunctionsByCategory).map(([category, categoryFunctions]) => (
                              <AccordionItem key={category} value={category}>
                                <AccordionTrigger className="text-sm" data-testid={`accordion-function-${category}`}>
                                  {category} ({categoryFunctions.length} functions)
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="grid gap-2">
                                    {categoryFunctions.map((func) => (
                                      <Card key={func.name} className="p-3">
                                        <div className="flex items-start justify-between gap-2">
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                              <span className="font-medium text-sm font-mono">{func.name}</span>
                                              <Badge 
                                                variant="outline" 
                                                className={`text-xs ${
                                                  func.difficulty === 'beginner' ? 'border-green-500' :
                                                  func.difficulty === 'intermediate' ? 'border-yellow-500' :
                                                  'border-red-500'
                                                }`}
                                              >
                                                {func.difficulty}
                                              </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground">{func.description}</p>
                                          </div>
                                        </div>
                                      </Card>
                                    ))}
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
                        <div>
                          <h4 className="font-medium mb-2">Actions</h4>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              onClick={resetLootTable}
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
                          <h4 className="font-medium">Loot Table Statistics</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="bg-muted p-3 rounded">
                              <div className="font-medium">Total Pools</div>
                              <div className="text-2xl font-bold">{pools.length}</div>
                            </div>
                            <div className="bg-muted p-3 rounded">
                              <div className="font-medium">Total Entries</div>
                              <div className="text-2xl font-bold">{pools.reduce((sum, pool) => sum + pool.entries.length, 0)}</div>
                            </div>
                            <div className="bg-muted p-3 rounded">
                              <div className="font-medium">Active Functions</div>
                              <div className="text-2xl font-bold">
                                {pools.reduce((sum, pool) => 
                                  sum + pool.functions.filter(f => f.enabled).length + 
                                  pool.entries.reduce((entrySum, entry) => 
                                    entrySum + entry.functions.filter(f => f.enabled).length, 0
                                  ), 0
                                )}
                              </div>
                            </div>
                            <div className="bg-muted p-3 rounded">
                              <div className="font-medium">Average Weight</div>
                              <div className="text-2xl font-bold">
                                {pools.length > 0 ? 
                                  (pools.reduce((sum, pool) => sum + calculateTotalWeight(pools.indexOf(pool)), 0) / pools.length).toFixed(1) : 
                                  '0'
                                }
                              </div>
                            </div>
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
                code={JSON.stringify(lootTableJSON, null, 2)}
                language="json"
                title="Loot Table JSON"
                validation={validation}
              />
            </div>
          </div>
        </div>

        {/* Function Selector Modal */}
        {showFunctionSelector && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold">Add Loot Function</h3>
                <p className="text-sm text-muted-foreground">
                  Choose a function to modify loot generation
                </p>
              </div>
              <ScrollArea className="max-h-[60vh] p-4">
                <Accordion type="single" collapsible>
                  {Object.entries(lootFunctionsByCategory).map(([category, categoryFunctions]) => (
                    <AccordionItem key={category} value={category}>
                      <AccordionTrigger>{category} ({categoryFunctions.length})</AccordionTrigger>
                      <AccordionContent>
                        <div className="grid gap-2">
                          {categoryFunctions.map((func) => (
                            <Card 
                              key={func.name} 
                              className="p-3 cursor-pointer hover:bg-muted/50"
                              onClick={() => addFunctionToTarget(func.name)}
                              data-testid={`card-function-${func.name}`}
                            >
                              <div className="flex items-center gap-2">
                                <div className="flex-1">
                                  <div className="font-medium text-sm font-mono">{func.name}</div>
                                  <p className="text-xs text-muted-foreground">{func.description}</p>
                                </div>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${
                                    func.difficulty === 'beginner' ? 'border-green-500' :
                                    func.difficulty === 'intermediate' ? 'border-yellow-500' :
                                    'border-red-500'
                                  }`}
                                >
                                  {func.difficulty}
                                </Badge>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </ScrollArea>
              <div className="p-4 border-t flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowFunctionSelector(false);
                    setEditingTarget(null);
                  }}
                  data-testid="button-close-function-selector"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </section>
    </TooltipProvider>
  );
}