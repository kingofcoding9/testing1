import { z } from 'zod';

// Base component interface
export interface ComponentProperty {
  name: string;
  type: 'number' | 'boolean' | 'string' | 'array' | 'object' | 'range';
  description: string;
  required?: boolean;
  default?: any;
  min?: number;
  max?: number;
  options?: string[];
  example?: any;
}

export interface EntityComponent {
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  version: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  properties: ComponentProperty[];
  example: string;
  documentation?: string;
  keywords: string[];
  stability: 'stable' | 'experimental' | 'beta';
  dependencies?: string[];
  conflicts?: string[];
}

// Zod schemas for validation
export const ComponentPropertySchema = z.object({
  name: z.string(),
  type: z.enum(['number', 'boolean', 'string', 'array', 'object', 'range']),
  description: z.string(),
  required: z.boolean().optional(),
  default: z.any().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  options: z.array(z.string()).optional(),
  example: z.any().optional(),
});

export const EntityComponentSchema = z.object({
  name: z.string(),
  description: z.string(),
  category: z.string(),
  subcategory: z.string().optional(),
  version: z.string(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  properties: z.array(ComponentPropertySchema),
  example: z.string(),
  documentation: z.string().optional(),
  keywords: z.array(z.string()),
  stability: z.enum(['stable', 'experimental', 'beta']),
  dependencies: z.array(z.string()).optional(),
  conflicts: z.array(z.string()).optional(),
});

// Comprehensive Entity Components Registry
export const entityComponents: EntityComponent[] = [
  // =============================================================================
  // CORE COMPONENTS
  // =============================================================================
  {
    name: 'minecraft:health',
    description: 'Defines the entity\'s health points and health-related behavior.',
    category: 'Core',
    subcategory: 'Attributes',
    version: '1.8.0',
    difficulty: 'beginner',
    properties: [
      { name: 'value', type: 'number', description: 'Current health points', required: true, min: 0, example: 20 },
      { name: 'max', type: 'number', description: 'Maximum health points', required: true, min: 1, max: 1024, example: 20 }
    ],
    example: `{
  "minecraft:health": {
    "value": 20,
    "max": 20
  }
}`,
    keywords: ['health', 'hp', 'life', 'vitality'],
    stability: 'stable',
    documentation: 'https://docs.microsoft.com/en-us/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecrafthealth'
  },

  {
    name: 'minecraft:physics',
    description: 'Enables physics simulation for the entity, allowing it to be affected by gravity and other physics forces.',
    category: 'Core',
    subcategory: 'Physics',
    version: '1.8.0',
    difficulty: 'beginner',
    properties: [
      { name: 'has_gravity', type: 'boolean', description: 'Whether entity is affected by gravity', default: true, example: true },
      { name: 'has_collision', type: 'boolean', description: 'Whether entity can collide with blocks', default: true, example: true }
    ],
    example: `{
  "minecraft:physics": {
    "has_gravity": true,
    "has_collision": true
  }
}`,
    keywords: ['physics', 'gravity', 'collision', 'simulation'],
    stability: 'stable'
  },

  {
    name: 'minecraft:collision_box',
    description: 'Defines the entity\'s collision boundaries for physics and interaction.',
    category: 'Core',
    subcategory: 'Physics',
    version: '1.8.0',
    difficulty: 'beginner',
    properties: [
      { name: 'width', type: 'number', description: 'Collision box width in blocks', required: true, min: 0, max: 16, example: 0.6 },
      { name: 'height', type: 'number', description: 'Collision box height in blocks', required: true, min: 0, max: 16, example: 1.8 }
    ],
    example: `{
  "minecraft:collision_box": {
    "width": 0.6,
    "height": 1.8
  }
}`,
    keywords: ['collision', 'hitbox', 'bounds', 'size'],
    stability: 'stable'
  },

  {
    name: 'minecraft:scale',
    description: 'Changes the visual size of the entity without affecting collision.',
    category: 'Core',
    subcategory: 'Visual',
    version: '1.8.0',
    difficulty: 'beginner',
    properties: [
      { name: 'value', type: 'number', description: 'Scale multiplier', required: true, min: 0.01, max: 10, default: 1.0, example: 1.5 }
    ],
    example: `{
  "minecraft:scale": {
    "value": 1.5
  }
}`,
    keywords: ['scale', 'size', 'visual', 'resize'],
    stability: 'stable'
  },

  {
    name: 'minecraft:transformation',
    description: 'Allows the entity to transform into another entity under specific conditions.',
    category: 'Core',
    subcategory: 'Behavior',
    version: '1.16.0',
    difficulty: 'advanced',
    properties: [
      { name: 'into', type: 'string', description: 'Entity to transform into', required: true, example: 'minecraft:zombie' },
      { name: 'transformation_sound', type: 'string', description: 'Sound to play during transformation', example: 'mob.zombie.remedy' },
      { name: 'keep_level', type: 'boolean', description: 'Whether to keep experience level', default: false, example: false },
      { name: 'keep_equipped', type: 'boolean', description: 'Whether to keep equipment', default: false, example: true },
      { name: 'keep_owner', type: 'boolean', description: 'Whether to keep ownership', default: false, example: true }
    ],
    example: `{
  "minecraft:transformation": {
    "into": "minecraft:zombie_villager",
    "transformation_sound": "mob.zombie.remedy",
    "keep_level": true,
    "keep_equipped": true
  }
}`,
    keywords: ['transformation', 'morph', 'convert', 'change'],
    stability: 'stable'
  },

  // =============================================================================
  // MOVEMENT COMPONENTS
  // =============================================================================
  {
    name: 'minecraft:movement',
    description: 'Defines the entity\'s basic movement speed.',
    category: 'Movement',
    subcategory: 'Basic',
    version: '1.8.0',
    difficulty: 'beginner',
    properties: [
      { name: 'value', type: 'number', description: 'Movement speed in blocks per second', required: true, min: 0, max: 10, default: 0.1, example: 0.25 }
    ],
    example: `{
  "minecraft:movement": {
    "value": 0.25
  }
}`,
    keywords: ['movement', 'speed', 'walk'],
    stability: 'stable'
  },

  {
    name: 'minecraft:movement.basic',
    description: 'Enables basic movement mechanics for the entity.',
    category: 'Movement',
    subcategory: 'Basic',
    version: '1.8.0',
    difficulty: 'beginner',
    properties: [],
    example: `{
  "minecraft:movement.basic": {}
}`,
    keywords: ['movement', 'basic', 'mechanics'],
    stability: 'stable'
  },

  {
    name: 'minecraft:movement.fly',
    description: 'Allows the entity to fly through the air.',
    category: 'Movement',
    subcategory: 'Advanced',
    version: '1.8.0',
    difficulty: 'intermediate',
    properties: [
      { name: 'max_turn', type: 'number', description: 'Maximum turn rate in degrees', default: 30, min: 1, max: 180, example: 45 }
    ],
    example: `{
  "minecraft:movement.fly": {
    "max_turn": 45
  }
}`,
    keywords: ['movement', 'fly', 'flying', 'air'],
    stability: 'stable'
  },

  {
    name: 'minecraft:movement.hover',
    description: 'Allows the entity to hover in place.',
    category: 'Movement',
    subcategory: 'Advanced',
    version: '1.8.0',
    difficulty: 'intermediate',
    properties: [],
    example: `{
  "minecraft:movement.hover": {}
}`,
    keywords: ['movement', 'hover', 'float'],
    stability: 'stable'
  },

  {
    name: 'minecraft:movement.jump',
    description: 'Enables jumping movement for the entity.',
    category: 'Movement',
    subcategory: 'Basic',
    version: '1.8.0',
    difficulty: 'beginner',
    properties: [
      { name: 'jump_delay', type: 'range', description: 'Time delay between jumps in seconds', default: [0.8, 1.6], example: [1.0, 2.0] }
    ],
    example: `{
  "minecraft:movement.jump": {
    "jump_delay": [1.0, 2.0]
  }
}`,
    keywords: ['movement', 'jump', 'hop'],
    stability: 'stable'
  },

  {
    name: 'minecraft:movement.skip',
    description: 'Allows the entity to skip while moving.',
    category: 'Movement',
    subcategory: 'Advanced',
    version: '1.8.0',
    difficulty: 'intermediate',
    properties: [],
    example: `{
  "minecraft:movement.skip": {}
}`,
    keywords: ['movement', 'skip', 'bounce'],
    stability: 'stable'
  },

  {
    name: 'minecraft:movement.sway',
    description: 'Adds swaying motion to the entity\'s movement.',
    category: 'Movement',
    subcategory: 'Advanced',
    version: '1.8.0',
    difficulty: 'intermediate',
    properties: [
      { name: 'sway_amplitude', type: 'number', description: 'Amplitude of the sway motion', default: 0.05, min: 0, max: 1, example: 0.1 },
      { name: 'sway_frequency', type: 'number', description: 'Frequency of the sway motion', default: 0.5, min: 0.1, max: 5, example: 1.0 }
    ],
    example: `{
  "minecraft:movement.sway": {
    "sway_amplitude": 0.1,
    "sway_frequency": 1.0
  }
}`,
    keywords: ['movement', 'sway', 'wave', 'oscillate'],
    stability: 'stable'
  },

  {
    name: 'minecraft:underwater_movement',
    description: 'Defines movement behavior while underwater.',
    category: 'Movement',
    subcategory: 'Environmental',
    version: '1.8.0',
    difficulty: 'intermediate',
    properties: [
      { name: 'value', type: 'number', description: 'Movement speed underwater', required: true, min: 0, max: 5, example: 0.15 }
    ],
    example: `{
  "minecraft:underwater_movement": {
    "value": 0.15
  }
}`,
    keywords: ['movement', 'underwater', 'swim', 'water'],
    stability: 'stable'
  },

  // =============================================================================
  // NAVIGATION COMPONENTS
  // =============================================================================
  {
    name: 'minecraft:navigation.walk',
    description: 'Allows the entity to navigate on land using pathfinding.',
    category: 'Movement',
    subcategory: 'Navigation',
    version: '1.8.0',
    difficulty: 'intermediate',
    properties: [
      { name: 'can_path_over_water', type: 'boolean', description: 'Can pathfind over water', default: false, example: false },
      { name: 'avoid_water', type: 'boolean', description: 'Avoids water when pathfinding', default: false, example: true },
      { name: 'avoid_damage_blocks', type: 'boolean', description: 'Avoids damaging blocks', default: false, example: true },
      { name: 'can_sink', type: 'boolean', description: 'Can sink in water', default: true, example: false },
      { name: 'can_pass_doors', type: 'boolean', description: 'Can pass through doors', default: false, example: true },
      { name: 'can_open_doors', type: 'boolean', description: 'Can open doors', default: false, example: true },
      { name: 'avoid_sun', type: 'boolean', description: 'Avoids sunlight when pathfinding', default: false, example: true }
    ],
    example: `{
  "minecraft:navigation.walk": {
    "can_path_over_water": false,
    "avoid_water": true,
    "avoid_damage_blocks": true,
    "can_pass_doors": true
  }
}`,
    keywords: ['navigation', 'walk', 'pathfinding', 'land'],
    stability: 'stable'
  },

  {
    name: 'minecraft:navigation.swim',
    description: 'Allows the entity to navigate in water.',
    category: 'Movement',
    subcategory: 'Navigation',
    version: '1.8.0',
    difficulty: 'intermediate',
    properties: [
      { name: 'avoid_sun', type: 'boolean', description: 'Avoids sunlight when pathfinding', default: false, example: true },
      { name: 'can_breach', type: 'boolean', description: 'Can breach water surface', default: false, example: true }
    ],
    example: `{
  "minecraft:navigation.swim": {
    "avoid_sun": false,
    "can_breach": true
  }
}`,
    keywords: ['navigation', 'swim', 'water', 'aquatic'],
    stability: 'stable'
  },

  {
    name: 'minecraft:navigation.fly',
    description: 'Allows the entity to navigate through the air.',
    category: 'Movement',
    subcategory: 'Navigation',
    version: '1.8.0',
    difficulty: 'intermediate',
    properties: [
      { name: 'can_path_over_water', type: 'boolean', description: 'Can pathfind over water', default: true, example: true },
      { name: 'can_path_from_air', type: 'boolean', description: 'Can start pathfinding from air', default: true, example: true }
    ],
    example: `{
  "minecraft:navigation.fly": {
    "can_path_over_water": true,
    "can_path_from_air": true
  }
}`,
    keywords: ['navigation', 'fly', 'air', 'flying'],
    stability: 'stable'
  },

  {
    name: 'minecraft:navigation.hover',
    description: 'Allows the entity to navigate while hovering.',
    category: 'Movement',
    subcategory: 'Navigation',
    version: '1.8.0',
    difficulty: 'advanced',
    properties: [
      { name: 'can_path_over_water', type: 'boolean', description: 'Can pathfind over water', default: true, example: true },
      { name: 'can_sink', type: 'boolean', description: 'Can sink when needed', default: false, example: false }
    ],
    example: `{
  "minecraft:navigation.hover": {
    "can_path_over_water": true,
    "can_sink": false
  }
}`,
    keywords: ['navigation', 'hover', 'float'],
    stability: 'stable'
  },

  // =============================================================================
  // JUMP COMPONENTS
  // =============================================================================
  {
    name: 'minecraft:jump.static',
    description: 'Allows the entity to jump with a fixed jump power.',
    category: 'Movement',
    subcategory: 'Jump',
    version: '1.8.0',
    difficulty: 'beginner',
    properties: [
      { name: 'jump_power', type: 'number', description: 'Jump strength', default: 0.42, min: 0, max: 10, example: 0.8 }
    ],
    example: `{
  "minecraft:jump.static": {
    "jump_power": 0.8
  }
}`,
    keywords: ['jump', 'static', 'power', 'leap'],
    stability: 'stable'
  },

  {
    name: 'minecraft:jump.dynamic',
    description: 'Allows the entity to jump with variable power based on conditions.',
    category: 'Movement',
    subcategory: 'Jump',
    version: '1.8.0',
    difficulty: 'intermediate',
    properties: [],
    example: `{
  "minecraft:jump.dynamic": {}
}`,
    keywords: ['jump', 'dynamic', 'variable'],
    stability: 'stable'
  },

  // =============================================================================
  // BEHAVIOR COMPONENTS (AI Goals)
  // =============================================================================
  {
    name: 'minecraft:behavior.random_stroll',
    description: 'Makes the entity wander around randomly.',
    category: 'Behavior',
    subcategory: 'Movement',
    version: '1.8.0',
    difficulty: 'beginner',
    properties: [
      { name: 'priority', type: 'number', description: 'Behavior priority (lower = higher priority)', required: true, min: 0, max: 100, example: 6 },
      { name: 'speed_multiplier', type: 'number', description: 'Movement speed multiplier', default: 1.0, min: 0.1, max: 5.0, example: 1.0 },
      { name: 'xz_dist', type: 'number', description: 'Distance to wander on X/Z axis', default: 10, min: 1, max: 64, example: 10 },
      { name: 'y_dist', type: 'number', description: 'Distance to wander on Y axis', default: 7, min: 1, max: 64, example: 7 },
      { name: 'interval', type: 'range', description: 'Time interval between wanders', default: [120, 120], example: [120, 240] }
    ],
    example: `{
  "minecraft:behavior.random_stroll": {
    "priority": 6,
    "speed_multiplier": 1.0,
    "xz_dist": 10,
    "y_dist": 7,
    "interval": [120, 240]
  }
}`,
    keywords: ['behavior', 'random', 'stroll', 'wander', 'walk'],
    stability: 'stable'
  },

  {
    name: 'minecraft:behavior.look_at_player',
    description: 'Makes the entity look at nearby players.',
    category: 'Behavior',
    subcategory: 'Social',
    version: '1.8.0',
    difficulty: 'beginner',
    properties: [
      { name: 'priority', type: 'number', description: 'Behavior priority', required: true, min: 0, max: 100, example: 7 },
      { name: 'look_distance', type: 'number', description: 'Distance to look for players', default: 6.0, min: 1, max: 64, example: 8.0 },
      { name: 'probability', type: 'number', description: 'Probability of looking', default: 0.02, min: 0, max: 1, example: 0.05 },
      { name: 'angle_of_view_horizontal', type: 'number', description: 'Horizontal viewing angle', default: 360, min: 1, max: 360, example: 120 },
      { name: 'angle_of_view_vertical', type: 'number', description: 'Vertical viewing angle', default: 360, min: 1, max: 360, example: 90 }
    ],
    example: `{
  "minecraft:behavior.look_at_player": {
    "priority": 7,
    "look_distance": 8.0,
    "probability": 0.05,
    "angle_of_view_horizontal": 120
  }
}`,
    keywords: ['behavior', 'look', 'player', 'gaze', 'attention'],
    stability: 'stable'
  },

  {
    name: 'minecraft:behavior.panic',
    description: 'Makes the entity run away when hurt or threatened.',
    category: 'Behavior',
    subcategory: 'Defensive',
    version: '1.8.0',
    difficulty: 'beginner',
    properties: [
      { name: 'priority', type: 'number', description: 'Behavior priority', required: true, min: 0, max: 100, example: 1 },
      { name: 'speed_multiplier', type: 'number', description: 'Panic speed multiplier', default: 1.25, min: 0.1, max: 5.0, example: 1.5 },
      { name: 'panic_sound', type: 'string', description: 'Sound to play when panicking', example: 'mob.pig.say' },
      { name: 'damage_sources', type: 'array', description: 'Damage sources that trigger panic', example: ['all'] }
    ],
    example: `{
  "minecraft:behavior.panic": {
    "priority": 1,
    "speed_multiplier": 1.5,
    "panic_sound": "mob.pig.say",
    "damage_sources": ["all"]
  }
}`,
    keywords: ['behavior', 'panic', 'flee', 'scared', 'fear'],
    stability: 'stable'
  },

  {
    name: 'minecraft:behavior.float',
    description: 'Makes the entity float in water to prevent drowning.',
    category: 'Behavior',
    subcategory: 'Survival',
    version: '1.8.0',
    difficulty: 'beginner',
    properties: [
      { name: 'priority', type: 'number', description: 'Behavior priority', required: true, min: 0, max: 100, example: 0 }
    ],
    example: `{
  "minecraft:behavior.float": {
    "priority": 0
  }
}`,
    keywords: ['behavior', 'float', 'water', 'swim', 'survival'],
    stability: 'stable'
  },

  {
    name: 'minecraft:behavior.follow_parent',
    description: 'Makes baby entities follow their parents.',
    category: 'Behavior',
    subcategory: 'Family',
    version: '1.8.0',
    difficulty: 'intermediate',
    properties: [
      { name: 'priority', type: 'number', description: 'Behavior priority', required: true, min: 0, max: 100, example: 5 },
      { name: 'speed_multiplier', type: 'number', description: 'Follow speed multiplier', default: 1.1, min: 0.1, max: 5.0, example: 1.25 }
    ],
    example: `{
  "minecraft:behavior.follow_parent": {
    "priority": 5,
    "speed_multiplier": 1.25
  }
}`,
    keywords: ['behavior', 'follow', 'parent', 'baby', 'family'],
    stability: 'stable',
    dependencies: ['minecraft:is_baby']
  },

  {
    name: 'minecraft:behavior.avoid_mob_type',
    description: 'Makes the entity avoid specific types of mobs.',
    category: 'Behavior',
    subcategory: 'Defensive',
    version: '1.8.0',
    difficulty: 'intermediate',
    properties: [
      { name: 'priority', type: 'number', description: 'Behavior priority', required: true, min: 0, max: 100, example: 4 },
      { name: 'entity_types', type: 'array', description: 'Entity types to avoid', required: true, example: [{ family: 'player', max_dist: 6, walk_speed_multiplier: 1.5 }] },
      { name: 'max_dist', type: 'number', description: 'Maximum avoidance distance', default: 16, min: 1, max: 64, example: 10 },
      { name: 'walk_speed_multiplier', type: 'number', description: 'Walk speed when avoiding', default: 1.0, min: 0.1, max: 5.0, example: 1.5 },
      { name: 'sprint_speed_multiplier', type: 'number', description: 'Sprint speed when avoiding', default: 1.0, min: 0.1, max: 5.0, example: 2.0 }
    ],
    example: `{
  "minecraft:behavior.avoid_mob_type": {
    "priority": 4,
    "entity_types": [
      {
        "filters": {
          "test": "is_family",
          "subject": "other",
          "value": "player"
        },
        "max_dist": 6,
        "walk_speed_multiplier": 1.5,
        "sprint_speed_multiplier": 2.0
      }
    ]
  }
}`,
    keywords: ['behavior', 'avoid', 'mob', 'fear', 'escape'],
    stability: 'stable'
  },

  {
    name: 'minecraft:behavior.random_look_around',
    description: 'Makes the entity randomly look around.',
    category: 'Behavior',
    subcategory: 'Idle',
    version: '1.8.0',
    difficulty: 'beginner',
    properties: [
      { name: 'priority', type: 'number', description: 'Behavior priority', required: true, min: 0, max: 100, example: 8 },
      { name: 'look_time', type: 'range', description: 'Time range to look in one direction', default: [40, 80], example: [20, 60] }
    ],
    example: `{
  "minecraft:behavior.random_look_around": {
    "priority": 8,
    "look_time": [20, 60]
  }
}`,
    keywords: ['behavior', 'look', 'random', 'idle', 'gaze'],
    stability: 'stable'
  },

  // =============================================================================
  // INTERACTION COMPONENTS
  // =============================================================================
  {
    name: 'minecraft:tameable',
    description: 'Allows the entity to be tamed by players.',
    category: 'Interaction',
    subcategory: 'Social',
    version: '1.8.0',
    difficulty: 'intermediate',
    properties: [
      { name: 'probability', type: 'number', description: 'Taming probability per attempt', default: 0.33, min: 0, max: 1, example: 0.5 },
      { name: 'tame_items', type: 'array', description: 'Items that can tame this entity', required: true, example: ['minecraft:wheat', 'minecraft:carrot'] },
      { name: 'tame_event', type: 'string', description: 'Event to trigger when tamed', example: 'minecraft:on_tame' }
    ],
    example: `{
  "minecraft:tameable": {
    "probability": 0.5,
    "tame_items": [
      "minecraft:wheat",
      "minecraft:carrot"
    ],
    "tame_event": "minecraft:on_tame"
  }
}`,
    keywords: ['tameable', 'tame', 'pet', 'domesticate'],
    stability: 'stable'
  },

  {
    name: 'minecraft:breedable',
    description: 'Allows the entity to breed and produce offspring.',
    category: 'Interaction',
    subcategory: 'Breeding',
    version: '1.8.0',
    difficulty: 'intermediate',
    properties: [
      { name: 'require_tame', type: 'boolean', description: 'Whether entity must be tamed to breed', default: true, example: false },
      { name: 'breeds_with', type: 'array', description: 'Entity types this can breed with', required: true, example: [{ mate_type: 'minecraft:cow', baby_type: 'minecraft:cow', breed_event: 'minecraft:entity_born' }] },
      { name: 'breed_items', type: 'array', description: 'Items used for breeding', required: true, example: ['minecraft:wheat'] },
      { name: 'love_filters', type: 'object', description: 'Filters for love mode', example: {} }
    ],
    example: `{
  "minecraft:breedable": {
    "require_tame": false,
    "breeds_with": [
      {
        "mate_type": "minecraft:cow",
        "baby_type": "minecraft:cow", 
        "breed_event": "minecraft:entity_born"
      }
    ],
    "breed_items": ["minecraft:wheat"]
  }
}`,
    keywords: ['breedable', 'breed', 'reproduction', 'offspring', 'baby'],
    stability: 'stable'
  },

  {
    name: 'minecraft:rideable',
    description: 'Allows the entity to be ridden by other entities.',
    category: 'Interaction',
    subcategory: 'Transportation',
    version: '1.8.0',
    difficulty: 'advanced',
    properties: [
      { name: 'seat_count', type: 'number', description: 'Number of seats available', default: 1, min: 1, max: 10, example: 2 },
      { name: 'family_types', type: 'array', description: 'Entity families that can ride', required: true, example: ['player'] },
      { name: 'interact_text', type: 'string', description: 'Text shown when interactable', example: 'action.interact.ride' },
      { name: 'pull_in_entities', type: 'boolean', description: 'Whether to pull entities onto seats', default: false, example: true },
      { name: 'rider_can_interact', type: 'boolean', description: 'Whether rider can interact', default: false, example: true }
    ],
    example: `{
  "minecraft:rideable": {
    "seat_count": 1,
    "family_types": ["player"],
    "interact_text": "action.interact.ride",
    "pull_in_entities": true,
    "rider_can_interact": true,
    "seats": [
      {
        "position": [0.0, 0.9, 0.0],
        "min_rider_count": 0,
        "max_rider_count": 1
      }
    ]
  }
}`,
    keywords: ['rideable', 'ride', 'mount', 'vehicle', 'transportation'],
    stability: 'stable'
  },

  // =============================================================================
  // ENVIRONMENT & SENSORS
  // =============================================================================
  {
    name: 'minecraft:breathable',
    description: 'Defines what the entity can breathe and drowning behavior.',
    category: 'Environment',
    subcategory: 'Survival',
    version: '1.8.0',
    difficulty: 'intermediate',
    properties: [
      { name: 'total_supply', type: 'number', description: 'Total air supply in seconds', default: 15, min: 1, max: 300, example: 20 },
      { name: 'suffocate_time', type: 'number', description: 'Time before suffocation damage', default: -1, min: -1, max: 300, example: 2 },
      { name: 'inhale_time', type: 'number', description: 'Time to fully inhale', default: 0, min: 0, max: 60, example: 3 },
      { name: 'breathes_air', type: 'boolean', description: 'Can breathe air', default: true, example: true },
      { name: 'breathes_water', type: 'boolean', description: 'Can breathe water', default: false, example: false },
      { name: 'breathes_lava', type: 'boolean', description: 'Can breathe lava', default: false, example: false },
      { name: 'breathes_solids', type: 'boolean', description: 'Can breathe in solid blocks', default: false, example: false },
      { name: 'generates_bubbles', type: 'boolean', description: 'Generates bubble particles', default: true, example: false }
    ],
    example: `{
  "minecraft:breathable": {
    "total_supply": 15,
    "suffocate_time": -1,
    "breathes_air": true,
    "breathes_water": false,
    "generates_bubbles": true
  }
}`,
    keywords: ['breathable', 'air', 'drowning', 'suffocation', 'oxygen'],
    stability: 'stable'
  },

  {
    name: 'minecraft:environment_sensor',
    description: 'Detects environmental conditions and triggers events.',
    category: 'Environment',
    subcategory: 'Sensors',
    version: '1.8.0',
    difficulty: 'advanced',
    properties: [
      { name: 'triggers', type: 'array', description: 'Environmental triggers', required: true, example: [{ filters: { test: 'is_daytime' }, event: 'minecraft:become_day' }] }
    ],
    example: `{
  "minecraft:environment_sensor": {
    "triggers": [
      {
        "filters": {
          "test": "is_daytime",
          "value": true
        },
        "event": "minecraft:become_day"
      },
      {
        "filters": {
          "test": "is_underwater",
          "subject": "self",
          "value": true
        },
        "event": "minecraft:enter_water"
      }
    ]
  }
}`,
    keywords: ['environment', 'sensor', 'detection', 'conditions', 'triggers'],
    stability: 'stable'
  },

  {
    name: 'minecraft:damage_sensor',
    description: 'Detects damage and can trigger events or modify damage.',
    category: 'Environment',
    subcategory: 'Sensors',
    version: '1.8.0',
    difficulty: 'advanced',
    properties: [
      { name: 'triggers', type: 'array', description: 'Damage triggers', required: true, example: [{ cause: 'fire', deals_damage: false, on_damage: { event: 'minecraft:fire_immunity' } }] }
    ],
    example: `{
  "minecraft:damage_sensor": {
    "triggers": [
      {
        "cause": "fire",
        "deals_damage": false,
        "on_damage": {
          "event": "minecraft:fire_immunity"
        }
      },
      {
        "cause": "fall",
        "damage_multiplier": 0.5,
        "deals_damage": true
      }
    ]
  }
}`,
    keywords: ['damage', 'sensor', 'immunity', 'resistance', 'protection'],
    stability: 'stable'
  },

  {
    name: 'minecraft:timer',
    description: 'Triggers events after specified time intervals.',
    category: 'Environment',
    subcategory: 'Timing',
    version: '1.8.0',
    difficulty: 'intermediate',
    properties: [
      { name: 'looping', type: 'boolean', description: 'Whether timer loops', default: true, example: false },
      { name: 'time', type: 'range', description: 'Time range in seconds', required: true, example: [5.0, 10.0] },
      { name: 'time_down_event', type: 'string', description: 'Event when timer expires', required: true, example: 'minecraft:timer_expired' },
      { name: 'randomInterval', type: 'boolean', description: 'Use random interval from range', default: true, example: true }
    ],
    example: `{
  "minecraft:timer": {
    "looping": true,
    "time": [5.0, 10.0],
    "time_down_event": "minecraft:timer_expired",
    "randomInterval": true
  }
}`,
    keywords: ['timer', 'schedule', 'interval', 'delay', 'timing'],
    stability: 'stable'
  },

  // =============================================================================
  // VISUAL & VARIANTS
  // =============================================================================
  {
    name: 'minecraft:variant',
    description: 'Defines visual variants for the entity.',
    category: 'Visual',
    subcategory: 'Appearance',
    version: '1.8.0',
    difficulty: 'beginner',
    properties: [
      { name: 'value', type: 'number', description: 'Variant number', required: true, min: 0, max: 2147483647, example: 2 }
    ],
    example: `{
  "minecraft:variant": {
    "value": 2
  }
}`,
    keywords: ['variant', 'texture', 'appearance', 'visual'],
    stability: 'stable'
  },

  {
    name: 'minecraft:mark_variant',
    description: 'Defines marking variants for the entity.',
    category: 'Visual',
    subcategory: 'Appearance',
    version: '1.8.0',
    difficulty: 'beginner',
    properties: [
      { name: 'value', type: 'number', description: 'Mark variant number', required: true, min: 0, max: 2147483647, example: 1 }
    ],
    example: `{
  "minecraft:mark_variant": {
    "value": 1
  }
}`,
    keywords: ['mark', 'variant', 'markings', 'pattern'],
    stability: 'stable'
  },

  {
    name: 'minecraft:skin_id',
    description: 'Defines the skin ID for the entity.',
    category: 'Visual',
    subcategory: 'Appearance',
    version: '1.8.0',
    difficulty: 'beginner',
    properties: [
      { name: 'value', type: 'number', description: 'Skin ID number', required: true, min: 0, max: 2147483647, example: 0 }
    ],
    example: `{
  "minecraft:skin_id": {
    "value": 0
  }
}`,
    keywords: ['skin', 'texture', 'appearance', 'visual'],
    stability: 'stable'
  },

  // =============================================================================
  // UTILITY COMPONENTS
  // =============================================================================
  {
    name: 'minecraft:nameable',
    description: 'Allows the entity to be named with name tags.',
    category: 'Utility',
    subcategory: 'Identity',
    version: '1.8.0',
    difficulty: 'beginner',
    properties: [
      { name: 'always_show', type: 'boolean', description: 'Always show name above entity', default: false, example: true },
      { name: 'allow_name_tag_renaming', type: 'boolean', description: 'Allow renaming with name tags', default: true, example: true },
      { name: 'default_trigger', type: 'string', description: 'Default name trigger event', example: 'minecraft:named' },
      { name: 'name_actions', type: 'array', description: 'Actions based on specific names', example: [] }
    ],
    example: `{
  "minecraft:nameable": {
    "always_show": false,
    "allow_name_tag_renaming": true,
    "default_trigger": "minecraft:named"
  }
}`,
    keywords: ['nameable', 'name', 'tag', 'identity', 'label'],
    stability: 'stable'
  },

  {
    name: 'minecraft:persistent',
    description: 'Prevents the entity from despawning naturally.',
    category: 'Utility',
    subcategory: 'Spawning',
    version: '1.8.0',
    difficulty: 'beginner',
    properties: [],
    example: `{
  "minecraft:persistent": {}
}`,
    keywords: ['persistent', 'despawn', 'permanent', 'stay'],
    stability: 'stable'
  },

  {
    name: 'minecraft:despawn',
    description: 'Controls when and how the entity despawns.',
    category: 'Utility',
    subcategory: 'Spawning',
    version: '1.8.0',
    difficulty: 'intermediate',
    properties: [
      { name: 'despawn_from_distance', type: 'object', description: 'Distance-based despawning rules', example: {} },
      { name: 'despawn_from_chance', type: 'boolean', description: 'Allow chance-based despawning', default: true, example: false },
      { name: 'despawn_from_inactivity', type: 'boolean', description: 'Despawn when inactive', default: true, example: false },
      { name: 'despawn_from_simulation_edge', type: 'boolean', description: 'Despawn at simulation edge', default: true, example: false },
      { name: 'remove_child_entities', type: 'boolean', description: 'Remove child entities when despawning', default: false, example: true }
    ],
    example: `{
  "minecraft:despawn": {
    "despawn_from_distance": {
      "max_distance": 128,
      "min_distance": 32
    },
    "despawn_from_chance": false,
    "despawn_from_inactivity": true
  }
}`,
    keywords: ['despawn', 'remove', 'cleanup', 'distance'],
    stability: 'stable'
  },

  {
    name: 'minecraft:is_baby',
    description: 'Marks the entity as a baby with special properties.',
    category: 'Utility',
    subcategory: 'Age',
    version: '1.8.0',
    difficulty: 'beginner',
    properties: [],
    example: `{
  "minecraft:is_baby": {}
}`,
    keywords: ['baby', 'young', 'child', 'juvenile'],
    stability: 'stable'
  },

  {
    name: 'minecraft:ageable',
    description: 'Allows the entity to age over time.',
    category: 'Utility',
    subcategory: 'Age',
    version: '1.8.0',
    difficulty: 'intermediate',
    properties: [
      { name: 'duration', type: 'number', description: 'Time to grow up in seconds', default: 1200, min: 1, max: 2147483647, example: 600 },
      { name: 'feed_items', type: 'array', description: 'Items that speed up growth', example: ['minecraft:wheat'] },
      { name: 'grow_up', type: 'object', description: 'Event when grown up', example: { event: 'minecraft:ageable_grow_up' } }
    ],
    example: `{
  "minecraft:ageable": {
    "duration": 1200,
    "feed_items": [
      "minecraft:wheat"
    ],
    "grow_up": {
      "event": "minecraft:ageable_grow_up",
      "target": "self"
    }
  }
}`,
    keywords: ['ageable', 'grow', 'mature', 'development'],
    stability: 'stable'
  },

  {
    name: 'minecraft:angry',
    description: 'Controls the entity\'s anger state and behavior.',
    category: 'Utility',
    subcategory: 'Emotional',
    version: '1.8.0',
    difficulty: 'intermediate',
    properties: [
      { name: 'duration', type: 'number', description: 'Anger duration in seconds', default: 25, min: 0, max: 2147483647, example: 30 },
      { name: 'duration_delta', type: 'number', description: 'Random duration variation', default: 0, min: 0, max: 2147483647, example: 10 },
      { name: 'broadcast_anger', type: 'boolean', description: 'Broadcast anger to nearby entities', default: false, example: true },
      { name: 'broadcast_range', type: 'number', description: 'Range to broadcast anger', default: 20, min: 1, max: 100, example: 16 },
      { name: 'calm_event', type: 'string', description: 'Event when calming down', example: 'minecraft:on_calm' }
    ],
    example: `{
  "minecraft:angry": {
    "duration": 25,
    "duration_delta": 5,
    "broadcast_anger": true,
    "broadcast_range": 16,
    "calm_event": "minecraft:on_calm"
  }
}`,
    keywords: ['angry', 'rage', 'hostility', 'emotion'],
    stability: 'stable'
  }
];

// Category definitions
export const entityCategories = {
  'Core': {
    name: 'Core Components',
    description: 'Essential components that define basic entity properties',
    icon: 'anvil-hammer.png',
    subcategories: ['Attributes', 'Physics', 'Visual', 'Behavior']
  },
  'Movement': {
    name: 'Movement & Navigation',
    description: 'Components controlling entity movement and pathfinding',
    icon: 'leather_boots.png',
    subcategories: ['Basic', 'Advanced', 'Navigation', 'Jump', 'Environmental']
  },
  'Behavior': {
    name: 'AI Behaviors',
    description: 'AI goals and behavioral patterns for entities',
    icon: 'brain_coral.png',
    subcategories: ['Movement', 'Social', 'Defensive', 'Survival', 'Idle', 'Family']
  },
  'Interaction': {
    name: 'Player Interaction',
    description: 'Components enabling player interaction with entities',
    icon: 'golden_carrot.png',
    subcategories: ['Social', 'Breeding', 'Transportation', 'Trading']
  },
  'Environment': {
    name: 'Environment & Sensors',
    description: 'Components for environmental awareness and adaptation',
    icon: 'grass.png',
    subcategories: ['Survival', 'Sensors', 'Timing']
  },
  'Visual': {
    name: 'Visual & Audio',
    description: 'Components controlling appearance and sound',
    icon: 'brush.png',
    subcategories: ['Appearance', 'Animation', 'Sound']
  },
  'Utility': {
    name: 'Utility & Management',
    description: 'Utility components for entity management',
    icon: 'anvil-crossout.png',
    subcategories: ['Identity', 'Spawning', 'Age', 'Emotional', 'Special']
  }
};

// Search functionality
export function searchEntityComponents(query: string, filters?: {
  category?: string;
  difficulty?: string;
  stability?: string;
}): EntityComponent[] {
  const lowercaseQuery = query.toLowerCase();
  
  return entityComponents.filter(component => {
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
export function getEntityComponent(name: string): EntityComponent | undefined {
  return entityComponents.find(component => component.name === name);
}

// Get components by category
export function getEntityComponentsByCategory(category: string): EntityComponent[] {
  return entityComponents.filter(component => component.category === category);
}

// Template generation helper
export function generateEntityComponentJSON(componentName: string, properties: Record<string, any>): object {
  const component = getEntityComponent(componentName);
  if (!component) {
    throw new Error(`Component ${componentName} not found`);
  }

  return {
    [componentName]: properties
  };
}

// Export summary statistics
export const entityRegistryStats = {
  totalComponents: entityComponents.length,
  categoryCounts: Object.keys(entityCategories).reduce((acc, category) => {
    acc[category] = getEntityComponentsByCategory(category).length;
    return acc;
  }, {} as Record<string, number>),
  difficultyLevels: ['beginner', 'intermediate', 'advanced'].reduce((acc, difficulty) => {
    acc[difficulty] = entityComponents.filter(c => c.difficulty === difficulty).length;
    return acc;
  }, {} as Record<string, number>),
  stabilityLevels: ['stable', 'experimental', 'beta'].reduce((acc, stability) => {
    acc[stability] = entityComponents.filter(c => c.stability === stability).length;
    return acc;
  }, {} as Record<string, number>)
};