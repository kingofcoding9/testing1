export interface ComponentProperty {
  name: string;
  type: string;
  description: string;
  required?: boolean;
  default?: string;
}

export interface EntityComponent {
  name: string;
  description: string;
  category: string;
  version?: string;
  properties?: ComponentProperty[];
  example?: string;
  documentation?: string;
}

export const entityComponents: EntityComponent[] = [
  // Health & Attributes
  {
    name: 'minecraft:health',
    description: 'Defines the entity\'s health points',
    category: 'Attributes',
    version: '1.8.0',
    properties: [
      { name: 'value', type: 'number', description: 'Current health', required: true },
      { name: 'max', type: 'number', description: 'Maximum health', required: true }
    ],
    example: `{
  "minecraft:health": {
    "value": 20,
    "max": 20
  }
}`,
    documentation: 'https://learn.microsoft.com/en-us/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecrafthealth'
  },
  {
    name: 'minecraft:attack',
    description: 'Defines the entity\'s attack damage',
    category: 'Combat',
    version: '1.8.0',
    properties: [
      { name: 'damage', type: 'number', description: 'Attack damage amount', required: true }
    ],
    example: `{
  "minecraft:attack": {
    "damage": 3
  }
}`,
  },
  {
    name: 'minecraft:scale',
    description: 'Changes the visual size of the entity',
    category: 'Visual',
    version: '1.8.0',
    properties: [
      { name: 'value', type: 'number', description: 'Scale multiplier', required: true, default: '1.0' }
    ],
    example: `{
  "minecraft:scale": {
    "value": 1.5
  }
}`,
  },

  // Movement
  {
    name: 'minecraft:movement',
    description: 'Basic movement speed for the entity',
    category: 'Movement',
    version: '1.8.0',
    properties: [
      { name: 'value', type: 'number', description: 'Movement speed', required: true, default: '0.1' }
    ],
    example: `{
  "minecraft:movement": {
    "value": 0.25
  }
}`,
  },
  {
    name: 'minecraft:navigation.walk',
    description: 'Allows the entity to navigate on land',
    category: 'Movement',
    version: '1.8.0',
    properties: [
      { name: 'can_path_over_water', type: 'boolean', description: 'Can walk over water', default: 'false' },
      { name: 'avoid_water', type: 'boolean', description: 'Avoids water when pathfinding', default: 'false' }
    ],
    example: `{
  "minecraft:navigation.walk": {
    "can_path_over_water": false,
    "avoid_water": true
  }
}`,
  },
  {
    name: 'minecraft:movement.basic',
    description: 'Basic movement mechanics',
    category: 'Movement',
    version: '1.8.0',
    example: `{
  "minecraft:movement.basic": {}
}`,
  },
  {
    name: 'minecraft:jump.static',
    description: 'Allows the entity to jump',
    category: 'Movement',
    version: '1.8.0',
    properties: [
      { name: 'jump_power', type: 'number', description: 'Jump strength', default: '0.42' }
    ],
    example: `{
  "minecraft:jump.static": {
    "jump_power": 0.42
  }
}`,
  },

  // Physics
  {
    name: 'minecraft:physics',
    description: 'Enables physics simulation for the entity',
    category: 'Physics',
    version: '1.8.0',
    example: `{
  "minecraft:physics": {}
}`,
  },
  {
    name: 'minecraft:collision_box',
    description: 'Defines the entity\'s collision boundaries',
    category: 'Physics',
    version: '1.8.0',
    properties: [
      { name: 'width', type: 'number', description: 'Collision box width', required: true },
      { name: 'height', type: 'number', description: 'Collision box height', required: true }
    ],
    example: `{
  "minecraft:collision_box": {
    "width": 0.6,
    "height": 1.8
  }
}`,
  },
  {
    name: 'minecraft:pushable',
    description: 'Allows the entity to be pushed by other entities',
    category: 'Physics',
    version: '1.8.0',
    properties: [
      { name: 'is_pushable', type: 'boolean', description: 'Can be pushed', default: 'true' },
      { name: 'is_pushable_by_piston', type: 'boolean', description: 'Can be pushed by pistons', default: 'true' }
    ],
    example: `{
  "minecraft:pushable": {
    "is_pushable": true,
    "is_pushable_by_piston": false
  }
}`,
  },

  // Behaviors
  {
    name: 'minecraft:behavior.random_stroll',
    description: 'Makes the entity wander around randomly',
    category: 'Behavior',
    version: '1.8.0',
    properties: [
      { name: 'priority', type: 'number', description: 'Behavior priority', required: true },
      { name: 'speed_multiplier', type: 'number', description: 'Movement speed multiplier', default: '1.0' }
    ],
    example: `{
  "minecraft:behavior.random_stroll": {
    "priority": 6,
    "speed_multiplier": 1.0
  }
}`,
  },
  {
    name: 'minecraft:behavior.look_at_player',
    description: 'Makes the entity look at nearby players',
    category: 'Behavior',
    version: '1.8.0',
    properties: [
      { name: 'priority', type: 'number', description: 'Behavior priority', required: true },
      { name: 'look_distance', type: 'number', description: 'Distance to look for players', default: '6.0' }
    ],
    example: `{
  "minecraft:behavior.look_at_player": {
    "priority": 7,
    "look_distance": 6.0
  }
}`,
  },
  {
    name: 'minecraft:behavior.panic',
    description: 'Makes the entity run away when hurt',
    category: 'Behavior',
    version: '1.8.0',
    properties: [
      { name: 'priority', type: 'number', description: 'Behavior priority', required: true },
      { name: 'speed_multiplier', type: 'number', description: 'Panic speed multiplier', default: '1.25' }
    ],
    example: `{
  "minecraft:behavior.panic": {
    "priority": 1,
    "speed_multiplier": 1.25
  }
}`,
  },
  {
    name: 'minecraft:behavior.float',
    description: 'Makes the entity float in water',
    category: 'Behavior',
    version: '1.8.0',
    properties: [
      { name: 'priority', type: 'number', description: 'Behavior priority', required: true }
    ],
    example: `{
  "minecraft:behavior.float": {
    "priority": 0
  }
}`,
  },

  // Environment
  {
    name: 'minecraft:breathable',
    description: 'Defines what the entity can breathe',
    category: 'Environment',
    version: '1.8.0',
    properties: [
      { name: 'total_supply', type: 'number', description: 'Total air supply', default: '15' },
      { name: 'suffocate_time', type: 'number', description: 'Time before suffocation damage', default: '-1' }
    ],
    example: `{
  "minecraft:breathable": {
    "total_supply": 15,
    "suffocate_time": -1,
    "breathes_air": true,
    "breathes_water": false
  }
}`,
  },

  // Utility
  {
    name: 'minecraft:nameable',
    description: 'Allows the entity to be named with name tags',
    category: 'Utility',
    version: '1.8.0',
    properties: [
      { name: 'always_show', type: 'boolean', description: 'Always show name', default: 'false' },
      { name: 'allow_name_tag_renaming', type: 'boolean', description: 'Allow renaming', default: 'true' }
    ],
    example: `{
  "minecraft:nameable": {
    "always_show": false,
    "allow_name_tag_renaming": true
  }
}`,
  },
  {
    name: 'minecraft:persistent',
    description: 'Prevents the entity from despawning naturally',
    category: 'Utility',
    version: '1.8.0',
    example: `{
  "minecraft:persistent": {}
}`,
  }
];
