import { useState } from "react";
import { Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CodePreview from "@/components/Common/CodePreview";
import ValidationStatus from "@/components/Common/ValidationStatus";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { validateItemJSON } from "@/lib/minecraft/validation";
import { generateItemJSON } from "@/lib/minecraft/templates";

export default function ItemBuilder() {
  const [identifier, setIdentifier] = useLocalStorage('item-identifier', '');
  const [displayName, setDisplayName] = useLocalStorage('item-display-name', '');
  const [category, setCategory] = useLocalStorage('item-category', 'items');
  const [maxStackSize, setMaxStackSize] = useLocalStorage('item-max-stack', '64');
  const [durability, setDurability] = useLocalStorage('item-durability', '');
  const [isFood, setIsFood] = useLocalStorage('item-is-food', false);
  const [foodValue, setFoodValue] = useLocalStorage('item-food-value', '4');
  const [activeTab, setActiveTab] = useState('basic');

  const itemConfig = {
    identifier,
    displayName,
    category,
    maxStackSize: parseInt(maxStackSize) || 64,
    durability: durability ? parseInt(durability) : undefined,
    isFood,
    foodValue: isFood ? parseInt(foodValue) || 4 : undefined
  };

  const itemJSON = generateItemJSON(itemConfig);
  const validation = validateItemJSON(itemJSON);

  const categories = [
    { value: 'items', label: 'Items' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'construction', label: 'Construction' },
    { value: 'nature', label: 'Nature' },
  ];

  return (
    <section className="p-6" data-testid="item-builder">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Builder Form */}
          <div className="builder-form rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">Item Configuration</h3>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
              <TabsList className="bg-muted rounded-lg p-1">
                <TabsTrigger value="basic" data-testid="tab-basic">Basic</TabsTrigger>
                <TabsTrigger value="properties" data-testid="tab-properties">Properties</TabsTrigger>
                <TabsTrigger value="food" data-testid="tab-food">Food</TabsTrigger>
                <TabsTrigger value="advanced" data-testid="tab-advanced">Advanced</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div>
                  <Label htmlFor="item-identifier">Item Identifier</Label>
                  <Input
                    id="item-identifier"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="my_addon:custom_item"
                    data-testid="input-identifier"
                  />
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
                  <Label htmlFor="item-category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger data-testid="select-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="properties" className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="item-stack-size">Max Stack Size</Label>
                    <Input
                      id="item-stack-size"
                      type="number"
                      min="1"
                      max="64"
                      value={maxStackSize}
                      onChange={(e) => setMaxStackSize(e.target.value)}
                      data-testid="input-max-stack"
                    />
                  </div>
                  <div>
                    <Label htmlFor="item-durability">Durability (optional)</Label>
                    <Input
                      id="item-durability"
                      type="number"
                      min="1"
                      value={durability}
                      onChange={(e) => setDurability(e.target.value)}
                      placeholder="Leave empty for no durability"
                      data-testid="input-durability"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="food" className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <h4 className="font-medium text-foreground">Food Item</h4>
                    <p className="text-xs text-muted-foreground">Can be consumed by players</p>
                  </div>
                  <Switch
                    checked={isFood}
                    onCheckedChange={setIsFood}
                    data-testid="switch-is-food"
                  />
                </div>

                {isFood && (
                  <div>
                    <Label htmlFor="food-value">Food Value (hunger points)</Label>
                    <Input
                      id="food-value"
                      type="number"
                      min="1"
                      max="20"
                      value={foodValue}
                      onChange={(e) => setFoodValue(e.target.value)}
                      data-testid="input-food-value"
                    />
                  </div>
                )}
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
            
            <CodePreview code={JSON.stringify(itemJSON, null, 2)} language="json" />

            <div className="mt-4">
              <ValidationStatus validation={validation} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
