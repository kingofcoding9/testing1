import { ComponentItem } from "@/components/Common/ComponentSelector";

// Component compatibility and utility functions
export interface ComponentInstance {
  name: string;
  enabled: boolean;
  properties: Record<string, any>;
  metadata?: {
    addedAt: number;
    category: string;
    difficulty: string;
  };
}

export interface CompatibilityCheck {
  compatible: boolean;
  issues: string[];
  warnings: string[];
  suggestions: string[];
}

/**
 * Check compatibility between components
 */
export function checkComponentCompatibility(
  targetComponent: ComponentItem,
  selectedComponents: ComponentInstance[],
  allComponents: ComponentItem[]
): CompatibilityCheck {
  const issues: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Check if component is already added
  const isAlreadySelected = selectedComponents.some(c => c.name === targetComponent.name);
  if (isAlreadySelected) {
    issues.push('Component is already added');
  }

  // Check conflicts
  if (targetComponent.conflicts) {
    const conflictingSelected = targetComponent.conflicts.filter(conflict => 
      selectedComponents.some(c => c.name === conflict && c.enabled)
    );
    if (conflictingSelected.length > 0) {
      issues.push(`Conflicts with: ${conflictingSelected.join(', ')}`);
    }
  }

  // Check dependencies
  if (targetComponent.dependencies) {
    const missingDeps = targetComponent.dependencies.filter(dep => 
      !selectedComponents.some(c => c.name === dep && c.enabled)
    );
    if (missingDeps.length > 0) {
      warnings.push(`Recommended dependencies: ${missingDeps.join(', ')}`);
      suggestions.push(...missingDeps.map(dep => `Add ${dep} component`));
    }
  }

  // Check for reverse conflicts
  selectedComponents.forEach(selected => {
    const selectedDef = allComponents.find(c => c.name === selected.name);
    if (selectedDef?.conflicts?.includes(targetComponent.name)) {
      issues.push(`Conflicts with selected: ${selected.name}`);
    }
  });

  // Category-specific compatibility checks
  if (targetComponent.category === 'Movement') {
    const hasMovementBase = selectedComponents.some(c => 
      c.name.includes('movement.basic') || c.name.includes('physics')
    );
    if (!hasMovementBase) {
      warnings.push('Movement components typically require minecraft:physics or minecraft:movement.basic');
    }
  }

  if (targetComponent.category === 'Behavior') {
    const hasBehaviorBase = selectedComponents.some(c => 
      c.name.includes('behavior.') || c.name.includes('navigation')
    );
    if (!hasBehaviorBase && !targetComponent.name.includes('behavior.float')) {
      suggestions.push('Consider adding navigation components for behavior');
    }
  }

  return {
    compatible: issues.length === 0,
    issues,
    warnings,
    suggestions
  };
}

/**
 * Get recommended components based on selected components
 */
export function getRecommendedComponents(
  selectedComponents: ComponentInstance[],
  allComponents: ComponentItem[],
  maxRecommendations: number = 5
): ComponentItem[] {
  const selectedNames = selectedComponents.map(c => c.name);
  const recommendations: ComponentItem[] = [];

  // Find dependencies of selected components
  selectedComponents.forEach(selected => {
    const def = allComponents.find(c => c.name === selected.name);
    if (def?.dependencies) {
      def.dependencies.forEach(dep => {
        if (!selectedNames.includes(dep)) {
          const depComponent = allComponents.find(c => c.name === dep);
          if (depComponent && !recommendations.some(r => r.name === dep)) {
            recommendations.push(depComponent);
          }
        }
      });
    }
  });

  // Category-based recommendations
  const categories = Array.from(new Set(selectedComponents.map(c => {
    const def = allComponents.find(comp => comp.name === c.name);
    return def?.category;
  }).filter(Boolean)));

  categories.forEach(category => {
    const categoryComponents = allComponents.filter(c => 
      c.category === category && 
      !selectedNames.includes(c.name) &&
      !recommendations.some(r => r.name === c.name)
    );
    
    // Add popular components from same category
    const popular = categoryComponents
      .filter(c => c.stability === 'stable' && c.difficulty !== 'advanced')
      .slice(0, 2);
    
    recommendations.push(...popular);
  });

  return recommendations.slice(0, maxRecommendations);
}

/**
 * Validate component properties
 */
export function validateComponentProperties(
  component: ComponentItem,
  properties: Record<string, any>
): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  component.properties.forEach(prop => {
    const value = properties[prop.name];

    // Check required properties
    if (prop.required && (value === undefined || value === null || value === '')) {
      errors.push(`${prop.name} is required`);
      return;
    }

    if (value === undefined || value === null) return;

    // Type validation
    switch (prop.type) {
      case 'number':
        if (isNaN(Number(value))) {
          errors.push(`${prop.name} must be a number`);
        } else {
          const numValue = Number(value);
          if (prop.min !== undefined && numValue < prop.min) {
            errors.push(`${prop.name} must be at least ${prop.min}`);
          }
          if (prop.max !== undefined && numValue > prop.max) {
            errors.push(`${prop.name} must be at most ${prop.max}`);
          }
        }
        break;

      case 'string':
        if (typeof value !== 'string') {
          errors.push(`${prop.name} must be a string`);
        } else if (prop.options && !prop.options.includes(value)) {
          errors.push(`${prop.name} must be one of: ${prop.options.join(', ')}`);
        }
        break;

      case 'boolean':
        if (typeof value !== 'boolean') {
          errors.push(`${prop.name} must be true or false`);
        }
        break;

      case 'range':
        if (typeof value !== 'object' || !value.min || !value.max) {
          errors.push(`${prop.name} must have min and max values`);
        } else if (value.min > value.max) {
          errors.push(`${prop.name} min value cannot be greater than max value`);
        }
        break;

      case 'vector3':
        if (typeof value !== 'object' || 
            typeof value.x !== 'number' || 
            typeof value.y !== 'number' || 
            typeof value.z !== 'number') {
          errors.push(`${prop.name} must have numeric x, y, and z values`);
        }
        break;

      case 'array':
        if (!Array.isArray(value)) {
          errors.push(`${prop.name} must be an array`);
        }
        break;
    }

    // Performance warnings
    if (prop.name === 'max_health' && Number(value) > 1000) {
      warnings.push('Very high health values may impact performance');
    }
    if (prop.name === 'speed' && Number(value) > 2.0) {
      warnings.push('High speed values may cause movement issues');
    }
  });

  return { isValid: errors.length === 0, errors, warnings };
}

/**
 * Generate component JSON from instances
 */
export function generateComponentsJSON(components: ComponentInstance[]): Record<string, any> {
  const json: Record<string, any> = {};

  components.forEach(component => {
    if (component.enabled && Object.keys(component.properties).length > 0) {
      // Clean empty properties
      const cleanProperties = Object.entries(component.properties).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);

      if (Object.keys(cleanProperties).length > 0) {
        json[component.name] = cleanProperties;
      } else {
        // Component with no properties (like physics)
        json[component.name] = {};
      }
    }
  });

  return json;
}

/**
 * Create component presets
 */
export const ENTITY_PRESETS = {
  basic_mob: [
    'minecraft:health',
    'minecraft:physics',
    'minecraft:movement.basic',
    'minecraft:navigation.walk',
    'minecraft:behavior.random_stroll',
    'minecraft:behavior.look_at_player'
  ],
  hostile_mob: [
    'minecraft:health',
    'minecraft:physics',
    'minecraft:movement.basic',
    'minecraft:navigation.walk',
    'minecraft:behavior.nearest_attackable_target',
    'minecraft:behavior.melee_attack',
    'minecraft:behavior.random_stroll',
    'minecraft:behavior.look_at_player'
  ],
  passive_animal: [
    'minecraft:health',
    'minecraft:physics',
    'minecraft:movement.basic',
    'minecraft:navigation.walk',
    'minecraft:behavior.random_stroll',
    'minecraft:behavior.look_at_player',
    'minecraft:behavior.panic',
    'minecraft:behavior.breed'
  ],
  flying_mob: [
    'minecraft:health',
    'minecraft:physics',
    'minecraft:movement.fly',
    'minecraft:navigation.fly',
    'minecraft:behavior.random_fly',
    'minecraft:behavior.look_at_player'
  ]
};

export const BLOCK_PRESETS = {
  basic_block: [
    'minecraft:destructible_by_mining',
    'minecraft:destructible_by_explosion',
    'minecraft:material_instances'
  ],
  interactive_block: [
    'minecraft:destructible_by_mining',
    'minecraft:destructible_by_explosion',
    'minecraft:material_instances',
    'minecraft:on_interact'
  ],
  light_source: [
    'minecraft:destructible_by_mining',
    'minecraft:destructible_by_explosion',
    'minecraft:material_instances',
    'minecraft:light_emission'
  ],
  crop_block: [
    'minecraft:destructible_by_mining',
    'minecraft:material_instances',
    'minecraft:random_ticking',
    'minecraft:on_interact'
  ]
};

export const ITEM_PRESETS = {
  basic_item: [
    'minecraft:max_stack_size',
    'minecraft:icon'
  ],
  food_item: [
    'minecraft:max_stack_size',
    'minecraft:icon',
    'minecraft:food',
    'minecraft:use_animation'
  ],
  tool_item: [
    'minecraft:max_stack_size',
    'minecraft:icon',
    'minecraft:durability',
    'minecraft:digger'
  ],
  weapon_item: [
    'minecraft:max_stack_size',
    'minecraft:icon',
    'minecraft:durability',
    'minecraft:weapon'
  ],
  armor_item: [
    'minecraft:max_stack_size',
    'minecraft:icon',
    'minecraft:durability',
    'minecraft:wearable',
    'minecraft:armor'
  ]
};

/**
 * Apply preset to component list
 */
export function applyPreset(
  presetName: string,
  presetType: 'entity' | 'block' | 'item',
  allComponents: ComponentItem[]
): ComponentInstance[] {
  let presetComponents: string[] = [];

  switch (presetType) {
    case 'entity':
      presetComponents = ENTITY_PRESETS[presetName as keyof typeof ENTITY_PRESETS] || [];
      break;
    case 'block':
      presetComponents = BLOCK_PRESETS[presetName as keyof typeof BLOCK_PRESETS] || [];
      break;
    case 'item':
      presetComponents = ITEM_PRESETS[presetName as keyof typeof ITEM_PRESETS] || [];
      break;
  }

  return presetComponents.map(componentName => {
    const component = allComponents.find(c => c.name === componentName);
    const defaultProperties: Record<string, any> = {};

    // Set default values from component definition
    component?.properties.forEach(prop => {
      if (prop.default !== undefined) {
        defaultProperties[prop.name] = prop.default;
      } else {
        switch (prop.type) {
          case 'number':
            defaultProperties[prop.name] = prop.min ?? 0;
            break;
          case 'boolean':
            defaultProperties[prop.name] = false;
            break;
          case 'string':
            defaultProperties[prop.name] = prop.options?.[0] ?? '';
            break;
        }
      }
    });

    return {
      name: componentName,
      enabled: true,
      properties: defaultProperties,
      metadata: {
        addedAt: Date.now(),
        category: component?.category || 'Unknown',
        difficulty: component?.difficulty || 'beginner'
      }
    };
  }).filter(c => c.name); // Filter out missing components
}

/**
 * Export utilities for specific builder types
 */
export function getComponentsByCategory(components: ComponentItem[], category: string): ComponentItem[] {
  return components.filter(c => c.category === category);
}

export function searchComponents(components: ComponentItem[], query: string): ComponentItem[] {
  const lowercaseQuery = query.toLowerCase();
  return components.filter(component => 
    component.name.toLowerCase().includes(lowercaseQuery) ||
    component.description.toLowerCase().includes(lowercaseQuery) ||
    component.keywords.some(k => k.toLowerCase().includes(lowercaseQuery))
  );
}