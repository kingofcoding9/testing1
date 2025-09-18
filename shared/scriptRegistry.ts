/**
 * Comprehensive Minecraft Script API Registry
 * Parsed from official TypeScript definitions
 */

/**
 * Minecraft API module identifiers
 */
export type MinecraftModule = 
  | '@minecraft/server'
  | '@minecraft/server-admin' 
  | '@minecraft/server-net'
  | '@minecraft/server-ui'
  | '@minecraft/common'
  | '@minecraft/vanilla-data'
  | '@minecraft/math';

/**
 * Types of API elements that can be registered
 */
export type ApiElementType = 
  | 'enum'
  | 'class' 
  | 'interface'
  | 'type'
  | 'function'
  | 'constant'
  | 'variable'
  | 'event'
  | 'namespace';

/**
 * Parameter definition for methods and functions
 */
export interface ApiParameter {
  /** Parameter name */
  name: string;
  /** TypeScript type */
  type: string;
  /** Whether parameter is optional */
  optional: boolean;
  /** Parameter description */
  description?: string;
  /** Default value if any */
  defaultValue?: string;
}

/**
 * Method or function signature
 */
export interface ApiMethod {
  /** Method name */
  name: string;
  /** Method description */
  description?: string;
  /** Parameters */
  parameters: ApiParameter[];
  /** Return type */
  returnType: string;
  /** Return type description */
  returnDescription?: string;
  /** Whether method is static */
  isStatic?: boolean;
  /** Whether method is async */
  isAsync?: boolean;
  /** Access modifier */
  accessibility?: 'public' | 'protected' | 'private';
  /** Full method signature */
  signature: string;
  /** Usage example */
  example?: string;
  /** JSDoc tags */
  tags?: string[];
}

/**
 * Property definition for classes and interfaces
 */
export interface ApiProperty {
  /** Property name */
  name: string;
  /** Property type */
  type: string;
  /** Property description */
  description?: string;
  /** Whether property is readonly */
  readonly?: boolean;
  /** Whether property is optional */
  optional?: boolean;
  /** Whether property is static */
  isStatic?: boolean;
  /** Access modifier */
  accessibility?: 'public' | 'protected' | 'private';
  /** Default value if any */
  defaultValue?: string;
}

/**
 * Enum value definition
 */
export interface ApiEnumValue {
  /** Enum key name */
  name: string;
  /** Enum value */
  value: string | number;
  /** Description of this enum value */
  description?: string;
}

/**
 * Event definition
 */
export interface ApiEvent {
  /** Event name */
  name: string;
  /** Event description */
  description?: string;
  /** Event data type */
  dataType: string;
  /** Event properties */
  properties: ApiProperty[];
  /** Usage example */
  example?: string;
}

/**
 * Generic API element that covers all types
 */
export interface ApiElement {
  /** Unique identifier */
  id: string;
  /** Element name */
  name: string;
  /** Element type */
  type: ApiElementType;
  /** Module this element belongs to */
  module: MinecraftModule;
  /** Element description */
  description?: string;
  /** Full TypeScript definition */
  definition: string;
  /** JSDoc comment block */
  jsdoc?: string;
  
  // Type-specific properties
  /** For enums: enum values */
  enumValues?: ApiEnumValue[];
  /** For classes/interfaces: properties */
  properties?: ApiProperty[];
  /** For classes/interfaces: methods */
  methods?: ApiMethod[];
  /** For functions: parameters */
  parameters?: ApiParameter[];
  /** For functions: return type */
  returnType?: string;
  /** For events: event data */
  eventData?: ApiEvent;
  /** For classes: parent class */
  extends?: string;
  /** For classes/interfaces: implemented interfaces */
  implements?: string[];
  /** For types: type definition */
  typeDefinition?: string;
  
  // Categorization and search
  /** Categories for organization */
  categories: string[];
  /** Tags for filtering */
  tags: string[];
  /** Keywords for search */
  keywords: string[];
  
  // Usage and examples  
  /** Code examples */
  examples?: CodeExample[];
  /** Related elements */
  relatedElements?: string[];
  
  // Metadata
  /** Whether this is deprecated */
  deprecated?: boolean;
  /** Deprecation message */
  deprecationMessage?: string;
  /** Whether this is experimental/preview */
  experimental?: boolean;
  /** Version introduced */
  since?: string;
  /** Stability level */
  stability?: 'stable' | 'experimental' | 'deprecated';
}

/**
 * Code example with description
 */
export interface CodeExample {
  /** Example title */
  title: string;
  /** Example description */
  description?: string;
  /** TypeScript code */
  code: string;
  /** Expected output or explanation */
  output?: string;
  /** Required imports */
  imports?: string[];
}

/**
 * Module registry containing all elements for a module
 */
export interface ModuleRegistry {
  /** Module identifier */
  module: MinecraftModule;
  /** Module version */
  version: string;
  /** Module description */
  description?: string;
  /** All elements in this module */
  elements: ApiElement[];
  /** Exports by type */
  exports: {
    enums: ApiElement[];
    classes: ApiElement[];
    interfaces: ApiElement[];
    functions: ApiElement[];
    types: ApiElement[];
    constants: ApiElement[];
    events: ApiElement[];
  };
}

/**
 * Complete script registry containing all modules
 */
export interface ScriptRegistry {
  /** Registry metadata */
  metadata: {
    /** Generation timestamp */
    generatedAt: string;
    /** Source file info */
    sourceFile: string;
    /** Total number of elements */
    totalElements: number;
    /** Modules included */
    modules: MinecraftModule[];
    /** Parser version */
    parserVersion: string;
  };
  /** Registry data by module */
  modules: Record<MinecraftModule, ModuleRegistry>;
  /** Global index of all elements */
  index: Record<string, ApiElement>;
  /** Search categories */
  categories: Record<string, string[]>; // category -> element ids
  /** Tags index */
  tags: Record<string, string[]>; // tag -> element ids
}

/**
 * Searchable index for UI consumption
 */
export interface SearchIndex {
  /** All searchable elements */
  elements: SearchableElement[];
  /** Categories for filtering */
  categories: Record<string, number>; // category -> count
  /** Tags for filtering */
  tags: Record<string, number>; // tag -> count
  /** Modules for filtering */
  modules: Record<MinecraftModule, number>; // module -> count
  /** Element types for filtering */
  types: Record<ApiElementType, number>; // type -> count
}

/**
 * Searchable element for UI
 */
export interface SearchableElement {
  /** Element ID */
  id: string;
  /** Display name */
  name: string;
  /** Element type */
  type: ApiElementType;
  /** Module */
  module: MinecraftModule;
  /** Short description */
  description?: string;
  /** Categories */
  categories: string[];
  /** Tags */
  tags: string[];
  /** Search keywords */
  keywords: string[];
  /** Quick signature (for methods/functions) */
  signature?: string;
  /** Deprecation status */
  deprecated?: boolean;
  /** Experimental status */
  experimental?: boolean;
}

/**
 * Filter options for searching the registry
 */
export interface SearchFilters {
  /** Text query */
  query?: string;
  /** Filter by element type */
  types?: ApiElementType[];
  /** Filter by module */
  modules?: MinecraftModule[];
  /** Filter by categories */
  categories?: string[];
  /** Filter by tags */
  tags?: string[];
  /** Include deprecated elements */
  includeDeprecated?: boolean;
  /** Include experimental elements */
  includeExperimental?: boolean;
}

/**
 * Search result
 */
export interface SearchResult {
  /** Matching elements */
  elements: SearchableElement[];
  /** Total count */
  total: number;
  /** Applied filters */
  filters: SearchFilters;
  /** Available filter options based on results */
  availableFilters: {
    types: Record<ApiElementType, number>;
    modules: Record<MinecraftModule, number>;
    categories: Record<string, number>;
    tags: Record<string, number>;
  };
}