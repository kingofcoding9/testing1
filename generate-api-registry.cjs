/**
 * Simple Node.js script to generate Minecraft API registry
 */

const fs = require('fs');
const path = require('path');

// Parser class
class MinecraftApiParser {
  constructor() {
    this.elements = [];
    this.modules = new Set();
    this.context = {
      module: '@minecraft/server',
      inComment: false,
      commentBuffer: [],
      lineNumber: 0
    };
  }

  async parseFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    console.log(`📄 Parsing ${lines.length} lines from ${filePath}`);
    
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

    console.log(`✅ Parsed ${this.elements.length} API elements from ${this.modules.size} modules`);
    return this.generateRegistry();
  }

  async parseLine(line, allLines, index) {
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
    }
  }

  detectModule(line) {
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

  handleComments(line) {
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
    
    return this.context.inComment;
  }

  async parseEnum(line, allLines, startIndex) {
    const enumMatch = line.match(/export enum (\w+)/);
    if (!enumMatch) return;

    const enumName = enumMatch[1];
    let i = startIndex + 1;
    const enumValues = [];
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

    const element = {
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

  async parseClass(line, allLines, startIndex) {
    const classMatch = line.match(/export class (\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+([^{]+))?/);
    if (!classMatch) return;

    const [, className, extendsClass, implementsInterfaces] = classMatch;
    let i = startIndex + 1;
    let braceCount = 1;
    const properties = [];
    const methods = [];
    let definition = line;

    while (i < allLines.length && braceCount > 0) {
      const currentLine = allLines[i];
      definition += '\n' + currentLine;
      
      braceCount += (currentLine.match(/\{/g) || []).length;
      braceCount -= (currentLine.match(/\}/g) || []).length;

      const trimmed = currentLine.trim();

      // Parse properties and methods
      if (trimmed.includes('readonly ') || (trimmed.includes(': ') && !trimmed.includes('('))) {
        const property = this.parseProperty(currentLine, allLines, i);
        if (property) properties.push(property);
      } else if (trimmed.includes('(') && (trimmed.includes('):') || trimmed.includes('): '))) {
        const method = this.parseMethod(currentLine, allLines, i);
        if (method) methods.push(method);
      }

      i++;
    }

    const element = {
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

  async parseInterface(line, allLines, startIndex) {
    const interfaceMatch = line.match(/export interface (\w+)(?:\s+extends\s+([^{]+))?/);
    if (!interfaceMatch) return;

    const [, interfaceName, extendsInterfaces] = interfaceMatch;
    let i = startIndex + 1;
    let braceCount = 1;
    const properties = [];
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

    const element = {
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

  async parseFunction(line, allLines, startIndex) {
    const functionMatch = line.match(/export function (\w+)\s*\([^)]*\):\s*([^;{]+)/);
    if (!functionMatch) return;

    const [, functionName, returnType] = functionMatch;
    const parameters = this.parseParameters(line);
    
    const element = {
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

  async parseType(line, allLines, startIndex) {
    const typeMatch = line.match(/export type (\w+)\s*=\s*(.+);?/);
    if (!typeMatch) return;

    const [, typeName, typeDefinition] = typeMatch;
    
    const element = {
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

  parseProperty(line, allLines, index) {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || 
        trimmed.includes('(') || trimmed === '{' || trimmed === '}' ||
        trimmed.startsWith('private') || trimmed.startsWith('protected')) {
      return null;
    }

    const propertyMatch = trimmed.match(/(readonly\s+)?(static\s+)?(\w+)(\?)?:\s*([^;]+);?/);
    if (!propertyMatch) return null;

    const [, readonly, isStatic, name, optional, type] = propertyMatch;
    
    let description = '';
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

  parseMethod(line, allLines, index) {
    const trimmed = line.trim();
    
    if (trimmed.includes('constructor') || trimmed.startsWith('private') || 
        trimmed.startsWith('[Symbol.') || trimmed === '{' || trimmed === '}') {
      return null;
    }

    const methodMatch = trimmed.match(/(static\s+)?(\w+)\s*\(([^)]*)\):\s*([^;{]+)[;{]?/);
    if (!methodMatch) return null;

    const [, isStatic, methodName, paramStr, returnType] = methodMatch;
    const parameters = this.parseParameters(`(${paramStr})`);
    
    let description = '';
    let jsdocTags = [];
    
    for (let i = index - 1; i >= 0; i--) {
      const prevLine = allLines[i].trim();
      if (prevLine.startsWith('* @remarks')) {
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

  parseParameters(paramStr) {
    const parameters = [];
    
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

  splitParameters(paramStr) {
    const params = [];
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

  extractEnumValueDescription(allLines, index) {
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

  extractDescription() {
    const jsdoc = this.context.commentBuffer.join('\n');
    const remarksMatch = jsdoc.match(/\*\s*@remarks\s*([\s\S]*?)(?:\*\s*@|\*\/|$)/);
    if (remarksMatch) {
      return remarksMatch[1]
        .split('\n')
        .map(line => line.replace(/^\s*\*\s?/, ''))
        .join(' ')
        .trim() || undefined;
    }

    const lines = this.context.commentBuffer
      .filter(line => !line.includes('@') && line.includes('*'))
      .map(line => line.replace(/^\s*\*+\s?/, ''))
      .filter(line => line.trim())
      .join(' ')
      .trim();

    return lines || undefined;
  }

  extractExamples() {
    const examples = [];
    const jsdoc = this.context.commentBuffer.join('\n');
    
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

  extractImportsFromCode(code) {
    const imports = [];
    const lines = code.split('\n');
    
    for (const line of lines) {
      const importMatch = line.match(/import\s+.*from\s+["']([^"']+)["']/);
      if (importMatch) {
        imports.push(importMatch[1]);
      }
    }
    
    return imports;
  }

  extractTags() {
    const tags = [];
    const jsdoc = this.context.commentBuffer.join('\n');
    
    if (jsdoc.includes('@preview')) tags.push('preview');
    if (jsdoc.includes('@deprecated')) tags.push('deprecated');
    if (jsdoc.includes('@experimental')) tags.push('experimental');
    if (jsdoc.includes('@beta')) tags.push('beta');
    if (jsdoc.includes('read-only mode')) tags.push('readonly-restricted');
    
    return tags;
  }

  extractStability() {
    const jsdoc = this.context.commentBuffer.join('\n');
    
    if (jsdoc.includes('@deprecated')) return 'deprecated';
    if (jsdoc.includes('@preview') || jsdoc.includes('@experimental') || jsdoc.includes('@beta')) {
      return 'experimental';
    }
    
    return 'stable';
  }

  getCategoryFromModule() {
    switch (this.context.module) {
      case '@minecraft/server': return 'Server';
      case '@minecraft/server-admin': return 'Admin';
      case '@minecraft/server-net': return 'Networking';
      case '@minecraft/server-ui': return 'UI';
      default: return 'General';
    }
  }

  getJSDocString() {
    if (this.context.commentBuffer.length === 0) return undefined;
    return this.context.commentBuffer.join('\n');
  }

  cleanValue(value) {
    const cleaned = value.replace(/[,;]/g, '').trim();
    
    const num = parseInt(cleaned);
    if (!isNaN(num)) return num;
    
    return cleaned.replace(/^['"]|['"]$/g, '');
  }

  clearCommentBuffer() {
    this.context.commentBuffer = [];
  }

  generateRegistry() {
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

    const index = {};
    for (const element of this.elements) {
      index[element.id] = element;
    }

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
  console.log('🚀 Starting Minecraft API registry generation...');
  
  const sourceFile = path.join(__dirname, 'attached_assets/all minecraft script info_1758169723748.txt');
  
  if (!fs.existsSync(sourceFile)) {
    console.error(`❌ Source file not found: ${sourceFile}`);
    process.exit(1);
  }

  console.log(`📄 Processing source file: ${sourceFile}`);
  console.log(`📊 File size: ${fs.statSync(sourceFile).size} bytes`);

  try {
    const parser = new MinecraftApiParser();
    const registry = await parser.parseFile(sourceFile);
    const searchIndex = parser.generateSearchIndex(registry);
    
    console.log('📈 Parse Results:');
    console.log(`  - Total elements: ${registry.metadata.totalElements}`);
    console.log(`  - Modules: ${registry.metadata.modules.join(', ')}`);
    
    const typeCounts = {};
    Object.values(registry.index).forEach(element => {
      typeCounts[element.type] = (typeCounts[element.type] || 0) + 1;
    });
    
    console.log('  - Element counts by type:');
    Object.entries(typeCounts).forEach(([type, count]) => {
      console.log(`    ${type}: ${count}`);
    });

    // Save registry
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
    if (!fs.existsSync('shared')) fs.mkdirSync('shared', { recursive: true });
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

    console.log('🎉 Registry generation completed successfully!');
    
    // Validate completeness
    console.log('\n🔍 Validating completeness...');
    const sourceContent = fs.readFileSync(sourceFile, 'utf-8');
    const sourceLines = sourceContent.split('\n').length;
    
    console.log(`Source file lines: ${sourceLines}`);
    console.log(`Parsed elements: ${registry.metadata.totalElements}`);
    
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

  } catch (error) {
    console.error('❌ Error generating registry:', error);
    process.exit(1);
  }
}

main().catch(console.error);