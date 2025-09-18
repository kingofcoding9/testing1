import { z } from 'zod';
import { 
  EntityComponentSchema, 
  entityComponents, 
  generateEntityComponentJSON,
  entityCategories 
} from './entityRegistry';
import { 
  BlockComponentSchema, 
  blockComponents, 
  generateBlockComponentJSON,
  generateBlockJSON,
  blockCategories 
} from './blockRegistry';
import { 
  ItemComponentSchema, 
  itemComponents, 
  generateItemComponentJSON,
  generateItemJSON,
  itemCategories 
} from './itemRegistry';
import { 
  RecipeType, 
  LootFunction, 
  BiomeComponent, 
  SpawnRuleComponent,
  recipeTypes,
  lootFunctions,
  biomeComponents,
  spawnRuleComponents,
  generateRecipeJSON,
  generateLootTableJSON,
  generateBiomeJSON,
  generateSpawnRulesJSON,
  gameplayCategories
} from './gameplayRegistry';

// =============================================================================
// UNIFIED BEDROCK COMPONENT SCHEMAS
// =============================================================================

// Base schemas for all component types
export const BaseComponentSchema = z.object({
  name: z.string(),
  description: z.string(),
  category: z.string(),
  subcategory: z.string().optional(),
  version: z.string(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  keywords: z.array(z.string()),
  stability: z.enum(['stable', 'experimental', 'beta']),
  dependencies: z.array(z.string()).optional(),
  conflicts: z.array(z.string()).optional(),
});

// Complete addon manifest schema
export const AddonManifestSchema = z.object({
  format_version: z.number().default(2),
  header: z.object({
    name: z.string(),
    description: z.string(),
    uuid: z.string().uuid(),
    version: z.array(z.number()).length(3),
    min_engine_version: z.array(z.number()).length(3)
  }),
  modules: z.array(z.object({
    description: z.string(),
    type: z.enum(['data', 'resources', 'client_data', 'javascript']),
    uuid: z.string().uuid(),
    version: z.array(z.number()).length(3)
  })),
  dependencies: z.array(z.object({
    description: z.string().optional(),
    uuid: z.string().uuid(),
    version: z.array(z.number()).length(3)
  })).optional(),
  capabilities: z.array(z.string()).optional(),
  metadata: z.object({
    authors: z.array(z.string()).optional(),
    license: z.string().optional(),
    url: z.string().url().optional()
  }).optional()
});

// Entity definition schema
export const EntityDefinitionSchema = z.object({
  format_version: z.string().default("1.21.0"),
  "minecraft:entity": z.object({
    description: z.object({
      identifier: z.string(),
      is_spawnable: z.boolean().default(true),
      is_summonable: z.boolean().default(true),
      is_experimental: z.boolean().default(false),
      runtime_identifier: z.string().optional(),
      scripts: z.object({
        animate: z.array(z.string()).optional()
      }).optional()
    }),
    component_groups: z.record(z.object({}).passthrough()).default({}),
    components: z.record(z.any()),
    events: z.record(z.object({
      randomize: z.array(z.object({
        weight: z.number(),
        add: z.object({
          component_groups: z.array(z.string())
        }).optional(),
        remove: z.object({
          component_groups: z.array(z.string())
        }).optional()
      })).optional(),
      sequence: z.array(z.object({
        filters: z.any().optional(),
        add: z.object({
          component_groups: z.array(z.string())
        }).optional(),
        remove: z.object({
          component_groups: z.array(z.string())
        }).optional(),
        trigger: z.string().optional()
      })).optional(),
      add: z.object({
        component_groups: z.array(z.string())
      }).optional(),
      remove: z.object({
        component_groups: z.array(z.string())
      }).optional(),
      trigger: z.string().optional()
    }).passthrough()).default({})
  })
});

// Block definition schema
export const BlockDefinitionSchema = z.object({
  format_version: z.string().default("1.21.0"),
  "minecraft:block": z.object({
    description: z.object({
      identifier: z.string(),
      menu_category: z.object({
        category: z.string(),
        group: z.string().optional(),
        is_hidden_in_commands: z.boolean().optional()
      }).optional(),
      traits: z.record(z.any()).optional()
    }),
    components: z.record(z.any()),
    permutations: z.array(z.object({
      condition: z.string(),
      components: z.record(z.any())
    })).default([])
  })
});

// Item definition schema
export const ItemDefinitionSchema = z.object({
  format_version: z.string().default("1.21.0"),
  "minecraft:item": z.object({
    description: z.object({
      identifier: z.string(),
      menu_category: z.object({
        category: z.string(),
        group: z.string().optional(),
        is_hidden_in_commands: z.boolean().optional()
      }).optional()
    }),
    components: z.record(z.any())
  })
});

// Recipe schemas
export const ShapedRecipeSchema = z.object({
  format_version: z.string().default("1.21.0"),
  "minecraft:recipe_shaped": z.object({
    description: z.object({
      identifier: z.string()
    }),
    tags: z.array(z.string()).default(["crafting_table"]),
    pattern: z.array(z.string()).min(1).max(3),
    key: z.record(z.object({
      item: z.string(),
      data: z.number().optional(),
      count: z.number().optional()
    })),
    result: z.object({
      item: z.string(),
      count: z.number().default(1),
      data: z.number().optional()
    }),
    group: z.string().optional(),
    priority: z.number().optional()
  })
});

export const ShapelessRecipeSchema = z.object({
  format_version: z.string().default("1.21.0"),
  "minecraft:recipe_shapeless": z.object({
    description: z.object({
      identifier: z.string()
    }),
    tags: z.array(z.string()).default(["crafting_table"]),
    ingredients: z.array(z.object({
      item: z.string(),
      data: z.number().optional(),
      count: z.number().optional()
    })).min(1).max(9),
    result: z.object({
      item: z.string(),
      count: z.number().default(1),
      data: z.number().optional()
    }),
    group: z.string().optional(),
    priority: z.number().optional()
  })
});

// Loot table schema
export const LootTableSchema = z.object({
  format_version: z.string().default("1.21.0"),
  pools: z.array(z.object({
    rolls: z.union([
      z.number(),
      z.object({
        min: z.number(),
        max: z.number()
      })
    ]),
    bonus_rolls: z.union([
      z.number(),
      z.object({
        min: z.number(),
        max: z.number()
      })
    ]).optional(),
    conditions: z.array(z.object({
      condition: z.string()
    }).passthrough()).optional(),
    entries: z.array(z.object({
      type: z.enum(['item', 'loot_table', 'empty']),
      name: z.string().optional(),
      weight: z.number().default(1),
      quality: z.number().default(0),
      functions: z.array(z.object({
        function: z.string()
      }).passthrough()).optional(),
      conditions: z.array(z.object({
        condition: z.string()
      }).passthrough()).optional()
    }))
  }))
});

// Biome definition schema
export const BiomeDefinitionSchema = z.object({
  format_version: z.string().default("1.21.0"),
  "minecraft:biome": z.object({
    description: z.object({
      identifier: z.string()
    }),
    components: z.record(z.any())
  })
});

// Spawn rules schema
export const SpawnRulesSchema = z.object({
  format_version: z.string().default("1.21.0"),
  "minecraft:spawn_rules": z.object({
    description: z.object({
      identifier: z.string(),
      population_control: z.string().optional()
    }),
    conditions: z.array(z.record(z.any()))
  })
});

// =============================================================================
// COMPONENT VALIDATION FUNCTIONS
// =============================================================================

export function validateEntityComponent(componentName: string, componentData: any): { valid: boolean; errors: string[] } {
  const component = entityComponents.find(c => c.name === componentName);
  if (!component) {
    return { valid: false, errors: [`Unknown entity component: ${componentName}`] };
  }

  const errors: string[] = [];
  
  // Validate required properties
  const requiredProps = component.properties.filter(p => p.required);
  for (const prop of requiredProps) {
    if (!(prop.name in componentData)) {
      errors.push(`Missing required property: ${prop.name}`);
    }
  }

  // Validate property types and ranges
  for (const [key, value] of Object.entries(componentData)) {
    const propDef = component.properties.find(p => p.name === key);
    if (!propDef) continue;

    // Type validation
    switch (propDef.type) {
      case 'number':
        if (typeof value !== 'number') {
          errors.push(`Property ${key} must be a number`);
        } else {
          if (propDef.min !== undefined && value < propDef.min) {
            errors.push(`Property ${key} must be >= ${propDef.min}`);
          }
          if (propDef.max !== undefined && value > propDef.max) {
            errors.push(`Property ${key} must be <= ${propDef.max}`);
          }
        }
        break;
      case 'boolean':
        if (typeof value !== 'boolean') {
          errors.push(`Property ${key} must be a boolean`);
        }
        break;
      case 'string':
        if (typeof value !== 'string') {
          errors.push(`Property ${key} must be a string`);
        } else if (propDef.options && !propDef.options.includes(value)) {
          errors.push(`Property ${key} must be one of: ${propDef.options.join(', ')}`);
        }
        break;
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateBlockComponent(componentName: string, componentData: any): { valid: boolean; errors: string[] } {
  const component = blockComponents.find(c => c.name === componentName);
  if (!component) {
    return { valid: false, errors: [`Unknown block component: ${componentName}`] };
  }

  // Similar validation logic as entity components
  const errors: string[] = [];
  const requiredProps = component.properties.filter(p => p.required);
  
  for (const prop of requiredProps) {
    if (!(prop.name in componentData)) {
      errors.push(`Missing required property: ${prop.name}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateItemComponent(componentName: string, componentData: any): { valid: boolean; errors: string[] } {
  const component = itemComponents.find(c => c.name === componentName);
  if (!component) {
    return { valid: false, errors: [`Unknown item component: ${componentName}`] };
  }

  // Similar validation logic as entity components
  const errors: string[] = [];
  const requiredProps = component.properties.filter(p => p.required);
  
  for (const prop of requiredProps) {
    if (!(prop.name in componentData)) {
      errors.push(`Missing required property: ${prop.name}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

// =============================================================================
// TEMPLATE GENERATORS
// =============================================================================

export interface AddonConfig {
  name: string;
  description: string;
  author: string;
  version: string;
  minEngineVersion: string;
  packType: 'behavior' | 'resource';
}

export function generateAddonManifest(config: AddonConfig): object {
  const [major, minor, patch] = config.version.split('.').map(v => parseInt(v) || 0);
  const [engineMajor, engineMinor, enginePatch] = config.minEngineVersion.split('.').map(v => parseInt(v) || 1);

  return AddonManifestSchema.parse({
    format_version: 2,
    header: {
      name: config.name,
      description: config.description,
      uuid: generateUUID(),
      version: [major, minor, patch],
      min_engine_version: [engineMajor, engineMinor, enginePatch]
    },
    modules: [
      {
        description: `${config.packType === 'behavior' ? 'Behavior' : 'Resource'} Pack Module`,
        type: config.packType === 'behavior' ? 'data' : 'resources',
        uuid: generateUUID(),
        version: [major, minor, patch]
      }
    ]
  });
}

export function generateCompleteEntity(
  identifier: string,
  selectedComponents: Array<{ name: string; properties: Record<string, any> }>,
  componentGroups?: Record<string, string[]>,
  events?: Record<string, any>
): object {
  const componentObj: Record<string, any> = {};
  
  selectedComponents.forEach(component => {
    componentObj[component.name] = component.properties;
  });

  return EntityDefinitionSchema.parse({
    format_version: "1.21.0",
    "minecraft:entity": {
      description: {
        identifier: identifier,
        is_spawnable: true,
        is_summonable: true,
        is_experimental: false
      },
      component_groups: componentGroups || {},
      components: componentObj,
      events: events || {}
    }
  });
}

export function generateCompleteBlock(
  identifier: string,
  selectedComponents: Array<{ name: string; properties: Record<string, any> }>,
  permutations?: Array<{ condition: string; components: Record<string, any> }>
): object {
  const componentObj: Record<string, any> = {};
  
  selectedComponents.forEach(component => {
    componentObj[component.name] = component.properties;
  });

  return BlockDefinitionSchema.parse({
    format_version: "1.21.0",
    "minecraft:block": {
      description: {
        identifier: identifier,
        menu_category: {
          category: "construction"
        }
      },
      components: componentObj,
      permutations: permutations || []
    }
  });
}

export function generateCompleteItem(
  identifier: string,
  selectedComponents: Array<{ name: string; properties: Record<string, any> }>
): object {
  const componentObj: Record<string, any> = {};
  
  selectedComponents.forEach(component => {
    componentObj[component.name] = component.properties;
  });

  return ItemDefinitionSchema.parse({
    format_version: "1.21.0",
    "minecraft:item": {
      description: {
        identifier: identifier,
        menu_category: {
          category: "items"
        }
      },
      components: componentObj
    }
  });
}

// =============================================================================
// COMPONENT COMPATIBILITY CHECKER
// =============================================================================

export function checkComponentCompatibility(components: string[]): {
  compatible: boolean;
  conflicts: Array<{ component1: string; component2: string; reason: string }>;
  warnings: string[];
  suggestions: string[];
} {
  const conflicts: Array<{ component1: string; component2: string; reason: string }> = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Check for explicit conflicts
  for (let i = 0; i < components.length; i++) {
    for (let j = i + 1; j < components.length; j++) {
      const comp1 = entityComponents.find(c => c.name === components[i]) ||
                   blockComponents.find(c => c.name === components[i]) ||
                   itemComponents.find(c => c.name === components[i]);
      
      if (comp1?.conflicts?.includes(components[j])) {
        conflicts.push({
          component1: components[i],
          component2: components[j],
          reason: 'Explicit conflict defined'
        });
      }
    }
  }

  // Check missing dependencies
  for (const componentName of components) {
    const comp = entityComponents.find(c => c.name === componentName) ||
                 blockComponents.find(c => c.name === componentName) ||
                 itemComponents.find(c => c.name === componentName);
    
    if (comp?.dependencies) {
      for (const dep of comp.dependencies) {
        if (!components.includes(dep)) {
          warnings.push(`Component ${componentName} requires ${dep} but it's not included`);
          suggestions.push(`Add ${dep} component`);
        }
      }
    }
  }

  // Logical compatibility checks
  const hasMovement = components.some(c => c.includes('movement'));
  const hasNavigation = components.some(c => c.includes('navigation'));
  const hasPhysics = components.includes('minecraft:physics');

  if (hasMovement && !hasPhysics) {
    warnings.push('Movement components work best with minecraft:physics');
    suggestions.push('Add minecraft:physics component');
  }

  if (hasNavigation && !hasMovement) {
    warnings.push('Navigation components require movement components');
    suggestions.push('Add a movement component');
  }

  return {
    compatible: conflicts.length === 0,
    conflicts,
    warnings,
    suggestions
  };
}

// Utility functions
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Export all schemas for external use
export const BedrockSchemas = {
  AddonManifest: AddonManifestSchema,
  EntityDefinition: EntityDefinitionSchema,
  BlockDefinition: BlockDefinitionSchema,
  ItemDefinition: ItemDefinitionSchema,
  ShapedRecipe: ShapedRecipeSchema,
  ShapelessRecipe: ShapelessRecipeSchema,
  LootTable: LootTableSchema,
  BiomeDefinition: BiomeDefinitionSchema,
  SpawnRules: SpawnRulesSchema,
  EntityComponent: EntityComponentSchema,
  BlockComponent: BlockComponentSchema,
  ItemComponent: ItemComponentSchema
};

// Export validation functions
export const BedrockValidators = {
  validateEntityComponent,
  validateBlockComponent,
  validateItemComponent,
  checkComponentCompatibility
};

// Export template generators
export const BedrockTemplates = {
  generateAddonManifest,
  generateCompleteEntity,
  generateCompleteBlock,
  generateCompleteItem,
  generateRecipeJSON,
  generateLootTableJSON,
  generateBiomeJSON,
  generateSpawnRulesJSON
};