/**
 * Addon export and packaging system
 */

export interface AddonConfig {
  name: string;
  description: string;
  author: string;
  version: string;
  minEngineVersion: string;
  includeBehaviorPack: boolean;
  includeResourcePack: boolean;
  files: Array<{
    path: string;
    type: 'behavior' | 'resource';
    content: string;
    size: number;
  }>;
}

export interface ManifestConfig {
  name: string;
  description: string;
  uuid: string;
  version: number[];
  minEngineVersion: number[];
  packType: 'data' | 'resources';
}

export class AddonExporter {
  private static generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  private static parseVersion(version: string): number[] {
    return version.split('.').map(v => parseInt(v) || 0);
  }

  private static createManifest(config: ManifestConfig): string {
    const manifest = {
      format_version: 2,
      header: {
        name: config.name,
        description: config.description,
        uuid: config.uuid,
        version: config.version,
        min_engine_version: config.minEngineVersion
      },
      modules: [
        {
          description: `${config.packType === 'data' ? 'Behavior' : 'Resource'} Pack Module`,
          type: config.packType,
          uuid: this.generateUUID(),
          version: config.version
        }
      ]
    };

    return JSON.stringify(manifest, null, 2);
  }

  static async exportAsZip(config: AddonConfig): Promise<Blob> {
    // Dynamic import for JSZip to avoid bundle size issues
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    const version = this.parseVersion(config.version);
    const minEngineVersion = this.parseVersion(config.minEngineVersion);

    // Create behavior pack if included
    if (config.includeBehaviorPack) {
      const behaviorPack = zip.folder('behavior_pack');
      
      // Create manifest
      const behaviorManifest = this.createManifest({
        name: `${config.name} Behavior Pack`,
        description: config.description,
        uuid: this.generateUUID(),
        version,
        minEngineVersion,
        packType: 'data'
      });
      
      behaviorPack?.file('manifest.json', behaviorManifest);

      // Add behavior pack files
      const behaviorFiles = config.files.filter(file => file.type === 'behavior');
      behaviorFiles.forEach(file => {
        behaviorPack?.file(file.path, file.content);
      });

      // Add pack icon if available
      behaviorPack?.file('pack_icon.png', this.generatePackIcon(config.name, 'behavior'));
    }

    // Create resource pack if included
    if (config.includeResourcePack) {
      const resourcePack = zip.folder('resource_pack');
      
      // Create manifest
      const resourceManifest = this.createManifest({
        name: `${config.name} Resource Pack`,
        description: config.description,
        uuid: this.generateUUID(),
        version,
        minEngineVersion,
        packType: 'resources'
      });
      
      resourcePack?.file('manifest.json', resourceManifest);

      // Add resource pack files
      const resourceFiles = config.files.filter(file => file.type === 'resource');
      resourceFiles.forEach(file => {
        resourcePack?.file(file.path, file.content);
      });

      // Add pack icon
      resourcePack?.file('pack_icon.png', this.generatePackIcon(config.name, 'resource'));
    }

    // Generate the zip file
    const blob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });

    return blob;
  }

  static async exportAsMcaddon(config: AddonConfig): Promise<Blob> {
    // For .mcaddon files, we create a different structure
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    const version = this.parseVersion(config.version);
    const minEngineVersion = this.parseVersion(config.minEngineVersion);

    // Create behavior pack folder
    if (config.includeBehaviorPack) {
      const behaviorManifest = this.createManifest({
        name: `${config.name}`,
        description: config.description,
        uuid: this.generateUUID(),
        version,
        minEngineVersion,
        packType: 'data'
      });
      
      zip.file('manifest.json', behaviorManifest);

      // Add behavior pack files to root
      const behaviorFiles = config.files.filter(file => file.type === 'behavior');
      behaviorFiles.forEach(file => {
        zip.file(file.path, file.content);
      });
    }

    // Add resource pack files if included
    if (config.includeResourcePack) {
      const resourceFiles = config.files.filter(file => file.type === 'resource');
      resourceFiles.forEach(file => {
        zip.file(file.path, file.content);
      });
    }

    // Add pack icon
    zip.file('pack_icon.png', this.generatePackIcon(config.name));

    return await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });
  }

  private static generatePackIcon(name: string, type?: string): string {
    // Generate a simple SVG icon and convert to base64 PNG
    const svg = `
      <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
        <rect width="64" height="64" fill="${type === 'behavior' ? '#4F46E5' : '#059669'}"/>
        <text x="32" y="32" font-family="Arial, sans-serif" font-size="10" 
              fill="white" text-anchor="middle" dominant-baseline="central">
          ${name.substring(0, 3).toUpperCase()}
        </text>
      </svg>
    `;

    // Convert SVG to data URL (simplified for demo)
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  static validateAddonStructure(config: AddonConfig): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate basic config
    if (!config.name?.trim()) {
      errors.push('Addon name is required');
    }

    if (!config.author?.trim()) {
      errors.push('Author name is required');
    }

    if (!config.version?.match(/^\d+\.\d+\.\d+$/)) {
      errors.push('Version must be in format X.Y.Z (e.g., 1.0.0)');
    }

    if (!config.includeBehaviorPack && !config.includeResourcePack) {
      errors.push('At least one pack type must be included');
    }

    // Validate files
    if (config.files.length === 0) {
      warnings.push('No files found to include in addon');
    }

    // Check for required files
    const behaviorFiles = config.files.filter(f => f.type === 'behavior');
    const resourceFiles = config.files.filter(f => f.type === 'resource');

    if (config.includeBehaviorPack && behaviorFiles.length === 0) {
      warnings.push('Behavior pack is enabled but no behavior files found');
    }

    if (config.includeResourcePack && resourceFiles.length === 0) {
      warnings.push('Resource pack is enabled but no resource files found');
    }

    // Check file sizes
    const totalSize = config.files.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > 50 * 1024 * 1024) { // 50MB limit
      warnings.push('Addon size is quite large and may cause performance issues');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static generateFileStructure(config: AddonConfig): {
    behaviorPack: string[];
    resourcePack: string[];
  } {
    const behaviorFiles: string[] = [];
    const resourceFiles: string[] = [];

    if (config.includeBehaviorPack) {
      behaviorFiles.push('manifest.json');
      behaviorFiles.push('pack_icon.png');
      
      config.files
        .filter(file => file.type === 'behavior')
        .forEach(file => behaviorFiles.push(file.path));
    }

    if (config.includeResourcePack) {
      resourceFiles.push('manifest.json');
      resourceFiles.push('pack_icon.png');
      
      config.files
        .filter(file => file.type === 'resource')
        .forEach(file => resourceFiles.push(file.path));
    }

    return {
      behaviorPack: behaviorFiles,
      resourcePack: resourceFiles
    };
  }

  static createSampleFiles(): AddonConfig['files'] {
    return [
      {
        path: 'entities/custom_entity.json',
        type: 'behavior',
        content: JSON.stringify({
          format_version: '1.21.0',
          'minecraft:entity': {
            description: {
              identifier: 'sample:custom_entity',
              is_spawnable: true,
              is_summonable: true
            },
            components: {
              'minecraft:health': { value: 20, max: 20 },
              'minecraft:movement': { value: 0.25 }
            }
          }
        }, null, 2),
        size: 512
      },
      {
        path: 'textures/entity/custom_entity.png',
        type: 'resource',
        content: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
        size: 68
      }
    ];
  }

  // Template generators
  static generateEntityTemplate(identifier: string, displayName: string): string {
    return JSON.stringify({
      format_version: '1.21.0',
      'minecraft:entity': {
        description: {
          identifier,
          is_spawnable: true,
          is_summonable: true
        },
        component_groups: {},
        components: {
          'minecraft:health': { value: 20, max: 20 },
          'minecraft:movement': { value: 0.25 },
          'minecraft:navigation.walk': {
            can_path_over_water: false,
            avoid_water: true
          },
          'minecraft:movement.basic': {},
          'minecraft:jump.static': {},
          'minecraft:can_climb': {},
          'minecraft:collision_box': {
            width: 0.6,
            height: 1.8
          },
          'minecraft:physics': {}
        },
        events: {}
      }
    }, null, 2);
  }

  static generateBlockTemplate(identifier: string, displayName: string): string {
    return JSON.stringify({
      format_version: '1.21.0',
      'minecraft:block': {
        description: {
          identifier,
          register_to_creative_menu: true
        },
        components: {
          'minecraft:destructible_by_mining': {
            seconds_to_destroy: 1.5
          },
          'minecraft:destructible_by_explosion': {
            explosion_resistance: 6.0
          },
          'minecraft:friction': 0.6,
          'minecraft:map_color': '#7F7F7F'
        }
      }
    }, null, 2);
  }

  static generateItemTemplate(identifier: string, displayName: string): string {
    return JSON.stringify({
      format_version: '1.21.0',
      'minecraft:item': {
        description: {
          identifier,
          menu_category: {
            category: 'items'
          }
        },
        components: {
          'minecraft:max_stack_size': 64,
          'minecraft:icon': {
            texture: identifier.split(':')[1] || 'custom_item'
          },
          'minecraft:display_name': {
            value: displayName
          }
        }
      }
    }, null, 2);
  }
}

// Export main function for use in components
export async function exportAddonPack(config: AddonConfig): Promise<Blob> {
  return AddonExporter.exportAsMcaddon(config);
}
