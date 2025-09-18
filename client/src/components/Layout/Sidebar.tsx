import { ChevronDown, ChevronRight, Minimize2, Maximize2, Box, Home } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect } from "react";
import { useCollapsible } from "@/hooks/useCollapsible";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";
import { getIconPath, type IconName } from "@/assets/icons";

interface SidebarProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({ currentSection, onSectionChange, collapsed, onToggleCollapse }: SidebarProps) {
  const isMobile = useIsMobile();

  // Auto-collapse sidebar on mobile mount
  useEffect(() => {
    if (isMobile && !collapsed) {
      onToggleCollapse();
    }
  }, [isMobile]);

  // Collapsible state for navigation sections
  const sectionNames = ['getting-started', 'documentation', 'builders', 'tools', 'community'];
  const navCollapsible = useCollapsible({
    storageKey: 'sidebar-sections',
    defaultCollapsed: false,
    initialSections: sectionNames
  });

  const handleSectionChange = (section: string) => {
    onSectionChange(section);
    // Auto-close sidebar on mobile after navigation
    if (isMobile && !collapsed) {
      onToggleCollapse();
    }
  };
  const navSections = [
    {
      title: "Getting Started",
      items: [
        { id: 'welcome', icon: 'omniScience', label: 'Welcome' },
        { id: 'tutorial', icon: 'documentation', label: 'Interactive Tutorial' },
        { id: 'quick-start', icon: 'documentation', label: 'Quick Start Guide' },
      ]
    },
    {
      title: "Documentation", 
      items: [
        { id: 'docs-concepts', icon: 'coreConcepts', label: 'Core Concepts' },
        { id: 'docs-entities', icon: 'entityBuilder', label: 'Entities' },
        { id: 'docs-blocks', icon: 'blockBuilder', label: 'Blocks' },
        { id: 'docs-items', icon: 'itemBuilder', label: 'Items' },
        { id: 'docs-scripting', icon: 'scriptStudio', label: 'Scripting APIs' },
      ]
    },
    {
      title: "Builders",
      items: [
        { id: 'builder-entity', icon: 'entityBuilder', label: 'Entity Builder' },
        { id: 'builder-client-entity', icon: 'entityBuilder', label: 'Client Entity' },
        { id: 'builder-block', icon: 'blockBuilder', label: 'Block Builder' },
        { id: 'builder-item', icon: 'itemBuilder', label: 'Item Builder' },
        { id: 'builder-recipe', icon: 'recipeBuilder', label: 'Recipe Builder' },
        { id: 'builder-loot', icon: 'lootBuilder', label: 'Loot Tables' },
        { id: 'builder-biome', icon: 'biomeBuilder', label: 'Biome Builder' },
        { id: 'builder-spawn', icon: 'spawnBuilder', label: 'Spawn Rules' },
      ]
    },
    {
      title: "Tools",
      items: [
        { id: 'script-studio', icon: 'scriptStudio', label: 'Script Studio' },
        { id: 'addon-packager', icon: 'addonPackager', label: 'Addon Packager' },
        { id: 'validator', icon: 'validator', label: 'JSON Validator' },
        { id: 'external-tools', icon: 'externalTools', label: 'External Tools' },
      ]
    },
    {
      title: "Community",
      items: [
        { id: 'community', icon: 'community', label: 'Community Hub' },
        { id: 'omni-science', icon: 'omniScience', label: 'Omni-Science' },
      ]
    }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && !collapsed && (
        <div 
          className="sidebar-overlay open"
          onClick={onToggleCollapse}
          data-testid="sidebar-overlay"
        />
      )}
      
      <aside 
        className={`bg-card border-r border-border flex-shrink-0 transition-all duration-300 h-screen flex flex-col ${
          isMobile 
            ? `sidebar-mobile ${!collapsed ? 'open' : ''}` 
            : collapsed 
            ? 'sidebar-collapsed' 
            : 'w-64'
        }`}
        data-testid="sidebar"
      >
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Icon 
                name={getIconPath('omniScience')} 
                size="sm"
                className="brightness-0 invert"
              />
            </div>
            {(!collapsed || isMobile) && (
              <div className="nav-text">
                <h1 className="text-base sm:text-lg font-bold text-foreground">Creator Suite</h1>
                <p className="text-xs text-muted-foreground">Minecraft Bedrock</p>
              </div>
            )}
          </div>
          {!isMobile && (
            <button 
              onClick={onToggleCollapse}
              className="p-2 hover:bg-secondary rounded-md transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              data-testid="sidebar-toggle"
              aria-label="Toggle sidebar"
            >
              <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <nav className="p-2 flex-1 overflow-y-auto">
        <TooltipProvider>
          {/* Global collapse/expand controls */}
          {(!collapsed || isMobile) && (
            <div className="flex items-center justify-between mb-4 px-2">
              <span className="text-xs text-muted-foreground">
                Navigation Sections
              </span>
              <div className="flex gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={navCollapsible.expandAll}
                      disabled={navCollapsible.getCollapsedCount() === 0}
                      className="h-6 w-6 p-0"
                      data-testid="sidebar-expand-all"
                    >
                      <Maximize2 className="w-3 h-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Expand all sections</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={navCollapsible.collapseAll}
                      disabled={navCollapsible.getExpandedCount() === 0}
                      className="h-6 w-6 p-0"
                      data-testid="sidebar-collapse-all"
                    >
                      <Minimize2 className="w-3 h-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Collapse all sections</TooltipContent>
                </Tooltip>
              </div>
            </div>
          )}

          {navSections.map((section, index) => {
            const sectionId = sectionNames[index];
            const isCollapsed = navCollapsible.isCollapsed(sectionId);
            
            return (
              <div key={section.title} className="mb-2">
                <CollapsibleSection
                  id={sectionId}
                  title={section.title}
                  badge={section.items.length}
                  collapsed={isCollapsed}
                  onToggle={(collapsed) => navCollapsible.setSection(sectionId, collapsed)}
                  className="rounded-md border border-transparent hover:border-border/50 transition-colors"
                  triggerClassName={`hover:bg-muted/50 ${(!collapsed || isMobile) ? "block" : "hidden"}`}
                  showChevron={!collapsed || isMobile}
                  data-testid={`nav-section-${sectionId}`}
                >
                  <ul className="space-y-1">
                    {section.items.map((item) => {
                      return (
                        <li key={item.id}>
                          <button
                            className={`nav-item w-full flex items-center space-x-3 px-3 py-3 sm:py-2 rounded-md text-left min-h-[44px] text-sm sm:text-base ${
                              currentSection === item.id ? 'active' : ''
                            }`}
                            onClick={() => handleSectionChange(item.id)}
                            data-testid={`nav-${item.id}`}
                          >
                            <Icon 
                              name={getIconPath(item.icon as IconName)} 
                              size="sm"
                              className="w-5 flex-shrink-0"
                            />
                            {(!collapsed || isMobile) && <span className="nav-text">{item.label}</span>}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </CollapsibleSection>
              </div>
            );
          })}
        </TooltipProvider>
      </nav>
    </aside>
    </>
  );
}
