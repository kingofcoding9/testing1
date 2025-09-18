import { useState } from "react";
import { Check, AlertCircle, Copy, Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CodePreview from "@/components/Common/CodePreview";
import { validateJSON, ValidationResult } from "@/lib/minecraft/validation";

type FileType = 'entity' | 'block' | 'item' | 'recipe' | 'loot_table' | 'biome' | 'client_entity' | 'spawn_rule' | 'auto';

export default function JSONValidator() {
  const [jsonInput, setJsonInput] = useState('');
  const [fileType, setFileType] = useState<FileType>('auto');
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validateInput = async () => {
    if (!jsonInput.trim()) {
      setValidation({ isValid: false, errors: ['JSON input cannot be empty'] });
      return;
    }

    setIsValidating(true);
    
    try {
      const result = validateJSON(jsonInput, fileType);
      setValidation(result);
    } catch (error) {
      setValidation({
        isValid: false,
        errors: [`Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`]
      });
    } finally {
      setIsValidating(false);
    }
  };

  const formatJSON = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonInput(formatted);
    } catch (error) {
      setValidation({
        isValid: false,
        errors: [`Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`]
      });
    }
  };

  const copyJSON = async () => {
    try {
      await navigator.clipboard.writeText(jsonInput);
    } catch (err) {
      console.error('Failed to copy JSON:', err);
    }
  };

  const loadSampleJSON = (sampleType: FileType) => {
    const samples = {
      entity: `{
  "format_version": "1.21.0",
  "minecraft:entity": {
    "description": {
      "identifier": "my_addon:custom_entity",
      "is_spawnable": true,
      "is_summonable": true
    },
    "components": {
      "minecraft:health": {
        "value": 20,
        "max": 20
      },
      "minecraft:movement": {
        "value": 0.25
      }
    }
  }
}`,
      block: `{
  "format_version": "1.21.0",
  "minecraft:block": {
    "description": {
      "identifier": "my_addon:custom_block",
      "register_to_creative_menu": true
    },
    "components": {
      "minecraft:destructible_by_mining": {
        "seconds_to_destroy": 1.5
      },
      "minecraft:map_color": "#7F7F7F"
    }
  }
}`,
      item: `{
  "format_version": "1.21.0",
  "minecraft:item": {
    "description": {
      "identifier": "my_addon:custom_item",
      "menu_category": {
        "category": "items"
      }
    },
    "components": {
      "minecraft:max_stack_size": 64,
      "minecraft:icon": {
        "texture": "custom_item"
      }
    }
  }
}`,
      recipe: `{
  "format_version": "1.21.0",
  "minecraft:recipe_shaped": {
    "description": {
      "identifier": "my_addon:custom_recipe"
    },
    "tags": ["crafting_table"],
    "pattern": [
      "###",
      "# #",
      "###"
    ],
    "key": {
      "#": {
        "item": "minecraft:stick"
      }
    },
    "result": {
      "item": "my_addon:custom_item"
    }
  }
}`,
      loot_table: `{
  "format_version": "1.21.0",
  "pools": [
    {
      "rolls": 1,
      "entries": [
        {
          "type": "item",
          "name": "minecraft:diamond",
          "weight": 1
        }
      ]
    }
  ]
}`,
      biome: `{
  "format_version": "1.21.0",
  "minecraft:biome": {
    "description": {
      "identifier": "my_addon:custom_biome"
    },
    "components": {
      "minecraft:climate": {
        "temperature": 0.8,
        "downfall": 0.4
      }
    }
  }
}`,
      client_entity: `{
  "format_version": "1.21.0",
  "minecraft:client_entity": {
    "description": {
      "identifier": "my_addon:custom_entity",
      "materials": { "default": "entity_alphatest" },
      "textures": { "default": "textures/entity/custom_entity" },
      "geometry": { "default": "geometry.custom_entity" }
    }
  }
}`,
      spawn_rule: `{
  "format_version": "1.21.0",
  "minecraft:spawn_rules": {
    "description": {
      "identifier": "my_addon:custom_entity",
      "population_control": "animal"
    },
    "conditions": [
      {
        "minecraft:spawns_on_surface": {},
        "minecraft:brightness_filter": {
          "min": 7,
          "max": 15
        }
      }
    ]
  }
}`,
      auto: ''
    };

    if (samples[sampleType]) {
      setJsonInput(samples[sampleType]);
      setFileType(sampleType);
    }
  };

  const fileTypes = [
    { value: 'auto' as FileType, label: 'Auto-detect' },
    { value: 'entity' as FileType, label: 'Entity' },
    { value: 'block' as FileType, label: 'Block' },
    { value: 'item' as FileType, label: 'Item' },
    { value: 'recipe' as FileType, label: 'Recipe' },
    { value: 'loot_table' as FileType, label: 'Loot Table' },
    { value: 'biome' as FileType, label: 'Biome' },
    { value: 'client_entity' as FileType, label: 'Client Entity' },
    { value: 'spawn_rule' as FileType, label: 'Spawn Rule' },
  ];

  return (
    <section className="p-6" data-testid="json-validator">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="builder-form rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-foreground">JSON Input</h3>
              <div className="flex space-x-2">
                <Select value={fileType} onValueChange={(value: FileType) => setFileType(value)}>
                  <SelectTrigger className="w-40" data-testid="select-file-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fileTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder="Paste your JSON here..."
              className="font-mono text-sm h-96 resize-none"
              data-testid="textarea-json-input"
            />

            <div className="flex items-center justify-between mt-4">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={formatJSON}
                  data-testid="button-format-json"
                >
                  <FileText className="mr-2" size={16} />
                  Format
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyJSON}
                  data-testid="button-copy-json"
                >
                  <Copy className="mr-2" size={16} />
                  Copy
                </Button>
              </div>
              <Button
                onClick={validateInput}
                disabled={isValidating}
                data-testid="button-validate"
              >
                {isValidating ? 'Validating...' : 'Validate JSON'}
              </Button>
            </div>
          </div>

          {/* Results Panel */}
          <div className="space-y-6">
            {/* Validation Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  {validation?.isValid ? (
                    <Check className="mr-2 text-green-500" size={20} />
                  ) : validation?.isValid === false ? (
                    <AlertCircle className="mr-2 text-destructive" size={20} />
                  ) : (
                    <FileText className="mr-2" size={20} />
                  )}
                  Validation Results
                </CardTitle>
                <CardDescription>
                  {validation 
                    ? validation.isValid 
                      ? 'Your JSON is valid and ready to use!'
                      : 'Found issues that need to be fixed'
                    : 'Click "Validate JSON" to check your code'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {validation ? (
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Badge variant={validation.isValid ? "default" : "destructive"}>
                        {validation.isValid ? 'Valid' : 'Invalid'}
                      </Badge>
                      {validation.warnings && validation.warnings.length > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {validation.warnings.length} Warning{validation.warnings.length !== 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>

                    {validation.errors && validation.errors.length > 0 && (
                      <div>
                        <h4 className="font-medium text-destructive mb-2">Errors:</h4>
                        <ul className="space-y-1">
                          {validation.errors.map((error, index) => (
                            <li key={index} className="text-sm text-destructive flex items-start">
                              <AlertCircle className="mr-2 mt-0.5 flex-shrink-0" size={16} />
                              {error}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {validation.warnings && validation.warnings.length > 0 && (
                      <div>
                        <h4 className="font-medium text-yellow-600 mb-2">Warnings:</h4>
                        <ul className="space-y-1">
                          {validation.warnings.map((warning, index) => (
                            <li key={index} className="text-sm text-yellow-600 flex items-start">
                              <AlertCircle className="mr-2 mt-0.5 flex-shrink-0" size={16} />
                              {warning}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No validation performed yet.</p>
                )}
              </CardContent>
            </Card>

            {/* Sample JSON */}
            <Card>
              <CardHeader>
                <CardTitle>Sample JSON</CardTitle>
                <CardDescription>
                  Load sample JSON files to test the validator
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="entity">
                  <TabsList className="grid grid-cols-3 gap-1">
                    <TabsTrigger value="entity" onClick={() => loadSampleJSON('entity')}>
                      Entity
                    </TabsTrigger>
                    <TabsTrigger value="block" onClick={() => loadSampleJSON('block')}>
                      Block
                    </TabsTrigger>
                    <TabsTrigger value="item" onClick={() => loadSampleJSON('item')}>
                      Item
                    </TabsTrigger>
                  </TabsList>
                  
                  <div className="mt-4">
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadSampleJSON('recipe')}
                        data-testid="button-load-recipe-sample"
                      >
                        Recipe
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadSampleJSON('loot_table')}
                        data-testid="button-load-loot-table-sample"
                      >
                        Loot Table
                      </Button>
                    </div>
                  </div>
                </Tabs>
              </CardContent>
            </Card>

            {/* Help */}
            <Card>
              <CardHeader>
                <CardTitle>Validation Help</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• The validator checks for proper JSON syntax and Minecraft-specific structure</p>
                <p>• Use "Auto-detect" to automatically identify the file type</p>
                <p>• Format your JSON for better readability before validation</p>
                <p>• Common errors include missing commas, brackets, and required properties</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
