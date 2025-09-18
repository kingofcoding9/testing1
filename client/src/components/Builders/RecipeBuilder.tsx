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
import { validateRecipeJSON } from "@/lib/minecraft/validation";
import { generateRecipeJSON } from "@/lib/minecraft/templates";

interface RecipeIngredient {
  item: string;
  count: number;
}

export default function RecipeBuilder() {
  const [identifier, setIdentifier] = useLocalStorage('recipe-identifier', '');
  const [recipeType, setRecipeType] = useLocalStorage('recipe-type', 'crafting_table');
  const [resultItem, setResultItem] = useLocalStorage('recipe-result-item', '');
  const [resultCount, setResultCount] = useLocalStorage('recipe-result-count', '1');
  const [ingredients, setIngredients] = useLocalStorage<RecipeIngredient[]>('recipe-ingredients', [
    { item: '', count: 1 }
  ]);
  const [activeTab, setActiveTab] = useState('basic');

  const recipeConfig = {
    identifier,
    type: recipeType,
    result: {
      item: resultItem,
      count: parseInt(resultCount) || 1
    },
    ingredients
  };

  const recipeJSON = generateRecipeJSON(recipeConfig);
  const validation = validateRecipeJSON(recipeJSON);

  const recipeTypes = [
    { value: 'crafting_table', label: 'Crafting Table' },
    { value: 'furnace', label: 'Furnace' },
    { value: 'brewing_stand', label: 'Brewing Stand' },
    { value: 'campfire', label: 'Campfire' },
    { value: 'stonecutter', label: 'Stonecutter' },
  ];

  const addIngredient = () => {
    setIngredients([...ingredients, { item: '', count: 1 }]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: keyof RecipeIngredient, value: string | number) => {
    setIngredients(ingredients.map((ing, i) => 
      i === index ? { ...ing, [field]: value } : ing
    ));
  };

  return (
    <section className="p-6" data-testid="recipe-builder">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Builder Form */}
          <div className="builder-form rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">Recipe Configuration</h3>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
              <TabsList className="bg-muted rounded-lg p-1">
                <TabsTrigger value="basic" data-testid="tab-basic">Basic</TabsTrigger>
                <TabsTrigger value="ingredients" data-testid="tab-ingredients">Ingredients</TabsTrigger>
                <TabsTrigger value="result" data-testid="tab-result">Result</TabsTrigger>
                <TabsTrigger value="advanced" data-testid="tab-advanced">Advanced</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div>
                  <Label htmlFor="recipe-identifier">Recipe Identifier</Label>
                  <Input
                    id="recipe-identifier"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="my_addon:custom_recipe"
                    data-testid="input-identifier"
                  />
                </div>

                <div>
                  <Label htmlFor="recipe-type">Recipe Type</Label>
                  <Select value={recipeType} onValueChange={setRecipeType}>
                    <SelectTrigger data-testid="select-recipe-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {recipeTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="ingredients" className="space-y-4">
                <div className="space-y-3">
                  {ingredients.map((ingredient, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <div className="flex-1">
                        <Input
                          placeholder="minecraft:iron_ingot"
                          value={ingredient.item}
                          onChange={(e) => updateIngredient(index, 'item', e.target.value)}
                          data-testid={`input-ingredient-item-${index}`}
                        />
                      </div>
                      <div className="w-20">
                        <Input
                          type="number"
                          min="1"
                          max="64"
                          value={ingredient.count}
                          onChange={(e) => updateIngredient(index, 'count', parseInt(e.target.value) || 1)}
                          data-testid={`input-ingredient-count-${index}`}
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeIngredient(index)}
                        disabled={ingredients.length === 1}
                        data-testid={`button-remove-ingredient-${index}`}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button 
                  variant="outline" 
                  onClick={addIngredient}
                  data-testid="button-add-ingredient"
                >
                  <Plus className="mr-2" size={16} />
                  Add Ingredient
                </Button>
              </TabsContent>

              <TabsContent value="result" className="space-y-4">
                <div>
                  <Label htmlFor="result-item">Result Item</Label>
                  <Input
                    id="result-item"
                    value={resultItem}
                    onChange={(e) => setResultItem(e.target.value)}
                    placeholder="my_addon:custom_item"
                    data-testid="input-result-item"
                  />
                </div>

                <div>
                  <Label htmlFor="result-count">Result Count</Label>
                  <Input
                    id="result-count"
                    type="number"
                    min="1"
                    max="64"
                    value={resultCount}
                    onChange={(e) => setResultCount(e.target.value)}
                    data-testid="input-result-count"
                  />
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4">
                <div className="text-center text-muted-foreground py-8">
                  <p>Advanced recipe properties will be available soon</p>
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
            
            <CodePreview code={JSON.stringify(recipeJSON, null, 2)} language="json" />

            <div className="mt-4">
              <ValidationStatus validation={validation} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
