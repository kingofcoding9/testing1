import { useState } from "react";
import { Plus, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CodePreview from "@/components/Common/CodePreview";
import ValidationStatus from "@/components/Common/ValidationStatus";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { validateBlockJSON } from "@/lib/minecraft/validation";
import { generateBlockJSON } from "@/lib/minecraft/templates";

export default function BlockBuilder() {
  const [identifier, setIdentifier] = useLocalStorage('block-identifier', '');
  const [displayName, setDisplayName] = useLocalStorage('block-display-name', '');
  const [material, setMaterial] = useLocalStorage('block-material', 'stone');
  const [hardness, setHardness] = useLocalStorage('block-hardness', '1.5');
  const [lightEmission, setLightEmission] = useLocalStorage('block-light-emission', '0');
  const [isTransparent, setIsTransparent] = useLocalStorage('block-transparent', false);
  const [activeTab, setActiveTab] = useState('basic');

  const blockConfig = {
    identifier,
    displayName,
    material,
    hardness: parseFloat(hardness) || 1.5,
    lightEmission: parseInt(lightEmission) || 0,
    isTransparent
  };

  const blockJSON = generateBlockJSON(blockConfig);
  const validation = validateBlockJSON(blockJSON);

  const materials = [
    { value: 'stone', label: 'Stone' },
    { value: 'wood', label: 'Wood' },
    { value: 'metal', label: 'Metal' },
    { value: 'glass', label: 'Glass' },
    { value: 'dirt', label: 'Dirt' },
    { value: 'sand', label: 'Sand' },
  ];

  return (
    <section className="p-6" data-testid="block-builder">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Builder Form */}
          <div className="builder-form rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">Block Configuration</h3>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
              <TabsList className="bg-muted rounded-lg p-1">
                <TabsTrigger value="basic" data-testid="tab-basic">Basic</TabsTrigger>
                <TabsTrigger value="properties" data-testid="tab-properties">Properties</TabsTrigger>
                <TabsTrigger value="texture" data-testid="tab-texture">Texture</TabsTrigger>
                <TabsTrigger value="advanced" data-testid="tab-advanced">Advanced</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div>
                  <Label htmlFor="block-identifier">Block Identifier</Label>
                  <Input
                    id="block-identifier"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="my_addon:custom_block"
                    data-testid="input-identifier"
                  />
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
                  <Label htmlFor="block-material">Material Type</Label>
                  <Select value={material} onValueChange={setMaterial}>
                    <SelectTrigger data-testid="select-material">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {materials.map((mat) => (
                        <SelectItem key={mat.value} value={mat.value}>
                          {mat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="properties" className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="block-hardness">Hardness</Label>
                    <Input
                      id="block-hardness"
                      type="number"
                      step="0.1"
                      value={hardness}
                      onChange={(e) => setHardness(e.target.value)}
                      data-testid="input-hardness"
                    />
                  </div>
                  <div>
                    <Label htmlFor="block-light">Light Emission (0-15)</Label>
                    <Input
                      id="block-light"
                      type="number"
                      min="0"
                      max="15"
                      value={lightEmission}
                      onChange={(e) => setLightEmission(e.target.value)}
                      data-testid="input-light-emission"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <h4 className="font-medium text-foreground">Transparent</h4>
                    <p className="text-xs text-muted-foreground">Allow light to pass through</p>
                  </div>
                  <Switch
                    checked={isTransparent}
                    onCheckedChange={setIsTransparent}
                    data-testid="switch-transparent"
                  />
                </div>
              </TabsContent>

              <TabsContent value="texture" className="space-y-4">
                <div className="text-center text-muted-foreground py-8">
                  <p>Texture configuration will be available soon</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    data-testid="button-open-texture-creator"
                  >
                    Open Texture Creator
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4">
                <div className="text-center text-muted-foreground py-8">
                  <p>Advanced properties will be available soon</p>
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
            
            <CodePreview code={JSON.stringify(blockJSON, null, 2)} language="json" />

            <div className="mt-4">
              <ValidationStatus validation={validation} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
