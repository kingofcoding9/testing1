import { useState } from "react";
import { Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CodePreview from "@/components/Common/CodePreview";
import ValidationStatus from "@/components/Common/ValidationStatus";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export default function BiomeBuilder() {
  const [identifier, setIdentifier] = useLocalStorage('biome-identifier', '');
  const [displayName, setDisplayName] = useLocalStorage('biome-display-name', '');
  const [temperature, setTemperature] = useLocalStorage('biome-temperature', [0.8]);
  const [downfall, setDownfall] = useLocalStorage('biome-downfall', [0.4]);
  
  // Features state
  const [surfaceMaterial, setSurfaceMaterial] = useLocalStorage('biome-surface-material', 'minecraft:grass_block');
  const [subsurfaceMaterial, setSubsurfaceMaterial] = useLocalStorage('biome-subsurface-material', 'minecraft:dirt');
  const [treeDensity, setTreeDensity] = useLocalStorage('biome-tree-density', '0.1');
  const [grassDensity, setGrassDensity] = useLocalStorage('biome-grass-density', '0.3');
  const [coalOre, setCoalOre] = useLocalStorage('biome-coal-ore', true);
  const [ironOre, setIronOre] = useLocalStorage('biome-iron-ore', true);
  const [diamondOre, setDiamondOre] = useLocalStorage('biome-diamond-ore', false);
  
  // Spawning state
  const [cowWeight, setCowWeight] = useLocalStorage('biome-cow-weight', '10');
  const [sheepWeight, setSheepWeight] = useLocalStorage('biome-sheep-weight', '12');
  const [pigWeight, setPigWeight] = useLocalStorage('biome-pig-weight', '10');
  const [zombieWeight, setZombieWeight] = useLocalStorage('biome-zombie-weight', '95');
  const [skeletonWeight, setSkeletonWeight] = useLocalStorage('biome-skeleton-weight', '100');
  const [spiderWeight, setSpiderWeight] = useLocalStorage('biome-spider-weight', '100');
  const [spawnLightLevel, setSpawnLightLevel] = useLocalStorage('biome-spawn-light-level', '7');
  const [spawnRate, setSpawnRate] = useLocalStorage('biome-spawn-rate', '0.5');
  
  const [activeTab, setActiveTab] = useState('basic');

  const biomeConfig = {
    identifier,
    displayName,
    temperature: temperature[0],
    downfall: downfall[0],
    features: {
      surfaceMaterial,
      subsurfaceMaterial,
      treeDensity: parseFloat(treeDensity) || 0.1,
      grassDensity: parseFloat(grassDensity) || 0.3,
      ores: {
        coal: coalOre,
        iron: ironOre,
        diamond: diamondOre
      }
    },
    spawning: {
      peaceful: {
        cow: parseInt(cowWeight) || 10,
        sheep: parseInt(sheepWeight) || 12,
        pig: parseInt(pigWeight) || 10
      },
      hostile: {
        zombie: parseInt(zombieWeight) || 95,
        skeleton: parseInt(skeletonWeight) || 100,
        spider: parseInt(spiderWeight) || 100
      },
      lightLevel: parseInt(spawnLightLevel) || 7,
      spawnRate: parseFloat(spawnRate) || 0.5
    }
  };

  const biomeJSON = {
    "format_version": "1.21.0",
    "minecraft:biome": {
      "description": {
        "identifier": biomeConfig.identifier || "my_addon:custom_biome"
      },
      "components": {
        "minecraft:climate": {
          "temperature": biomeConfig.temperature,
          "downfall": biomeConfig.downfall
        },
        "minecraft:surface_parameters": {
          "top_material": biomeConfig.features.surfaceMaterial,
          "mid_material": biomeConfig.features.subsurfaceMaterial
        },
        "minecraft:surface_material_adjustments": {
          "adjustments": [
            {
              "materials": {
                "top_material": biomeConfig.features.surfaceMaterial,
                "mid_material": biomeConfig.features.subsurfaceMaterial
              }
            }
          ]
        },
        "minecraft:overworld_generation_rules": {
          "hills_transformation": "minecraft:forest_hills",
          "generate_for_climates": [
            ["medium", 1.0]
          ]
        },
        "minecraft:surface_material": {
          "top_material": biomeConfig.features.surfaceMaterial
        },
        ...(biomeConfig.features.treeDensity > 0 && {
          "minecraft:tree_frequency": {
            "frequency": biomeConfig.features.treeDensity
          }
        }),
        ...(biomeConfig.features.grassDensity > 0 && {
          "minecraft:grass_color": {
            "multiplier": biomeConfig.features.grassDensity
          }
        }),
        ...(biomeConfig.features.ores.coal && {
          "minecraft:ore_deposits": {
            "coal_ore": {
              "probability": 0.8,
              "block": "minecraft:coal_ore"
            }
          }
        })
      }
    },
    // Spawning rules as separate components  
    ...(Object.values(biomeConfig.spawning.peaceful).some(w => w > 0) && {
      "spawn_rules": {
        "format_version": "1.21.0",
        "minecraft:spawn_rules": {
          "description": {
            "identifier": (biomeConfig.identifier || "my_addon:custom_biome") + "_spawns"
          },
          "conditions": [
            {
              "minecraft:spawns_on_surface": {},
              "minecraft:spawns_underground": {},
              "minecraft:brightness_filter": {
                "min": 0,
                "max": biomeConfig.spawning.lightLevel
              },
              "minecraft:weight": {
                "default": biomeConfig.spawning.spawnRate
              },
              "minecraft:mob_event_filter": {
                "event": "minecraft:entity_spawned"
              },
              "minecraft:permute_type": [
                ...(biomeConfig.spawning.peaceful.cow > 0 ? [{
                  "entity_type": "minecraft:cow",
                  "weight": biomeConfig.spawning.peaceful.cow
                }] : []),
                ...(biomeConfig.spawning.peaceful.sheep > 0 ? [{
                  "entity_type": "minecraft:sheep", 
                  "weight": biomeConfig.spawning.peaceful.sheep
                }] : []),
                ...(biomeConfig.spawning.peaceful.pig > 0 ? [{
                  "entity_type": "minecraft:pig",
                  "weight": biomeConfig.spawning.peaceful.pig
                }] : []),
                ...(biomeConfig.spawning.hostile.zombie > 0 ? [{
                  "entity_type": "minecraft:zombie",
                  "weight": biomeConfig.spawning.hostile.zombie
                }] : []),
                ...(biomeConfig.spawning.hostile.skeleton > 0 ? [{
                  "entity_type": "minecraft:skeleton",
                  "weight": biomeConfig.spawning.hostile.skeleton  
                }] : []),
                ...(biomeConfig.spawning.hostile.spider > 0 ? [{
                  "entity_type": "minecraft:spider",
                  "weight": biomeConfig.spawning.hostile.spider
                }] : [])
              ]
            }
          ]
        }
      }
    })
  };

  const validation = { isValid: true, errors: [] };

  return (
    <section className="p-6" data-testid="biome-builder">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Builder Form */}
          <div className="builder-form rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">Biome Configuration</h3>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
              <TabsList className="bg-muted rounded-lg p-1">
                <TabsTrigger value="basic" data-testid="tab-basic">Basic</TabsTrigger>
                <TabsTrigger value="climate" data-testid="tab-climate">Climate</TabsTrigger>
                <TabsTrigger value="features" data-testid="tab-features">Features</TabsTrigger>
                <TabsTrigger value="spawning" data-testid="tab-spawning">Spawning</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div>
                  <Label htmlFor="biome-identifier">Biome Identifier</Label>
                  <Input
                    id="biome-identifier"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="my_addon:custom_biome"
                    data-testid="input-identifier"
                  />
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
              </TabsContent>

              <TabsContent value="climate" className="space-y-6">
                <div>
                  <Label>Temperature: {temperature[0].toFixed(2)}</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Controls snow/rain and affects mob spawning (0.0 = frozen, 1.0 = hot)
                  </p>
                  <Slider
                    value={temperature}
                    onValueChange={setTemperature}
                    min={0}
                    max={2}
                    step={0.1}
                    data-testid="slider-temperature"
                  />
                </div>

                <div>
                  <Label>Downfall: {downfall[0].toFixed(2)}</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Controls precipitation intensity (0.0 = no rain, 1.0 = heavy rain)
                  </p>
                  <Slider
                    value={downfall}
                    onValueChange={setDownfall}
                    min={0}
                    max={1}
                    step={0.1}
                    data-testid="slider-downfall"
                  />
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium text-foreground mb-2">Climate Preview</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Weather: </span>
                      <span className="text-foreground">
                        {temperature[0] <= 0.15 ? 'Snow' : downfall[0] > 0.5 ? 'Rain' : 'Clear'}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Type: </span>
                      <span className="text-foreground">
                        {temperature[0] <= 0.15 ? 'Cold' : temperature[0] >= 0.95 ? 'Hot' : 'Temperate'}
                      </span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="features" className="space-y-4">
                <div className="text-sm text-muted-foreground mb-4">
                  Configure biome features like terrain, vegetation, and structures.
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="surface-material">Surface Material</Label>
                    <Input
                      id="surface-material"
                      value={surfaceMaterial}
                      onChange={(e) => setSurfaceMaterial(e.target.value)}
                      placeholder="minecraft:grass_block"
                      data-testid="input-surface-material"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="subsurface-material">Subsurface Material</Label>
                    <Input
                      id="subsurface-material"
                      value={subsurfaceMaterial}
                      onChange={(e) => setSubsurfaceMaterial(e.target.value)}
                      placeholder="minecraft:dirt"
                      data-testid="input-subsurface-material"
                    />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tree-density">Tree Density</Label>
                      <Input
                        id="tree-density"
                        type="number"
                        min="0"
                        max="1"
                        step="0.1"
                        value={treeDensity}
                        onChange={(e) => setTreeDensity(e.target.value)}
                        placeholder="0.1"
                        data-testid="input-tree-density"
                      />
                    </div>
                    <div>
                      <Label htmlFor="grass-density">Grass Density</Label>
                      <Input
                        id="grass-density"
                        type="number"
                        min="0"
                        max="1"
                        step="0.1"
                        value={grassDensity}
                        onChange={(e) => setGrassDensity(e.target.value)}
                        placeholder="0.3"
                        data-testid="input-grass-density"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Ore Generation</Label>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={coalOre}
                        onCheckedChange={setCoalOre}
                        data-testid="switch-coal-ore" 
                      />
                      <span className="text-sm">Coal Ore</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={ironOre}
                        onCheckedChange={setIronOre}
                        data-testid="switch-iron-ore" 
                      />
                      <span className="text-sm">Iron Ore</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={diamondOre}
                        onCheckedChange={setDiamondOre}
                        data-testid="switch-diamond-ore" 
                      />
                      <span className="text-sm">Diamond Ore</span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="spawning" className="space-y-4">
                <div className="text-sm text-muted-foreground mb-4">
                  Configure mob spawning rules for different creature types.
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium text-foreground mb-3">Peaceful Creatures</h4>
                    <div className="space-y-3">
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="cow-weight">Cow Weight</Label>
                          <Input
                            id="cow-weight"
                            type="number"
                            min="0"
                            placeholder="10"
                            data-testid="input-cow-weight"
                          />
                        </div>
                        <div>
                          <Label htmlFor="sheep-weight">Sheep Weight</Label>
                          <Input
                            id="sheep-weight"
                            type="number"
                            min="0"
                            placeholder="12"
                            data-testid="input-sheep-weight"
                          />
                        </div>
                        <div>
                          <Label htmlFor="pig-weight">Pig Weight</Label>
                          <Input
                            id="pig-weight"
                            type="number"
                            min="0"
                            placeholder="10"
                            data-testid="input-pig-weight"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium text-foreground mb-3">Hostile Creatures</h4>
                    <div className="space-y-3">
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="zombie-weight">Zombie Weight</Label>
                          <Input
                            id="zombie-weight"
                            type="number"
                            min="0"
                            placeholder="95"
                            data-testid="input-zombie-weight"
                          />
                        </div>
                        <div>
                          <Label htmlFor="skeleton-weight">Skeleton Weight</Label>
                          <Input
                            id="skeleton-weight"
                            type="number"
                            min="0"
                            placeholder="100"
                            data-testid="input-skeleton-weight"
                          />
                        </div>
                        <div>
                          <Label htmlFor="spider-weight">Spider Weight</Label>
                          <Input
                            id="spider-weight"
                            type="number"
                            min="0"
                            placeholder="100"
                            data-testid="input-spider-weight"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="spawn-light-level">Max Light Level for Hostile Spawns</Label>
                      <Input
                        id="spawn-light-level"
                        type="number"
                        min="0"
                        max="15"
                        placeholder="7"
                        data-testid="input-spawn-light-level"
                      />
                    </div>
                    <div>
                      <Label htmlFor="spawn-rate">Overall Spawn Rate</Label>
                      <Input
                        id="spawn-rate"
                        type="number"
                        min="0"
                        max="1"
                        step="0.1"
                        placeholder="0.5"
                        data-testid="input-spawn-rate"
                      />
                    </div>
                  </div>
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
            
            <CodePreview code={JSON.stringify(biomeJSON, null, 2)} language="json" />

            <div className="mt-4">
              <ValidationStatus validation={validation} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
