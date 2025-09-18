import { useState, useMemo } from "react";
import { ChefHat, Download, Copy, Save, RotateCcw, Info, Plus, Trash2, Grid3X3, Shuffle, Flame, Beaker, Hammer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import CodePreview from "@/components/Common/CodePreview";
import ValidationStatus from "@/components/Common/ValidationStatus";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useToast } from "@/hooks/use-toast";
import { validateRecipeJSON } from "@/lib/minecraft/validation";

// Import the comprehensive recipe registry
import { recipeTypes, generateRecipeJSON } from "@shared/gameplayRegistry";

interface RecipeIngredient {
  item: string;
  count?: number;
  data?: number;
  tag?: string;
}

interface ShapedRecipeKey {
  [key: string]: RecipeIngredient;
}

interface RecipeResult {
  item: string;
  count: number;
  data?: number;
}

export default function RecipeBuilder() {
  const { toast } = useToast();

  // Basic recipe properties
  const [identifier, setIdentifier] = useLocalStorage('recipe-identifier-v2', '');
  const [selectedRecipeType, setSelectedRecipeType] = useLocalStorage('recipe-selected-type-v2', 'minecraft:recipe_shaped');
  const [description, setDescription] = useLocalStorage('recipe-description-v2', '');
  const [tags, setTags] = useLocalStorage('recipe-tags-v2', 'crafting_table');
  const [group, setGroup] = useLocalStorage('recipe-group-v2', '');

  // Recipe-specific properties
  const [shapedPattern, setShapedPattern] = useLocalStorage<string[]>('recipe-shaped-pattern-v2', ['AAA', 'A A', 'AAA']);
  const [shapedKeys, setShapedKeys] = useLocalStorage<ShapedRecipeKey>('recipe-shaped-keys-v2', { 'A': { item: 'minecraft:planks' } });
  const [shapelessIngredients, setShapelessIngredients] = useLocalStorage<RecipeIngredient[]>('recipe-shapeless-ingredients-v2', [{ item: 'minecraft:planks' }]);
  const [furnaceInput, setFurnaceInput] = useLocalStorage<RecipeIngredient>('recipe-furnace-input-v2', { item: 'minecraft:raw_iron' });
  const [brewingInput, setBrewingInput] = useLocalStorage<RecipeIngredient>('recipe-brewing-input-v2', { item: 'minecraft:potion', tag: 'minecraft:awkward_potion' });
  const [brewingReagent, setBrewingReagent] = useLocalStorage<RecipeIngredient>('recipe-brewing-reagent-v2', { item: 'minecraft:spider_eye' });
  const [smithingTemplate, setSmithingTemplate] = useLocalStorage<RecipeIngredient>('recipe-smithing-template-v2', { item: 'minecraft:netherite_upgrade_smithing_template' });
  const [smithingBase, setSmithingBase] = useLocalStorage<RecipeIngredient>('recipe-smithing-base-v2', { item: 'minecraft:diamond_sword' });
  const [smithingAddition, setSmithingAddition] = useLocalStorage<RecipeIngredient>('recipe-smithing-addition-v2', { item: 'minecraft:netherite_ingot' });

  // Result configuration
  const [result, setResult] = useLocalStorage<RecipeResult>('recipe-result-v2', { item: 'minecraft:chest', count: 1 });

  // UI state
  const [activeTab, setActiveTab] = useState('basic');

  // Get current recipe type definition
  const currentRecipeTypeDef = recipeTypes.find(r => r.name === selectedRecipeType);

  // Generate JSON based on recipe type
  const recipeJSON = useMemo(() => {
    const baseDescription = {
      identifier: identifier || "my_addon:custom_recipe"
    };

    let recipeProperties: Record<string, any> = {};

    switch (selectedRecipeType) {
      case 'minecraft:recipe_shaped':
        recipeProperties = {
          tags: tags.split(',').map(t => t.trim()).filter(t => t),
          pattern: shapedPattern,
          key: shapedKeys,
          result: result,
          ...(group && { group })
        };
        break;

      case 'minecraft:recipe_shapeless':
        recipeProperties = {
          tags: tags.split(',').map(t => t.trim()).filter(t => t),
          ingredients: shapelessIngredients,
          result: result,
          ...(group && { group })
        };
        break;

      case 'minecraft:recipe_furnace':
        recipeProperties = {
          tags: tags.split(',').map(t => t.trim()).filter(t => t),
          input: furnaceInput,
          output: result.item,
          ...(group && { group })
        };
        break;

      case 'minecraft:recipe_brewing_mix':
        recipeProperties = {
          tags: tags.split(',').map(t => t.trim()).filter(t => t),
          input: brewingInput,
          reagent: brewingReagent,
          output: result.item,
          ...(group && { group })
        };
        break;

      case 'minecraft:recipe_brewing_container':
        recipeProperties = {
          tags: tags.split(',').map(t => t.trim()).filter(t => t),
          input: brewingInput,
          reagent: brewingReagent,
          output: result.item,
          ...(group && { group })
        };
        break;

      case 'minecraft:recipe_smithing_transform':
        recipeProperties = {
          tags: tags.split(',').map(t => t.trim()).filter(t => t),
          template: smithingTemplate,
          base: smithingBase,
          addition: smithingAddition,
          result: result,
          ...(group && { group })
        };
        break;

      case 'minecraft:recipe_smithing_trim':
        recipeProperties = {
          tags: tags.split(',').map(t => t.trim()).filter(t => t),
          template: smithingTemplate,
          base: smithingBase,
          addition: smithingAddition,
          ...(group && { group })
        };
        break;

      default:
        recipeProperties = {
          tags: tags.split(',').map(t => t.trim()).filter(t => t),
          result: result
        };
    }

    return {
      format_version: "1.21.0",
      [selectedRecipeType]: {
        description: baseDescription,
        ...recipeProperties
      }
    };
  }, [
    identifier, selectedRecipeType, tags, group, shapedPattern, shapedKeys, 
    shapelessIngredients, furnaceInput, brewingInput, brewingReagent, 
    smithingTemplate, smithingBase, smithingAddition, result
  ]);

  const validation = validateRecipeJSON(recipeJSON);

  // Recipe type categories
  const recipeTypesByCategory = useMemo(() => {
    const grouped: Record<string, typeof recipeTypes> = {};
    recipeTypes.forEach(recipe => {
      if (!grouped[recipe.category]) grouped[recipe.category] = [];
      grouped[recipe.category].push(recipe);
    });
    return grouped;
  }, []);

  // Recipe management functions
  const resetRecipe = () => {
    setIdentifier('');
    setDescription('');
    setTags('crafting_table');
    setGroup('');
    setShapedPattern(['AAA', 'A A', 'AAA']);
    setShapedKeys({ 'A': { item: 'minecraft:planks' } });
    setShapelessIngredients([{ item: 'minecraft:planks' }]);
    setResult({ item: 'minecraft:chest', count: 1 });
    
    toast({
      title: "Recipe reset",
      description: "Recipe has been reset to default state."
    });
  };

  const exportToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(recipeJSON, null, 2));
    toast({
      title: "Copied to clipboard",
      description: "Recipe JSON has been copied to your clipboard."
    });
  };

  const addShapedKey = () => {
    const availableKeys = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').filter(k => !shapedKeys[k]);
    if (availableKeys.length > 0) {
      setShapedKeys({ ...shapedKeys, [availableKeys[0]]: { item: 'minecraft:stone' } });
    }
  };

  const removeShapedKey = (key: string) => {
    const newKeys = { ...shapedKeys };
    delete newKeys[key];
    setShapedKeys(newKeys);
  };

  const updateShapedKey = (key: string, ingredient: RecipeIngredient) => {
    setShapedKeys({ ...shapedKeys, [key]: ingredient });
  };

  const addShapelessIngredient = () => {
    setShapelessIngredients([...shapelessIngredients, { item: 'minecraft:stone' }]);
  };

  const removeShapelessIngredient = (index: number) => {
    setShapelessIngredients(shapelessIngredients.filter((_, i) => i !== index));
  };

  const updateShapelessIngredient = (index: number, ingredient: RecipeIngredient) => {
    setShapelessIngredients(shapelessIngredients.map((ing, i) => i === index ? ingredient : ing));
  };

  const getRecipeTypeIcon = (recipeType: string) => {
    switch (recipeType) {
      case 'minecraft:recipe_shaped': return <Grid3X3 className="w-4 h-4" />;
      case 'minecraft:recipe_shapeless': return <Shuffle className="w-4 h-4" />;
      case 'minecraft:recipe_furnace': return <Flame className="w-4 h-4" />;
      case 'minecraft:recipe_brewing_mix':
      case 'minecraft:recipe_brewing_container': return <Beaker className="w-4 h-4" />;
      case 'minecraft:recipe_smithing_transform':
      case 'minecraft:recipe_smithing_trim': return <Hammer className="w-4 h-4" />;
      default: return <ChefHat className="w-4 h-4" />;
    }
  };

  return (
    <TooltipProvider>
      <section className="p-6" data-testid="recipe-builder">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Builder Form */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ChefHat className="w-5 h-5" />
                    Recipe Configuration
                  </CardTitle>
                  <CardDescription>
                    Create comprehensive Minecraft Bedrock recipes with all official recipe types
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="basic" data-testid="tab-basic">Basic</TabsTrigger>
                      <TabsTrigger value="type" data-testid="tab-type">Type & Config</TabsTrigger>
                      <TabsTrigger value="result" data-testid="tab-result">Result</TabsTrigger>
                      <TabsTrigger value="advanced" data-testid="tab-advanced">Advanced</TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="space-y-4">
                      <div className="grid gap-4">
                        <div>
                          <Label htmlFor="recipe-identifier">Recipe Identifier *</Label>
                          <Input
                            id="recipe-identifier"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            placeholder="my_addon:custom_recipe"
                            data-testid="input-identifier"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Must include namespace (e.g., my_addon:recipe_name)
                          </p>
                        </div>

                        <div>
                          <Label htmlFor="recipe-description">Description</Label>
                          <Input
                            id="recipe-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="A custom recipe for my addon"
                            data-testid="input-description"
                          />
                        </div>

                        <div>
                          <Label htmlFor="recipe-tags">Recipe Tags</Label>
                          <Input
                            id="recipe-tags"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="crafting_table, furnace"
                            data-testid="input-tags"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Comma-separated list (e.g., crafting_table, stonecutter)
                          </p>
                        </div>

                        <div>
                          <Label htmlFor="recipe-group">Recipe Group (optional)</Label>
                          <Input
                            id="recipe-group"
                            value={group}
                            onChange={(e) => setGroup(e.target.value)}
                            placeholder="wooden_tools"
                            data-testid="input-group"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Groups recipes together in the recipe book
                          </p>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="type" className="space-y-4">
                      <div>
                        <Label>Recipe Type</Label>
                        <div className="grid gap-3 mt-2">
                          {Object.entries(recipeTypesByCategory).map(([category, categoryRecipes]) => (
                            <div key={category}>
                              <h4 className="font-medium text-sm mb-2">{category}</h4>
                              <div className="grid gap-2">
                                {categoryRecipes.map((recipeType) => (
                                  <Card 
                                    key={recipeType.name}
                                    className={`p-3 cursor-pointer transition-colors ${
                                      selectedRecipeType === recipeType.name 
                                        ? 'ring-2 ring-primary bg-primary/5' 
                                        : 'hover:bg-muted/50'
                                    }`}
                                    onClick={() => setSelectedRecipeType(recipeType.name)}
                                    data-testid={`card-recipe-type-${recipeType.name}`}
                                  >
                                    <div className="flex items-center gap-3">
                                      {getRecipeTypeIcon(recipeType.name)}
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium text-sm">
                                            {recipeType.name.replace('minecraft:recipe_', '').replace('_', ' ')}
                                          </span>
                                          <Badge 
                                            variant="outline" 
                                            className={`text-xs ${
                                              recipeType.difficulty === 'beginner' ? 'border-green-500' :
                                              recipeType.difficulty === 'intermediate' ? 'border-yellow-500' :
                                              'border-red-500'
                                            }`}
                                          >
                                            {recipeType.difficulty}
                                          </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                          {recipeType.description}
                                        </p>
                                      </div>
                                    </div>
                                  </Card>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Recipe Type Specific Configuration */}
                      {currentRecipeTypeDef && (
                        <Card className="mt-4">
                          <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                              {getRecipeTypeIcon(selectedRecipeType)}
                              Configure {selectedRecipeType.replace('minecraft:recipe_', '').replace('_', ' ')}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {selectedRecipeType === 'minecraft:recipe_shaped' && (
                              <div className="space-y-4">
                                <div>
                                  <Label>Crafting Pattern</Label>
                                  <div className="grid gap-2 mt-2">
                                    {shapedPattern.map((row, index) => (
                                      <Input
                                        key={index}
                                        value={row}
                                        onChange={(e) => {
                                          const newPattern = [...shapedPattern];
                                          newPattern[index] = e.target.value;
                                          setShapedPattern(newPattern);
                                        }}
                                        placeholder="AAA"
                                        className="font-mono text-center"
                                        maxLength={3}
                                        data-testid={`input-pattern-${index}`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <Label>Key Mappings</Label>
                                    <Button variant="outline" size="sm" onClick={addShapedKey}>
                                      <Plus className="w-3 h-3 mr-1" />
                                      Add Key
                                    </Button>
                                  </div>
                                  {Object.entries(shapedKeys).map(([key, ingredient]) => (
                                    <div key={key} className="flex items-center gap-2 mb-2">
                                      <div className="w-8 text-center font-mono font-bold">{key}</div>
                                      <Input
                                        value={ingredient.item}
                                        onChange={(e) => updateShapedKey(key, { ...ingredient, item: e.target.value })}
                                        placeholder="minecraft:planks"
                                        className="flex-1"
                                        data-testid={`input-key-${key}`}
                                      />
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => removeShapedKey(key)}
                                        data-testid={`button-remove-key-${key}`}
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {selectedRecipeType === 'minecraft:recipe_shapeless' && (
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <Label>Ingredients</Label>
                                  <Button variant="outline" size="sm" onClick={addShapelessIngredient}>
                                    <Plus className="w-3 h-3 mr-1" />
                                    Add Ingredient
                                  </Button>
                                </div>
                                {shapelessIngredients.map((ingredient, index) => (
                                  <div key={index} className="flex items-center gap-2 mb-2">
                                    <Input
                                      value={ingredient.item}
                                      onChange={(e) => updateShapelessIngredient(index, { ...ingredient, item: e.target.value })}
                                      placeholder="minecraft:planks"
                                      className="flex-1"
                                      data-testid={`input-shapeless-${index}`}
                                    />
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => removeShapelessIngredient(index)}
                                      disabled={shapelessIngredients.length === 1}
                                      data-testid={`button-remove-shapeless-${index}`}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}

                            {selectedRecipeType === 'minecraft:recipe_furnace' && (
                              <div>
                                <Label>Input Item</Label>
                                <Input
                                  value={furnaceInput.item}
                                  onChange={(e) => setFurnaceInput({ ...furnaceInput, item: e.target.value })}
                                  placeholder="minecraft:raw_iron"
                                  data-testid="input-furnace-input"
                                />
                              </div>
                            )}

                            {(selectedRecipeType === 'minecraft:recipe_brewing_mix' || selectedRecipeType === 'minecraft:recipe_brewing_container') && (
                              <div className="space-y-4">
                                <div>
                                  <Label>Input (Base Potion)</Label>
                                  <Input
                                    value={brewingInput.item}
                                    onChange={(e) => setBrewingInput({ ...brewingInput, item: e.target.value })}
                                    placeholder="minecraft:potion"
                                    data-testid="input-brewing-input"
                                  />
                                </div>
                                <div>
                                  <Label>Reagent (Brewing Ingredient)</Label>
                                  <Input
                                    value={brewingReagent.item}
                                    onChange={(e) => setBrewingReagent({ ...brewingReagent, item: e.target.value })}
                                    placeholder="minecraft:spider_eye"
                                    data-testid="input-brewing-reagent"
                                  />
                                </div>
                              </div>
                            )}

                            {(selectedRecipeType === 'minecraft:recipe_smithing_transform' || selectedRecipeType === 'minecraft:recipe_smithing_trim') && (
                              <div className="space-y-4">
                                <div>
                                  <Label>Template</Label>
                                  <Input
                                    value={smithingTemplate.item}
                                    onChange={(e) => setSmithingTemplate({ ...smithingTemplate, item: e.target.value })}
                                    placeholder="minecraft:netherite_upgrade_smithing_template"
                                    data-testid="input-smithing-template"
                                  />
                                </div>
                                <div>
                                  <Label>Base Item</Label>
                                  <Input
                                    value={smithingBase.item}
                                    onChange={(e) => setSmithingBase({ ...smithingBase, item: e.target.value })}
                                    placeholder="minecraft:diamond_sword"
                                    data-testid="input-smithing-base"
                                  />
                                </div>
                                <div>
                                  <Label>Addition Material</Label>
                                  <Input
                                    value={smithingAddition.item}
                                    onChange={(e) => setSmithingAddition({ ...smithingAddition, item: e.target.value })}
                                    placeholder="minecraft:netherite_ingot"
                                    data-testid="input-smithing-addition"
                                  />
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}
                    </TabsContent>

                    <TabsContent value="result" className="space-y-4">
                      <div className="grid gap-4">
                        <div>
                          <Label htmlFor="result-item">Result Item *</Label>
                          <Input
                            id="result-item"
                            value={result.item}
                            onChange={(e) => setResult({ ...result, item: e.target.value })}
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
                            value={result.count}
                            onChange={(e) => setResult({ ...result, count: parseInt(e.target.value) || 1 })}
                            data-testid="input-result-count"
                          />
                        </div>

                        <div>
                          <Label htmlFor="result-data">Result Data Value (optional)</Label>
                          <Input
                            id="result-data"
                            type="number"
                            min="0"
                            value={result.data || ''}
                            onChange={(e) => setResult({ 
                              ...result, 
                              data: e.target.value ? parseInt(e.target.value) : undefined 
                            })}
                            placeholder="0"
                            data-testid="input-result-data"
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="advanced" className="space-y-4">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Actions</h4>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              onClick={resetRecipe}
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

                        {currentRecipeTypeDef && (
                          <div className="space-y-3">
                            <h4 className="font-medium">Recipe Type Information</h4>
                            <div className="bg-muted p-4 rounded">
                              <div className="text-sm space-y-2">
                                <div><strong>Type:</strong> {currentRecipeTypeDef.name}</div>
                                <div><strong>Category:</strong> {currentRecipeTypeDef.category}</div>
                                <div><strong>Difficulty:</strong> {currentRecipeTypeDef.difficulty}</div>
                                <div><strong>Version:</strong> {currentRecipeTypeDef.version}</div>
                                <div><strong>Stability:</strong> {currentRecipeTypeDef.stability}</div>
                              </div>
                            </div>
                          </div>
                        )}

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
                code={JSON.stringify(recipeJSON, null, 2)}
                language="json"
                title="Recipe JSON"
                validation={validation}
              />
            </div>
          </div>
        </div>
      </section>
    </TooltipProvider>
  );
}