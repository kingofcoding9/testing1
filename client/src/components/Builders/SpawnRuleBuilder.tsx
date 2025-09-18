import { useState } from "react";
import { Copy, Download, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CodePreview from "@/components/Common/CodePreview";
import ValidationStatus from "@/components/Common/ValidationStatus";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface SpawnCondition {
  type: string;
  value: string;
}

export default function SpawnRuleBuilder() {
  const [identifier, setIdentifier] = useLocalStorage('spawn-identifier', '');
  const [entityType, setEntityType] = useLocalStorage('spawn-entity-type', '');
  const [spawnWeight, setSpawnWeight] = useLocalStorage('spawn-weight', '100');
  const [minGroupSize, setMinGroupSize] = useLocalStorage('spawn-min-group', '1');
  const [maxGroupSize, setMaxGroupSize] = useLocalStorage('spawn-max-group', '4');
  const [populationControl, setPopulationControl] = useLocalStorage('spawn-population-control', true);
  const [conditions, setConditions] = useLocalStorage<SpawnCondition[]>('spawn-conditions', [
    { type: 'minecraft:biome_filter', value: 'plains' }
  ]);
  const [activeTab, setActiveTab] = useState('basic');

  const spawnConfig = {
    identifier,
    entityType,
    weight: parseInt(spawnWeight) || 100,
    minGroupSize: parseInt(minGroupSize) || 1,
    maxGroupSize: parseInt(maxGroupSize) || 4,
    populationControl,
    conditions
  };

  const spawnJSON = {
    "format_version": "1.21.0",
    "minecraft:spawn_rules": {
      "description": {
        "identifier": spawnConfig.identifier || "my_addon:custom_spawn_rule",
        "population_control": spawnConfig.populationControl
      },
      "conditions": spawnConfig.conditions.map(condition => ({
        [condition.type]: condition.value
      })),
      "herd": {
        "min_size": spawnConfig.minGroupSize,
        "max_size": spawnConfig.maxGroupSize
      }
    }
  };

  const validation = { isValid: true, errors: [] };

  const conditionTypes = [
    { value: 'minecraft:biome_filter', label: 'Biome Filter' },
    { value: 'minecraft:brightness_filter', label: 'Brightness Filter' },
    { value: 'minecraft:height_filter', label: 'Height Filter' },
    { value: 'minecraft:herd', label: 'Herd Size' },
    { value: 'minecraft:permute_type', label: 'Permute Type' },
  ];

  const addCondition = () => {
    setConditions([...conditions, { type: 'minecraft:biome_filter', value: '' }]);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const updateCondition = (index: number, field: keyof SpawnCondition, value: string) => {
    setConditions(conditions.map((condition, i) => 
      i === index ? { ...condition, [field]: value } : condition
    ));
  };

  return (
    <section className="p-6" data-testid="spawn-rule-builder">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Builder Form */}
          <div className="builder-form rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">Spawn Rule Configuration</h3>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
              <TabsList className="bg-muted rounded-lg p-1">
                <TabsTrigger value="basic" data-testid="tab-basic">Basic</TabsTrigger>
                <TabsTrigger value="conditions" data-testid="tab-conditions">Conditions</TabsTrigger>
                <TabsTrigger value="population" data-testid="tab-population">Population</TabsTrigger>
                <TabsTrigger value="advanced" data-testid="tab-advanced">Advanced</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div>
                  <Label htmlFor="spawn-identifier">Spawn Rule Identifier</Label>
                  <Input
                    id="spawn-identifier"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="my_addon:custom_spawn_rule"
                    data-testid="input-identifier"
                  />
                </div>
                
                <div>
                  <Label htmlFor="spawn-entity-type">Entity Type</Label>
                  <Input
                    id="spawn-entity-type"
                    value={entityType}
                    onChange={(e) => setEntityType(e.target.value)}
                    placeholder="my_addon:custom_entity"
                    data-testid="input-entity-type"
                  />
                </div>

                <div>
                  <Label htmlFor="spawn-weight">Spawn Weight</Label>
                  <Input
                    id="spawn-weight"
                    type="number"
                    min="1"
                    max="1000"
                    value={spawnWeight}
                    onChange={(e) => setSpawnWeight(e.target.value)}
                    data-testid="input-spawn-weight"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Higher values increase spawn chance relative to other entities
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="conditions" className="space-y-4">
                <div className="space-y-3">
                  {conditions.map((condition, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <Select 
                        value={condition.type} 
                        onValueChange={(value) => updateCondition(index, 'type', value)}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {conditionTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Input
                        placeholder="Condition value"
                        value={condition.value}
                        onChange={(e) => updateCondition(index, 'value', e.target.value)}
                        className="flex-1"
                        data-testid={`input-condition-value-${index}`}
                      />
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeCondition(index)}
                        disabled={conditions.length === 1}
                        data-testid={`button-remove-condition-${index}`}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button 
                  variant="outline" 
                  onClick={addCondition}
                  data-testid="button-add-condition"
                >
                  <Plus className="mr-2" size={16} />
                  Add Condition
                </Button>
              </TabsContent>

              <TabsContent value="population" className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <h4 className="font-medium text-foreground">Population Control</h4>
                    <p className="text-xs text-muted-foreground">Limit entity spawning based on existing population</p>
                  </div>
                  <Switch
                    checked={populationControl}
                    onCheckedChange={setPopulationControl}
                    data-testid="switch-population-control"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="min-group-size">Min Group Size</Label>
                    <Input
                      id="min-group-size"
                      type="number"
                      min="1"
                      max="20"
                      value={minGroupSize}
                      onChange={(e) => setMinGroupSize(e.target.value)}
                      data-testid="input-min-group-size"
                    />
                  </div>
                  <div>
                    <Label htmlFor="max-group-size">Max Group Size</Label>
                    <Input
                      id="max-group-size"
                      type="number"
                      min="1"
                      max="20"
                      value={maxGroupSize}
                      onChange={(e) => setMaxGroupSize(e.target.value)}
                      data-testid="input-max-group-size"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4">
                <div className="text-center text-muted-foreground py-8">
                  <p>Advanced spawn properties will be available soon</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* JSON Output */}
          <div className="builder-form rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-foreground">Generated JSON</h3>
              <div className="flex space-x-2">
                <Button 
                  variant="secondary" 
                  size="sm"
                  data-testid="button-copy-json"
                >
                  <Copy className="mr-2" size={16} />
                  Copy
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm"
                  data-testid="button-export-json"
                >
                  <Download className="mr-2" size={16} />
                  Export
                </Button>
              </div>
            </div>
            
            <CodePreview code={JSON.stringify(spawnJSON, null, 2)} language="json" />

            <div className="mt-4">
              <ValidationStatus validation={validation} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
