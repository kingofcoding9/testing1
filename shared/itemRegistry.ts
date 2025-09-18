import { z } from 'zod';

// Base component interface
export interface ItemComponentProperty {
  name: string;
  type: 'number' | 'boolean' | 'string' | 'array' | 'object' | 'range' | 'vector3' | 'effect';
  description: string;
  required?: boolean;
  default?: any;
  min?: number;
  max?: number;
  options?: string[];
  example?: any;
}

export interface ItemComponent {
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  version: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  properties: ItemComponentProperty[];
  example: string;
  documentation?: string;
  keywords: string[];
  stability: 'stable' | 'experimental' | 'beta';
  dependencies?: string[];
  conflicts?: string[];
}

// Zod schemas for validation
export const ItemComponentPropertySchema = z.object({
  name: z.string(),
  type: z.enum(['number', 'boolean', 'string', 'array', 'object', 'range', 'vector3', 'effect']),
  description: z.string(),
  required: z.boolean().optional(),
  default: z.any().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  options: z.array(z.string()).optional(),
  example: z.any().optional(),
});

export const ItemComponentSchema = z.object({
  name: z.string(),
  description: z.string(),
  category: z.string(),
  subcategory: z.string().optional(),
  version: z.string(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  properties: z.array(ItemComponentPropertySchema),
  example: z.string(),
  documentation: z.string().optional(),
  keywords: z.array(z.string()),
  stability: z.enum(['stable', 'experimental', 'beta']),
  dependencies: z.array(z.string()).optional(),
  conflicts: z.array(z.string()).optional(),
});

// Comprehensive Item Components Registry
export const itemComponents: ItemComponent[] = [
  // =============================================================================
  // CORE COMPONENTS
  // =============================================================================
  {
    name: 'minecraft:icon',
    description: 'Defines the texture/icon for the item in inventories and UI.',
    category: 'Core',
    subcategory: 'Visual',
    version: '1.16.0',
    difficulty: 'beginner',
    properties: [
      { name: 'texture', type: 'string', description: 'Texture name/path for the item icon', required: true, example: 'my_custom_item' }
    ],
    example: `{
  "minecraft:icon": {
    "texture": "my_custom_item"
  }
}`,
    keywords: ['icon', 'texture', 'visual', 'sprite', 'image'],
    stability: 'stable',
    documentation: 'https://docs.microsoft.com/en-us/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecrafticon'
  },

  {
    name: 'minecraft:display_name',
    description: 'Sets the display name shown for the item.',
    category: 'Core',
    subcategory: 'Identity',
    version: '1.16.0',
    difficulty: 'beginner',
    properties: [
      { name: 'value', type: 'string', description: 'The display name to show', required: true, example: 'My Custom Item' }
    ],
    example: `{
  "minecraft:display_name": {
    "value": "My Custom Item"
  }
}`,
    keywords: ['display', 'name', 'title', 'label', 'text'],
    stability: 'stable'
  },

  {
    name: 'minecraft:max_stack_size',
    description: 'Defines the maximum number of items that can be stacked.',
    category: 'Core',
    subcategory: 'Stacking',
    version: '1.16.0',
    difficulty: 'beginner',
    properties: [
      { name: 'value', type: 'number', description: 'Maximum stack size', required: true, min: 1, max: 64, default: 64, example: 16 }
    ],
    example: `{
  "minecraft:max_stack_size": {
    "value": 16
  }
}`,
    keywords: ['stack', 'size', 'count', 'quantity', 'max'],
    stability: 'stable'
  },

  {
    name: 'minecraft:hand_equipped',
    description: 'Determines whether the item is rendered in the player\'s hand.',
    category: 'Core',
    subcategory: 'Visual',
    version: '1.16.0',
    difficulty: 'beginner',
    properties: [
      { name: 'value', type: 'boolean', description: 'Whether item shows in hand', required: true, default: false, example: true }
    ],
    example: `{
  "minecraft:hand_equipped": {
    "value": true
  }
}`,
    keywords: ['hand', 'equipped', 'render', 'visual', 'hold'],
    stability: 'stable'
  },

  {
    name: 'minecraft:use_duration',
    description: 'Defines how long it takes to use the item.',
    category: 'Core',
    subcategory: 'Usage',
    version: '1.16.0',
    difficulty: 'intermediate',
    properties: [
      { name: 'value', type: 'number', description: 'Use duration in seconds', required: true, min: 0, max: 600, example: 1.6 }
    ],
    example: `{
  "minecraft:use_duration": {
    "value": 1.6
  }
}`,
    keywords: ['use', 'duration', 'time', 'consume', 'cast'],
    stability: 'stable'
  },

  {
    name: 'minecraft:cooldown',
    description: 'Adds a cooldown period after using the item.',
    category: 'Core',
    subcategory: 'Usage',
    version: '1.16.0',
    difficulty: 'intermediate',
    properties: [
      { name: 'category', type: 'string', description: 'Cooldown category name', required: true, example: 'ender_pearl' },
      { name: 'duration', type: 'number', description: 'Cooldown duration in seconds', required: true, min: 0, max: 3600, example: 1.0 }
    ],
    example: `{
  "minecraft:cooldown": {
    "category": "ender_pearl",
    "duration": 1.0
  }
}`,
    keywords: ['cooldown', 'delay', 'timer', 'recharge', 'wait'],
    stability: 'stable'
  },

  // =============================================================================
  // FOOD COMPONENTS
  // =============================================================================
  {
    name: 'minecraft:food',
    description: 'Makes the item consumable as food with nutritional properties.',
    category: 'Food',
    subcategory: 'Nutrition',
    version: '1.16.0',
    difficulty: 'intermediate',
    properties: [
      { name: 'nutrition', type: 'number', description: 'Hunger points restored', required: true, min: 0, max: 20, example: 4 },
      { name: 'saturation_modifier', type: 'number', description: 'Saturation modifier', required: true, min: 0, max: 2, example: 0.6 },
      { name: 'can_always_eat', type: 'boolean', description: 'Can eat even when full', default: false, example: true },
      { name: 'using_converts_to', type: 'string', description: 'Item to convert to when eaten', example: 'minecraft:bowl' },
      { name: 'effects', type: 'array', description: 'Status effects when consumed', example: [] }
    ],
    example: `{
  "minecraft:food": {
    "nutrition": 4,
    "saturation_modifier": 0.6,
    "can_always_eat": false,
    "using_converts_to": "minecraft:bowl",
    "effects": [
      {
        "name": "regeneration",
        "chance": 1.0,
        "duration": 5,
        "amplifier": 1
      }
    ]
  }
}`,
    keywords: ['food', 'eat', 'nutrition', 'hunger', 'saturation', 'consume'],
    stability: 'stable'
  },

  // =============================================================================
  // WEAPON COMPONENTS
  // =============================================================================
  {
    name: 'minecraft:weapon',
    description: 'Defines weapon properties and damage values.',
    category: 'Combat',
    subcategory: 'Weapons',
    version: '1.16.0',
    difficulty: 'intermediate',
    properties: [
      { name: 'on_hit_entity', type: 'object', description: 'Actions when hitting an entity', example: { event: 'my_item:on_hit', target: 'other' } },
      { name: 'on_hurt_entity', type: 'object', description: 'Actions when hurting an entity', example: { event: 'my_item:on_hurt' } },
      { name: 'on_not_hurt_entity', type: 'object', description: 'Actions when not hurting an entity', example: { event: 'my_item:on_miss' } }
    ],
    example: `{
  "minecraft:weapon": {
    "on_hit_entity": {
      "event": "my_item:on_hit",
      "target": "other"
    },
    "on_hurt_entity": {
      "event": "my_item:on_hurt",
      "target": "self"
    }
  }
}`,
    keywords: ['weapon', 'combat', 'damage', 'attack', 'hit'],
    stability: 'stable'
  },

  {
    name: 'minecraft:projectile',
    description: 'Makes the item launchable as a projectile.',
    category: 'Combat',
    subcategory: 'Projectiles',
    version: '1.16.0',
    difficulty: 'advanced',
    properties: [
      { name: 'minimum_critical_power', type: 'number', description: 'Minimum power for critical hit', default: 0.5, min: 0, max: 1, example: 0.8 },
      { name: 'projectile_entity', type: 'string', description: 'Entity spawned as projectile', required: true, example: 'minecraft:arrow' }
    ],
    example: `{
  "minecraft:projectile": {
    "minimum_critical_power": 0.8,
    "projectile_entity": "minecraft:arrow"
  }
}`,
    keywords: ['projectile', 'launch', 'shoot', 'arrow', 'throw'],
    stability: 'stable'
  },

  {
    name: 'minecraft:throwable',
    description: 'Makes the item throwable like snowballs or eggs.',
    category: 'Combat',
    subcategory: 'Projectiles',
    version: '1.16.0',
    difficulty: 'intermediate',
    properties: [
      { name: 'do_swing_animation', type: 'boolean', description: 'Play swing animation when throwing', default: false, example: true },
      { name: 'launch_power_scale', type: 'number', description: 'Scale factor for launch power', default: 1.0, min: 0, max: 10, example: 1.5 },
      { name: 'max_draw_duration', type: 'number', description: 'Maximum draw duration', default: 0, min: 0, max: 20, example: 3.0 },
      { name: 'max_launch_power', type: 'number', description: 'Maximum launch power', default: 1.0, min: 0, max: 10, example: 2.0 },
      { name: 'min_launch_power', type: 'number', description: 'Minimum launch power', default: 0.1, min: 0, max: 10, example: 0.5 },
      { name: 'scale_power_by_draw_duration', type: 'boolean', description: 'Scale power by draw time', default: false, example: true }
    ],
    example: `{
  "minecraft:throwable": {
    "do_swing_animation": true,
    "launch_power_scale": 1.5,
    "max_draw_duration": 3.0,
    "max_launch_power": 2.0,
    "min_launch_power": 0.5,
    "scale_power_by_draw_duration": true
  }
}`,
    keywords: ['throwable', 'throw', 'launch', 'projectile', 'toss'],
    stability: 'stable'
  },

  // =============================================================================
  // ARMOR COMPONENTS
  // =============================================================================
  {
    name: 'minecraft:armor',
    description: 'Defines armor protection and properties.',
    category: 'Combat',
    subcategory: 'Armor',
    version: '1.16.0',
    difficulty: 'intermediate',
    properties: [
      { name: 'protection', type: 'number', description: 'Armor protection points', required: true, min: 0, max: 20, example: 3 }
    ],
    example: `{
  "minecraft:armor": {
    "protection": 3
  }
}`,
    keywords: ['armor', 'protection', 'defense', 'damage', 'reduce'],
    stability: 'stable'
  },

  {
    name: 'minecraft:wearable',
    description: 'Allows the item to be equipped in armor slots.',
    category: 'Combat',
    subcategory: 'Armor',
    version: '1.16.0',
    difficulty: 'intermediate',
    properties: [
      { name: 'slot', type: 'string', description: 'Equipment slot', required: true, options: ['slot.armor.head', 'slot.armor.chest', 'slot.armor.legs', 'slot.armor.feet'], example: 'slot.armor.head' },
      { name: 'dispensable', type: 'boolean', description: 'Can be dispensed by dispensers', default: false, example: true }
    ],
    example: `{
  "minecraft:wearable": {
    "slot": "slot.armor.head",
    "dispensable": true
  }
}`,
    keywords: ['wearable', 'equip', 'armor', 'slot', 'equipment'],
    stability: 'stable'
  },

  // =============================================================================
  // TOOL COMPONENTS
  // =============================================================================
  {
    name: 'minecraft:tool',
    description: 'Defines tool properties and mining capabilities.',
    category: 'Tools',
    subcategory: 'Mining',
    version: '1.16.0',
    difficulty: 'advanced',
    properties: [
      { name: 'damage_per_block', type: 'number', description: 'Durability damage per block mined', default: 1, min: 0, max: 1000, example: 2 },
      { name: 'speed_multiplier', type: 'number', description: 'Mining speed multiplier', default: 1.0, min: 0, max: 100, example: 8.0 }
    ],
    example: `{
  "minecraft:tool": {
    "damage_per_block": 1,
    "speed_multiplier": 8.0
  }
}`,
    keywords: ['tool', 'mining', 'dig', 'harvest', 'efficiency'],
    stability: 'stable'
  },

  {
    name: 'minecraft:digger',
    description: 'Defines which blocks the tool can efficiently mine.',
    category: 'Tools',
    subcategory: 'Mining',
    version: '1.16.0',
    difficulty: 'advanced',
    properties: [
      { name: 'use_efficiency', type: 'boolean', description: 'Whether to use efficiency enchantment', default: false, example: true },
      { name: 'destroy_speeds', type: 'array', description: 'Block-specific destroy speeds', required: true, example: [{ block: 'minecraft:dirt', speed: 6 }] }
    ],
    example: `{
  "minecraft:digger": {
    "use_efficiency": true,
    "destroy_speeds": [
      {
        "block": {
          "tags": "q.any_tag('stone', 'metal')"
        },
        "speed": 6
      },
      {
        "block": "minecraft:dirt",
        "speed": 10
      }
    ]
  }
}`,
    keywords: ['digger', 'mining', 'destroy', 'blocks', 'efficiency'],
    stability: 'stable'
  },

  {
    name: 'minecraft:durability',
    description: 'Adds durability to tools, weapons, and armor.',
    category: 'Tools',
    subcategory: 'Durability',
    version: '1.16.0',
    difficulty: 'intermediate',
    properties: [
      { name: 'max_durability', type: 'number', description: 'Maximum durability points', required: true, min: 1, max: 32767, example: 250 },
      { name: 'damage_chance', type: 'object', description: 'Chance for damage to occur', example: { min: 10, max: 50 } }
    ],
    example: `{
  "minecraft:durability": {
    "max_durability": 250,
    "damage_chance": {
      "min": 10,
      "max": 50
    }
  }
}`,
    keywords: ['durability', 'damage', 'wear', 'repair', 'break'],
    stability: 'stable'
  },

  // =============================================================================
  // ENHANCEMENT COMPONENTS
  // =============================================================================
  {
    name: 'minecraft:enchantable',
    description: 'Allows the item to be enchanted with specific enchantments.',
    category: 'Enhancement',
    subcategory: 'Enchantments',
    version: '1.16.0',
    difficulty: 'intermediate',
    properties: [
      { name: 'value', type: 'number', description: 'Enchantability value', required: true, min: 0, max: 50, example: 15 },
      { name: 'slot', type: 'string', description: 'Enchantment slot category', required: true, options: ['sword', 'bow', 'crossbow', 'trident', 'tool', 'armor_head', 'armor_torso', 'armor_feet', 'armor_legs', 'all', 'elytra', 'fishing_rod', 'flintsteel', 'hoe', 'pickaxe', 'axe', 'shovel', 'shears'], example: 'sword' }
    ],
    example: `{
  "minecraft:enchantable": {
    "value": 15,
    "slot": "sword"
  }
}`,
    keywords: ['enchantable', 'enchant', 'magic', 'enhancement', 'upgrade'],
    stability: 'stable'
  },

  {
    name: 'minecraft:repairable',
    description: 'Allows the item to be repaired with specific materials.',
    category: 'Enhancement',
    subcategory: 'Repair',
    version: '1.16.0',
    difficulty: 'intermediate',
    properties: [
      { name: 'repair_items', type: 'array', description: 'Items that can repair this item', required: true, example: [{ items: ['minecraft:iron_ingot'], repair_amount: 25 }] }
    ],
    example: `{
  "minecraft:repairable": {
    "repair_items": [
      {
        "items": ["minecraft:iron_ingot"],
        "repair_amount": 25
      },
      {
        "items": ["minecraft:iron_block"],
        "repair_amount": 100
      }
    ]
  }
}`,
    keywords: ['repairable', 'repair', 'fix', 'restore', 'materials'],
    stability: 'stable'
  },

  // =============================================================================
  // UTILITY COMPONENTS
  // =============================================================================
  {
    name: 'minecraft:fuel',
    description: 'Allows the item to be used as fuel in furnaces.',
    category: 'Utility',
    subcategory: 'Fuel',
    version: '1.16.0',
    difficulty: 'beginner',
    properties: [
      { name: 'duration', type: 'number', description: 'Burn time in seconds', required: true, min: 0.05, max: 32767, example: 10.0 }
    ],
    example: `{
  "minecraft:fuel": {
    "duration": 10.0
  }
}`,
    keywords: ['fuel', 'burn', 'furnace', 'smelting', 'energy'],
    stability: 'stable'
  },

  {
    name: 'minecraft:entity_placer',
    description: 'Allows the item to place/spawn entities when used.',
    category: 'Utility',
    subcategory: 'Placement',
    version: '1.16.0',
    difficulty: 'intermediate',
    properties: [
      { name: 'entity', type: 'string', description: 'Entity to spawn', required: true, example: 'minecraft:pig' },
      { name: 'use_on', type: 'array', description: 'Block types this can be used on', example: ['minecraft:grass', 'minecraft:dirt'] },
      { name: 'dispense_on', type: 'array', description: 'Block types this can be dispensed on', example: ['minecraft:grass'] }
    ],
    example: `{
  "minecraft:entity_placer": {
    "entity": "minecraft:pig",
    "use_on": [
      "minecraft:grass",
      "minecraft:dirt"
    ],
    "dispense_on": [
      "minecraft:grass"
    ]
  }
}`,
    keywords: ['entity', 'placer', 'spawn', 'summon', 'mob'],
    stability: 'stable'
  },

  {
    name: 'minecraft:block_placer',
    description: 'Allows the item to place blocks when used.',
    category: 'Utility',
    subcategory: 'Placement',
    version: '1.16.0',
    difficulty: 'intermediate',
    properties: [
      { name: 'block', type: 'string', description: 'Block to place', required: true, example: 'minecraft:dirt' },
      { name: 'use_block_description', type: 'boolean', description: 'Use block description as item description', default: false, example: true }
    ],
    example: `{
  "minecraft:block_placer": {
    "block": "minecraft:dirt",
    "use_block_description": true
  }
}`,
    keywords: ['block', 'placer', 'place', 'build', 'construction'],
    stability: 'stable'
  },

  // =============================================================================
  // INTERACTIVE COMPONENTS
  // =============================================================================
  {
    name: 'minecraft:interact_button',
    description: 'Adds interaction text when looking at the item.',
    category: 'Interactive',
    subcategory: 'UI',
    version: '1.16.0',
    difficulty: 'beginner',
    properties: [
      { name: 'button_text', type: 'string', description: 'Text shown on interaction button', required: true, example: 'action.interact.use' },
      { name: 'new_interaction_text', type: 'string', description: 'Text for new interaction', example: 'action.interact.new' }
    ],
    example: `{
  "minecraft:interact_button": {
    "button_text": "action.interact.use",
    "new_interaction_text": "action.interact.new"
  }
}`,
    keywords: ['interact', 'button', 'text', 'ui', 'interface'],
    stability: 'stable'
  },

  {
    name: 'minecraft:use_animation',
    description: 'Defines the animation played when using the item.',
    category: 'Interactive',
    subcategory: 'Animation',
    version: '1.16.0',
    difficulty: 'beginner',
    properties: [
      { name: 'value', type: 'string', description: 'Animation type', required: true, options: ['eat', 'drink', 'block', 'bow', 'spear', 'crossbow', 'spyglass', 'brush', 'none'], example: 'eat' }
    ],
    example: `{
  "minecraft:use_animation": {
    "value": "eat"
  }
}`,
    keywords: ['use', 'animation', 'action', 'visual', 'motion'],
    stability: 'stable'
  },

  // =============================================================================
  // RECORD COMPONENTS
  // =============================================================================
  {
    name: 'minecraft:record',
    description: 'Makes the item playable in jukeboxes as a music disc.',
    category: 'Interactive',
    subcategory: 'Music',
    version: '1.16.0',
    difficulty: 'intermediate',
    properties: [
      { name: 'sound_event', type: 'string', description: 'Sound event to play', required: true, example: 'record.cat' },
      { name: 'duration', type: 'number', description: 'Duration of the track in seconds', required: true, min: 1, max: 3600, example: 185 },
      { name: 'comparator_signal', type: 'number', description: 'Redstone comparator signal strength', default: 1, min: 1, max: 15, example: 1 }
    ],
    example: `{
  "minecraft:record": {
    "sound_event": "record.cat",
    "duration": 185,
    "comparator_signal": 1
  }
}`,
    keywords: ['record', 'music', 'disc', 'jukebox', 'sound'],
    stability: 'stable'
  },

  // =============================================================================
  // TAGS & PROPERTIES
  // =============================================================================
  {
    name: 'minecraft:tags',
    description: 'Adds tags to the item for grouping and filtering.',
    category: 'Utility',
    subcategory: 'Organization',
    version: '1.16.0',
    difficulty: 'beginner',
    properties: [
      { name: 'tags', type: 'array', description: 'List of tags to add', required: true, example: ['minecraft:logs', 'minecraft:planks'] }
    ],
    example: `{
  "minecraft:tags": {
    "tags": [
      "minecraft:logs",
      "minecraft:planks",
      "custom:my_group"
    ]
  }
}`,
    keywords: ['tags', 'group', 'filter', 'category', 'organize'],
    stability: 'stable'
  },

  {
    name: 'minecraft:glint',
    description: 'Adds an enchantment glint effect to the item.',
    category: 'Visual',
    subcategory: 'Effects',
    version: '1.16.0',
    difficulty: 'beginner',
    properties: [
      { name: 'value', type: 'boolean', description: 'Whether to show glint effect', required: true, default: false, example: true }
    ],
    example: `{
  "minecraft:glint": {
    "value": true
  }
}`,
    keywords: ['glint', 'enchant', 'shine', 'effect', 'visual'],
    stability: 'stable'
  },

  {
    name: 'minecraft:foil',
    description: 'Adds a foil effect similar to enchanted items.',
    category: 'Visual',
    subcategory: 'Effects',
    version: '1.16.0',
    difficulty: 'beginner',
    properties: [
      { name: 'value', type: 'boolean', description: 'Whether to show foil effect', required: true, default: false, example: true }
    ],
    example: `{
  "minecraft:foil": {
    "value": true
  }
}`,
    keywords: ['foil', 'shine', 'effect', 'enchant', 'glint'],
    stability: 'stable'
  },

  // =============================================================================
  // CREATIVE ONLY COMPONENTS
  // =============================================================================
  {
    name: 'minecraft:creative_category',
    description: 'Defines which creative inventory tab the item appears in.',
    category: 'Utility',
    subcategory: 'Creative',
    version: '1.16.0',
    difficulty: 'beginner',
    properties: [
      { name: 'parent', type: 'string', description: 'Parent creative category', required: true, options: ['itemGroup.name.building', 'itemGroup.name.decoration', 'itemGroup.name.redstone', 'itemGroup.name.transportation', 'itemGroup.name.miscFoodAndDrinks', 'itemGroup.name.search', 'itemGroup.name.tools', 'itemGroup.name.combat', 'itemGroup.name.brewing', 'itemGroup.name.materials', 'itemGroup.name.items'], example: 'itemGroup.name.tools' },
      { name: 'category', type: 'string', description: 'Specific category within parent', example: 'equipment' }
    ],
    example: `{
  "minecraft:creative_category": {
    "parent": "itemGroup.name.tools",
    "category": "equipment"
  }
}`,
    keywords: ['creative', 'category', 'inventory', 'tab', 'group'],
    stability: 'stable'
  }
];

// Item category definitions
export const itemCategories = {
  'Core': {
    name: 'Core Properties',
    description: 'Essential item properties and basic functionality',
    icon: '⚙️',
    subcategories: ['Visual', 'Identity', 'Stacking', 'Usage']
  },
  'Food': {
    name: 'Food & Consumables',
    description: 'Components for edible items and consumables',
    icon: '🍎',
    subcategories: ['Nutrition', 'Effects', 'Consumption']
  },
  'Combat': {
    name: 'Combat & Defense',
    description: 'Weapons, armor, and combat-related components',
    icon: '⚔️',
    subcategories: ['Weapons', 'Armor', 'Projectiles']
  },
  'Tools': {
    name: 'Tools & Equipment',
    description: 'Mining tools, equipment, and durability',
    icon: '🔨',
    subcategories: ['Mining', 'Durability', 'Efficiency']
  },
  'Enhancement': {
    name: 'Enhancement & Upgrades',
    description: 'Enchantments, repairs, and item improvements',
    icon: '✨',
    subcategories: ['Enchantments', 'Repair', 'Upgrades']
  },
  'Utility': {
    name: 'Utility & Special',
    description: 'Fuel, placement, and utility functions',
    icon: '🔧',
    subcategories: ['Fuel', 'Placement', 'Creative', 'Organization']
  },
  'Interactive': {
    name: 'Interactive & UI',
    description: 'User interaction and interface components',
    icon: '🤝',
    subcategories: ['UI', 'Animation', 'Music']
  },
  'Visual': {
    name: 'Visual Effects',
    description: 'Visual enhancements and special effects',
    icon: '🎨',
    subcategories: ['Effects', 'Appearance']
  }
};

// Common item properties and presets
export const itemPresets = {
  food: {
    required: ['minecraft:food', 'minecraft:use_animation'],
    optional: ['minecraft:use_duration', 'minecraft:display_name'],
    defaults: {
      'minecraft:use_animation': { value: 'eat' },
      'minecraft:use_duration': { value: 1.6 }
    }
  },
  weapon: {
    required: ['minecraft:weapon', 'minecraft:durability'],
    optional: ['minecraft:enchantable', 'minecraft:repairable'],
    defaults: {
      'minecraft:enchantable': { value: 10, slot: 'sword' }
    }
  },
  tool: {
    required: ['minecraft:tool', 'minecraft:durability', 'minecraft:digger'],
    optional: ['minecraft:enchantable', 'minecraft:repairable'],
    defaults: {
      'minecraft:enchantable': { value: 14, slot: 'tool' }
    }
  },
  armor: {
    required: ['minecraft:armor', 'minecraft:wearable', 'minecraft:durability'],
    optional: ['minecraft:enchantable', 'minecraft:repairable'],
    defaults: {
      'minecraft:enchantable': { value: 9, slot: 'armor_head' }
    }
  }
};

// Effect types for food and potions
export const effectTypes = [
  'speed', 'slowness', 'haste', 'mining_fatigue', 'strength', 'instant_health',
  'instant_damage', 'jump_boost', 'nausea', 'regeneration', 'resistance',
  'fire_resistance', 'water_breathing', 'invisibility', 'blindness', 'night_vision',
  'hunger', 'weakness', 'poison', 'wither', 'health_boost', 'absorption',
  'saturation', 'levitation', 'fatal_poison', 'slow_falling'
];

// Search functionality
export function searchItemComponents(query: string, filters?: {
  category?: string;
  difficulty?: string;
  stability?: string;
}): ItemComponent[] {
  const lowercaseQuery = query.toLowerCase();
  
  return itemComponents.filter(component => {
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
export function getItemComponent(name: string): ItemComponent | undefined {
  return itemComponents.find(component => component.name === name);
}

// Get components by category
export function getItemComponentsByCategory(category: string): ItemComponent[] {
  return itemComponents.filter(component => component.category === category);
}

// Template generation helper
export function generateItemComponentJSON(componentName: string, properties: Record<string, any>): object {
  const component = getItemComponent(componentName);
  if (!component) {
    throw new Error(`Component ${componentName} not found`);
  }

  return {
    [componentName]: properties
  };
}

// Generate complete item JSON
export function generateItemJSON(identifier: string, components: Array<{ name: string; properties: Record<string, any> }>): object {
  const componentObj: Record<string, any> = {};
  
  components.forEach(component => {
    componentObj[component.name] = component.properties;
  });

  return {
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
  };
}

// Validate item preset requirements
export function validateItemPreset(presetName: string, components: string[]): { valid: boolean; missing: string[]; suggestions: string[] } {
  const preset = itemPresets[presetName as keyof typeof itemPresets];
  if (!preset) {
    return { valid: false, missing: [], suggestions: [] };
  }

  const missing = preset.required.filter(req => !components.includes(req));
  const suggestions = preset.optional.filter(opt => !components.includes(opt));

  return {
    valid: missing.length === 0,
    missing,
    suggestions
  };
}

// Export summary statistics
export const itemRegistryStats = {
  totalComponents: itemComponents.length,
  categoryCounts: Object.keys(itemCategories).reduce((acc, category) => {
    acc[category] = getItemComponentsByCategory(category).length;
    return acc;
  }, {} as Record<string, number>),
  difficultyLevels: ['beginner', 'intermediate', 'advanced'].reduce((acc, difficulty) => {
    acc[difficulty] = itemComponents.filter(c => c.difficulty === difficulty).length;
    return acc;
  }, {} as Record<string, number>),
  stabilityLevels: ['stable', 'experimental', 'beta'].reduce((acc, stability) => {
    acc[stability] = itemComponents.filter(c => c.stability === stability).length;
    return acc;
  }, {} as Record<string, number>),
  totalPresets: Object.keys(itemPresets).length,
  totalEffectTypes: effectTypes.length
};