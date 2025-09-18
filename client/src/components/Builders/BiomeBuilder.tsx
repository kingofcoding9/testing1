import { useState } from "react";
import { Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CodePreview from "@/components/Common/CodePreview";
import ValidationStatus from "@/components/Common/ValidationStatus";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export default function BiomeBuilder() {
  const [identifier, setIdentifier] = useLocalStorage('biome-identifier', '');
  const [displayName, setDisplayName] = useLocalStorage('biome-display-name', '');
  const [temperature, setTemperature] = useLocalStorage('biome-temperature', [0.8]);
  const [downfall, setDownfall] = useLocalStorage('biome-downfall', [0.4]);
  const [activeTab, setActiveTab] = useState('basic');

  const biomeConfig = {
    identifier,
    displayName,
    temperature: temperature[0],
    downfall: downfall[0]
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
        }
      }
    }
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
                <div className="text-center text-muted-foreground py-8">
                  <p>Biome features configuration will be available soon</p>
                </div>
              </TabsContent>

              <TabsContent value="spawning" className="space-y-4">
                <div className="text-center text-muted-foreground py-8">
                  <p>Mob spawning rules will be available soon</p>
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
