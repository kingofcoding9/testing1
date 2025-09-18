import { Download, Save, Home, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useIsMobile } from "@/hooks/use-mobile";
import omniScienceLogo from "@assets/omni-science_1758171429429.png";

interface HeaderProps {
  currentSection: string;
  onMenuToggle?: () => void;
  isSidebarOpen?: boolean;
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
    subtitle: 'Connect with the Omni-Science Game Studio community and access professional resources'
  },
  'omni-science': {
    title: 'Omni-Science Game Studio',
    subtitle: 'Explore our game studio, team, and mission (supporting The Helping Guild)'
  }
};

export default function Header({ currentSection, onMenuToggle, isSidebarOpen }: HeaderProps) {
  const isMobile = useIsMobile();
  const sectionInfo = sectionTitles[currentSection] || sectionTitles.welcome;
  const [, setLocation] = useLocation();

  const handleLogoClick = () => {
    setLocation('/');
  };

  return (
    <header className="bg-card border-b border-border" data-testid="header">
      {/* Top row with logo and main title */}
      <div className="flex items-center justify-between p-3 sm:p-4 pb-2">
        <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
          {/* Mobile hamburger menu */}
          {isMobile && onMenuToggle && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuToggle}
              className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center mr-2"
              data-testid="mobile-menu-button"
              aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
            >
              <Menu size={20} />
            </Button>
          )}
          
          <button 
            onClick={handleLogoClick}
            className="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition-opacity cursor-pointer group flex-1 min-w-0"
            data-testid="logo-home-button"
            aria-label="Go to home page"
          >
            <img 
              src={omniScienceLogo} 
              alt="Omni-Science Logo" 
              className="h-10 w-auto sm:h-12 md:h-14 lg:h-16 transition-transform group-hover:scale-105 flex-shrink-0"
              data-testid="omni-science-logo"
            />
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground leading-tight truncate">
                Omni-Science Game Studio
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground -mt-1 truncate">
                Professional Game Development Tools
              </p>
            </div>
          </button>
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
          <Button 
            variant="secondary" 
            size="sm"
            data-testid="button-export"
            className="hidden lg:flex min-h-[44px]"
          >
            <Download className="mr-2" size={16} />
            Export Project
          </Button>
          <Button 
            variant="secondary" 
            size="sm"
            data-testid="button-export-mobile"
            className="lg:hidden min-h-[44px] min-w-[44px] p-2"
            title="Export Project"
          >
            <Download size={16} />
          </Button>
          <Button 
            size="sm"
            data-testid="button-save"
            className="min-h-[44px]"
          >
            <Save className="mr-1 sm:mr-2" size={16} />
            <span className="hidden md:inline">Save Progress</span>
            <span className="hidden sm:inline md:hidden">Save</span>
            <span className="sm:hidden sr-only">Save</span>
          </Button>
        </div>
      </div>
      
      {/* Bottom row with current section info and credits */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-3 sm:px-4 pb-3 pt-1 space-y-2 sm:space-y-0">
        <div className="flex-1 min-w-0">
          <h2 className="text-base sm:text-lg font-semibold text-foreground truncate" data-testid="page-title">
            {sectionInfo.title}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 sm:line-clamp-1" data-testid="page-subtitle">
            {sectionInfo.subtitle}
          </p>
        </div>
        
        {/* Credits - responsive layout */}
        <div className="hidden xl:flex flex-col text-right text-xs text-muted-foreground flex-shrink-0">
          <span data-testid="creator-credit">Created by king_of_coding</span>
          <span data-testid="ownership-credit" className="font-medium">Owned by Omni-Science Game Studio</span>
        </div>
        
        {/* Credits - compact for smaller screens */}
        <div className="xl:hidden flex justify-center sm:justify-end">
          <div className="text-xs text-muted-foreground text-center sm:text-right">
            <div className="flex flex-wrap justify-center sm:justify-end items-center gap-1">
              <span data-testid="creator-credit-compact">Created by king_of_coding</span>
              <span className="hidden sm:inline">•</span>
              <span data-testid="ownership-credit-compact" className="font-medium">Owned by Omni-Science Game Studio</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
