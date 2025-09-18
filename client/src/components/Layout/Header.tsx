import { Download, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  currentSection: string;
}

const sectionTitles: Record<string, { title: string; subtitle: string }> = {
  'welcome': {
    title: 'Welcome',
    subtitle: 'Get started with Minecraft Bedrock Edition addon development'
  },
  'tutorial': {
    title: 'Interactive Tutorial',
    subtitle: 'Learn by doing - create your first addon step by step'
  },
  'quick-start': {
    title: 'Quick Start Guide',
    subtitle: 'Fast track to creating your first addon'
  },
  'docs-concepts': {
    title: 'Core Concepts',
    subtitle: 'Understanding the fundamentals of addon development'
  },
  'docs-entities': {
    title: 'Entity Documentation',
    subtitle: 'Complete guide to creating custom entities'
  },
  'docs-blocks': {
    title: 'Block Documentation',
    subtitle: 'Learn how to create custom blocks'
  },
  'docs-items': {
    title: 'Item Documentation',
    subtitle: 'Guide to creating custom items'
  },
  'docs-scripting': {
    title: 'Scripting APIs',
    subtitle: 'JavaScript APIs for dynamic content'
  },
  'builder-entity': {
    title: 'Entity Builder',
    subtitle: 'Create custom mobs and NPCs with interactive components'
  },
  'builder-client-entity': {
    title: 'Client Entity Builder',
    subtitle: 'Define visual and audio properties for entities'
  },
  'builder-block': {
    title: 'Block Builder',
    subtitle: 'Design custom blocks with unique properties'
  },
  'builder-item': {
    title: 'Item Builder',
    subtitle: 'Create custom items and tools'
  },
  'builder-recipe': {
    title: 'Recipe Builder',
    subtitle: 'Design crafting and cooking recipes'
  },
  'builder-loot': {
    title: 'Loot Table Builder',
    subtitle: 'Configure drops and rewards'
  },
  'builder-biome': {
    title: 'Biome Builder',
    subtitle: 'Create custom world biomes'
  },
  'builder-spawn': {
    title: 'Spawn Rule Builder',
    subtitle: 'Control where and when entities spawn'
  },
  'texture-creator': {
    title: 'Texture Creator',
    subtitle: 'Advanced 2D texture editor with layers and custom brushes'
  },
  'script-studio': {
    title: 'Script Studio',
    subtitle: 'Interactive script builder with API explorer'
  },
  'addon-packager': {
    title: 'Addon Packager',
    subtitle: 'Export complete addon packs'
  },
  'validator': {
    title: 'JSON Validator',
    subtitle: 'Validate and debug your addon files'
  }
};

export default function Header({ currentSection }: HeaderProps) {
  const sectionInfo = sectionTitles[currentSection] || sectionTitles.welcome;

  return (
    <header className="bg-card border-b border-border p-4" data-testid="header">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground" data-testid="page-title">
            {sectionInfo.title}
          </h2>
          <p className="text-sm text-muted-foreground" data-testid="page-subtitle">
            {sectionInfo.subtitle}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="secondary" 
            size="sm"
            data-testid="button-export"
          >
            <Download className="mr-2" size={16} />
            Export Project
          </Button>
          <Button 
            size="sm"
            data-testid="button-save"
          >
            <Save className="mr-2" size={16} />
            Save Progress
          </Button>
        </div>
      </div>
    </header>
  );
}
