import { useState } from "react";
import { Copy, Download, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CodePreview from "@/components/Common/CodePreview";
import ValidationStatus from "@/components/Common/ValidationStatus";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { validateLootTableJSON } from "@/lib/minecraft/validation";
import { generateLootTableJSON } from "@/lib/minecraft/templates";

interface LootEntry {
  type: string;
  name: string;
  weight: number;
  count?: { min: number; max: number };
}

interface LootPool {
  rolls: { min: number; max: number };
  entries: LootEntry[];
}

export default function LootTableBuilder() {
  const [identifier, setIdentifier] = useLocalStorage('loot-identifier', '');
  const [lootType, setLootType] = useLocalStorage('loot-type', 'entity');
  const [pools, setPools] = useLocalStorage<LootPool[]>('loot-pools', [
    {
      rolls: { min: 1, max: 1 },
      entries: [{ type: 'item', name: '', weight: 1 }]
    }
  ]);
  const [activeTab, setActiveTab] = useState('basic');

  const lootConfig = {
    identifier,
    type: lootType,
    pools
  };

  const lootJSON = generateLootTableJSON(lootConfig);
  const validation = validateLootTableJSON(lootJSON);

  const lootTypes = [
    { value: 'entity', label: 'Entity Drops' },
    { value: 'blocks', label: 'Block Drops' },
    { value: 'chests', label: 'Chest Loot' },
    { value: 'fishing', label: 'Fishing Loot' },
  ];

  const entryTypes = [
    { value: 'item', label: 'Item' },
    { value: 'loot_table', label: 'Loot Table' },
    { value: 'empty', label: 'Empty' },
  ];

  const addPool = () => {
    setPools([...pools, {
      rolls: { min: 1, max: 1 },
      entries: [{ type: 'item', name: '', weight: 1 }]
    }]);
  };

  const removePool = (poolIndex: number) => {
    setPools(pools.filter((_, i) => i !== poolIndex));
  };

  const updatePool = (poolIndex: number, field: keyof LootPool, value: any) => {
    setPools(pools.map((pool, i) => 
      i === poolIndex ? { ...pool, [field]: value } : pool
    ));
  };

  const addEntry = (poolIndex: number) => {
    const newEntry: LootEntry = { type: 'item', name: '', weight: 1 };
    setPools(pools.map((pool, i) => 
      i === poolIndex ? { ...pool, entries: [...pool.entries, newEntry] } : pool
    ));
  };

  const removeEntry = (poolIndex: number, entryIndex: number) => {
    setPools(pools.map((pool, i) => 
      i === poolIndex 
        ? { ...pool, entries: pool.entries.filter((_, j) => j !== entryIndex) }
        : pool
    ));
  };

  const updateEntry = (poolIndex: number, entryIndex: number, field: keyof LootEntry, value: any) => {
    setPools(pools.map((pool, i) => 
      i === poolIndex
        ? {
            ...pool,
            entries: pool.entries.map((entry, j) =>
              j === entryIndex ? { ...entry, [field]: value } : entry
            )
          }
        : pool
    ));
  };

  return (
    <section className="p-6" data-testid="loot-table-builder">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Builder Form */}
          <div className="builder-form rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">Loot Table Configuration</h3>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
              <TabsList className="bg-muted rounded-lg p-1">
                <TabsTrigger value="basic" data-testid="tab-basic">Basic</TabsTrigger>
                <TabsTrigger value="pools" data-testid="tab-pools">Loot Pools</TabsTrigger>
                <TabsTrigger value="conditions" data-testid="tab-conditions">Conditions</TabsTrigger>
                <TabsTrigger value="advanced" data-testid="tab-advanced">Advanced</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div>
                  <Label htmlFor="loot-identifier">Loot Table Identifier</Label>
                  <Input
                    id="loot-identifier"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="my_addon:custom_loot"
                    data-testid="input-identifier"
                  />
                </div>

                <div>
                  <Label htmlFor="loot-type">Loot Type</Label>
                  <Select value={lootType} onValueChange={setLootType}>
                    <SelectTrigger data-testid="select-loot-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {lootTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="pools" className="space-y-4">
                <div className="space-y-6">
                  {pools.map((pool, poolIndex) => (
                    <div key={poolIndex} className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-foreground">Pool {poolIndex + 1}</h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removePool(poolIndex)}
                          disabled={pools.length === 1}
                          data-testid={`button-remove-pool-${poolIndex}`}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div>
                          <Label>Min Rolls</Label>
                          <Input
                            type="number"
                            min="0"
                            value={pool.rolls.min}
                            onChange={(e) => updatePool(poolIndex, 'rolls', {
                              ...pool.rolls,
                              min: parseInt(e.target.value) || 0
                            })}
                            data-testid={`input-pool-min-rolls-${poolIndex}`}
                          />
                        </div>
                        <div>
                          <Label>Max Rolls</Label>
                          <Input
                            type="number"
                            min="0"
                            value={pool.rolls.max}
                            onChange={(e) => updatePool(poolIndex, 'rolls', {
                              ...pool.rolls,
                              max: parseInt(e.target.value) || 0
                            })}
                            data-testid={`input-pool-max-rolls-${poolIndex}`}
                          />
                        </div>
                      </div>

                      <div className="space-y-2 mb-3">
                        {pool.entries.map((entry, entryIndex) => (
                          <div key={entryIndex} className="flex items-center gap-2 p-2 bg-background rounded">
                            <Select 
                              value={entry.type} 
                              onValueChange={(value) => updateEntry(poolIndex, entryIndex, 'type', value)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {entryTypes.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            
                            <Input
                              placeholder="Item name"
                              value={entry.name}
                              onChange={(e) => updateEntry(poolIndex, entryIndex, 'name', e.target.value)}
                              className="flex-1"
                              data-testid={`input-entry-name-${poolIndex}-${entryIndex}`}
                            />
                            
                            <Input
                              type="number"
                              placeholder="Weight"
                              value={entry.weight}
                              onChange={(e) => updateEntry(poolIndex, entryIndex, 'weight', parseInt(e.target.value) || 1)}
                              className="w-20"
                              data-testid={`input-entry-weight-${poolIndex}-${entryIndex}`}
                            />
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeEntry(poolIndex, entryIndex)}
                              disabled={pool.entries.length === 1}
                              data-testid={`button-remove-entry-${poolIndex}-${entryIndex}`}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        ))}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addEntry(poolIndex)}
                        data-testid={`button-add-entry-${poolIndex}`}
                      >
                        <Plus className="mr-2" size={14} />
                        Add Entry
                      </Button>
                    </div>
                  ))}
                </div>

                <Button 
                  variant="outline" 
                  onClick={addPool}
                  data-testid="button-add-pool"
                >
                  <Plus className="mr-2" size={16} />
                  Add Pool
                </Button>
              </TabsContent>

              <TabsContent value="conditions" className="space-y-4">
                <div className="text-center text-muted-foreground py-8">
                  <p>Loot conditions will be available soon</p>
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4">
                <div className="text-center text-muted-foreground py-8">
                  <p>Advanced loot table properties will be available soon</p>
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
            
            <CodePreview code={JSON.stringify(lootJSON, null, 2)} language="json" />

            <div className="mt-4">
              <ValidationStatus validation={validation} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
