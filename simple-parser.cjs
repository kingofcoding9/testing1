/**
 * Simplified but comprehensive Minecraft API parser
 */

const fs = require('fs');
const path = require('path');

class SimpleMinecraftParser {
  constructor() {
    this.elements = [];
    this.currentModule = '@minecraft/server';
    this.modules = new Set();
  }

  parseFile(filePath) {
    console.log('📄 Starting to parse file...');
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    console.log(`Processing ${lines.length} lines...`);
    
    let currentComment = [];
    let inComment = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      
      // Track module changes
      if (trimmed.includes('"module_name":')) {
        if (trimmed.includes('@minecraft/server-admin')) {
          this.currentModule = '@minecraft/server-admin';
        } else if (trimmed.includes('@minecraft/server-net')) {
          this.currentModule = '@minecraft/server-net';
        } else if (trimmed.includes('@minecraft/server-ui')) {
          this.currentModule = '@minecraft/server-ui';
        } else if (trimmed.includes('@minecraft/server')) {
          this.currentModule = '@minecraft/server';
        }
        this.modules.add(this.currentModule);
      }
      
      // Handle comments
      if (trimmed.startsWith('/**')) {
        inComment = true;
        currentComment = [line];
        continue;
      } else if (inComment && trimmed.startsWith('*/')) {
        currentComment.push(line);
        inComment = false;
        continue;
      } else if (inComment) {
        currentComment.push(line);
        continue;
      }
      
      // Parse exports
      if (trimmed.startsWith('export ')) {
        const element = this.parseExport(trimmed, lines, i, currentComment);
        if (element) {
          this.elements.push(element);
          console.log(`Parsed: ${element.type} ${element.name} (${this.currentModule})`);
        }
        currentComment = []; // Clear comment after use
      }
    }
    
    console.log(`✅ Finished parsing. Found ${this.elements.length} elements`);
    return this.generateRegistry();
  }

  parseExport(line, allLines, startIndex, commentLines) {
    try {
      // Parse enums
      if (line.includes('export enum ')) {
        return this.parseEnum(line, allLines, startIndex, commentLines);
      }
      
      // Parse classes  
      if (line.includes('export class ')) {
        return this.parseClass(line, allLines, startIndex, commentLines);
      }
      
      // Parse interfaces
      if (line.includes('export interface ')) {
        return this.parseInterface(line, allLines, startIndex, commentLines);
      }
      
      // Parse functions
      if (line.includes('export function ')) {
        return this.parseFunction(line, allLines, startIndex, commentLines);
      }
      
      // Parse types
      if (line.includes('export type ')) {
        return this.parseType(line, allLines, startIndex, commentLines);
      }
      
      return null;
    } catch (error) {
      console.log(`Error parsing line ${startIndex + 1}: ${error.message}`);
      return null;
    }
  }

  parseEnum(line, allLines, startIndex, commentLines) {
    const match = line.match(/export enum (\w+)/);
    if (!match) return null;
    
    const enumName = match[1];
    const enumValues = [];
    let definition = line;
    let i = startIndex + 1;
    
    // Parse enum body
    while (i < allLines.length) {
      const currentLine = allLines[i];
      definition += '\n' + currentLine;
      const trimmed = currentLine.trim();
      
      if (trimmed === '}') break;
      
      // Parse enum values
      const valueMatch = trimmed.match(/^\s*(\w+)\s*=\s*([^,]+),?\s*$/);
      if (valueMatch) {
        const [, name, value] = valueMatch;
        enumValues.push({
          name,
          value: this.cleanValue(value),
          description: this.findValueDescription(allLines, i)
        });
      }
      
      i++;
    }

    return {
      id: `${this.currentModule}.${enumName}`,
      name: enumName,
      type: 'enum',
      module: this.currentModule,
      description: this.extractDescription(commentLines),
      definition,
      jsdoc: commentLines.join('\n'),
      enumValues,
      categories: ['Enums', this.getModuleCategory()],
      tags: this.extractTags(commentLines),
      keywords: [enumName.toLowerCase(), 'enum'],
      stability: this.extractStability(commentLines)
    };
  }

  parseClass(line, allLines, startIndex, commentLines) {
    const match = line.match(/export class (\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+([^{]+))?/);
    if (!match) return null;
    
    const [, className, extendsClass, implementsInterfaces] = match;
    const properties = [];
    const methods = [];
    let definition = line;
    let braceCount = 0;
    let i = startIndex;
    
    // Find all lines for this class
    do {
      if (i > startIndex) definition += '\n' + allLines[i];
      
      const currentLine = allLines[i];
      braceCount += (currentLine.match(/\{/g) || []).length;
      braceCount -= (currentLine.match(/\}/g) || []).length;
      
      // Parse class members (simplified)
      const trimmed = currentLine.trim();
      if (trimmed.includes('readonly ') && trimmed.includes(':')) {
        const propMatch = trimmed.match(/(readonly\s+)?(\w+):\s*([^;]+);?/);
        if (propMatch) {
          const [, readonly, name, type] = propMatch;
          properties.push({
            name,
            type: type.trim(),
            readonly: !!readonly,
            accessibility: 'public'
          });
        }
      } else if (trimmed.includes('(') && trimmed.includes('):')) {
        const methodMatch = trimmed.match(/(\w+)\s*\([^)]*\):\s*([^;{]+)/);
        if (methodMatch) {
          const [, methodName, returnType] = methodMatch;
          methods.push({
            name: methodName,
            parameters: [],
            returnType: returnType.trim(),
            accessibility: 'public',
            signature: methodMatch[0]
          });
        }
      }
      
      i++;
    } while (i < allLines.length && braceCount > 0);

    return {
      id: `${this.currentModule}.${className}`,
      name: className,
      type: 'class',
      module: this.currentModule,
      description: this.extractDescription(commentLines),
      definition,
      jsdoc: commentLines.join('\n'),
      properties,
      methods,
      extends: extendsClass,
      implements: implementsInterfaces?.split(',').map(s => s.trim()),
      categories: ['Classes', this.getModuleCategory()],
      tags: this.extractTags(commentLines),
      keywords: [className.toLowerCase(), 'class'],
      examples: this.extractExamples(commentLines),
      stability: this.extractStability(commentLines)
    };
  }

  parseInterface(line, allLines, startIndex, commentLines) {
    const match = line.match(/export interface (\w+)(?:\s+extends\s+([^{]+))?/);
    if (!match) return null;
    
    const [, interfaceName, extendsInterfaces] = match;
    const properties = [];
    let definition = line;
    let braceCount = 0;
    let i = startIndex;
    
    // Find all lines for this interface
    do {
      if (i > startIndex) definition += '\n' + allLines[i];
      
      const currentLine = allLines[i];
      braceCount += (currentLine.match(/\{/g) || []).length;
      braceCount -= (currentLine.match(/\}/g) || []).length;
      
      // Parse interface properties (simplified)
      const trimmed = currentLine.trim();
      if (trimmed.includes(':') && !trimmed.startsWith('*') && !trimmed.startsWith('//')) {
        const propMatch = trimmed.match(/(\w+)(\?)?:\s*([^;]+);?/);
        if (propMatch) {
          const [, name, optional, type] = propMatch;
          properties.push({
            name,
            type: type.trim(),
            optional: !!optional,
            accessibility: 'public'
          });
        }
      }
      
      i++;
    } while (i < allLines.length && braceCount > 0);

    return {
      id: `${this.currentModule}.${interfaceName}`,
      name: interfaceName,
      type: 'interface',
      module: this.currentModule,
      description: this.extractDescription(commentLines),
      definition,
      jsdoc: commentLines.join('\n'),
      properties,
      extends: extendsInterfaces?.trim(),
      categories: ['Interfaces', this.getModuleCategory()],
      tags: this.extractTags(commentLines),
      keywords: [interfaceName.toLowerCase(), 'interface'],
      stability: this.extractStability(commentLines)
    };
  }

  parseFunction(line, allLines, startIndex, commentLines) {
    const match = line.match(/export function (\w+)\s*\([^)]*\):\s*([^;{]+)/);
    if (!match) return null;
    
    const [, functionName, returnType] = match;

    return {
      id: `${this.currentModule}.${functionName}`,
      name: functionName,
      type: 'function',
      module: this.currentModule,
      description: this.extractDescription(commentLines),
      definition: line,
      jsdoc: commentLines.join('\n'),
      parameters: [],
      returnType: returnType.trim(),
      categories: ['Functions', this.getModuleCategory()],
      tags: this.extractTags(commentLines),
      keywords: [functionName.toLowerCase(), 'function'],
      stability: this.extractStability(commentLines)
    };
  }

  parseType(line, allLines, startIndex, commentLines) {
    const match = line.match(/export type (\w+)\s*=\s*(.+);?/);
    if (!match) return null;
    
    const [, typeName, typeDefinition] = match;

    return {
      id: `${this.currentModule}.${typeName}`,
      name: typeName,
      type: 'type',
      module: this.currentModule,
      description: this.extractDescription(commentLines),
      definition: line,
      jsdoc: commentLines.join('\n'),
      typeDefinition: typeDefinition.trim(),
      categories: ['Types', this.getModuleCategory()],
      tags: this.extractTags(commentLines),
      keywords: [typeName.toLowerCase(), 'type'],
      stability: this.extractStability(commentLines)
    };
  }

  findValueDescription(allLines, index) {
    // Look backwards for description in comments
    for (let i = index - 1; i >= 0; i--) {
      const line = allLines[i].trim();
      if (line.startsWith('* @remarks')) {
        return line.replace('* @remarks', '').trim();
      }
      if (!line.startsWith('*') && line !== '') break;
    }
    return undefined;
  }

  extractDescription(commentLines) {
    if (!commentLines || commentLines.length === 0) return undefined;
    
    const joined = commentLines.join('\n');
    
    // Look for @remarks
    const remarksMatch = joined.match(/\*\s*@remarks\s*([\s\S]*?)(?:\*\s*@|\*\/|$)/);
    if (remarksMatch) {
      return remarksMatch[1]
        .split('\n')
        .map(line => line.replace(/^\s*\*\s?/, ''))
        .join(' ')
        .trim() || undefined;
    }
    
    // Fallback to general description
    const desc = commentLines
      .filter(line => !line.includes('@') && line.includes('*'))
      .map(line => line.replace(/^\s*\/?\*+\s?/, ''))
      .join(' ')
      .trim();
      
    return desc || undefined;
  }

  extractExamples(commentLines) {
    if (!commentLines || commentLines.length === 0) return [];
    
    const examples = [];
    const joined = commentLines.join('\n');
    
    // Simple example extraction
    const exampleMatches = joined.matchAll(/\*\s*@example\s+(\S+)\s*\n\s*\*\s*```(\w+)\s*\n([\s\S]*?)\n\s*\*\s*```/g);
    
    for (const match of exampleMatches) {
      const [, title, language, code] = match;
      if (language === 'typescript' || language === 'ts' || language === 'javascript' || language === 'js') {
        examples.push({
          title: title || 'Example',
          code: code
            .split('\n')
            .map(line => line.replace(/^\s*\*\s?/, ''))
            .join('\n')
            .trim()
        });
      }
    }
    
    return examples;
  }

  extractTags(commentLines) {
    if (!commentLines || commentLines.length === 0) return [];
    
    const tags = [];
    const joined = commentLines.join('\n');
    
    if (joined.includes('@preview')) tags.push('preview');
    if (joined.includes('@deprecated')) tags.push('deprecated');
    if (joined.includes('@experimental')) tags.push('experimental');
    if (joined.includes('@beta')) tags.push('beta');
    if (joined.includes('read-only mode')) tags.push('readonly-restricted');
    
    return tags;
  }

  extractStability(commentLines) {
    if (!commentLines || commentLines.length === 0) return 'stable';
    
    const joined = commentLines.join('\n');
    
    if (joined.includes('@deprecated')) return 'deprecated';
    if (joined.includes('@preview') || joined.includes('@experimental') || joined.includes('@beta')) {
      return 'experimental';
    }
    
    return 'stable';
  }

  getModuleCategory() {
    switch (this.currentModule) {
      case '@minecraft/server': return 'Server';
      case '@minecraft/server-admin': return 'Admin';
      case '@minecraft/server-net': return 'Networking';
      case '@minecraft/server-ui': return 'UI';
      default: return 'General';
    }
  }

  cleanValue(value) {
    const cleaned = value.replace(/[,;]/g, '').trim();
    
    const num = parseInt(cleaned);
    if (!isNaN(num)) return num;
    
    return cleaned.replace(/^['"]|['"]$/g, '');
  }

  generateRegistry() {
    // Group elements by module
    const moduleMap = {};
    
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
    const index = {};
    for (const element of this.elements) {
      index[element.id] = element;
    }

    // Create categories and tags indices
    const categories = {};
    const tags = {};
    
    for (const element of this.elements) {
      for (const category of element.categories) {
        if (!categories[category]) categories[category] = [];
        categories[category].push(element.id);
      }
      
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

  getModuleVersion(module) {
    switch (module) {
      case '@minecraft/server': return '2.2.0';
      case '@minecraft/server-admin': return '1.0.0';
      case '@minecraft/server-net': return '1.0.0'; 
      case '@minecraft/server-ui': return '1.2.0';
      default: return '1.0.0';
    }
  }

  getModuleDescription(module) {
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

  generateSearchIndex(registry) {
    const elements = [];
    const categories = {};
    const tags = {};
    const modules = {};
    const types = {};

    for (const element of Object.values(registry.index)) {
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

      for (const category of element.categories) {
        categories[category] = (categories[category] || 0) + 1;
      }

      for (const tag of element.tags) {
        tags[tag] = (tags[tag] || 0) + 1;
      }

      modules[element.module] = (modules[element.module] || 0) + 1;
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

// Main execution
async function main() {
  console.log('🚀 Starting simplified Minecraft API registry generation...');
  
  const sourceFile = path.join(__dirname, 'attached_assets/all minecraft script info_1758169723748.txt');
  
  if (!fs.existsSync(sourceFile)) {
    console.error(`❌ Source file not found: ${sourceFile}`);
    process.exit(1);
  }

  console.log(`📄 Processing source file: ${sourceFile}`);
  console.log(`📊 File size: ${fs.statSync(sourceFile).size} bytes`);

  try {
    const parser = new SimpleMinecraftParser();
    const registry = parser.parseFile(sourceFile);
    const searchIndex = parser.generateSearchIndex(registry);
    
    console.log('\n📈 Parse Results:');
    console.log(`  - Total elements: ${registry.metadata.totalElements}`);
    console.log(`  - Modules: ${registry.metadata.modules.join(', ')}`);
    
    // Log counts by type
    const typeCounts = {};
    Object.values(registry.index).forEach(element => {
      typeCounts[element.type] = (typeCounts[element.type] || 0) + 1;
    });
    
    console.log('  - Element counts by type:');
    Object.entries(typeCounts).forEach(([type, count]) => {
      console.log(`    ${type}: ${count}`);
    });

    // Ensure shared directory exists
    if (!fs.existsSync('shared')) {
      fs.mkdirSync('shared', { recursive: true });
    }

    // Save files
    console.log('\n💾 Saving registry files...');

    // Save the actual registry data
    const registryContent = `/**
 * Generated Minecraft Script API Registry
 * Generated on: ${new Date().toISOString()}
 * Source: all minecraft script info_1758169723748.txt
 * Total Elements: ${registry.metadata.totalElements}
 */

import { ScriptRegistry } from './scriptRegistry';

export const minecraftRegistry: ScriptRegistry = ${JSON.stringify(registry, null, 2)};

export default minecraftRegistry;
`;

    const registryPath = path.join(__dirname, 'shared/minecraftRegistry.ts');
    fs.writeFileSync(registryPath, registryContent);
    console.log(`✅ Registry data saved to: ${registryPath}`);

    // Save search index
    const indexPath = path.join(__dirname, 'shared/scriptIndex.json');
    fs.writeFileSync(indexPath, JSON.stringify(searchIndex, null, 2));
    console.log(`✅ Search index saved to: ${indexPath}`);

    // Save summary
    const summary = {
      generatedAt: new Date().toISOString(),
      sourceFile: 'all minecraft script info_1758169723748.txt',
      totalElements: registry.metadata.totalElements,
      modules: registry.metadata.modules.map(module => ({
        name: module,
        elementCount: Object.values(registry.index).filter(el => el.module === module).length,
        types: Object.entries(typeCounts).map(([type, count]) => ({
          type,
          count: Object.values(registry.index).filter(el => el.module === module && el.type === type).length
        })).filter(item => item.count > 0)
      })),
      elementsByType: Object.entries(typeCounts).map(([type, count]) => ({ type, count })),
      categories: Object.entries(registry.categories).map(([category, ids]) => ({
        category,
        count: ids.length
      })),
      tags: Object.entries(registry.tags).map(([tag, ids]) => ({
        tag,
        count: ids.length
      }))
    };

    const summaryPath = path.join(__dirname, 'shared/registrySummary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    console.log(`✅ Summary report saved to: ${summaryPath}`);

    // Validation
    console.log('\n🔍 Validating completeness...');
    const sourceContent = fs.readFileSync(sourceFile, 'utf-8');
    
    const enumCount = (sourceContent.match(/^export enum /gm) || []).length;
    const classCount = (sourceContent.match(/^export class /gm) || []).length;
    const interfaceCount = (sourceContent.match(/^export interface /gm) || []).length;
    const functionCount = (sourceContent.match(/^export function /gm) || []).length;
    
    console.log('Expected vs Parsed:');
    console.log(`  - Enums: ${enumCount} expected, ${typeCounts.enum || 0} parsed`);
    console.log(`  - Classes: ${classCount} expected, ${typeCounts.class || 0} parsed`);
    console.log(`  - Interfaces: ${interfaceCount} expected, ${typeCounts.interface || 0} parsed`);
    console.log(`  - Functions: ${functionCount} expected, ${typeCounts.function || 0} parsed`);

    const total = (typeCounts.enum || 0) + (typeCounts.class || 0) + (typeCounts.interface || 0) + (typeCounts.function || 0);
    const expected = enumCount + classCount + interfaceCount + functionCount;
    const coverage = Math.round((total / expected) * 100);
    console.log(`\n📊 Coverage: ${coverage}% (${total}/${expected} elements)`);

    console.log('\n🎉 Registry generation completed successfully!');

  } catch (error) {
    console.error('❌ Error generating registry:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

main().catch(console.error);