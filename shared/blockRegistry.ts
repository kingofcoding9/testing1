import { z } from 'zod';

// Base component interface
export interface BlockComponentProperty {
  name: string;
  type: 'number' | 'boolean' | 'string' | 'array' | 'object' | 'range' | 'vector3' | 'material';
  description: string;
  required?: boolean;
  default?: any;
  min?: number;
  max?: number;
  options?: string[];
  example?: any;
}

export interface BlockComponent {
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  version: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  properties: BlockComponentProperty[];
  example: string;
  documentation?: string;
  keywords: string[];
  stability: 'stable' | 'experimental' | 'beta';
  dependencies?: string[];
  conflicts?: string[];
}

// Zod schemas for validation
export const BlockComponentPropertySchema = z.object({
  name: z.string(),
  type: z.enum(['number', 'boolean', 'string', 'array', 'object', 'range', 'vector3', 'material']),
  description: z.string(),
  required: z.boolean().optional(),
  default: z.any().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  options: z.array(z.string()).optional(),
  example: z.any().optional(),
});

export const BlockComponentSchema = z.object({
  name: z.string(),
  description: z.string(),
  category: z.string(),
  subcategory: z.string().optional(),
  version: z.string(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  properties: z.array(BlockComponentPropertySchema),
  example: z.string(),
  documentation: z.string().optional(),
  keywords: z.array(z.string()),
  stability: z.enum(['stable', 'experimental', 'beta']),
  dependencies: z.array(z.string()).optional(),
  conflicts: z.array(z.string()).optional(),
});

// Comprehensive Block Components Registry
export const blockComponents: BlockComponent[] = [
  // =============================================================================
  // CORE DESTRUCTIBILITY COMPONENTS
  // =============================================================================
  {
    name: 'minecraft:destructible_by_mining',
    description: 'Controls how the block can be destroyed by mining tools.',
    category: 'Core',
    subcategory: 'Destructibility',
    version: '1.16.0',
    difficulty: 'beginner',
    properties: [
      { name: 'seconds_to_destroy', type: 'number', description: 'Time to destroy with bare hands', default: 0, min: 0, max: 3600, example: 1.5 }
    ],
    example: `{
  "minecraft:destructible_by_mining": {
    "seconds_to_destroy": 1.5
  }
}`,
    keywords: ['destructible', 'mining', 'hardness', 'break', 'destroy'],
    stability: 'stable',
    documentation: 'https://docs.microsoft.com/en-us/minecraft/creator/reference/content/blockreference/examples/blockcomponents/minecraftdestructiblebymining'
  },

  {
    name: 'minecraft:destructible_by_explosion',
    description: 'Controls how the block behaves when exposed to explosions.',
    category: 'Core',
    subcategory: 'Destructibility',
    version: '1.16.0',
    difficulty: 'beginner',
    properties: [
      { name: 'explosion_resistance', type: 'number', description: 'Resistance to explosions', default: 0, min: 0, max: 1200, example: 6.0 }
    ],
    example: `{
  "minecraft:destructible_by_explosion": {
    "explosion_resistance": 6.0
  }
}`,
    keywords: ['destructible', 'explosion', 'resistance', 'blast', 'TNT'],
    stability: 'stable'
  },

  // =============================================================================
  // MATERIAL & VISUAL COMPONENTS
  // =============================================================================
  {
    name: 'minecraft:material_instances',
    description: 'Defines materials and textures for each face of the block.',
    category: 'Visual',
    subcategory: 'Materials',
    version: '1.16.0',
    difficulty: 'intermediate',
    properties: [
      { name: '*', type: 'object', description: 'Default material for all faces', example: { texture: 'stone', render_method: 'opaque' } },
      { name: 'up', type: 'object', description: 'Material for top face', example: { texture: 'grass_top', render_method: 'opaque' } },
      { name: 'down', type: 'object', description: 'Material for bottom face', example: { texture: 'dirt', render_method: 'opaque' } },
      { name: 'north', type: 'object', description: 'Material for north face', example: { texture: 'log_side', render_method: 'opaque' } },
      { name: 'south', type: 'object', description: 'Material for south face', example: { texture: 'log_side', render_method: 'opaque' } },
      { name: 'east', type: 'object', description: 'Material for east face', example: { texture: 'log_side', render_method: 'opaque' } },
      { name: 'west', type: 'object', description: 'Material for west face', example: { texture: 'log_side', render_method: 'opaque' } }
    ],
    example: `{
  "minecraft:material_instances": {
    "*": {
      "texture": "my_block",
      "render_method": "opaque"
    },
    "up": {
      "texture": "my_block_top",
      "render_method": "opaque"
    },
    "down": {
      "texture": "my_block_bottom", 
      "render_method": "opaque"
    }
  }
}`,
    keywords: ['material', 'texture', 'faces', 'render', 'appearance'],
    stability: 'stable'
  },

  {
    name: 'minecraft:geometry',
    description: 'Defines custom geometry for the block using a model file.',
    category: 'Visual',
    subcategory: 'Geometry',
    version: '1.16.0',
    difficulty: 'advanced',
    properties: [
      { name: 'identifier', type: 'string', description: 'Geometry model identifier', required: true, example: 'geometry.my_custom_block' },
      { name: 'bone_visibility', type: 'object', description: 'Controls bone visibility', example: {} }
    ],
    example: `{
  "minecraft:geometry": {
    "identifier": "geometry.my_custom_block",
    "bone_visibility": {
      "bone_name": "q.block_state('my_state') == 0"
    }
  }
}`,
    keywords: ['geometry', 'model', 'custom', 'shape', '3d'],
    stability: 'stable'
  },

  {
    name: 'minecraft:unit_cube',
    description: 'Makes the block use the default unit cube shape.',
    category: 'Visual',
    subcategory: 'Geometry',
    version: '1.16.0',
    difficulty: 'beginner',
    properties: [],
    example: `{
  "minecraft:unit_cube": {}
}`,
    keywords: ['unit', 'cube', 'default', 'shape', 'standard'],
    stability: 'stable'
  },

  {
    name: 'minecraft:crafting_table',
    description: 'Makes the block function as a crafting table.',
    category: 'Visual',
    subcategory: 'Geometry',
    version: '1.16.0',
    difficulty: 'intermediate',
    properties: [
      { name: 'custom_description', type: 'string', description: 'Custom description for the crafting interface', example: 'My Custom Workbench' },
      { name: 'grid_size', type: 'number', description: 'Size of the crafting grid', default: 3, min: 1, max: 9, example: 3 }
    ],
    example: `{
  "minecraft:crafting_table": {
    "custom_description": "My Custom Workbench",
    "grid_size": 3
  }
}`,
    keywords: ['crafting', 'table', 'workbench', 'interface'],
    stability: 'stable'
  },

  // =============================================================================
  // COLLISION & PHYSICS COMPONENTS
  // =============================================================================
  {
    name: 'minecraft:collision_box',
    description: 'Defines the collision boundaries of the block.',
    category: 'Physics',
    subcategory: 'Collision',
    version: '1.16.0',
    difficulty: 'intermediate',
    properties: [
      { name: 'origin', type: 'vector3', description: 'Origin point of collision box', default: [-8, 0, -8], example: [-8, 0, -8] },
      { name: 'size', type: 'vector3', description: 'Size of collision box', default: [16, 16, 16], example: [16, 14, 16] }
    ],
    example: `{
  "minecraft:collision_box": {
    "origin": [-8, 0, -8],
    "size": [16, 14, 16]
  }
}`,
    keywords: ['collision', 'box', 'hitbox', 'physics', 'boundaries'],
    stability: 'stable'
  },

  {
    name: 'minecraft:selection_box',
    description: 'Defines the selection box for player interaction.',
    category: 'Physics',
    subcategory: 'Selection',
    version: '1.16.0',
    difficulty: 'intermediate',
    properties: [
      { name: 'origin', type: 'vector3', description: 'Origin point of selection box', default: [-8, 0, -8], example: [-8, 0, -8] },
      { name: 'size', type: 'vector3', description: 'Size of selection box', default: [16, 16, 16], example: [16, 14, 16] }
    ],
    example: `{
  "minecraft:selection_box": {
    "origin": [-8, 0, -8],
    "size": [16, 14, 16]
  }
}`,
    keywords: ['selection', 'box', 'outline', 'highlight', 'interaction'],
    stability: 'stable'
  },

  {
    name: 'minecraft:friction',
    description: 'Controls the friction coefficient of the block surface.',
    category: 'Physics',
    subcategory: 'Movement',
    version: '1.16.0',
    difficulty: 'intermediate',
    properties: [
      { name: 'value', type: 'number', description: 'Friction value (0=slippery, 1=normal)', default: 0.6, min: 0, max: 1, example: 0.1 }
    ],
    example: `{
  "minecraft:friction": {
    "value": 0.1
  }
}`,
    keywords: ['friction', 'slippery', 'ice', 'slide', 'movement'],
    stability: 'stable'
  },

  // =============================================================================
  // LIGHTING COMPONENTS
  // =============================================================================
  {
    name: 'minecraft:light_emission',
    description: 'Makes the block emit light.',
    category: 'Lighting',
    subcategory: 'Emission',
    version: '1.16.0',
    difficulty: 'beginner',
    properties: [
      { name: 'emission', type: 'number', description: 'Light level emitted (0-15)', required: true, min: 0, max: 15, example: 10 }
    ],
    example: `{
  "minecraft:light_emission": {
    "emission": 10
  }
}`,
    keywords: ['light', 'emission', 'glow', 'brightness', 'illuminate'],
    stability: 'stable'
  },

  {
    name: 'minecraft:light_dampening',
    description: 'Controls how much light the block dampens.',
    category: 'Lighting',
    subcategory: 'Absorption',
    version: '1.16.0',
    difficulty: 'intermediate',
    properties: [
      { name: 'lightLevel', type: 'number', description: 'Light dampening amount (0-15)', default: 15, min: 0, max: 15, example: 2 }
    ],
    example: `{
  "minecraft:light_dampening": {
    "lightLevel": 2
  }
}`,
    keywords: ['light', 'dampening', 'absorption', 'shadow', 'opacity'],
    stability: 'stable'
  },

  // =============================================================================
  // ENVIRONMENTAL COMPONENTS
  // =============================================================================
  {
    name: 'minecraft:flammable',
    description: 'Makes the block flammable and defines fire spread behavior.',
    category: 'Environment',
    subcategory: 'Fire',
    version: '1.16.0',
    difficulty: 'intermediate',
    properties: [
      { name: 'catch_chance_modifier', type: 'number', description: 'Chance modifier for catching fire', default: 5, min: 0, max: 300, example: 15 },
      { name: 'destroy_chance_modifier', type: 'number', description: 'Chance modifier for being destroyed by fire', default: 20, min: 0, max: 300, example: 60 }
    ],
    example: `{
  "minecraft:flammable": {
    "catch_chance_modifier": 15,
    "destroy_chance_modifier": 60
  }
}`,
    keywords: ['flammable', 'fire', 'burn', 'combustible', 'flame'],
    stability: 'stable'
  },

  {
    name: 'minecraft:breathability',
    description: 'Controls how the block affects breathing and mob spawning.',
    category: 'Environment',
    subcategory: 'Air',
    version: '1.16.0',
    difficulty: 'intermediate',
    properties: [
      { name: 'breathability', type: 'string', description: 'Breathability type', required: true, options: ['solid', 'air'], example: 'air' }
    ],
    example: `{
  "minecraft:breathability": {
    "breathability": "air"
  }
}`,
    keywords: ['breathability', 'air', 'spawning', 'suffocation', 'oxygen'],
    stability: 'stable'
  },

  // =============================================================================
  // INTERACTION COMPONENTS
  // =============================================================================
  {
    name: 'minecraft:display_name',
    description: 'Sets a custom display name for the block.',
    category: 'Interaction',
    subcategory: 'Identity',
    version: '1.16.0',
    difficulty: 'beginner',
    properties: [
      { name: 'value', type: 'string', description: 'Display name to show', required: true, example: 'My Custom Block' }
    ],
    example: `{
  "minecraft:display_name": {
    "value": "My Custom Block"
  }
}`,
    keywords: ['display', 'name', 'title', 'label', 'identity'],
    stability: 'stable'
  },

  {
    name: 'minecraft:creative_category',
    description: 'Defines which creative inventory tab the block appears in.',
    category: 'Interaction',
    subcategory: 'Inventory',
    version: '1.16.0',
    difficulty: 'beginner',
    properties: [
      { name: 'category', type: 'string', description: 'Creative category', required: true, options: ['building', 'decoration', 'redstone', 'transportation', 'miscellaneous', 'search', 'survival', 'equipment', 'items', 'nature', 'construction'], example: 'building' },
      { name: 'group', type: 'string', description: 'Group within category', example: 'itemGroup.name.planks' }
    ],
    example: `{
  "minecraft:creative_category": {
    "category": "building",
    "group": "itemGroup.name.planks"
  }
}`,
    keywords: ['creative', 'category', 'inventory', 'tab', 'group'],
    stability: 'stable'
  },

  {
    name: 'minecraft:map_color',
    description: 'Defines the color shown on maps.',
    category: 'Interaction',
    subcategory: 'Visual',
    version: '1.16.0',
    difficulty: 'beginner',
    properties: [
      { name: 'color', type: 'string', description: 'Map color as hex code', required: true, example: '#FF0000' }
    ],
    example: `{
  "minecraft:map_color": {
    "color": "#FF0000"
  }
}`,
    keywords: ['map', 'color', 'navigation', 'display'],
    stability: 'stable'
  },

  // =============================================================================
  // TRANSFORMATION & TICKING
  // =============================================================================
  {
    name: 'minecraft:transformation',
    description: 'Allows the block to transform under specific conditions.',
    category: 'Transformation',
    subcategory: 'State',
    version: '1.16.0',
    difficulty: 'advanced',
    properties: [
      { name: 'transform', type: 'object', description: 'Transformation rules', required: true, example: { block: 'minecraft:stone', conditions: [] } }
    ],
    example: `{
  "minecraft:transformation": {
    "transform": {
      "block": "minecraft:stone",
      "conditions": [
        {
          "test": "has_biome_tag",
          "value": "cold"
        }
      ]
    }
  }
}`,
    keywords: ['transformation', 'change', 'morph', 'convert', 'conditions'],
    stability: 'experimental'
  },

  {
    name: 'minecraft:queued_ticking',
    description: 'Enables queued ticking for the block.',
    category: 'Transformation',
    subcategory: 'Timing',
    version: '1.16.0',
    difficulty: 'advanced',
    properties: [
      { name: 'looping', type: 'boolean', description: 'Whether ticking loops', default: true, example: false },
      { name: 'interval_range', type: 'range', description: 'Tick interval range in seconds', required: true, example: [10, 20] },
      { name: 'on_tick', type: 'object', description: 'Event to trigger on tick', required: true, example: { event: 'my_block:on_tick' } }
    ],
    example: `{
  "minecraft:queued_ticking": {
    "looping": true,
    "interval_range": [10, 20],
    "on_tick": {
      "event": "my_block:on_tick",
      "target": "self"
    }
  }
}`,
    keywords: ['queued', 'ticking', 'timer', 'interval', 'schedule'],
    stability: 'stable'
  },

  {
    name: 'minecraft:random_ticking',
    description: 'Enables random ticking for the block like grass or crops.',
    category: 'Transformation',
    subcategory: 'Timing',
    version: '1.16.0',
    difficulty: 'advanced',
    properties: [
      { name: 'on_tick', type: 'object', description: 'Event to trigger on random tick', required: true, example: { event: 'my_block:random_tick' } }
    ],
    example: `{
  "minecraft:random_ticking": {
    "on_tick": {
      "event": "my_block:random_tick",
      "target": "self"
    }
  }
}`,
    keywords: ['random', 'ticking', 'growth', 'crops', 'natural'],
    stability: 'stable'
  },

  // =============================================================================
  // REDSTONE COMPONENTS
  // =============================================================================
  {
    name: 'minecraft:redstone_conductivity',
    description: 'Controls how the block conducts redstone signals.',
    category: 'Redstone',
    subcategory: 'Conductivity',
    version: '1.16.0',
    difficulty: 'intermediate',
    properties: [
      { name: 'redstone_conductor', type: 'boolean', description: 'Whether block conducts redstone', default: false, example: true }
    ],
    example: `{
  "minecraft:redstone_conductivity": {
    "redstone_conductor": true
  }
}`,
    keywords: ['redstone', 'conductivity', 'signal', 'power', 'electrical'],
    stability: 'stable'
  },

  // =============================================================================
  // PLACEMENT RESTRICTIONS
  // =============================================================================
  {
    name: 'minecraft:placement_filter',
    description: 'Controls where the block can be placed.',
    category: 'Placement',
    subcategory: 'Restrictions',
    version: '1.16.0',
    difficulty: 'advanced',
    properties: [
      { name: 'conditions', type: 'array', description: 'Placement conditions', required: true, example: [{ allowed_faces: ['up'], block_filter: [{ tags: '!query.any_tag(\'stone\')' }] }] }
    ],
    example: `{
  "minecraft:placement_filter": {
    "conditions": [
      {
        "allowed_faces": ["up"],
        "block_filter": [
          {
            "tags": "!query.any_tag('stone')"
          }
        ]
      }
    ]
  }
}`,
    keywords: ['placement', 'filter', 'restrictions', 'conditions', 'rules'],
    stability: 'stable'
  },

  // =============================================================================
  // LOOT COMPONENTS
  // =============================================================================
  {
    name: 'minecraft:loot',
    description: 'Defines what items drop when the block is destroyed.',
    category: 'Loot',
    subcategory: 'Drops',
    version: '1.16.0',
    difficulty: 'intermediate',
    properties: [
      { name: 'table', type: 'string', description: 'Loot table path', required: true, example: 'loot_tables/blocks/my_block.json' }
    ],
    example: `{
  "minecraft:loot": {
    "table": "loot_tables/blocks/my_block.json"
  }
}`,
    keywords: ['loot', 'drops', 'items', 'rewards', 'harvest'],
    stability: 'stable'
  },

  // =============================================================================
  // BLOCK STATES
  // =============================================================================
  {
    name: 'minecraft:block_state',
    description: 'Defines custom block states for the block.',
    category: 'States',
    subcategory: 'Properties',
    version: '1.16.0',
    difficulty: 'advanced',
    properties: [
      { name: 'states', type: 'object', description: 'Block state definitions', required: true, example: { 'my_state': [0, 1, 2], 'my_bool_state': [true, false] } }
    ],
    example: `{
  "minecraft:block_state": {
    "states": {
      "my_int_state": [0, 1, 2, 3],
      "my_bool_state": [true, false],
      "my_string_state": ["red", "green", "blue"]
    }
  }
}`,
    keywords: ['block', 'state', 'properties', 'variants', 'values'],
    stability: 'stable'
  }
];

// Block state definitions
export interface BlockState {
  name: string;
  type: 'int' | 'bool' | 'string';
  values: any[];
  description: string;
  example: any;
}

export const commonBlockStates: BlockState[] = [
  { name: 'age', type: 'int', values: [0, 1, 2, 3, 4, 5, 6, 7], description: 'Growth stage for crops', example: 3 },
  { name: 'facing_direction', type: 'int', values: [0, 1, 2, 3, 4, 5], description: 'Direction block is facing', example: 2 },
  { name: 'open_bit', type: 'bool', values: [true, false], description: 'Whether block is open (doors, gates)', example: true },
  { name: 'powered_bit', type: 'bool', values: [true, false], description: 'Whether block is powered by redstone', example: false },
  { name: 'color', type: 'string', values: ['white', 'orange', 'magenta', 'light_blue', 'yellow', 'lime', 'pink', 'gray', 'light_gray', 'cyan', 'purple', 'blue', 'brown', 'green', 'red', 'black'], description: 'Block color variant', example: 'red' },
  { name: 'wood_type', type: 'string', values: ['oak', 'spruce', 'birch', 'jungle', 'acacia', 'dark_oak', 'mangrove', 'cherry'], description: 'Wood type variant', example: 'oak' },
  { name: 'stone_type', type: 'string', values: ['stone', 'granite', 'diorite', 'andesite'], description: 'Stone type variant', example: 'granite' },
  { name: 'moisture', type: 'int', values: [0, 1, 2, 3, 4, 5, 6, 7], description: 'Farmland moisture level', example: 4 },
  { name: 'upper_block_bit', type: 'bool', values: [true, false], description: 'Whether this is the upper part of a double block', example: false },
  { name: 'occupied_bit', type: 'bool', values: [true, false], description: 'Whether bed is occupied', example: false }
];

// Category definitions
export const blockCategories = {
  'Core': {
    name: 'Core Components',
    description: 'Essential components defining basic block properties',
    icon: '🧱',
    subcategories: ['Destructibility', 'Identity']
  },
  'Visual': {
    name: 'Visual & Geometry',
    description: 'Components controlling block appearance and shape',
    icon: '🎨',
    subcategories: ['Materials', 'Geometry', 'Appearance']
  },
  'Physics': {
    name: 'Physics & Collision',
    description: 'Components controlling physical properties and collision',
    icon: '⚛️',
    subcategories: ['Collision', 'Selection', 'Movement']
  },
  'Lighting': {
    name: 'Lighting',
    description: 'Components controlling light emission and absorption',
    icon: '💡',
    subcategories: ['Emission', 'Absorption']
  },
  'Environment': {
    name: 'Environmental',
    description: 'Components for environmental interactions',
    icon: '🌍',
    subcategories: ['Fire', 'Air', 'Weather']
  },
  'Interaction': {
    name: 'Player Interaction',
    description: 'Components for player interaction and UI',
    icon: '🤝',
    subcategories: ['Identity', 'Inventory', 'Visual', 'Interface']
  },
  'Transformation': {
    name: 'Transformation & Timing',
    description: 'Components for block state changes and ticking',
    icon: '🔄',
    subcategories: ['State', 'Timing']
  },
  'Redstone': {
    name: 'Redstone',
    description: 'Components for redstone interactions',
    icon: '🔴',
    subcategories: ['Conductivity', 'Power']
  },
  'Placement': {
    name: 'Placement',
    description: 'Components controlling block placement rules',
    icon: '📐',
    subcategories: ['Restrictions', 'Conditions']
  },
  'Loot': {
    name: 'Loot & Drops',
    description: 'Components controlling item drops',
    icon: '💎',
    subcategories: ['Drops', 'Harvest']
  },
  'States': {
    name: 'Block States',
    description: 'Components for block state definitions',
    icon: '🔢',
    subcategories: ['Properties', 'Variants']
  }
};

// Material types for material_instances
export const materialTypes = {
  render_methods: ['opaque', 'alpha_test', 'blend', 'double_sided'],
  face_dimming: [true, false],
  ambient_occlusion: [true, false]
};

// Search functionality
export function searchBlockComponents(query: string, filters?: {
  category?: string;
  difficulty?: string;
  stability?: string;
}): BlockComponent[] {
  const lowercaseQuery = query.toLowerCase();
  
  return blockComponents.filter(component => {
    // Text search
    const matchesText = !query || 
      component.name.toLowerCase().includes(lowercaseQuery) ||
      component.description.toLowerCase().includes(lowercaseQuery) ||
      component.keywords.some(keyword => keyword.toLowerCase().includes(lowercaseQuery));
    
    // Filters
    const matchesCategory = !filters?.category || component.category === filters.category;
    const matchesDifficulty = !filters?.difficulty || component.difficulty === filters.difficulty;
    const matchesStability = !filters?.stability || component.stability === filters.stability;
    
    return matchesText && matchesCategory && matchesDifficulty && matchesStability;
  });
}

// Get component by name
export function getBlockComponent(name: string): BlockComponent | undefined {
  return blockComponents.find(component => component.name === name);
}

// Get components by category
export function getBlockComponentsByCategory(category: string): BlockComponent[] {
  return blockComponents.filter(component => component.category === category);
}

// Template generation helper
export function generateBlockComponentJSON(componentName: string, properties: Record<string, any>): object {
  const component = getBlockComponent(componentName);
  if (!component) {
    throw new Error(`Component ${componentName} not found`);
  }

  return {
    [componentName]: properties
  };
}

// Generate complete block JSON
export function generateBlockJSON(identifier: string, components: Array<{ name: string; properties: Record<string, any> }>): object {
  const componentObj: Record<string, any> = {};
  
  components.forEach(component => {
    componentObj[component.name] = component.properties;
  });

  return {
    format_version: "1.21.0",
    "minecraft:block": {
      description: {
        identifier: identifier,
        menu_category: {
          category: "construction"
        }
      },
      components: componentObj,
      permutations: []
    }
  };
}

// Block state validation helpers
export function validateBlockState(stateName: string, value: any): boolean {
  const state = commonBlockStates.find(s => s.name === stateName);
  if (!state) return false;
  
  return state.values.includes(value);
}

// Export summary statistics
export const blockRegistryStats = {
  totalComponents: blockComponents.length,
  categoryCounts: Object.keys(blockCategories).reduce((acc, category) => {
    acc[category] = getBlockComponentsByCategory(category).length;
    return acc;
  }, {} as Record<string, number>),
  difficultyLevels: ['beginner', 'intermediate', 'advanced'].reduce((acc, difficulty) => {
    acc[difficulty] = blockComponents.filter(c => c.difficulty === difficulty).length;
    return acc;
  }, {} as Record<string, number>),
  stabilityLevels: ['stable', 'experimental', 'beta'].reduce((acc, stability) => {
    acc[stability] = blockComponents.filter(c => c.stability === stability).length;
    return acc;
  }, {} as Record<string, number>),
  totalBlockStates: commonBlockStates.length
};