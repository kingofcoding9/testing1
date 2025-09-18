/**
 * Minecraft Bedrock Documentation System
 * Validates content against official Minecraft Bedrock docs
 */

export interface MinecraftDoc {
  id: string;
  title: string;
  content: string;
  category: string;
  version: string;
  lastUpdated: string;
  officialUrl?: string;
}

export interface APIMethod {
  name: string;
  description: string;
  module: string;
  parameters: Array<{
    name: string;
    type: string;
    description: string;
    optional?: boolean;
    defaultValue?: any;
  }>;
  returns: {
    type: string;
    description: string;
  };
  examples: string[];
  version: string;
  deprecated?: boolean;
}

export interface ComponentSpec {
  name: string;
  description: string;
  category: string;
  properties: Array<{
    name: string;
    type: string;
    description: string;
    required?: boolean;
    defaultValue?: any;
    validValues?: any[];
  }>;
  examples: string[];
  compatibleWith: string[];
  version: string;
}

// Minecraft API Documentation
export const minecraftApi: Record<string, APIMethod[]> = {
  '@minecraft/server': [
    {
      name: 'world.sendMessage',
      description: 'Sends a message to all players in the world',
      module: '@minecraft/server',
      parameters: [
        {
          name: 'message',
          type: 'string | RawMessage',
          description: 'The message to send to players'
        }
      ],
      returns: {
        type: 'void',
        description: 'No return value'
      },
      examples: [
        'world.sendMessage("Hello, world!");',
        'world.sendMessage({ rawtext: [{ text: "Hello, " }, { text: "world!" }] });'
      ],
      version: '1.21.0'
    },
    {
      name: 'world.playSound',
      description: 'Plays a sound at a specific location in the world',
      module: '@minecraft/server',
      parameters: [
        {
          name: 'soundId',
          type: 'string',
          description: 'The sound identifier to play'
        },
        {
          name: 'location',
          type: 'Vector3',
          description: 'The location where the sound should be played'
        },
        {
          name: 'soundOptions',
          type: 'WorldSoundOptions',
          description: 'Additional sound configuration options',
          optional: true
        }
      ],
      returns: {
        type: 'void',
        description: 'No return value'
      },
      examples: [
        'world.playSound("random.pop", { x: 0, y: 64, z: 0 });',
        'world.playSound("ambient.cave", playerLocation, { pitch: 1.2, volume: 0.8 });'
      ],
      version: '1.21.0'
    },
    {
      name: 'world.spawnEntity',
      description: 'Spawns an entity at the specified location',
      module: '@minecraft/server',
      parameters: [
        {
          name: 'identifier',
          type: 'string',
          description: 'The entity type identifier'
        },
        {
          name: 'location',
          type: 'Vector3',
          description: 'The spawn location'
        }
      ],
      returns: {
        type: 'Entity',
        description: 'The spawned entity object'
      },
      examples: [
        'const pig = world.spawnEntity("minecraft:pig", { x: 0, y: 64, z: 0 });',
        'const customEntity = world.spawnEntity("my_addon:custom_mob", spawnPoint);'
      ],
      version: '1.21.0'
    },
    {
      name: 'world.getPlayers',
      description: 'Gets all players currently in the world',
      module: '@minecraft/server',
      parameters: [],
      returns: {
        type: 'Player[]',
        description: 'Array of all players in the world'
      },
      examples: [
        'const players = world.getPlayers();',
        'for (const player of world.getPlayers()) { player.sendMessage("Hello!"); }'
      ],
      version: '1.21.0'
    }
  ],
  'system': [
    {
      name: 'system.run',
      description: 'Schedules a function to run on the next tick',
      module: 'system',
      parameters: [
        {
          name: 'callback',
          type: '() => void',
          description: 'Function to execute on the next tick'
        }
      ],
      returns: {
        type: 'number',
        description: 'The run ID for this scheduled function'
      },
      examples: [
        'system.run(() => { console.log("Next tick!"); });',
        'const runId = system.run(() => { world.sendMessage("Delayed message"); });'
      ],
      version: '1.21.0'
    },
    {
      name: 'system.runInterval',
      description: 'Schedules a function to run repeatedly at specified intervals',
      module: 'system',
      parameters: [
        {
          name: 'callback',
          type: '() => void',
          description: 'Function to execute repeatedly'
        },
        {
          name: 'tickInterval',
          type: 'number',
          description: 'Number of ticks between each execution'
        }
      ],
      returns: {
        type: 'number',
        description: 'The interval ID for this scheduled function'
      },
      examples: [
        'system.runInterval(() => { world.sendMessage("Every second!"); }, 20);',
        'const intervalId = system.runInterval(updateGameState, 10);'
      ],
      version: '1.21.0'
    },
    {
      name: 'system.runTimeout',
      description: 'Schedules a function to run after a specified delay',
      module: 'system',
      parameters: [
        {
          name: 'callback',
          type: '() => void',
          description: 'Function to execute after delay'
        },
        {
          name: 'tickDelay',
          type: 'number',
          description: 'Number of ticks to wait before execution'
        }
      ],
      returns: {
        type: 'number',
        description: 'The timeout ID for this scheduled function'
      },
      examples: [
        'system.runTimeout(() => { player.sendMessage("Delayed!"); }, 100);',
        'const timeoutId = system.runTimeout(resetGame, 1200); // 60 seconds'
      ],
      version: '1.21.0'
    },
    {
      name: 'system.clearRun',
      description: 'Cancels a scheduled function',
      module: 'system',
      parameters: [
        {
          name: 'runId',
          type: 'number',
          description: 'The run ID to cancel'
        }
      ],
      returns: {
        type: 'void',
        description: 'No return value'
      },
      examples: [
        'system.clearRun(runId);',
        'system.clearRun(intervalId); // Cancel interval'
      ],
      version: '1.21.0'
    }
  ]
};

// Component specifications based on official docs
export const componentSpecs: Record<string, ComponentSpec> = {
  'minecraft:health': {
    name: 'minecraft:health',
    description: 'Defines the health of the entity',
    category: 'Attributes',
    properties: [
      {
        name: 'value',
        type: 'number',
        description: 'Current health of the entity',
        required: true
      },
      {
        name: 'max',
        type: 'number',
        description: 'Maximum health of the entity',
        required: true
      }
    ],
    examples: [
      '{ "minecraft:health": { "value": 20, "max": 20 } }',
      '{ "minecraft:health": { "value": 100, "max": 100 } }'
    ],
    compatibleWith: ['minecraft:entity'],
    version: '1.8.0'
  },
  'minecraft:movement': {
    name: 'minecraft:movement',
    description: 'Defines the movement speed of the entity',
    category: 'Movement',
    properties: [
      {
        name: 'value',
        type: 'number',
        description: 'Movement speed multiplier',
        required: true,
        defaultValue: 0.1
      }
    ],
    examples: [
      '{ "minecraft:movement": { "value": 0.25 } }',
      '{ "minecraft:movement": { "value": 0.5 } }'
    ],
    compatibleWith: ['minecraft:entity'],
    version: '1.8.0'
  }
};

// Documentation validation functions
export function validateAgainstDocs(content: any, contentType: string): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Validate based on content type
  switch (contentType) {
    case 'entity':
      return validateEntityAgainstDocs(content);
    case 'block':
      return validateBlockAgainstDocs(content);
    case 'item':
      return validateItemAgainstDocs(content);
    case 'script':
      return validateScriptAgainstDocs(content);
    default:
      warnings.push('Unknown content type - limited validation available');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions
  };
}

function validateEntityAgainstDocs(entity: any) {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Check format version
  const currentVersion = '1.21.0';
  if (!entity.format_version) {
    errors.push('Missing format_version - required for entity files');
  } else if (entity.format_version < currentVersion) {
    warnings.push(`Consider updating format_version to ${currentVersion} for latest features`);
  }

  // Validate components against specs
  if (entity['minecraft:entity']?.components) {
    const components = entity['minecraft:entity'].components;
    
    Object.keys(components).forEach(componentName => {
      const spec = componentSpecs[componentName];
      if (spec) {
        // Validate component properties
        const component = components[componentName];
        spec.properties.forEach(prop => {
          if (prop.required && !(prop.name in component)) {
            errors.push(`Missing required property '${prop.name}' in ${componentName}`);
          }
        });
      } else {
        warnings.push(`Unknown component '${componentName}' - verify spelling and version compatibility`);
      }
    });

    // Suggest common missing components
    if (!components['minecraft:health']) {
      suggestions.push('Consider adding minecraft:health component for entity survivability');
    }
    if (!components['minecraft:physics']) {
      suggestions.push('Consider adding minecraft:physics component for proper physics simulation');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions
  };
}

function validateBlockAgainstDocs(block: any) {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  if (!block['minecraft:block']) {
    errors.push('Missing minecraft:block object');
  }

  if (!block.format_version) {
    errors.push('Missing format_version');
  }

  return { isValid: errors.length === 0, errors, warnings, suggestions };
}

function validateItemAgainstDocs(item: any) {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  if (!item['minecraft:item']) {
    errors.push('Missing minecraft:item object');
  }

  if (!item.format_version) {
    errors.push('Missing format_version');
  }

  return { isValid: errors.length === 0, errors, warnings, suggestions };
}

function validateScriptAgainstDocs(script: string) {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Check for common API usage
  const lines = script.split('\n');
  
  lines.forEach((line, index) => {
    // Check for deprecated methods
    if (line.includes('world.say')) {
      warnings.push(`Line ${index + 1}: 'world.say' is deprecated, use 'world.sendMessage' instead`);
    }
    
    // Check for proper imports
    if (line.includes('world.') && !script.includes('import') && !script.includes('from "@minecraft/server"')) {
      suggestions.push('Consider adding proper imports for better code organization');
    }
  });

  return { isValid: errors.length === 0, errors, warnings, suggestions };
}

// Search and reference functions
export function searchDocs(query: string): MinecraftDoc[] {
  // Implementation would search through documentation
  return [];
}

export function getAPIReference(methodName: string): APIMethod | null {
  for (const moduleApi of Object.values(minecraftApi)) {
    const method = moduleApi.find(m => m.name === methodName);
    if (method) return method;
  }
  return null;
}

export function getComponentSpec(componentName: string): ComponentSpec | null {
  return componentSpecs[componentName] || null;
}
