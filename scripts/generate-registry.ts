#!/usr/bin/env tsx

/**
 * Script to generate Minecraft API registry from the definitions file
 */

import { parseMinecraftApi } from '../server/parse-minecraft-api.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log('🚀 Starting Minecraft API registry generation...');
  
  const sourceFile = path.join(__dirname, '../attached_assets/all minecraft script info_1758169723748.txt');
  
  if (!fs.existsSync(sourceFile)) {
    console.error(`❌ Source file not found: ${sourceFile}`);
    process.exit(1);
  }

  console.log(`📄 Processing source file: ${sourceFile}`);
  console.log(`📊 File size: ${fs.statSync(sourceFile).size} bytes`);

  try {
    // Parse the API definitions
    console.log('⚙️  Parsing API definitions...');
    const { registry, searchIndex } = await parseMinecraftApi(sourceFile);
    
    console.log('📈 Parse Results:');
    console.log(`  - Total elements: ${registry.metadata.totalElements}`);
    console.log(`  - Modules: ${registry.metadata.modules.join(', ')}`);
    
    // Log counts by type
    const typeCounts: Record<string, number> = {};
    Object.values(registry.index).forEach(element => {
      typeCounts[element.type] = (typeCounts[element.type] || 0) + 1;
    });
    
    console.log('  - Element counts by type:');
    Object.entries(typeCounts).forEach(([type, count]) => {
      console.log(`    ${type}: ${count}`);
    });

    // Generate registry data file
    console.log('💾 Generating registry data...');
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

    const registryPath = path.join(__dirname, '../shared/minecraftRegistry.ts');
    fs.writeFileSync(registryPath, registryContent);
    console.log(`✅ Registry data saved to: ${registryPath}`);

    // Generate searchable index JSON
    console.log('🔍 Generating search index...');
    const indexPath = path.join(__dirname, '../shared/scriptIndex.json');
    fs.writeFileSync(indexPath, JSON.stringify(searchIndex, null, 2));
    console.log(`✅ Search index saved to: ${indexPath}`);

    // Generate summary report
    console.log('📋 Generating summary report...');
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

    const summaryPath = path.join(__dirname, '../shared/registrySummary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    console.log(`✅ Summary report saved to: ${summaryPath}`);

    console.log('🎉 Registry generation completed successfully!');
    console.log('\nGenerated files:');
    console.log(`  - ${registryPath}`);
    console.log(`  - ${indexPath}`);  
    console.log(`  - ${summaryPath}`);
    
    // Validate completeness
    console.log('\n🔍 Validating completeness...');
    const sourceContent = fs.readFileSync(sourceFile, 'utf-8');
    const sourceLines = sourceContent.split('\n').length;
    
    console.log(`Source file lines: ${sourceLines}`);
    console.log(`Parsed elements: ${registry.metadata.totalElements}`);
    
    // Quick validation checks
    const enumCount = sourceContent.match(/^export enum /gm)?.length || 0;
    const classCount = sourceContent.match(/^export class /gm)?.length || 0;
    const interfaceCount = sourceContent.match(/^export interface /gm)?.length || 0;
    const functionCount = sourceContent.match(/^export function /gm)?.length || 0;
    
    console.log('Expected vs Parsed:');
    console.log(`  - Enums: ${enumCount} expected, ${typeCounts.enum || 0} parsed`);
    console.log(`  - Classes: ${classCount} expected, ${typeCounts.class || 0} parsed`);
    console.log(`  - Interfaces: ${interfaceCount} expected, ${typeCounts.interface || 0} parsed`);
    console.log(`  - Functions: ${functionCount} expected, ${typeCounts.function || 0} parsed`);

    const coverage = Math.round(((typeCounts.enum || 0) + (typeCounts.class || 0) + (typeCounts.interface || 0) + (typeCounts.function || 0)) / (enumCount + classCount + interfaceCount + functionCount) * 100);
    console.log(`\n📊 Estimated coverage: ${coverage}%`);

  } catch (error) {
    console.error('❌ Error generating registry:', error);
    process.exit(1);
  }
}

main().catch(console.error);