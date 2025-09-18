import { z } from 'zod';

// Base interfaces for different gameplay elements
export interface RecipeType {
  name: string;
  description: string;
  category: 'Crafting' | 'Smelting' | 'Brewing' | 'Smithing' | 'Special';
  subcategory?: string;
  version: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  properties: GameplayProperty[];
  example: string;
  keywords: string[];
  stability: 'stable' | 'experimental' | 'beta';
}

export interface LootFunction {
  name: string;
  description: string;
  category: 'Loot' | 'Trading';
  subcategory?: string;
  version: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  properties: GameplayProperty[];
  example: string;
  keywords: string[];
  stability: 'stable' | 'experimental' | 'beta';
}

export interface BiomeComponent {
  name: string;
  description: string;
  category: 'Biome';
  subcategory?: string;
  version: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  properties: GameplayProperty[];
  example: string;
  keywords: string[];
  stability: 'stable' | 'experimental' | 'beta';
}

export interface SpawnRuleComponent {
  name: string;
  description: string;
  category: 'Spawning';
  subcategory?: string;
  version: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  properties: GameplayProperty[];
  example: string;
  keywords: string[];
  stability: 'stable' | 'experimental' | 'beta';
}

export interface GameplayProperty {
  name: string;
  type: 'number' | 'boolean' | 'string' | 'array' | 'object' | 'range' | 'filter' | 'condition';
  description: string;
  required?: boolean;
  default?: any;
  min?: number;
  max?: number;
  options?: string[];
  example?: any;
}

// Zod schemas
export const GameplayPropertySchema = z.object({
  name: z.string(),
  type: z.enum(['number', 'boolean', 'string', 'array', 'object', 'range', 'filter', 'condition']),
  description: z.string(),
  required: z.boolean().optional(),
  default: z.any().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  options: z.array(z.string()).optional(),
  example: z.any().optional(),
});

// =============================================================================
// RECIPE TYPES REGISTRY
// =============================================================================
export const recipeTypes: RecipeType[] = [
  {
    name: 'minecraft:recipe_shaped',
    description: 'Shaped crafting recipe that requires specific pattern arrangement.',
    category: 'Crafting',
    subcategory: 'Shaped',
    version: '1.12.0',
    difficulty: 'intermediate',
    properties: [
      { name: 'pattern', type: 'array', description: 'Crafting pattern using keys', required: true, example: ['###', '# #', '###'] },
      { name: 'key', type: 'object', description: 'Key mappings for pattern', required: true, example: { '#': { item: 'minecraft:planks' } } },
      { name: 'result', type: 'object', description: 'Result item and count', required: true, example: { item: 'minecraft:chest', count: 1 } },
      { name: 'tags', type: 'array', description: 'Recipe tags', example: ['crafting_table'] },
      { name: 'group', type: 'string', description: 'Recipe group for organization', example: 'wooden_door' }
    ],
    example: `{
  "format_version": "1.21.0",
  "minecraft:recipe_shaped": {
    "description": {
      "identifier": "my_addon:custom_chest"
    },
    "tags": ["crafting_table"],
    "pattern": [
      "###",
      "# #", 
      "###"
    ],
    "key": {
      "#": {
        "item": "minecraft:planks"
      }
    },
    "result": {
      "item": "minecraft:chest",
      "count": 1
    }
  }
}`,
    keywords: ['recipe', 'shaped', 'crafting', 'pattern', 'grid'],
    stability: 'stable'
  },

  {
    name: 'minecraft:recipe_shapeless',
    description: 'Shapeless crafting recipe where ingredient order doesn\'t matter.',
    category: 'Crafting',
    subcategory: 'Shapeless',
    version: '1.12.0',
    difficulty: 'beginner',
    properties: [
      { name: 'ingredients', type: 'array', description: 'Required ingredients list', required: true, example: [{ item: 'minecraft:planks' }, { item: 'minecraft:stick' }] },
      { name: 'result', type: 'object', description: 'Result item and count', required: true, example: { item: 'minecraft:wooden_sword', count: 1 } },
      { name: 'tags', type: 'array', description: 'Recipe tags', example: ['crafting_table'] },
      { name: 'group', type: 'string', description: 'Recipe group for organization', example: 'wooden_tools' }
    ],
    example: `{
  "format_version": "1.21.0",
  "minecraft:recipe_shapeless": {
    "description": {
      "identifier": "my_addon:custom_potion"
    },
    "tags": ["crafting_table"],
    "ingredients": [
      {
        "item": "minecraft:glass_bottle"
      },
      {
        "item": "minecraft:spider_eye"
      },
      {
        "item": "minecraft:sugar"
      }
    ],
    "result": {
      "item": "minecraft:potion",
      "count": 1
    }
  }
}`,
    keywords: ['recipe', 'shapeless', 'crafting', 'ingredients', 'flexible'],
    stability: 'stable'
  },

  {
    name: 'minecraft:recipe_furnace',
    description: 'Furnace smelting recipe for converting items with heat.',
    category: 'Smelting',
    subcategory: 'Furnace',
    version: '1.12.0',
    difficulty: 'beginner',
    properties: [
      { name: 'input', type: 'string', description: 'Input item identifier', required: true, example: 'minecraft:iron_ore' },
      { name: 'output', type: 'string', description: 'Output item identifier', required: true, example: 'minecraft:iron_ingot' },
      { name: 'tags', type: 'array', description: 'Recipe tags', example: ['furnace'] }
    ],
    example: `{
  "format_version": "1.21.0",
  "minecraft:recipe_furnace": {
    "description": {
      "identifier": "my_addon:smelt_custom_ore"
    },
    "tags": ["furnace"],
    "input": "my_addon:custom_ore",
    "output": "my_addon:custom_ingot"
  }
}`,
    keywords: ['recipe', 'furnace', 'smelting', 'cooking', 'heat'],
    stability: 'stable'
  },

  {
    name: 'minecraft:recipe_brewing_mix',
    description: 'Brewing stand recipe for creating potions.',
    category: 'Brewing',
    subcategory: 'Potions',
    version: '1.12.0',
    difficulty: 'intermediate',
    properties: [
      { name: 'input', type: 'string', description: 'Base potion input', required: true, example: 'minecraft:potion' },
      { name: 'reagent', type: 'string', description: 'Brewing reagent', required: true, example: 'minecraft:spider_eye' },
      { name: 'output', type: 'string', description: 'Output potion', required: true, example: 'minecraft:potion' },
      { name: 'tags', type: 'array', description: 'Recipe tags', example: ['brewing_stand'] }
    ],
    example: `{
  "format_version": "1.21.0",
  "minecraft:recipe_brewing_mix": {
    "description": {
      "identifier": "my_addon:custom_potion_brew"
    },
    "tags": ["brewing_stand"],
    "input": "minecraft:potion",
    "reagent": "minecraft:spider_eye",
    "output": "minecraft:potion"
  }
}`,
    keywords: ['recipe', 'brewing', 'potion', 'alchemy', 'reagent'],
    stability: 'stable'
  },

  {
    name: 'minecraft:recipe_brewing_container',
    description: 'Brewing recipe for converting bottle containers.',
    category: 'Brewing',
    subcategory: 'Containers',
    version: '1.12.0',
    difficulty: 'intermediate',
    properties: [
      { name: 'input', type: 'string', description: 'Input container', required: true, example: 'minecraft:glass_bottle' },
      { name: 'reagent', type: 'string', description: 'Brewing reagent', required: true, example: 'minecraft:nether_wart' },
      { name: 'output', type: 'string', description: 'Output container', required: true, example: 'minecraft:potion' },
      { name: 'tags', type: 'array', description: 'Recipe tags', example: ['brewing_stand'] }
    ],
    example: `{
  "format_version": "1.21.0",
  "minecraft:recipe_brewing_container": {
    "description": {
      "identifier": "my_addon:water_to_awkward"
    },
    "tags": ["brewing_stand"],
    "input": "minecraft:potion",
    "reagent": "minecraft:nether_wart",
    "output": "minecraft:potion"
  }
}`,
    keywords: ['recipe', 'brewing', 'container', 'bottle', 'base'],
    stability: 'stable'
  },

  {
    name: 'minecraft:recipe_smithing_transform',
    description: 'Smithing table recipe for transforming items with templates.',
    category: 'Smithing',
    subcategory: 'Transform',
    version: '1.20.0',
    difficulty: 'advanced',
    properties: [
      { name: 'template', type: 'string', description: 'Smithing template', required: true, example: 'minecraft:netherite_upgrade_smithing_template' },
      { name: 'base', type: 'string', description: 'Base item to upgrade', required: true, example: 'minecraft:diamond_sword' },
      { name: 'addition', type: 'string', description: 'Addition material', required: true, example: 'minecraft:netherite_ingot' },
      { name: 'result', type: 'object', description: 'Result item', required: true, example: { item: 'minecraft:netherite_sword', count: 1 } },
      { name: 'tags', type: 'array', description: 'Recipe tags', example: ['smithing_table'] }
    ],
    example: `{
  "format_version": "1.21.0",
  "minecraft:recipe_smithing_transform": {
    "description": {
      "identifier": "my_addon:custom_upgrade"
    },
    "tags": ["smithing_table"],
    "template": "minecraft:netherite_upgrade_smithing_template",
    "base": "minecraft:diamond_sword",
    "addition": "minecraft:netherite_ingot",
    "result": {
      "item": "minecraft:netherite_sword",
      "count": 1
    }
  }
}`,
    keywords: ['recipe', 'smithing', 'transform', 'upgrade', 'template'],
    stability: 'stable'
  },

  {
    name: 'minecraft:recipe_smithing_trim',
    description: 'Smithing table recipe for adding armor trims.',
    category: 'Smithing',
    subcategory: 'Trim',
    version: '1.20.0',
    difficulty: 'advanced',
    properties: [
      { name: 'template', type: 'string', description: 'Trim template', required: true, example: 'minecraft:coast_armor_trim_smithing_template' },
      { name: 'base', type: 'string', description: 'Base armor piece', required: true, example: 'minecraft:diamond_chestplate' },
      { name: 'addition', type: 'string', description: 'Trim material', required: true, example: 'minecraft:emerald' },
      { name: 'tags', type: 'array', description: 'Recipe tags', example: ['smithing_table'] }
    ],
    example: `{
  "format_version": "1.21.0",
  "minecraft:recipe_smithing_trim": {
    "description": {
      "identifier": "my_addon:custom_trim"
    },
    "tags": ["smithing_table"],
    "template": "minecraft:coast_armor_trim_smithing_template",
    "base": "minecraft:diamond_chestplate",
    "addition": "minecraft:emerald"
  }
}`,
    keywords: ['recipe', 'smithing', 'trim', 'armor', 'decoration'],
    stability: 'stable'
  }
];

// =============================================================================
// LOOT TABLE FUNCTIONS REGISTRY
// =============================================================================
export const lootFunctions: LootFunction[] = [
  {
    name: 'set_count',
    description: 'Sets the count of items in the loot drop.',
    category: 'Loot',
    subcategory: 'Quantity',
    version: '1.12.0',
    difficulty: 'beginner',
    properties: [
      { name: 'count', type: 'range', description: 'Number of items (min, max)', required: true, example: { min: 1, max: 3 } }
    ],
    example: `{
  "function": "set_count",
  "count": {
    "min": 1,
    "max": 3
  }
}`,
    keywords: ['loot', 'count', 'quantity', 'amount', 'number'],
    stability: 'stable'
  },

  {
    name: 'set_damage',
    description: 'Sets the damage/durability of items in the loot drop.',
    category: 'Loot',
    subcategory: 'Properties',
    version: '1.12.0',
    difficulty: 'intermediate',
    properties: [
      { name: 'damage', type: 'range', description: 'Damage value (0-1 where 1 is fully damaged)', required: true, example: { min: 0.2, max: 0.8 } }
    ],
    example: `{
  "function": "set_damage",
  "damage": {
    "min": 0.2,
    "max": 0.8
  }
}`,
    keywords: ['loot', 'damage', 'durability', 'wear', 'condition'],
    stability: 'stable'
  },

  {
    name: 'enchant_randomly',
    description: 'Randomly enchants items with available enchantments.',
    category: 'Loot',
    subcategory: 'Enchantments',
    version: '1.12.0',
    difficulty: 'intermediate',
    properties: [
      { name: 'treasure', type: 'boolean', description: 'Include treasure enchantments', default: false, example: true }
    ],
    example: `{
  "function": "enchant_randomly",
  "treasure": true
}`,
    keywords: ['loot', 'enchant', 'random', 'magic', 'treasure'],
    stability: 'stable'
  },

  {
    name: 'enchant_with_levels',
    description: 'Enchants items as if using an enchanting table with specific levels.',
    category: 'Loot',
    subcategory: 'Enchantments',
    version: '1.12.0',
    difficulty: 'intermediate',
    properties: [
      { name: 'levels', type: 'range', description: 'Enchantment levels to use', required: true, example: { min: 20, max: 39 } },
      { name: 'treasure', type: 'boolean', description: 'Include treasure enchantments', default: false, example: true }
    ],
    example: `{
  "function": "enchant_with_levels",
  "levels": {
    "min": 20,
    "max": 39
  },
  "treasure": true
}`,
    keywords: ['loot', 'enchant', 'levels', 'table', 'experience'],
    stability: 'stable'
  },

  {
    name: 'looting_enchant',
    description: 'Modifies loot based on the Looting enchantment level.',
    category: 'Loot',
    subcategory: 'Modifiers',
    version: '1.12.0',
    difficulty: 'intermediate',
    properties: [
      { name: 'count', type: 'range', description: 'Additional count per looting level', required: true, example: { min: 0, max: 1 } }
    ],
    example: `{
  "function": "looting_enchant",
  "count": {
    "min": 0,
    "max": 1
  }
}`,
    keywords: ['loot', 'looting', 'enchant', 'bonus', 'modifier'],
    stability: 'stable'
  },

  {
    name: 'set_data',
    description: 'Sets the data value (block variant) for items.',
    category: 'Loot',
    subcategory: 'Properties',
    version: '1.12.0',
    difficulty: 'intermediate',
    properties: [
      { name: 'data', type: 'range', description: 'Data value to set', required: true, example: { min: 0, max: 15 } }
    ],
    example: `{
  "function": "set_data",
  "data": {
    "min": 0,
    "max": 15
  }
}`,
    keywords: ['loot', 'data', 'variant', 'metadata', 'block'],
    stability: 'stable'
  },

  {
    name: 'furnace_smelt',
    description: 'Smelts the item as if it went through a furnace.',
    category: 'Loot',
    subcategory: 'Transformation',
    version: '1.12.0',
    difficulty: 'intermediate',
    properties: [],
    example: `{
  "function": "furnace_smelt"
}`,
    keywords: ['loot', 'furnace', 'smelt', 'cook', 'transform'],
    stability: 'stable'
  },

  {
    name: 'specific_enchants',
    description: 'Applies specific enchantments with defined levels.',
    category: 'Loot',
    subcategory: 'Enchantments',
    version: '1.12.0',
    difficulty: 'advanced',
    properties: [
      { name: 'enchants', type: 'array', description: 'List of specific enchantments', required: true, example: [{ id: 'sharpness', level: { min: 1, max: 5 } }] }
    ],
    example: `{
  "function": "specific_enchants",
  "enchants": [
    {
      "id": "sharpness",
      "level": {
        "min": 1,
        "max": 5
      }
    },
    {
      "id": "unbreaking",
      "level": 3
    }
  ]
}`,
    keywords: ['loot', 'enchant', 'specific', 'custom', 'defined'],
    stability: 'stable'
  }
];

// =============================================================================
// BIOME COMPONENTS REGISTRY
// =============================================================================
export const biomeComponents: BiomeComponent[] = [
  {
    name: 'minecraft:climate',
    description: 'Defines the climate conditions of the biome.',
    category: 'Biome',
    subcategory: 'Climate',
    version: '1.16.0',
    difficulty: 'intermediate',
    properties: [
      { name: 'temperature', type: 'number', description: 'Temperature value (-0.5 to 2.0)', required: true, min: -0.5, max: 2.0, example: 0.8 },
      { name: 'downfall', type: 'number', description: 'Rainfall/humidity (0.0 to 1.0)', required: true, min: 0.0, max: 1.0, example: 0.9 },
      { name: 'snow_accumulation', type: 'range', description: 'Snow accumulation range', example: { min: 0.0, max: 0.1 } },
      { name: 'blue_spores', type: 'number', description: 'Blue spore particle density', min: 0, max: 100, example: 0 },
      { name: 'red_spores', type: 'number', description: 'Red spore particle density', min: 0, max: 100, example: 0 },
      { name: 'white_ash', type: 'number', description: 'White ash particle density', min: 0, max: 100, example: 0 }
    ],
    example: `{
  "minecraft:climate": {
    "temperature": 0.8,
    "downfall": 0.9,
    "snow_accumulation": {
      "min": 0.0,
      "max": 0.1
    }
  }
}`,
    keywords: ['biome', 'climate', 'temperature', 'rainfall', 'weather'],
    stability: 'stable'
  },

  {
    name: 'minecraft:overworld_height',
    description: 'Defines height generation rules for overworld biomes.',
    category: 'Biome',
    subcategory: 'Generation',
    version: '1.16.0',
    difficulty: 'intermediate',
    properties: [
      { name: 'noise_type', type: 'string', description: 'Type of noise generation', options: ['default', 'deep_ocean', 'default_mutated'], example: 'default' },
      { name: 'noise_params', type: 'array', description: 'Noise generation parameters', example: [0.0, 0.0] }
    ],
    example: `{
  "minecraft:overworld_height": {
    "noise_type": "default",
    "noise_params": [0.1, 0.3]
  }
}`,
    keywords: ['biome', 'height', 'generation', 'terrain', 'noise'],
    stability: 'stable'
  },

  {
    name: 'minecraft:surface_parameters',
    description: 'Defines surface block generation for the biome.',
    category: 'Biome',
    subcategory: 'Surface',
    version: '1.16.0',
    difficulty: 'advanced',
    properties: [
      { name: 'top_material', type: 'string', description: 'Top surface material', required: true, example: 'minecraft:grass' },
      { name: 'mid_material', type: 'string', description: 'Sub-surface material', required: true, example: 'minecraft:dirt' },
      { name: 'foundation_material', type: 'string', description: 'Deep foundation material', example: 'minecraft:stone' },
      { name: 'sea_floor_material', type: 'string', description: 'Sea floor material', example: 'minecraft:sand' },
      { name: 'sea_floor_depth', type: 'number', description: 'Depth of sea floor layer', min: 1, max: 10, example: 3 },
      { name: 'sea_material', type: 'string', description: 'Sea/ocean material', example: 'minecraft:water' }
    ],
    example: `{
  "minecraft:surface_parameters": {
    "top_material": "minecraft:grass",
    "mid_material": "minecraft:dirt",
    "foundation_material": "minecraft:stone",
    "sea_floor_material": "minecraft:sand",
    "sea_floor_depth": 3,
    "sea_material": "minecraft:water"
  }
}`,
    keywords: ['biome', 'surface', 'materials', 'blocks', 'generation'],
    stability: 'stable'
  },

  {
    name: 'minecraft:monster_spawning',
    description: 'Controls hostile mob spawning in the biome.',
    category: 'Biome',
    subcategory: 'Spawning',
    version: '1.16.0',
    difficulty: 'advanced',
    properties: [
      { name: 'monster_spawn_probability', type: 'number', description: 'Base monster spawn probability', min: 0, max: 1, example: 0.95 },
      { name: 'monster_spawn_block_list', type: 'array', description: 'Blocks monsters can spawn on', example: ['minecraft:stone', 'minecraft:dirt'] }
    ],
    example: `{
  "minecraft:monster_spawning": {
    "monster_spawn_probability": 0.95,
    "monster_spawn_block_list": [
      {
        "name": "minecraft:stone"
      },
      {
        "name": "minecraft:dirt"
      }
    ]
  }
}`,
    keywords: ['biome', 'monster', 'spawning', 'hostile', 'mobs'],
    stability: 'stable'
  },

  {
    name: 'minecraft:animal_spawning',
    description: 'Controls passive animal spawning in the biome.',
    category: 'Biome',
    subcategory: 'Spawning',
    version: '1.16.0',
    difficulty: 'advanced',
    properties: [
      { name: 'animal_spawn_probability', type: 'number', description: 'Base animal spawn probability', min: 0, max: 1, example: 0.07 },
      { name: 'animal_spawn_block_list', type: 'array', description: 'Blocks animals can spawn on', example: ['minecraft:grass'] }
    ],
    example: `{
  "minecraft:animal_spawning": {
    "animal_spawn_probability": 0.07,
    "animal_spawn_block_list": [
      {
        "name": "minecraft:grass"
      }
    ]
  }
}`,
    keywords: ['biome', 'animal', 'spawning', 'passive', 'creatures'],
    stability: 'stable'
  },

  {
    name: 'minecraft:frozen_ocean_surface',
    description: 'Generates frozen ice surface for ocean biomes.',
    category: 'Biome',
    subcategory: 'Special',
    version: '1.16.0',
    difficulty: 'intermediate',
    properties: [
      { name: 'ice_depth', type: 'number', description: 'Depth of ice layer', min: 1, max: 10, example: 1 }
    ],
    example: `{
  "minecraft:frozen_ocean_surface": {
    "ice_depth": 1
  }
}`,
    keywords: ['biome', 'frozen', 'ice', 'ocean', 'surface'],
    stability: 'stable'
  }
];

// =============================================================================
// SPAWN RULE COMPONENTS REGISTRY
// =============================================================================
export const spawnRuleComponents: SpawnRuleComponent[] = [
  {
    name: 'minecraft:spawns_on_surface',
    description: 'Allows spawning on the surface during specific conditions.',
    category: 'Spawning',
    subcategory: 'Surface',
    version: '1.8.0',
    difficulty: 'intermediate',
    properties: [],
    example: `{
  "minecraft:spawns_on_surface": {}
}`,
    keywords: ['spawn', 'surface', 'ground', 'daylight'],
    stability: 'stable'
  },

  {
    name: 'minecraft:spawns_underground',
    description: 'Allows spawning underground in caves and dark areas.',
    category: 'Spawning',
    subcategory: 'Underground',
    version: '1.8.0',
    difficulty: 'intermediate',
    properties: [],
    example: `{
  "minecraft:spawns_underground": {}
}`,
    keywords: ['spawn', 'underground', 'caves', 'dark'],
    stability: 'stable'
  },

  {
    name: 'minecraft:spawns_underwater',
    description: 'Allows spawning underwater in water bodies.',
    category: 'Spawning',
    subcategory: 'Aquatic',
    version: '1.8.0',
    difficulty: 'intermediate',
    properties: [],
    example: `{
  "minecraft:spawns_underwater": {}
}`,
    keywords: ['spawn', 'underwater', 'aquatic', 'water'],
    stability: 'stable'
  },

  {
    name: 'minecraft:spawns_on_block_filter',
    description: 'Specifies which blocks the entity can spawn on.',
    category: 'Spawning',
    subcategory: 'Blocks',
    version: '1.8.0',
    difficulty: 'advanced',
    properties: [
      { name: 'allowed_blocks', type: 'array', description: 'List of allowed spawn blocks', required: true, example: ['minecraft:grass', 'minecraft:dirt'] }
    ],
    example: `{
  "minecraft:spawns_on_block_filter": [
    {
      "test": "has_component",
      "subject": "block",
      "operator": "==",
      "value": "grass"
    }
  ]
}`,
    keywords: ['spawn', 'block', 'filter', 'surface', 'conditions'],
    stability: 'stable'
  },

  {
    name: 'minecraft:spawns_above_block_filter',
    description: 'Specifies blocks that must be below the spawn location.',
    category: 'Spawning',
    subcategory: 'Blocks',
    version: '1.8.0',
    difficulty: 'advanced',
    properties: [
      { name: 'allowed_blocks', type: 'array', description: 'List of required blocks below', required: true, example: ['minecraft:stone', 'minecraft:dirt'] }
    ],
    example: `{
  "minecraft:spawns_above_block_filter": [
    {
      "test": "has_component",
      "subject": "block",
      "operator": "==",
      "value": "stone"
    }
  ]
}`,
    keywords: ['spawn', 'above', 'block', 'filter', 'requirements'],
    stability: 'stable'
  },

  {
    name: 'minecraft:brightness_filter',
    description: 'Controls spawning based on light levels.',
    category: 'Spawning',
    subcategory: 'Light',
    version: '1.8.0',
    difficulty: 'intermediate',
    properties: [
      { name: 'min', type: 'number', description: 'Minimum light level', min: 0, max: 15, example: 0 },
      { name: 'max', type: 'number', description: 'Maximum light level', min: 0, max: 15, example: 7 },
      { name: 'adjust_for_weather', type: 'boolean', description: 'Adjust brightness for weather', default: true, example: false }
    ],
    example: `{
  "minecraft:brightness_filter": {
    "min": 0,
    "max": 7,
    "adjust_for_weather": true
  }
}`,
    keywords: ['spawn', 'brightness', 'light', 'darkness', 'level'],
    stability: 'stable'
  },

  {
    name: 'minecraft:biome_filter',
    description: 'Restricts spawning to specific biomes.',
    category: 'Spawning',
    subcategory: 'Biome',
    version: '1.8.0',
    difficulty: 'intermediate',
    properties: [
      { name: 'test', type: 'string', description: 'Test type', options: ['has_biome_tag'], example: 'has_biome_tag' },
      { name: 'operator', type: 'string', description: 'Comparison operator', options: ['==', '!='], example: '==' },
      { name: 'value', type: 'string', description: 'Biome tag or name', required: true, example: 'forest' }
    ],
    example: `{
  "minecraft:biome_filter": {
    "test": "has_biome_tag",
    "operator": "==",
    "value": "forest"
  }
}`,
    keywords: ['spawn', 'biome', 'filter', 'environment', 'location'],
    stability: 'stable'
  },

  {
    name: 'minecraft:difficulty_filter',
    description: 'Controls spawning based on world difficulty.',
    category: 'Spawning',
    subcategory: 'Difficulty',
    version: '1.8.0',
    difficulty: 'intermediate',
    properties: [
      { name: 'min', type: 'string', description: 'Minimum difficulty', options: ['peaceful', 'easy', 'normal', 'hard'], example: 'easy' },
      { name: 'max', type: 'string', description: 'Maximum difficulty', options: ['peaceful', 'easy', 'normal', 'hard'], example: 'hard' }
    ],
    example: `{
  "minecraft:difficulty_filter": {
    "min": "easy",
    "max": "hard"
  }
}`,
    keywords: ['spawn', 'difficulty', 'challenge', 'level', 'world'],
    stability: 'stable'
  },

  {
    name: 'minecraft:weight',
    description: 'Sets the spawn weight relative to other entities.',
    category: 'Spawning',
    subcategory: 'Probability',
    version: '1.8.0',
    difficulty: 'beginner',
    properties: [
      { name: 'default', type: 'number', description: 'Default spawn weight', required: true, min: 0, max: 1000, example: 10 }
    ],
    example: `{
  "minecraft:weight": {
    "default": 10
  }
}`,
    keywords: ['spawn', 'weight', 'probability', 'chance', 'frequency'],
    stability: 'stable'
  },

  {
    name: 'minecraft:herd',
    description: 'Controls group spawning behavior.',
    category: 'Spawning',
    subcategory: 'Groups',
    version: '1.8.0',
    difficulty: 'intermediate',
    properties: [
      { name: 'min_size', type: 'number', description: 'Minimum herd size', required: true, min: 1, max: 32, example: 2 },
      { name: 'max_size', type: 'number', description: 'Maximum herd size', required: true, min: 1, max: 32, example: 6 },
      { name: 'event', type: 'string', description: 'Event to trigger for herd members', example: 'minecraft:entity_born' },
      { name: 'event_skip_count', type: 'number', description: 'Number to skip for event', min: 0, max: 32, example: 1 }
    ],
    example: `{
  "minecraft:herd": {
    "min_size": 2,
    "max_size": 6,
    "event": "minecraft:entity_born",
    "event_skip_count": 1
  }
}`,
    keywords: ['spawn', 'herd', 'group', 'pack', 'together'],
    stability: 'stable'
  }
];

// Category definitions for all gameplay elements
export const gameplayCategories = {
  'Crafting': {
    name: 'Crafting Recipes',
    description: 'Recipes for crafting tables and workbenches',
    icon: '🔨',
    subcategories: ['Shaped', 'Shapeless']
  },
  'Smelting': {
    name: 'Smelting Recipes',
    description: 'Furnace, blast furnace, and smoker recipes',
    icon: '🔥',
    subcategories: ['Furnace', 'BlastFurnace', 'Smoker', 'Campfire']
  },
  'Brewing': {
    name: 'Brewing Recipes',
    description: 'Potion brewing and alchemy recipes',
    icon: '🧪',
    subcategories: ['Potions', 'Containers']
  },
  'Smithing': {
    name: 'Smithing Recipes',
    description: 'Smithing table upgrades and modifications',
    icon: '⚒️',
    subcategories: ['Transform', 'Trim']
  },
  'Loot': {
    name: 'Loot Tables',
    description: 'Loot generation and modification functions',
    icon: '💎',
    subcategories: ['Quantity', 'Properties', 'Enchantments', 'Modifiers', 'Transformation']
  },
  'Trading': {
    name: 'Trading Tables',
    description: 'Villager and NPC trading configurations',
    icon: '🤝',
    subcategories: ['Villager', 'Wandering']
  },
  'Biome': {
    name: 'Biome Components',
    description: 'World generation and biome properties',
    icon: '🌍',
    subcategories: ['Climate', 'Generation', 'Surface', 'Spawning', 'Special']
  },
  'Spawning': {
    name: 'Spawn Rules',
    description: 'Entity spawning conditions and requirements',
    icon: '🐛',
    subcategories: ['Surface', 'Underground', 'Aquatic', 'Blocks', 'Light', 'Biome', 'Difficulty', 'Probability', 'Groups']
  }
};

// Search functionality for all gameplay elements
export function searchGameplayElements(query: string, filters?: {
  category?: string;
  difficulty?: string;
  stability?: string;
}): (RecipeType | LootFunction | BiomeComponent | SpawnRuleComponent)[] {
  const lowercaseQuery = query.toLowerCase();
  
  const allElements = [
    ...recipeTypes,
    ...lootFunctions,
    ...biomeComponents,
    ...spawnRuleComponents
  ];
  
  return allElements.filter(element => {
    // Text search
    const matchesText = !query || 
      element.name.toLowerCase().includes(lowercaseQuery) ||
      element.description.toLowerCase().includes(lowercaseQuery) ||
      element.keywords.some(keyword => keyword.toLowerCase().includes(lowercaseQuery));
    
    // Filters
    const matchesCategory = !filters?.category || element.category === filters.category;
    const matchesDifficulty = !filters?.difficulty || element.difficulty === filters.difficulty;
    const matchesStability = !filters?.stability || element.stability === filters.stability;
    
    return matchesText && matchesCategory && matchesDifficulty && matchesStability;
  });
}

// Get elements by category
export function getGameplayElementsByCategory(category: string): (RecipeType | LootFunction | BiomeComponent | SpawnRuleComponent)[] {
  const allElements = [
    ...recipeTypes,
    ...lootFunctions,
    ...biomeComponents,
    ...spawnRuleComponents
  ];
  
  return allElements.filter(element => element.category === category);
}

// Template generation helpers
export function generateRecipeJSON(recipeType: string, properties: Record<string, any>): object {
  return {
    format_version: "1.21.0",
    [recipeType]: {
      description: {
        identifier: properties.identifier || "my_addon:custom_recipe"
      },
      ...properties
    }
  };
}

export function generateLootTableJSON(pools: Array<{ 
  rolls: { min: number; max: number }; 
  entries: Array<{ type: string; name: string; weight?: number; functions?: any[] }> 
}>): object {
  return {
    format_version: "1.21.0",
    pools: pools.map(pool => ({
      rolls: pool.rolls,
      entries: pool.entries.map(entry => ({
        type: entry.type,
        name: entry.name,
        weight: entry.weight || 1,
        functions: entry.functions || []
      }))
    }))
  };
}

export function generateBiomeJSON(identifier: string, components: Array<{ name: string; properties: Record<string, any> }>): object {
  const componentObj: Record<string, any> = {};
  
  components.forEach(component => {
    componentObj[component.name] = component.properties;
  });

  return {
    format_version: "1.21.0",
    "minecraft:biome": {
      description: {
        identifier: identifier
      },
      components: componentObj
    }
  };
}

export function generateSpawnRulesJSON(identifier: string, conditions: Array<{ name: string; properties: Record<string, any> }>): object {
  const conditionsObj: Record<string, any> = {};
  
  conditions.forEach(condition => {
    conditionsObj[condition.name] = condition.properties;
  });

  return {
    format_version: "1.21.0",
    "minecraft:spawn_rules": {
      description: {
        identifier: identifier
      },
      conditions: [conditionsObj]
    }
  };
}

// Export summary statistics
export const gameplayRegistryStats = {
  totalRecipeTypes: recipeTypes.length,
  totalLootFunctions: lootFunctions.length,
  totalBiomeComponents: biomeComponents.length,
  totalSpawnRuleComponents: spawnRuleComponents.length,
  totalElements: recipeTypes.length + lootFunctions.length + biomeComponents.length + spawnRuleComponents.length,
  categoryCounts: Object.keys(gameplayCategories).reduce((acc, category) => {
    acc[category] = getGameplayElementsByCategory(category).length;
    return acc;
  }, {} as Record<string, number>)
};