export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
  warnings?: string[];
}

export function validateJSON(jsonString: string, fileType: string = 'auto'): ValidationResult {
  try {
    const data = JSON.parse(jsonString);
    
    // Auto-detect file type if not specified
    if (fileType === 'auto') {
      fileType = detectFileType(data);
    }

    // Validate based on file type
    switch (fileType) {
      case 'entity':
        return validateEntityJSON(data);
      case 'block':
        return validateBlockJSON(data);
      case 'item':
        return validateItemJSON(data);
      case 'recipe':
        return validateRecipeJSON(data);
      case 'loot_table':
        return validateLootTableJSON(data);
      case 'client_entity':
        return validateClientEntityJSON(data);
      case 'spawn_rule':
        return validateSpawnRuleJSON(data);
      case 'biome':
        return validateBiomeJSON(data);
      default:
        return validateGenericJSON(data);
    }
  } catch (error) {
    return {
      isValid: false,
      errors: [`Invalid JSON syntax: ${error instanceof Error ? error.message : 'Unknown error'}`]
    };
  }
}

function detectFileType(data: any): string {
  if (data['minecraft:entity']) return 'entity';
  if (data['minecraft:client_entity']) return 'client_entity';
  if (data['minecraft:block']) return 'block';
  if (data['minecraft:item']) return 'item';
  if (data['minecraft:recipe_shaped'] || data['minecraft:recipe_shapeless']) return 'recipe';
  if (data['minecraft:spawn_rules']) return 'spawn_rule';
  if (data['minecraft:biome']) return 'biome';
  if (data['pools']) return 'loot_table';
  return 'unknown';
}

export function validateEntityJSON(data: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check format version
  if (!data.format_version) {
    errors.push('Missing format_version');
  } else if (typeof data.format_version !== 'string') {
    errors.push('format_version must be a string');
  }

  // Check minecraft:entity
  if (!data['minecraft:entity']) {
    errors.push('Missing minecraft:entity object');
    return { isValid: false, errors };
  }

  const entity = data['minecraft:entity'];

  // Check description
  if (!entity.description) {
    errors.push('Missing entity description');
  } else {
    if (!entity.description.identifier) {
      errors.push('Missing entity identifier');
    } else if (typeof entity.description.identifier !== 'string') {
      errors.push('Entity identifier must be a string');
    } else if (!entity.description.identifier.includes(':')) {
      warnings.push('Entity identifier should include namespace (e.g., "my_addon:entity_name")');
    }
  }

  // Check components
  if (!entity.components) {
    warnings.push('Entity has no components - it may not function properly');
  } else {
    // Check for common required components
    if (!entity.components['minecraft:health']) {
      warnings.push('Consider adding minecraft:health component');
    }
    if (!entity.components['minecraft:physics']) {
      warnings.push('Consider adding minecraft:physics component for proper physics simulation');
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

export function validateBlockJSON(data: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data.format_version) {
    errors.push('Missing format_version');
  }

  if (!data['minecraft:block']) {
    errors.push('Missing minecraft:block object');
    return { isValid: false, errors };
  }

  const block = data['minecraft:block'];

  if (!block.description?.identifier) {
    errors.push('Missing block identifier');
  } else if (!block.description.identifier.includes(':')) {
    warnings.push('Block identifier should include namespace');
  }

  if (!block.components) {
    warnings.push('Block has no components');
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

export function validateItemJSON(data: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data.format_version) {
    errors.push('Missing format_version');
  }

  if (!data['minecraft:item']) {
    errors.push('Missing minecraft:item object');
    return { isValid: false, errors };
  }

  const item = data['minecraft:item'];

  if (!item.description?.identifier) {
    errors.push('Missing item identifier');
  } else if (!item.description.identifier.includes(':')) {
    warnings.push('Item identifier should include namespace');
  }

  if (!item.components) {
    warnings.push('Item has no components');
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

export function validateRecipeJSON(data: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data.format_version) {
    errors.push('Missing format_version');
  }

  const isShapedRecipe = data['minecraft:recipe_shaped'];
  const isShapelessRecipe = data['minecraft:recipe_shapeless'];

  if (!isShapedRecipe && !isShapelessRecipe) {
    errors.push('Missing recipe type (minecraft:recipe_shaped or minecraft:recipe_shapeless)');
    return { isValid: false, errors };
  }

  const recipe = isShapedRecipe || isShapelessRecipe;

  if (!recipe.description?.identifier) {
    errors.push('Missing recipe identifier');
  }

  if (isShapedRecipe) {
    if (!recipe.pattern) {
      errors.push('Shaped recipe missing pattern');
    }
    if (!recipe.key) {
      errors.push('Shaped recipe missing key');
    }
  }

  if (!recipe.result) {
    errors.push('Recipe missing result');
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

export function validateLootTableJSON(data: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data.format_version) {
    errors.push('Missing format_version');
  }

  if (!data.pools || !Array.isArray(data.pools)) {
    errors.push('Missing or invalid pools array');
    return { isValid: false, errors };
  }

  data.pools.forEach((pool: any, index: number) => {
    if (!pool.rolls) {
      errors.push(`Pool ${index + 1} missing rolls`);
    }
    if (!pool.entries || !Array.isArray(pool.entries)) {
      errors.push(`Pool ${index + 1} missing or invalid entries`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

export function validateClientEntityJSON(data: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data.format_version) {
    errors.push('Missing format_version');
  }

  if (!data['minecraft:client_entity']) {
    errors.push('Missing minecraft:client_entity object');
    return { isValid: false, errors };
  }

  const clientEntity = data['minecraft:client_entity'];

  if (!clientEntity.description?.identifier) {
    errors.push('Missing client entity identifier');
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

export function validateSpawnRuleJSON(data: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data.format_version) {
    errors.push('Missing format_version');
  }

  if (!data['minecraft:spawn_rules']) {
    errors.push('Missing minecraft:spawn_rules object');
    return { isValid: false, errors };
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

export function validateBiomeJSON(data: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data.format_version) {
    errors.push('Missing format_version');
  }

  if (!data['minecraft:biome']) {
    errors.push('Missing minecraft:biome object');
    return { isValid: false, errors };
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

function validateGenericJSON(data: any): ValidationResult {
  const warnings: string[] = [];
  
  if (!data.format_version) {
    warnings.push('Consider adding format_version for better compatibility');
  }

  return {
    isValid: true,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}
