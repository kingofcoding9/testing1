import { 
  entityComponents, 
  entityCategories, 
  searchEntityComponents, 
  getEntityComponentsByCategory,
  entityRegistryStats,
  type EntityComponent 
} from './entityRegistry';
import { 
  blockComponents, 
  blockCategories, 
  searchBlockComponents, 
  getBlockComponentsByCategory,
  blockRegistryStats,
  type BlockComponent 
} from './blockRegistry';
import { 
  itemComponents, 
  itemCategories, 
  searchItemComponents, 
  getItemComponentsByCategory,
  itemRegistryStats,
  type ItemComponent 
} from './itemRegistry';
import { 
  recipeTypes,
  lootFunctions,
  biomeComponents,
  spawnRuleComponents,
  gameplayCategories,
  searchGameplayElements,
  getGameplayElementsByCategory,
  gameplayRegistryStats,
  type RecipeType,
  type LootFunction,
  type BiomeComponent,
  type SpawnRuleComponent
} from './gameplayRegistry';

// =============================================================================
// UNIFIED COMPONENT TYPES
// =============================================================================

export type ComponentType = 'entity' | 'block' | 'item' | 'recipe' | 'loot' | 'biome' | 'spawn';

export interface UnifiedComponent {
  id: string;
  name: string;
  description: string;
  type: ComponentType;
  category: string;
  subcategory?: string;
  version: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  stability: 'stable' | 'experimental' | 'beta';
  keywords: string[];
  example: string;
  documentation?: string;
  dependencies?: string[];
  conflicts?: string[];
  properties?: any[];
}

// =============================================================================
// UNIFIED SEARCH INTERFACE
// =============================================================================

export interface SearchFilters {
  type?: ComponentType | ComponentType[];
  category?: string | string[];
  subcategory?: string | string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | ('beginner' | 'intermediate' | 'advanced')[];
  stability?: 'stable' | 'experimental' | 'beta' | ('stable' | 'experimental' | 'beta')[];
  version?: string;
  hasDocumentation?: boolean;
  hasExample?: boolean;
}

export interface SearchResult {
  components: UnifiedComponent[];
  totalCount: number;
  facets: {
    types: Array<{ type: ComponentType; count: number }>;
    categories: Array<{ category: string; count: number }>;
    difficulties: Array<{ difficulty: string; count: number }>;
    stabilities: Array<{ stability: string; count: number }>;
  };
  suggestions: string[];
}

// =============================================================================
// COMPONENT INDEX CREATION
// =============================================================================

function createUnifiedComponent(
  component: EntityComponent | BlockComponent | ItemComponent | RecipeType | LootFunction | BiomeComponent | SpawnRuleComponent,
  type: ComponentType
): UnifiedComponent {
  return {
    id: `${type}:${component.name}`,
    name: component.name,
    description: component.description,
    type,
    category: component.category,
    subcategory: component.subcategory,
    version: component.version,
    difficulty: component.difficulty,
    stability: component.stability,
    keywords: component.keywords,
    example: component.example,
    documentation: component.documentation,
    dependencies: component.dependencies,
    conflicts: component.conflicts,
    properties: 'properties' in component ? component.properties : undefined
  };
}

// Create unified component index
const allUnifiedComponents: UnifiedComponent[] = [
  ...entityComponents.map(c => createUnifiedComponent(c, 'entity')),
  ...blockComponents.map(c => createUnifiedComponent(c, 'block')),
  ...itemComponents.map(c => createUnifiedComponent(c, 'item')),
  ...recipeTypes.map(c => createUnifiedComponent(c, 'recipe')),
  ...lootFunctions.map(c => createUnifiedComponent(c, 'loot')),
  ...biomeComponents.map(c => createUnifiedComponent(c, 'biome')),
  ...spawnRuleComponents.map(c => createUnifiedComponent(c, 'spawn'))
];

// =============================================================================
// UNIFIED SEARCH FUNCTIONS
// =============================================================================

export function searchAllComponents(
  query: string,
  filters: SearchFilters = {},
  limit: number = 50,
  offset: number = 0
): SearchResult {
  const lowercaseQuery = query.toLowerCase();
  
  // Filter components based on criteria
  let filteredComponents = allUnifiedComponents.filter(component => {
    // Text search
    const matchesText = !query || 
      component.name.toLowerCase().includes(lowercaseQuery) ||
      component.description.toLowerCase().includes(lowercaseQuery) ||
      component.keywords.some(keyword => keyword.toLowerCase().includes(lowercaseQuery));
    
    if (!matchesText) return false;

    // Type filter
    if (filters.type) {
      const types = Array.isArray(filters.type) ? filters.type : [filters.type];
      if (!types.includes(component.type)) return false;
    }

    // Category filter
    if (filters.category) {
      const categories = Array.isArray(filters.category) ? filters.category : [filters.category];
      if (!categories.includes(component.category)) return false;
    }

    // Subcategory filter
    if (filters.subcategory && component.subcategory) {
      const subcategories = Array.isArray(filters.subcategory) ? filters.subcategory : [filters.subcategory];
      if (!subcategories.includes(component.subcategory)) return false;
    }

    // Difficulty filter
    if (filters.difficulty) {
      const difficulties = Array.isArray(filters.difficulty) ? filters.difficulty : [filters.difficulty];
      if (!difficulties.includes(component.difficulty)) return false;
    }

    // Stability filter
    if (filters.stability) {
      const stabilities = Array.isArray(filters.stability) ? filters.stability : [filters.stability];
      if (!stabilities.includes(component.stability)) return false;
    }

    // Documentation filter
    if (filters.hasDocumentation !== undefined) {
      const hasDoc = !!component.documentation;
      if (hasDoc !== filters.hasDocumentation) return false;
    }

    // Example filter
    if (filters.hasExample !== undefined) {
      const hasExample = !!component.example;
      if (hasExample !== filters.hasExample) return false;
    }

    return true;
  });

  // Sort by relevance (exact matches first, then by name)
  filteredComponents.sort((a, b) => {
    const aExactMatch = a.name.toLowerCase() === lowercaseQuery;
    const bExactMatch = b.name.toLowerCase() === lowercaseQuery;
    
    if (aExactMatch && !bExactMatch) return -1;
    if (!aExactMatch && bExactMatch) return 1;
    
    return a.name.localeCompare(b.name);
  });

  const totalCount = filteredComponents.length;
  const paginatedComponents = filteredComponents.slice(offset, offset + limit);

  // Generate facets
  const facets = generateFacets(filteredComponents);

  // Generate search suggestions
  const suggestions = generateSearchSuggestions(query, filteredComponents);

  return {
    components: paginatedComponents,
    totalCount,
    facets,
    suggestions
  };
}

function generateFacets(components: UnifiedComponent[]) {
  const typeCounts = new Map<ComponentType, number>();
  const categoryCounts = new Map<string, number>();
  const difficultyCounts = new Map<string, number>();
  const stabilityCounts = new Map<string, number>();

  components.forEach(component => {
    typeCounts.set(component.type, (typeCounts.get(component.type) || 0) + 1);
    categoryCounts.set(component.category, (categoryCounts.get(component.category) || 0) + 1);
    difficultyCounts.set(component.difficulty, (difficultyCounts.get(component.difficulty) || 0) + 1);
    stabilityCounts.set(component.stability, (stabilityCounts.get(component.stability) || 0) + 1);
  });

  return {
    types: Array.from(typeCounts.entries()).map(([type, count]) => ({ type, count })),
    categories: Array.from(categoryCounts.entries()).map(([category, count]) => ({ category, count })),
    difficulties: Array.from(difficultyCounts.entries()).map(([difficulty, count]) => ({ difficulty, count })),
    stabilities: Array.from(stabilityCounts.entries()).map(([stability, count]) => ({ stability, count }))
  };
}

function generateSearchSuggestions(query: string, components: UnifiedComponent[]): string[] {
  if (!query || query.length < 2) return [];

  const suggestions = new Set<string>();
  const lowercaseQuery = query.toLowerCase();

  // Add component names that partially match
  components.forEach(component => {
    if (component.name.toLowerCase().includes(lowercaseQuery)) {
      suggestions.add(component.name);
    }
    
    // Add keywords that match
    component.keywords.forEach(keyword => {
      if (keyword.toLowerCase().includes(lowercaseQuery)) {
        suggestions.add(keyword);
      }
    });
  });

  // Add category suggestions
  const allCategories = [...entityCategories, ...blockCategories, ...itemCategories, ...gameplayCategories];
  Object.keys(allCategories).forEach(category => {
    if (category.toLowerCase().includes(lowercaseQuery)) {
      suggestions.add(category);
    }
  });

  return Array.from(suggestions).slice(0, 10);
}

// =============================================================================
// CATEGORY MANAGEMENT
// =============================================================================

export function getAllCategories(): Record<ComponentType, any> {
  return {
    entity: entityCategories,
    block: blockCategories,
    item: itemCategories,
    recipe: gameplayCategories,
    loot: gameplayCategories,
    biome: gameplayCategories,
    spawn: gameplayCategories
  };
}

export function getCategoryByType(type: ComponentType): any {
  const categories = getAllCategories();
  return categories[type];
}

export function getComponentsByTypeAndCategory(type: ComponentType, category: string): UnifiedComponent[] {
  return allUnifiedComponents.filter(component => 
    component.type === type && component.category === category
  );
}

// =============================================================================
// COMPONENT RECOMMENDATIONS
// =============================================================================

export interface ComponentRecommendation {
  component: UnifiedComponent;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

export function getComponentRecommendations(
  selectedComponents: string[],
  targetType: ComponentType,
  limit: number = 5
): ComponentRecommendation[] {
  const recommendations: ComponentRecommendation[] = [];
  const selectedComponentObjects = selectedComponents.map(name => 
    allUnifiedComponents.find(c => c.name === name)
  ).filter(Boolean) as UnifiedComponent[];

  // Get components of target type
  const targetComponents = allUnifiedComponents.filter(c => c.type === targetType);

  for (const component of targetComponents) {
    if (selectedComponents.includes(component.name)) continue;

    // Check for dependencies
    if (component.dependencies) {
      const missingDeps = component.dependencies.filter(dep => !selectedComponents.includes(dep));
      if (missingDeps.length === 0) {
        recommendations.push({
          component,
          reason: 'All dependencies are satisfied',
          priority: 'high'
        });
        continue;
      }
    }

    // Check for complementary components (same category/subcategory)
    const hasComplementary = selectedComponentObjects.some(selected => 
      selected.category === component.category || selected.subcategory === component.subcategory
    );

    if (hasComplementary) {
      recommendations.push({
        component,
        reason: 'Complements selected components',
        priority: 'medium'
      });
      continue;
    }

    // Check for beginner-friendly components
    if (component.difficulty === 'beginner' && component.stability === 'stable') {
      recommendations.push({
        component,
        reason: 'Beginner-friendly and stable',
        priority: 'low'
      });
    }
  }

  // Sort by priority and limit results
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return recommendations
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
    .slice(0, limit);
}

// =============================================================================
// COMPONENT ANALYTICS
// =============================================================================

export interface ComponentAnalytics {
  totalComponents: number;
  componentsByType: Record<ComponentType, number>;
  componentsByDifficulty: Record<string, number>;
  componentsByStability: Record<string, number>;
  mostPopularCategories: Array<{ category: string; count: number }>;
  recentlyAdded: UnifiedComponent[];
  experimental: UnifiedComponent[];
}

export function getComponentAnalytics(): ComponentAnalytics {
  const componentsByType = allUnifiedComponents.reduce((acc, component) => {
    acc[component.type] = (acc[component.type] || 0) + 1;
    return acc;
  }, {} as Record<ComponentType, number>);

  const componentsByDifficulty = allUnifiedComponents.reduce((acc, component) => {
    acc[component.difficulty] = (acc[component.difficulty] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const componentsByStability = allUnifiedComponents.reduce((acc, component) => {
    acc[component.stability] = (acc[component.stability] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryCounts = allUnifiedComponents.reduce((acc, component) => {
    acc[component.category] = (acc[component.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostPopularCategories = Object.entries(categoryCounts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Filter for newer versions (1.20.0+)
  const recentlyAdded = allUnifiedComponents
    .filter(c => {
      const [major, minor] = c.version.split('.').map(Number);
      return major > 1 || (major === 1 && minor >= 20);
    })
    .slice(0, 10);

  const experimental = allUnifiedComponents
    .filter(c => c.stability === 'experimental')
    .slice(0, 10);

  return {
    totalComponents: allUnifiedComponents.length,
    componentsByType,
    componentsByDifficulty,
    componentsByStability,
    mostPopularCategories,
    recentlyAdded,
    experimental
  };
}

// =============================================================================
// EXPORT UNIFIED INTERFACE
// =============================================================================

export const ComponentIndex = {
  // Data
  components: allUnifiedComponents,
  categories: getAllCategories(),
  
  // Search
  search: searchAllComponents,
  getByType: (type: ComponentType) => allUnifiedComponents.filter(c => c.type === type),
  getByCategory: getComponentsByTypeAndCategory,
  getById: (id: string) => allUnifiedComponents.find(c => c.id === id),
  getByName: (name: string) => allUnifiedComponents.find(c => c.name === name),
  
  // Recommendations
  getRecommendations: getComponentRecommendations,
  
  // Analytics
  getAnalytics: getComponentAnalytics,
  
  // Statistics
  stats: {
    entity: entityRegistryStats,
    block: blockRegistryStats,
    item: itemRegistryStats,
    gameplay: gameplayRegistryStats,
    total: {
      components: allUnifiedComponents.length,
      categories: Object.keys(getAllCategories()).length
    }
  }
};

// Export types and main interface
export type { UnifiedComponent, SearchFilters, SearchResult, ComponentRecommendation, ComponentAnalytics };
export default ComponentIndex;