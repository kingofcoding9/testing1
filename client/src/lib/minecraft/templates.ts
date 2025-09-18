interface EntityComponent {
  id: string;
  type: string;
  enabled: boolean;
  properties: Record<string, any>;
}

export function generateEntityJSON(identifier: string, displayName: string, components: EntityComponent[]) {
  const enabledComponents = components.filter(c => c.enabled);
  const componentObj: Record<string, any> = {};

  enabledComponents.forEach(component => {
    componentObj[component.type] = component.properties;
  });

  return {
    format_version: "1.21.0",
    "minecraft:entity": {
      description: {
        identifier: identifier || "my_addon:custom_entity",
        is_spawnable: true,
        is_summonable: true,
        is_experimental: false
      },
      component_groups: {},
      components: {
        "minecraft:collision_box": {
          width: 0.6,
          height: 1.8
        },
        "minecraft:physics": {},
        ...componentObj
      },
      events: {}
    }
  };
}

interface BlockConfig {
  identifier: string;
  displayName: string;
  material: string;
  hardness: number;
  lightEmission: number;
  isTransparent: boolean;
}

export function generateBlockJSON(config: BlockConfig) {
  const components: Record<string, any> = {
    "minecraft:destructible_by_mining": {
      seconds_to_destroy: config.hardness
    },
    "minecraft:destructible_by_explosion": {
      explosion_resistance: config.hardness * 3
    }
  };

  if (config.lightEmission > 0) {
    components["minecraft:light_emission"] = {
      emission: config.lightEmission
    };
  }

  if (config.material) {
    components["minecraft:material_instances"] = {
      "*": {
        texture: config.identifier.split(':')[1] || "custom_block",
        render_method: config.isTransparent ? "alpha_test" : "opaque"
      }
    };
  }

  return {
    format_version: "1.21.0",
    "minecraft:block": {
      description: {
        identifier: config.identifier || "my_addon:custom_block",
        register_to_creative_menu: true
      },
      components
    }
  };
}

interface ItemConfig {
  identifier: string;
  displayName: string;
  category: string;
  maxStackSize: number;
  durability?: number;
  isFood: boolean;
  foodValue?: number;
}

export function generateItemJSON(config: ItemConfig) {
  const components: Record<string, any> = {
    "minecraft:max_stack_size": config.maxStackSize,
    "minecraft:icon": {
      texture: config.identifier.split(':')[1] || "custom_item"
    }
  };

  if (config.displayName) {
    components["minecraft:display_name"] = {
      value: config.displayName
    };
  }

  if (config.durability) {
    components["minecraft:durability"] = {
      max_durability: config.durability
    };
  }

  if (config.isFood && config.foodValue) {
    components["minecraft:food"] = {
      nutrition: config.foodValue,
      saturation_modifier: 0.6
    };
    components["minecraft:use_animation"] = "eat";
  }

  return {
    format_version: "1.21.0",
    "minecraft:item": {
      description: {
        identifier: config.identifier || "my_addon:custom_item",
        menu_category: {
          category: config.category || "items"
        }
      },
      components
    }
  };
}

interface RecipeIngredient {
  item: string;
  count: number;
}

interface RecipeConfig {
  identifier: string;
  type: string;
  result: {
    item: string;
    count: number;
  };
  ingredients: RecipeIngredient[];
}

export function generateRecipeJSON(config: RecipeConfig) {
  const validIngredients = config.ingredients.filter(ing => ing.item.trim() !== '');
  
  if (config.type === 'furnace') {
    return {
      format_version: "1.21.0",
      "minecraft:recipe_furnace": {
        description: {
          identifier: config.identifier || "my_addon:custom_recipe"
        },
        tags: ["furnace"],
        input: validIngredients[0]?.item || "minecraft:iron_ore",
        output: config.result.item || "my_addon:custom_item"
      }
    };
  }

  // Default to shapeless recipe
  return {
    format_version: "1.21.0",
    "minecraft:recipe_shapeless": {
      description: {
        identifier: config.identifier || "my_addon:custom_recipe"
      },
      tags: ["crafting_table"],
      ingredients: validIngredients.map(ing => ({
        item: ing.item,
        count: ing.count
      })),
      result: {
        item: config.result.item || "my_addon:custom_item",
        count: config.result.count || 1
      }
    }
  };
}

interface LootEntry {
  type: string;
  name: string;
  weight: number;
}

interface LootPool {
  rolls: { min: number; max: number };
  entries: LootEntry[];
}

interface LootConfig {
  identifier: string;
  type: string;
  pools: LootPool[];
}

export function generateLootTableJSON(config: LootConfig) {
  const pools = config.pools.map(pool => ({
    rolls: {
      min: pool.rolls.min,
      max: pool.rolls.max
    },
    entries: pool.entries
      .filter(entry => entry.name.trim() !== '')
      .map(entry => ({
        type: entry.type,
        name: entry.name,
        weight: entry.weight
      }))
  })).filter(pool => pool.entries.length > 0);

  return {
    format_version: "1.21.0",
    pools
  };
}

export function generateManifestJSON(config: {
  name: string;
  description: string;
  author: string;
  version: string;
  minEngineVersion: string;
  packType: 'behavior' | 'resource';
}) {
  const [major, minor, patch] = config.version.split('.').map(v => parseInt(v) || 0);
  const [engineMajor, engineMinor, enginePatch] = config.minEngineVersion.split('.').map(v => parseInt(v) || 1);

  return {
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
  };
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
