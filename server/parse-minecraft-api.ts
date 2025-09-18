/**
 * Comprehensive Minecraft API Parser
 * Parses TypeScript definitions and generates registry data
 */

import * as fs from 'fs';
import * as path from 'path';
import { 
  ApiElement, 
  ApiElementType, 
  MinecraftModule, 
  ScriptRegistry, 
  ModuleRegistry,
  ApiMethod,
  ApiParameter,
  ApiProperty,
  ApiEnumValue,
  CodeExample,
  SearchIndex,
  SearchableElement
} from '../shared/scriptRegistry';

interface ParseContext {
  module: MinecraftModule;
  currentClass?: string;
  currentInterface?: string;
  currentEnum?: string;
  inComment: boolean;
  commentBuffer: string[];
  lineNumber: number;
}

export class MinecraftApiParser {
  private elements: ApiElement[] = [];
  private modules: Set<MinecraftModule> = new Set();
  private context: ParseContext = {
    module: '@minecraft/server',
    inComment: false,
    commentBuffer: [],
    lineNumber: 0
  };

  async parseFile(filePath: string): Promise<ScriptRegistry> {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    console.log(`Parsing ${lines.length} lines from ${filePath}`);
    
    // Reset parser state
    this.elements = [];
    this.modules = new Set();
    this.context = {
      module: '@minecraft/server',
      inComment: false,
      commentBuffer: [],
      lineNumber: 0
    };

    // Parse line by line
    for (let i = 0; i < lines.length; i++) {
      this.context.lineNumber = i + 1;
      await this.parseLine(lines[i], lines, i);
    }

    console.log(`Parsed ${this.elements.length} API elements from ${this.modules.size} modules`);

    // Generate registry
    return this.generateRegistry();
  }

  private async parseLine(line: string, allLines: string[], index: number): Promise<void> {
    const trimmed = line.trim();

    // Handle module detection
    this.detectModule(trimmed);

    // Handle JSDoc comments
    if (this.handleComments(trimmed)) {
      return;
    }

    // Parse different types of exports
    if (trimmed.startsWith('export enum ')) {
      await this.parseEnum(trimmed, allLines, index);
    } else if (trimmed.startsWith('export class ')) {
      await this.parseClass(trimmed, allLines, index);
    } else if (trimmed.startsWith('export interface ')) {
      await this.parseInterface(trimmed, allLines, index);
    } else if (trimmed.startsWith('export function ')) {
      await this.parseFunction(trimmed, allLines, index);
    } else if (trimmed.startsWith('export type ')) {
      await this.parseType(trimmed, allLines, index);
    } else if (trimmed.startsWith('export declare ')) {
      await this.parseDeclaration(trimmed, allLines, index);
    }
  }

  private detectModule(line: string): void {
    if (line.includes('"module_name": "@minecraft/server"')) {
      this.context.module = '@minecraft/server';
    } else if (line.includes('"module_name": "@minecraft/server-admin"')) {
      this.context.module = '@minecraft/server-admin';
    } else if (line.includes('"module_name": "@minecraft/server-net"')) {
      this.context.module = '@minecraft/server-net';
    } else if (line.includes('"module_name": "@minecraft/server-ui"')) {
      this.context.module = '@minecraft/server-ui';
    }
    
    this.modules.add(this.context.module);
  }

  private handleComments(line: string): boolean {
    if (line.startsWith('/**')) {
      this.context.inComment = true;
      this.context.commentBuffer = [line];
      return true;
    } else if (line.startsWith('*') && this.context.inComment) {
      this.context.commentBuffer.push(line);
      return true;
    } else if (line.startsWith('*/') && this.context.inComment) {
      this.context.commentBuffer.push(line);
      this.context.inComment = false;
      return true;
    }
    
    if (!this.context.inComment && this.context.commentBuffer.length > 0) {
      // Comment block ended, keep buffer for next element
      return false;
    }
    
    return this.context.inComment;
  }

  private async parseEnum(line: string, allLines: string[], startIndex: number): Promise<void> {
    const enumMatch = line.match(/export enum (\w+)/);
    if (!enumMatch) return;

    const enumName = enumMatch[1];
    let i = startIndex + 1;
    const enumValues: ApiEnumValue[] = [];
    let definition = line;

    // Parse enum body
    while (i < allLines.length) {
      const currentLine = allLines[i].trim();
      definition += '\n' + allLines[i];

      if (currentLine === '}') {
        break;
      }

      // Parse enum values
      const valueMatch = currentLine.match(/(\w+)\s*=\s*([^,]+),?/);
      if (valueMatch) {
        const [, name, value] = valueMatch;
        const description = this.extractEnumValueDescription(allLines, i);
        
        enumValues.push({
          name,
          value: this.cleanValue(value),
          description
        });
      }

      i++;
    }

    const element: ApiElement = {
      id: `${this.context.module}.${enumName}`,
      name: enumName,
      type: 'enum',
      module: this.context.module,
      description: this.extractDescription(),
      definition,
      jsdoc: this.getJSDocString(),
      enumValues,
      categories: ['Enums', this.getCategoryFromModule()],
      tags: this.extractTags(),
      keywords: [enumName.toLowerCase(), 'enum'],
      stability: this.extractStability()
    };

    this.elements.push(element);
    this.clearCommentBuffer();
  }

  private async parseClass(line: string, allLines: string[], startIndex: number): Promise<void> {
    const classMatch = line.match(/export class (\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+([^{]+))?/);
    if (!classMatch) return;

    const [, className, extendsClass, implementsInterfaces] = classMatch;
    let i = startIndex + 1;
    let braceCount = 1; // Start with 1 for opening brace
    const properties: ApiProperty[] = [];
    const methods: ApiMethod[] = [];
    let definition = line;

    while (i < allLines.length && braceCount > 0) {
      const currentLine = allLines[i];
      definition += '\n' + currentLine;
      
      // Track braces
      braceCount += (currentLine.match(/\{/g) || []).length;
      braceCount -= (currentLine.match(/\}/g) || []).length;

      const trimmed = currentLine.trim();

      // Parse properties and methods
      if (trimmed.includes('readonly ') || trimmed.includes(': ') || trimmed.includes('?:')) {
        const property = this.parseProperty(currentLine, allLines, i);
        if (property) properties.push(property);
      } else if (trimmed.includes('(') && (trimmed.includes('):') || trimmed.includes('): '))) {
        const method = await this.parseMethod(currentLine, allLines, i);
        if (method) methods.push(method);
      }

      i++;
    }

    const element: ApiElement = {
      id: `${this.context.module}.${className}`,
      name: className,
      type: 'class',
      module: this.context.module,
      description: this.extractDescription(),
      definition,
      jsdoc: this.getJSDocString(),
      properties,
      methods,
      extends: extendsClass,
      implements: implementsInterfaces?.split(',').map(s => s.trim()),
      categories: ['Classes', this.getCategoryFromModule()],
      tags: this.extractTags(),
      keywords: [className.toLowerCase(), 'class'],
      examples: this.extractExamples(),
      stability: this.extractStability()
    };

    this.elements.push(element);
    this.clearCommentBuffer();
  }

  private async parseInterface(line: string, allLines: string[], startIndex: number): Promise<void> {
    const interfaceMatch = line.match(/export interface (\w+)(?:\s+extends\s+([^{]+))?/);
    if (!interfaceMatch) return;

    const [, interfaceName, extendsInterfaces] = interfaceMatch;
    let i = startIndex + 1;
    let braceCount = 1;
    const properties: ApiProperty[] = [];
    let definition = line;

    while (i < allLines.length && braceCount > 0) {
      const currentLine = allLines[i];
      definition += '\n' + currentLine;
      
      braceCount += (currentLine.match(/\{/g) || []).length;
      braceCount -= (currentLine.match(/\}/g) || []).length;

      const property = this.parseProperty(currentLine, allLines, i);
      if (property) properties.push(property);

      i++;
    }

    const element: ApiElement = {
      id: `${this.context.module}.${interfaceName}`,
      name: interfaceName,
      type: 'interface',
      module: this.context.module,
      description: this.extractDescription(),
      definition,
      jsdoc: this.getJSDocString(),
      properties,
      extends: extendsInterfaces,
      categories: ['Interfaces', this.getCategoryFromModule()],
      tags: this.extractTags(),
      keywords: [interfaceName.toLowerCase(), 'interface'],
      stability: this.extractStability()
    };

    this.elements.push(element);
    this.clearCommentBuffer();
  }

  private async parseFunction(line: string, allLines: string[], startIndex: number): Promise<void> {
    const functionMatch = line.match(/export function (\w+)\s*\([^)]*\):\s*([^;{]+)/);
    if (!functionMatch) return;

    const [, functionName, returnType] = functionMatch;
    const parameters = this.parseParameters(line);
    
    const element: ApiElement = {
      id: `${this.context.module}.${functionName}`,
      name: functionName,
      type: 'function',
      module: this.context.module,
      description: this.extractDescription(),
      definition: line,
      jsdoc: this.getJSDocString(),
      parameters,
      returnType: returnType.trim(),
      categories: ['Functions', this.getCategoryFromModule()],
      tags: this.extractTags(),
      keywords: [functionName.toLowerCase(), 'function'],
      stability: this.extractStability()
    };

    this.elements.push(element);
    this.clearCommentBuffer();
  }

  private async parseType(line: string, allLines: string[], startIndex: number): Promise<void> {
    const typeMatch = line.match(/export type (\w+)\s*=\s*(.+);?/);
    if (!typeMatch) return;

    const [, typeName, typeDefinition] = typeMatch;
    
    const element: ApiElement = {
      id: `${this.context.module}.${typeName}`,
      name: typeName,
      type: 'type',
      module: this.context.module,
      description: this.extractDescription(),
      definition: line,
      jsdoc: this.getJSDocString(),
      typeDefinition: typeDefinition.trim(),
      categories: ['Types', this.getCategoryFromModule()],
      tags: this.extractTags(),
      keywords: [typeName.toLowerCase(), 'type'],
      stability: this.extractStability()
    };

    this.elements.push(element);
    this.clearCommentBuffer();
  }

  private async parseDeclaration(line: string, allLines: string[], startIndex: number): Promise<void> {
    // Handle declare statements
    const constMatch = line.match(/export declare const (\w+):\s*(.+);/);
    if (constMatch) {
      const [, constName, constType] = constMatch;
      
      const element: ApiElement = {
        id: `${this.context.module}.${constName}`,
        name: constName,
        type: 'constant',
        module: this.context.module,
        description: this.extractDescription(),
        definition: line,
        jsdoc: this.getJSDocString(),
        typeDefinition: constType.trim(),
        categories: ['Constants', this.getCategoryFromModule()],
        tags: this.extractTags(),
        keywords: [constName.toLowerCase(), 'constant'],
        stability: this.extractStability()
      };

      this.elements.push(element);
      this.clearCommentBuffer();
    }
  }

  private parseProperty(line: string, allLines: string[], index: number): ApiProperty | null {
    const trimmed = line.trim();
    
    // Skip comments, method signatures, and braces
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || 
        trimmed.includes('(') || trimmed === '{' || trimmed === '}' ||
        trimmed.startsWith('private') || trimmed.startsWith('protected')) {
      return null;
    }

    const propertyMatch = trimmed.match(/(readonly\s+)?(static\s+)?(\w+)(\?)?:\s*([^;]+);?/);
    if (!propertyMatch) return null;

    const [, readonly, isStatic, name, optional, type] = propertyMatch;
    
    // Look for property description in preceding comments
    let description = '';
    for (let i = index - 1; i >= 0; i--) {
      const prevLine = allLines[i].trim();
      if (prevLine.startsWith('* @remarks')) {
        // Found remarks, collect description
        let j = i + 1;
        const descParts = [];
        while (j < allLines.length) {
          const descLine = allLines[j].trim();
          if (descLine.startsWith('*') && !descLine.startsWith('* @')) {
            descParts.push(descLine.replace(/^\*\s?/, ''));
          } else {
            break;
          }
          j++;
        }
        description = descParts.join(' ').trim();
        break;
      }
      if (!prevLine.startsWith('*') && !prevLine.startsWith('/**')) {
        break;
      }
    }

    return {
      name,
      type: type.trim(),
      description: description || undefined,
      readonly: !!readonly,
      optional: !!optional,
      isStatic: !!isStatic,
      accessibility: 'public'
    };
  }

  private async parseMethod(line: string, allLines: string[], index: number): Promise<ApiMethod | null> {
    const trimmed = line.trim();
    
    // Skip constructors and special methods
    if (trimmed.includes('constructor') || trimmed.startsWith('private') || 
        trimmed.startsWith('[Symbol.') || trimmed === '{' || trimmed === '}') {
      return null;
    }

    const methodMatch = trimmed.match(/(static\s+)?(\w+)\s*\(([^)]*)\):\s*([^;{]+)[;{]?/);
    if (!methodMatch) return null;

    const [, isStatic, methodName, paramStr, returnType] = methodMatch;
    const parameters = this.parseParameters(`(${paramStr})`);
    
    // Look for method description in preceding comments
    let description = '';
    let jsdocTags: string[] = [];
    
    for (let i = index - 1; i >= 0; i--) {
      const prevLine = allLines[i].trim();
      if (prevLine.startsWith('* @remarks')) {
        // Collect description and tags
        let j = i + 1;
        const descParts = [];
        while (j < allLines.length) {
          const descLine = allLines[j].trim();
          if (descLine.startsWith('* @')) {
            jsdocTags.push(descLine.replace(/^\*\s?/, ''));
          } else if (descLine.startsWith('*') && !descLine.startsWith('* @')) {
            descParts.push(descLine.replace(/^\*\s?/, ''));
          } else {
            break;
          }
          j++;
        }
        description = descParts.join(' ').trim();
        break;
      }
      if (!prevLine.startsWith('*') && !prevLine.startsWith('/**')) {
        break;
      }
    }

    return {
      name: methodName,
      description: description || undefined,
      parameters,
      returnType: returnType.trim(),
      isStatic: !!isStatic,
      accessibility: 'public',
      signature: `${methodName}(${paramStr}): ${returnType.trim()}`,
      tags: jsdocTags
    };
  }

  private parseParameters(paramStr: string): ApiParameter[] {
    const parameters: ApiParameter[] = [];
    
    // Extract parameter string from parentheses
    const match = paramStr.match(/\(([^)]*)\)/);
    if (!match || !match[1].trim()) return parameters;
    
    const paramText = match[1];
    const params = this.splitParameters(paramText);
    
    for (const param of params) {
      const paramMatch = param.trim().match(/(\w+)(\?)?:\s*([^=]+)(?:\s*=\s*(.+))?/);
      if (paramMatch) {
        const [, name, optional, type, defaultValue] = paramMatch;
        parameters.push({
          name,
          type: type.trim(),
          optional: !!optional || !!defaultValue,
          defaultValue: defaultValue?.trim()
        });
      }
    }
    
    return parameters;
  }

  private splitParameters(paramStr: string): string[] {
    const params: string[] = [];
    let current = '';
    let parenCount = 0;
    let bracketCount = 0;
    
    for (const char of paramStr) {
      if (char === '(' || char === '<') parenCount++;
      if (char === ')' || char === '>') parenCount--;
      if (char === '[') bracketCount++;
      if (char === ']') bracketCount--;
      
      if (char === ',' && parenCount === 0 && bracketCount === 0) {
        params.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    if (current.trim()) {
      params.push(current.trim());
    }
    
    return params;
  }

  private extractEnumValueDescription(allLines: string[], index: number): string | undefined {
    // Look for description in preceding comment
    for (let i = index - 1; i >= 0; i--) {
      const prevLine = allLines[i].trim();
      if (prevLine.startsWith('* @remarks')) {
        let j = i + 1;
        const descParts = [];
        while (j < allLines.length) {
          const descLine = allLines[j].trim();
          if (descLine.startsWith('*') && !descLine.startsWith('* @')) {
            descParts.push(descLine.replace(/^\*\s?/, ''));
          } else {
            break;
          }
          j++;
        }
        return descParts.join(' ').trim() || undefined;
      }
      if (!prevLine.startsWith('*') && !prevLine.startsWith('/**')) {
        break;
      }
    }
    return undefined;
  }

  private extractDescription(): string | undefined {
    const jsdoc = this.context.commentBuffer.join('\n');
    const remarksMatch = jsdoc.match(/\*\s*@remarks\s*([\s\S]*?)(?:\*\s*@|\*\/|$)/);
    if (remarksMatch) {
      return remarksMatch[1]
        .split('\n')
        .map(line => line.replace(/^\s*\*\s?/, ''))
        .join(' ')
        .trim() || undefined;
    }

    // Fallback to general description
    const lines = this.context.commentBuffer
      .filter(line => !line.includes('@') && line.includes('*'))
      .map(line => line.replace(/^\s*\*+\s?/, ''))
      .filter(line => line.trim())
      .join(' ')
      .trim();

    return lines || undefined;
  }

  private extractExamples(): CodeExample[] {
    const examples: CodeExample[] = [];
    const jsdoc = this.context.commentBuffer.join('\n');
    
    // Look for @example tags
    const exampleMatches = jsdoc.matchAll(/\*\s*@example\s+(\S+)\s*\n\s*\*\s*```(\w+)\s*\n([\s\S]*?)\n\s*\*\s*```/g);
    
    for (const match of exampleMatches) {
      const [, title, language, code] = match;
      if (language === 'typescript' || language === 'ts' || language === 'javascript' || language === 'js') {
        examples.push({
          title: title || 'Example',
          code: code
            .split('\n')
            .map(line => line.replace(/^\s*\*\s?/, ''))
            .join('\n')
            .trim(),
          imports: this.extractImportsFromCode(code)
        });
      }
    }
    
    return examples;
  }

  private extractImportsFromCode(code: string): string[] {
    const imports: string[] = [];
    const lines = code.split('\n');
    
    for (const line of lines) {
      const importMatch = line.match(/import\s+.*from\s+["']([^"']+)["']/);
      if (importMatch) {
        imports.push(importMatch[1]);
      }
    }
    
    return imports;
  }

  private extractTags(): string[] {
    const tags: string[] = [];
    const jsdoc = this.context.commentBuffer.join('\n');
    
    if (jsdoc.includes('@preview')) tags.push('preview');
    if (jsdoc.includes('@deprecated')) tags.push('deprecated');
    if (jsdoc.includes('@experimental')) tags.push('experimental');
    if (jsdoc.includes('@beta')) tags.push('beta');
    if (jsdoc.includes('read-only mode')) tags.push('readonly-restricted');
    
    return tags;
  }

  private extractStability(): 'stable' | 'experimental' | 'deprecated' {
    const jsdoc = this.context.commentBuffer.join('\n');
    
    if (jsdoc.includes('@deprecated')) return 'deprecated';
    if (jsdoc.includes('@preview') || jsdoc.includes('@experimental') || jsdoc.includes('@beta')) {
      return 'experimental';
    }
    
    return 'stable';
  }

  private getCategoryFromModule(): string {
    switch (this.context.module) {
      case '@minecraft/server': return 'Server';
      case '@minecraft/server-admin': return 'Admin';
      case '@minecraft/server-net': return 'Networking';
      case '@minecraft/server-ui': return 'UI';
      default: return 'General';
    }
  }

  private getJSDocString(): string | undefined {
    if (this.context.commentBuffer.length === 0) return undefined;
    return this.context.commentBuffer.join('\n');
  }

  private cleanValue(value: string): string | number {
    const cleaned = value.replace(/[,;]/g, '').trim();
    
    // Try to parse as number
    const num = parseInt(cleaned);
    if (!isNaN(num)) return num;
    
    // Return as string without quotes
    return cleaned.replace(/^['"]|['"]$/g, '');
  }

  private clearCommentBuffer(): void {
    this.context.commentBuffer = [];
  }

  private generateRegistry(): ScriptRegistry {
    // Group elements by module
    const moduleMap: Record<MinecraftModule, ModuleRegistry> = {} as any;
    
    for (const module of this.modules) {
      const moduleElements = this.elements.filter(el => el.module === module);
      
      moduleMap[module] = {
        module,
        version: this.getModuleVersion(module),
        description: this.getModuleDescription(module),
        elements: moduleElements,
        exports: {
          enums: moduleElements.filter(el => el.type === 'enum'),
          classes: moduleElements.filter(el => el.type === 'class'),
          interfaces: moduleElements.filter(el => el.type === 'interface'),
          functions: moduleElements.filter(el => el.type === 'function'),
          types: moduleElements.filter(el => el.type === 'type'),
          constants: moduleElements.filter(el => el.type === 'constant'),
          events: moduleElements.filter(el => el.type === 'event')
        }
      };
    }

    // Create global index
    const index: Record<string, ApiElement> = {};
    for (const element of this.elements) {
      index[element.id] = element;
    }

    // Create categories and tags indices
    const categories: Record<string, string[]> = {};
    const tags: Record<string, string[]> = {};
    
    for (const element of this.elements) {
      // Categories
      for (const category of element.categories) {
        if (!categories[category]) categories[category] = [];
        categories[category].push(element.id);
      }
      
      // Tags  
      for (const tag of element.tags) {
        if (!tags[tag]) tags[tag] = [];
        tags[tag].push(element.id);
      }
    }

    return {
      metadata: {
        generatedAt: new Date().toISOString(),
        sourceFile: 'all minecraft script info_1758169723748.txt',
        totalElements: this.elements.length,
        modules: Array.from(this.modules),
        parserVersion: '1.0.0'
      },
      modules: moduleMap,
      index,
      categories,
      tags
    };
  }

  private getModuleVersion(module: MinecraftModule): string {
    // These would typically be extracted from the file, using defaults for now
    switch (module) {
      case '@minecraft/server': return '2.2.0';
      case '@minecraft/server-admin': return '1.0.0';
      case '@minecraft/server-net': return '1.0.0'; 
      case '@minecraft/server-ui': return '1.2.0';
      default: return '1.0.0';
    }
  }

  private getModuleDescription(module: MinecraftModule): string {
    switch (module) {
      case '@minecraft/server': 
        return 'Contains many types related to manipulating a Minecraft world, including entities, blocks, dimensions, and more.';
      case '@minecraft/server-admin':
        return 'Contains types for managing server administrative functions.';
      case '@minecraft/server-net':
        return 'Contains types for networking functionality.';
      case '@minecraft/server-ui':
        return 'Contains types for creating and managing user interface forms.';
      default: 
        return 'Minecraft scripting module.';
    }
  }

  generateSearchIndex(registry: ScriptRegistry): SearchIndex {
    const elements: SearchableElement[] = [];
    const categories: Record<string, number> = {};
    const tags: Record<string, number> = {};
    const modules: Record<MinecraftModule, number> = {} as any;
    const types: Record<ApiElementType, number> = {} as any;

    for (const element of Object.values(registry.index)) {
      // Add to searchable elements
      elements.push({
        id: element.id,
        name: element.name,
        type: element.type,
        module: element.module,
        description: element.description,
        categories: element.categories,
        tags: element.tags,
        keywords: element.keywords,
        signature: element.methods?.[0]?.signature || element.typeDefinition,
        deprecated: element.deprecated,
        experimental: element.experimental
      });

      // Count categories
      for (const category of element.categories) {
        categories[category] = (categories[category] || 0) + 1;
      }

      // Count tags
      for (const tag of element.tags) {
        tags[tag] = (tags[tag] || 0) + 1;
      }

      // Count modules
      modules[element.module] = (modules[element.module] || 0) + 1;

      // Count types
      types[element.type] = (types[element.type] || 0) + 1;
    }

    return {
      elements,
      categories,
      tags,
      modules,
      types
    };
  }
}

// Export for use in other files
export async function parseMinecraftApi(sourceFile: string): Promise<{
  registry: ScriptRegistry;
  searchIndex: SearchIndex;
}> {
  const parser = new MinecraftApiParser();
  const registry = await parser.parseFile(sourceFile);
  const searchIndex = parser.generateSearchIndex(registry);
  
  return { registry, searchIndex };
}