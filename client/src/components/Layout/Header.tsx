import { Download, Save, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import omniScienceLogo from "@assets/omni-science_1758171429429.png";

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
  },
  'external-tools': {
    title: 'External Tools',
    subtitle: 'Professional integrated tools for complete Minecraft development workflow'
  },
  'community': {
    title: 'Community Hub',
    subtitle: 'Connect with the Omni-Science community and access resources'
  },
  'omni-science': {
    title: 'Omni-Science',
    subtitle: 'Visit our educational platform and learn about our mission'
  }
};

export default function Header({ currentSection }: HeaderProps) {
  const sectionInfo = sectionTitles[currentSection] || sectionTitles.welcome;
  const [, setLocation] = useLocation();

  const handleLogoClick = () => {
    setLocation('/');
  };

  return (
    <header className="bg-card border-b border-border" data-testid="header">
      {/* Top row with logo and main title */}
      <div className="flex items-center justify-between p-4 pb-2">
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleLogoClick}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer group"
            data-testid="logo-home-button"
            aria-label="Go to home page"
          >
            <img 
              src={omniScienceLogo} 
              alt="Omni-Science Logo" 
              className="h-12 w-auto sm:h-14 md:h-16 transition-transform group-hover:scale-105"
              data-testid="omni-science-logo"
            />
            <div className="hidden sm:block">
              <h1 className="text-xl md:text-2xl font-bold text-foreground leading-tight">
                Omni-Science
              </h1>
              <p className="text-sm text-muted-foreground -mt-1">
                Minecraft Bedrock Creator Suite
              </p>
            </div>
          </button>
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center space-x-3">
          <Button 
            variant="secondary" 
            size="sm"
            data-testid="button-export"
            className="hidden sm:flex"
          >
            <Download className="mr-2" size={16} />
            Export Project
          </Button>
          <Button 
            size="sm"
            data-testid="button-save"
          >
            <Save className="mr-2" size={16} />
            <span className="hidden sm:inline">Save Progress</span>
            <span className="sm:hidden">Save</span>
          </Button>
        </div>
      </div>
      
      {/* Bottom row with current section info and credits */}
      <div className="flex items-center justify-between px-4 pb-3 pt-1">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-foreground" data-testid="page-title">
            {sectionInfo.title}
          </h2>
          <p className="text-sm text-muted-foreground" data-testid="page-subtitle">
            {sectionInfo.subtitle}
          </p>
        </div>
        
        {/* Credits - visible on larger screens */}
        <div className="hidden lg:flex flex-col text-right text-xs text-muted-foreground">
          <span data-testid="creator-credit">Created by king_of_coding</span>
          <span data-testid="ownership-credit" className="font-medium">Owned by Omni-Science</span>
        </div>
      </div>
      
      {/* Mobile credits row */}
      <div className="lg:hidden px-4 pb-2 flex justify-center">
        <div className="text-xs text-muted-foreground text-center">
          <span data-testid="creator-credit-mobile">Created by king_of_coding</span>
          <span className="mx-2">•</span>
          <span data-testid="ownership-credit-mobile" className="font-medium">Owned by Omni-Science</span>
        </div>
      </div>
    </header>
  );
}
