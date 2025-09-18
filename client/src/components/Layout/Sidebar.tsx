import { BookOpen, Box, Crown, Eye, Gem, Hammer, Mountain, MapPin, Shovel, PaintbrushVertical, Terminal, Archive, CheckCircle, Home, GraduationCap, Rocket } from "lucide-react";

interface SidebarProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({ currentSection, onSectionChange, collapsed, onToggleCollapse }: SidebarProps) {
  const navSections = [
    {
      title: "Getting Started",
      items: [
        { id: 'welcome', icon: Home, label: 'Welcome' },
        { id: 'tutorial', icon: GraduationCap, label: 'Interactive Tutorial' },
        { id: 'quick-start', icon: Rocket, label: 'Quick Start Guide' },
      ]
    },
    {
      title: "Documentation", 
      items: [
        { id: 'docs-concepts', icon: BookOpen, label: 'Core Concepts' },
        { id: 'docs-entities', icon: Crown, label: 'Entities' },
        { id: 'docs-blocks', icon: Box, label: 'Blocks' },
        { id: 'docs-items', icon: Gem, label: 'Items' },
        { id: 'docs-scripting', icon: Terminal, label: 'Scripting APIs' },
      ]
    },
    {
      title: "Builders",
      items: [
        { id: 'builder-entity', icon: Crown, label: 'Entity Builder' },
        { id: 'builder-client-entity', icon: Eye, label: 'Client Entity' },
        { id: 'builder-block', icon: Box, label: 'Block Builder' },
        { id: 'builder-item', icon: Gem, label: 'Item Builder' },
        { id: 'builder-recipe', icon: Hammer, label: 'Recipe Builder' },
        { id: 'builder-loot', icon: Shovel, label: 'Loot Tables' },
        { id: 'builder-biome', icon: Mountain, label: 'Biome Builder' },
        { id: 'builder-spawn', icon: MapPin, label: 'Spawn Rules' },
      ]
    },
    {
      title: "Tools",
      items: [
        { id: 'texture-creator', icon: PaintbrushVertical, label: 'Texture Creator' },
        { id: 'script-studio', icon: Terminal, label: 'Script Studio' },
        { id: 'addon-packager', icon: Archive, label: 'Addon Packager' },
        { id: 'validator', icon: CheckCircle, label: 'JSON Validator' },
      ]
    }
  ];

  return (
    <aside 
      className={`bg-card border-r border-border flex-shrink-0 transition-all duration-300 ${
        collapsed ? 'sidebar-collapsed' : 'w-64'
      }`}
      data-testid="sidebar"
    >
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Box className="text-primary-foreground text-sm" size={16} />
            </div>
            {!collapsed && (
              <div className="nav-text">
                <h1 className="text-lg font-bold text-foreground">Creator Suite</h1>
                <p className="text-xs text-muted-foreground">Minecraft Bedrock</p>
              </div>
            )}
          </div>
          <button 
            onClick={onToggleCollapse}
            className="p-1 hover:bg-secondary rounded-md transition-colors"
            data-testid="sidebar-toggle"
          >
            <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      <nav className="p-2 flex-1 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.title} className="mb-4">
            {!collapsed && (
              <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider nav-text">
                {section.title}
              </h3>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      className={`nav-item w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left ${
                        currentSection === item.id ? 'active' : ''
                      }`}
                      onClick={() => onSectionChange(item.id)}
                      data-testid={`nav-${item.id}`}
                    >
                      <Icon size={16} className="w-5" />
                      {!collapsed && <span className="nav-text">{item.label}</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
