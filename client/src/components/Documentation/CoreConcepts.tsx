import { useState } from "react";
import { 
  ChevronRight, BookOpen, FileText, Code, Layers, ArrowRight, Copy, Search, 
  Package, FolderTree, Settings, Play, CheckCircle, AlertCircle, 
  Download, Upload, Zap, BookmarkPlus, Eye, Lightbulb
} from "lucide-react";
import { useCollapsible } from "@/hooks/useCollapsible";
import { CollapsibleSection, CollapsibleGroup } from "@/components/ui/collapsible-section";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import CodePreview from "@/components/Common/CodePreview";

interface CoreConceptsProps {
  onNavigate: (section: string) => void;
}

export default function CoreConcepts({ onNavigate }: CoreConceptsProps) {
  const [readingProgress, setReadingProgress] = useState(0);
  const [expandedSections, setExpandedSections] = useState<string[]>(['getting-started']);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const { toast } = useToast();
  
  // Table of contents - moved before useCollapsible to avoid hoisting issues
  const tableOfContents = [
    { 
      id: 'getting-started', 
      title: '1. Getting Started', 
      difficulty: 'beginner' as const,
      icon: Play,
      completed: false,
      description: 'Introduction to Minecraft Bedrock addon development'
    },
    { 
      id: 'addon-structure', 
      title: '2. Addon Architecture', 
      difficulty: 'beginner' as const,
      icon: FolderTree,
      completed: false,
      description: 'Understanding the file structure and organization'
    },
    { 
      id: 'behavior-vs-resource', 
      title: '3. Behavior vs Resource Packs', 
      difficulty: 'beginner' as const,
      icon: Package,
      completed: false,
      description: 'Key differences and when to use each pack type'
    },
    { 
      id: 'manifests', 
      title: '4. Manifest Files', 
      difficulty: 'beginner' as const,
      icon: FileText,
      completed: false,
      description: 'Configuration and metadata for your addons'
    },
    { 
      id: 'identifiers', 
      title: '5. Identifiers & Namespaces', 
      difficulty: 'intermediate' as const,
      icon: Code,
      completed: false,
      description: 'Proper naming conventions and conflict prevention'
    },
    { 
      id: 'components-system', 
      title: '6. Component System', 
      difficulty: 'intermediate' as const,
      icon: Layers,
      completed: false,
      description: 'How components work across entities, blocks, and items'
    },
    { 
      id: 'events-scripting', 
      title: '7. Events & Scripting', 
      difficulty: 'intermediate' as const,
      icon: Zap,
      completed: false,
      description: 'Event handling and script integration'
    },
    { 
      id: 'development-workflow', 
      title: '8. Development Workflow', 
      difficulty: 'intermediate' as const,
      icon: Settings,
      completed: false,
      description: 'Testing, debugging, and deployment strategies'
    },
    { 
      id: 'version-compatibility', 
      title: '9. Version Management', 
      difficulty: 'advanced' as const,
      icon: BookmarkPlus,
      completed: false,
      description: 'Format versions and backward compatibility'
    },
    { 
      id: 'best-practices', 
      title: '10. Best Practices', 
      difficulty: 'advanced' as const,
      icon: Lightbulb,
      completed: false,
      description: 'Performance optimization and advanced techniques'
    },
  ];

  // Enhanced collapsible functionality
  const collapsibleSections = useCollapsible({
    storageKey: 'core-concepts',
    defaultCollapsed: false,
    initialSections: tableOfContents.map(item => item.id)
  });

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const copyToClipboard = async (code: string, title: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast({
        title: "Copied to clipboard",
        description: `${title} has been copied to your clipboard.`,
      });
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const filteredContents = tableOfContents.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = selectedDifficulty === 'beginner' ? true : 
                             selectedDifficulty === 'intermediate' ? item.difficulty !== 'beginner' :
                             item.difficulty === 'advanced';
    return matchesSearch && matchesDifficulty;
  });

  const quickStartExamples = {
    manifestBehavior: `{
  "format_version": 2,
  "header": {
    "description": "My First Addon - Behavior Pack",
    "name": "My First Addon BP",
    "uuid": "12345678-1234-5678-9012-123456789012",
    "version": [1, 0, 0],
    "min_engine_version": [1, 21, 0]
  },
  "modules": [
    {
      "description": "Behavior Pack Module",
      "type": "data",
      "uuid": "87654321-4321-8765-2109-876543210987",
      "version": [1, 0, 0]
    }
  ],
  "dependencies": [
    {
      "description": "My First Addon Resource Pack",
      "uuid": "abcdefab-abcd-efab-cdef-abcdefabcdef",
      "version": [1, 0, 0]
    }
  ]
}`,
    manifestResource: `{
  "format_version": 2,
  "header": {
    "description": "My First Addon - Resource Pack",
    "name": "My First Addon RP",
    "uuid": "abcdefab-abcd-efab-cdef-abcdefabcdef",
    "version": [1, 0, 0],
    "min_engine_version": [1, 21, 0]
  },
  "modules": [
    {
      "description": "Resource Pack Module",
      "type": "resources",
      "uuid": "fedcbaef-dcba-fead-bcef-fedcbafedcba",
      "version": [1, 0, 0]
    }
  ]
}`,
    simpleEntity: `{
  "format_version": "1.21.0",
  "minecraft:entity": {
    "description": {
      "identifier": "my_addon:friendly_robot",
      "is_spawnable": true,
      "is_summonable": true,
      "is_experimental": false
    },
    "components": {
      "minecraft:health": {
        "value": 20,
        "max": 20
      },
      "minecraft:collision_box": {
        "width": 0.6,
        "height": 1.8
      },
      "minecraft:movement": {
        "value": 0.25
      },
      "minecraft:navigation.walk": {
        "can_path_over_water": false,
        "avoid_water": true
      },
      "minecraft:movement.basic": {},
      "minecraft:jump.static": {
        "jump_power": 0.42
      },
      "minecraft:physics": {},
      "minecraft:pushable": {
        "is_pushable": true,
        "is_pushable_by_piston": true
      }
    },
    "component_groups": {
      "my_addon:friendly_mode": {
        "minecraft:behavior.look_at_player": {
          "priority": 7,
          "look_distance": 6.0
        },
        "minecraft:behavior.random_stroll": {
          "priority": 6,
          "speed_multiplier": 1.0
        }
      }
    },
    "events": {
      "minecraft:entity_spawned": {
        "add": {
          "component_groups": ["my_addon:friendly_mode"]
        }
      }
    }
  }
}`,
    simpleBlock: `{
  "format_version": "1.21.0",
  "minecraft:block": {
    "description": {
      "identifier": "my_addon:custom_ore",
      "menu_category": {
        "category": "nature"
      }
    },
    "components": {
      "minecraft:destructible_by_mining": {
        "seconds_to_destroy": 3.0
      },
      "minecraft:destructible_by_explosion": {
        "explosion_resistance": 6.0
      },
      "minecraft:friction": 0.6,
      "minecraft:map_color": "#4A4A4A",
      "minecraft:material_instances": {
        "*": {
          "texture": "custom_ore",
          "render_method": "opaque"
        }
      },
      "minecraft:geometry": "minecraft:geometry.full_block"
    }
  }
}`,
    simpleItem: `{
  "format_version": "1.21.0",
  "minecraft:item": {
    "description": {
      "identifier": "my_addon:energy_crystal",
      "menu_category": {
        "category": "items"
      }
    },
    "components": {
      "minecraft:max_stack_size": 64,
      "minecraft:icon": {
        "texture": "energy_crystal"
      },
      "minecraft:display_name": {
        "value": "Energy Crystal"
      },
      "minecraft:use_animation": "bow",
      "minecraft:use_duration": 32,
      "minecraft:food": {
        "nutrition": 0,
        "saturation_modifier": 0,
        "can_always_eat": true,
        "effects": [
          {
            "name": "speed",
            "chance": 1.0,
            "duration": 300,
            "amplifier": 1
          }
        ]
      }
    }
  }
}`
  };

  return (
    <section className="p-6 max-w-7xl mx-auto" data-testid="core-concepts">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">Core Concepts</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Master the fundamentals of Minecraft: Bedrock Edition addon development
        </p>
        
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                placeholder="Search concepts and topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-concept-search"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedDifficulty === 'beginner' ? 'default' : 'outline'}
              onClick={() => setSelectedDifficulty('beginner')}
              size="sm"
              data-testid="button-difficulty-beginner"
            >
              Beginner
            </Button>
            <Button
              variant={selectedDifficulty === 'intermediate' ? 'default' : 'outline'}
              onClick={() => setSelectedDifficulty('intermediate')}
              size="sm"
              data-testid="button-difficulty-intermediate"
            >
              Intermediate
            </Button>
            <Button
              variant={selectedDifficulty === 'advanced' ? 'default' : 'outline'}
              onClick={() => setSelectedDifficulty('advanced')}
              size="sm"
              data-testid="button-difficulty-advanced"
            >
              Advanced
            </Button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Table of Contents Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <BookOpen className="mr-2" size={20} />
                Table of Contents
              </CardTitle>
              <CardDescription>
                Navigate through core concepts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {filteredContents.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleSection(item.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all hover:bg-muted ${
                      expandedSections.includes(item.id) ? 'bg-muted border-primary' : 'border-border'
                    }`}
                    data-testid={`button-section-${item.id}`}
                  >
                    <div className="flex items-start gap-3">
                      <IconComponent className="mt-0.5 flex-shrink-0" size={16} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{item.title}</span>
                          <Badge 
                            variant={item.difficulty === 'beginner' ? 'secondary' : 
                                    item.difficulty === 'intermediate' ? 'default' : 'destructive'}
                            className="text-xs"
                          >
                            {item.difficulty}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.description}
                        </p>
                      </div>
                      {item.completed && <CheckCircle className="text-green-500 flex-shrink-0" size={16} />}
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
          {/* Getting Started Section */}
          {expandedSections.includes('getting-started') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Play className="mr-2" size={20} />
                  Getting Started with Bedrock Addons
                </CardTitle>
                <CardDescription>
                  Your journey into Minecraft Bedrock addon development begins here
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="prose max-w-none">
                  <h3 className="text-xl font-semibold mb-4">What are Minecraft Bedrock Addons?</h3>
                  <p className="text-muted-foreground mb-4">
                    Minecraft Bedrock addons are powerful modification packages that allow you to customize 
                    and extend the game experience. Unlike Java Edition mods, Bedrock addons work across 
                    all platforms including mobile, console, and Windows 10.
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4 my-6">
                    <Card className="p-4">
                      <h4 className="font-semibold mb-2 flex items-center">
                        <Package className="mr-2" size={16} />
                        What You Can Create
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Custom entities with unique behaviors</li>
                        <li>• New blocks with special properties</li>
                        <li>• Custom items, tools, and weapons</li>
                        <li>• Interactive gameplay mechanics</li>
                        <li>• Custom textures and models</li>
                        <li>• Scripted behaviors and events</li>
                      </ul>
                    </Card>
                    
                    <Card className="p-4">
                      <h4 className="font-semibold mb-2 flex items-center">
                        <Settings className="mr-2" size={16} />
                        Development Tools
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Visual Studio Code (recommended)</li>
                        <li>• Blockbench for 3D models</li>
                        <li>• Bridge. addon editor</li>
                        <li>• Minecraft Education Edition</li>
                        <li>• Bedrock Dedicated Server</li>
                        <li>• This Creator Suite!</li>
                      </ul>
                    </Card>
                  </div>

                  <h3 className="text-xl font-semibold mb-4">Quick Start: Your First 5 Minutes</h3>
                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Prerequisites</h4>
                    <ul className="text-blue-800 dark:text-blue-200 text-sm space-y-1">
                      <li>• Minecraft Bedrock Edition (any platform)</li>
                      <li>• Basic understanding of JSON format</li>
                      <li>• Text editor (VS Code recommended)</li>
                      <li>• Willingness to experiment and learn!</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Addon Structure Section */}
          {expandedSections.includes('addon-structure') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FolderTree className="mr-2" size={20} />
                  Addon Architecture & File Structure
                </CardTitle>
                <CardDescription>
                  Understanding how addons are organized and structured
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="behavior-pack">Behavior Pack</TabsTrigger>
                    <TabsTrigger value="resource-pack">Resource Pack</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-4">
                    <h3 className="text-xl font-semibold">Complete Addon Structure</h3>
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg font-mono text-sm">
                      <div className="space-y-1">
                        <div>📁 My_Awesome_Addon/</div>
                        <div className="ml-4">📁 behavior_packs/</div>
                        <div className="ml-8">📁 My_Awesome_Addon_BP/</div>
                        <div className="ml-12">📄 manifest.json</div>
                        <div className="ml-12">📁 entities/</div>
                        <div className="ml-16">📄 custom_mob.json</div>
                        <div className="ml-12">📁 blocks/</div>
                        <div className="ml-16">📄 custom_block.json</div>
                        <div className="ml-12">📁 items/</div>
                        <div className="ml-16">📄 custom_item.json</div>
                        <div className="ml-12">📁 scripts/</div>
                        <div className="ml-16">📄 main.js</div>
                        <div className="ml-12">📁 spawn_rules/</div>
                        <div className="ml-12">📁 loot_tables/</div>
                        <div className="ml-12">📁 recipes/</div>
                        <div className="ml-4">📁 resource_packs/</div>
                        <div className="ml-8">📁 My_Awesome_Addon_RP/</div>
                        <div className="ml-12">📄 manifest.json</div>
                        <div className="ml-12">📁 textures/</div>
                        <div className="ml-16">📁 entity/</div>
                        <div className="ml-16">📁 blocks/</div>
                        <div className="ml-16">📁 items/</div>
                        <div className="ml-12">📁 models/</div>
                        <div className="ml-16">📁 entity/</div>
                        <div className="ml-12">📁 sounds/</div>
                        <div className="ml-12">📁 animations/</div>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <Card className="p-4">
                        <h4 className="font-semibold mb-2 text-blue-600 dark:text-blue-400">Behavior Pack (BP)</h4>
                        <p className="text-sm text-muted-foreground mb-3">Defines HOW things work</p>
                        <ul className="text-sm space-y-1">
                          <li>• Entity behaviors and AI</li>
                          <li>• Block functionality</li>
                          <li>• Item mechanics</li>
                          <li>• Game logic and scripts</li>
                          <li>• Spawn rules and loot tables</li>
                        </ul>
                      </Card>
                      
                      <Card className="p-4">
                        <h4 className="font-semibold mb-2 text-green-600 dark:text-green-400">Resource Pack (RP)</h4>
                        <p className="text-sm text-muted-foreground mb-3">Defines HOW things look and sound</p>
                        <ul className="text-sm space-y-1">
                          <li>• Textures and materials</li>
                          <li>• 3D models and animations</li>
                          <li>• Sounds and music</li>
                          <li>• UI elements</li>
                          <li>• Visual effects</li>
                        </ul>
                      </Card>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="behavior-pack" className="space-y-4">
                    <h3 className="text-xl font-semibold">Behavior Pack Deep Dive</h3>
                    <p className="text-muted-foreground">
                      The behavior pack controls all the functional aspects of your addon - the game logic, 
                      mechanics, and how entities, blocks, and items behave.
                    </p>
                    
                    <Accordion type="multiple" className="w-full">
                      <AccordionItem value="entities">
                        <AccordionTrigger>entities/ - Custom Mob Definitions</AccordionTrigger>
                        <AccordionContent>
                          <p className="mb-3">Define custom entities with components, behaviors, and events.</p>
                          <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded text-sm">
                            <strong>Example files:</strong><br/>
                            • friendly_robot.json - Custom friendly NPC<br/>
                            • fire_dragon.json - Boss mob with special abilities<br/>
                            • magic_sheep.json - Modified vanilla mob
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="blocks">
                        <AccordionTrigger>blocks/ - Custom Block Behaviors</AccordionTrigger>
                        <AccordionContent>
                          <p className="mb-3">Define how custom blocks function, their properties, and interactions.</p>
                          <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded text-sm">
                            <strong>Key features:</strong><br/>
                            • Destructibility and hardness<br/>
                            • Material properties<br/>
                            • Custom geometry and collision<br/>
                            • Block states and transitions
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="scripts">
                        <AccordionTrigger>scripts/ - TypeScript/JavaScript Logic</AccordionTrigger>
                        <AccordionContent>
                          <p className="mb-3">Advanced scripting for complex behaviors and game mechanics.</p>
                          <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded text-sm">
                            <strong>Script capabilities:</strong><br/>
                            • Event handling and custom events<br/>
                            • Player interaction systems<br/>
                            • World manipulation<br/>
                            • UI creation and management<br/>
                            • Complex game mechanics
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </TabsContent>
                  
                  <TabsContent value="resource-pack" className="space-y-4">
                    <h3 className="text-xl font-semibold">Resource Pack Deep Dive</h3>
                    <p className="text-muted-foreground">
                      The resource pack provides all visual and audio assets that make your addon come to life.
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <Card className="p-4">
                        <h4 className="font-semibold mb-2">Visual Assets</h4>
                        <ul className="text-sm space-y-1">
                          <li>• <strong>textures/</strong> - PNG images for entities, blocks, items</li>
                          <li>• <strong>models/</strong> - 3D geometry files (.geo.json)</li>
                          <li>• <strong>animations/</strong> - Movement and state animations</li>
                          <li>• <strong>ui/</strong> - Interface elements and HUD</li>
                        </ul>
                      </Card>
                      
                      <Card className="p-4">
                        <h4 className="font-semibold mb-2">Audio Assets</h4>
                        <ul className="text-sm space-y-1">
                          <li>• <strong>sounds/</strong> - WAV/OGG sound effects</li>
                          <li>• <strong>music/</strong> - Background music tracks</li>
                          <li>• <strong>sound_definitions.json</strong> - Audio mapping</li>
                        </ul>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* Behavior vs Resource Packs */}
          {expandedSections.includes('behavior-vs-resource') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="mr-2" size={20} />
                  Behavior vs Resource Packs
                </CardTitle>
                <CardDescription>
                  Understanding the key differences and when to use each type
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="border-blue-200 dark:border-blue-800">
                    <CardHeader className="bg-blue-50 dark:bg-blue-950/30">
                      <CardTitle className="text-blue-900 dark:text-blue-100 flex items-center">
                        <Code className="mr-2" size={20} />
                        Behavior Pack
                      </CardTitle>
                      <CardDescription className="text-blue-700 dark:text-blue-300">
                        The "brain" of your addon - defines functionality
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <h4 className="font-semibold mb-3">What it contains:</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center"><CheckCircle className="mr-2 text-green-500" size={16} /> Entity behaviors and AI</li>
                        <li className="flex items-center"><CheckCircle className="mr-2 text-green-500" size={16} /> Block functionality</li>
                        <li className="flex items-center"><CheckCircle className="mr-2 text-green-500" size={16} /> Item mechanics</li>
                        <li className="flex items-center"><CheckCircle className="mr-2 text-green-500" size={16} /> Scripting logic</li>
                        <li className="flex items-center"><CheckCircle className="mr-2 text-green-500" size={16} /> Loot tables & recipes</li>
                        <li className="flex items-center"><CheckCircle className="mr-2 text-green-500" size={16} /> Spawn rules</li>
                      </ul>
                      
                      <h4 className="font-semibold mt-4 mb-2">File extensions:</h4>
                      <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded text-xs font-mono">
                        .json (entities, blocks, items)<br/>
                        .js/.ts (scripts)<br/>
                        .mcfunction (functions)
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-green-200 dark:border-green-800">
                    <CardHeader className="bg-green-50 dark:bg-green-950/30">
                      <CardTitle className="text-green-900 dark:text-green-100 flex items-center">
                        <Eye className="mr-2" size={20} />
                        Resource Pack
                      </CardTitle>
                      <CardDescription className="text-green-700 dark:text-green-300">
                        The "appearance" of your addon - defines visuals and audio
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <h4 className="font-semibold mb-3">What it contains:</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center"><CheckCircle className="mr-2 text-green-500" size={16} /> Textures (PNG images)</li>
                        <li className="flex items-center"><CheckCircle className="mr-2 text-green-500" size={16} /> 3D models and geometry</li>
                        <li className="flex items-center"><CheckCircle className="mr-2 text-green-500" size={16} /> Animations</li>
                        <li className="flex items-center"><CheckCircle className="mr-2 text-green-500" size={16} /> Sound effects</li>
                        <li className="flex items-center"><CheckCircle className="mr-2 text-green-500" size={16} /> UI elements</li>
                        <li className="flex items-center"><CheckCircle className="mr-2 text-green-500" size={16} /> Particle effects</li>
                      </ul>
                      
                      <h4 className="font-semibold mt-4 mb-2">File extensions:</h4>
                      <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded text-xs font-mono">
                        .png (textures)<br/>
                        .geo.json (models)<br/>
                        .animation.json (animations)<br/>
                        .wav/.ogg (sounds)
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2 flex items-center">
                    <Lightbulb className="mr-2" size={16} />
                    Pro Tip: Pack Dependencies
                  </h4>
                  <p className="text-amber-800 dark:text-amber-200 text-sm">
                    Most addons use BOTH pack types. The behavior pack references resources from the resource pack, 
                    and they're linked together through the manifest dependencies. You can distribute them separately 
                    or bundle them together.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Manifest Files */}
          {expandedSections.includes('manifests') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2" size={20} />
                  Manifest Files
                </CardTitle>
                <CardDescription>
                  Configuration and metadata that define your addon
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="prose max-w-none">
                  <p className="text-muted-foreground">
                    The manifest.json file is the heart of every addon pack. It tells Minecraft what your 
                    addon is, what it does, and how it should be loaded.
                  </p>
                </div>
                
                <Tabs defaultValue="behavior" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="behavior">Behavior Pack</TabsTrigger>
                    <TabsTrigger value="resource">Resource Pack</TabsTrigger>
                    <TabsTrigger value="explained">Field Explanations</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="behavior" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Behavior Pack Manifest</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(quickStartExamples.manifestBehavior, "Behavior Pack Manifest")}
                        data-testid="button-copy-manifest-behavior"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                    <CodePreview
                      code={quickStartExamples.manifestBehavior}
                      language="json"
                      title="manifest.json (Behavior Pack)"
                    />
                  </TabsContent>
                  
                  <TabsContent value="resource" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Resource Pack Manifest</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(quickStartExamples.manifestResource, "Resource Pack Manifest")}
                        data-testid="button-copy-manifest-resource"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                    <CodePreview
                      code={quickStartExamples.manifestResource}
                      language="json"
                      title="manifest.json (Resource Pack)"
                    />
                  </TabsContent>
                  
                  <TabsContent value="explained" className="space-y-4">
                    <h3 className="text-lg font-semibold">Manifest Field Explanations</h3>
                    
                    <Accordion type="multiple" className="w-full">
                      <AccordionItem value="format-version">
                        <AccordionTrigger>format_version</AccordionTrigger>
                        <AccordionContent>
                          <p className="mb-2">Specifies the manifest format version. Always use <code>2</code> for modern addons.</p>
                          <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded text-sm">
                            <strong>Current version:</strong> 2<br/>
                            <strong>Legacy version:</strong> 1 (deprecated)
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="header">
                        <AccordionTrigger>header</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-3">
                            <p>Contains basic information about your addon:</p>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                              <li><strong>name:</strong> Display name (shown in-game)</li>
                              <li><strong>description:</strong> Brief description of the addon</li>
                              <li><strong>uuid:</strong> Unique identifier (generate with online tools)</li>
                              <li><strong>version:</strong> Version array [major, minor, patch]</li>
                              <li><strong>min_engine_version:</strong> Minimum Minecraft version required</li>
                            </ul>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="modules">
                        <AccordionTrigger>modules</AccordionTrigger>
                        <AccordionContent>
                          <p className="mb-3">Defines what type of content this pack contains:</p>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded">
                              <strong className="text-blue-900 dark:text-blue-100">data</strong><br/>
                              <span className="text-blue-700 dark:text-blue-300">Behavior pack content</span>
                            </div>
                            <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded">
                              <strong className="text-green-900 dark:text-green-100">resources</strong><br/>
                              <span className="text-green-700 dark:text-green-300">Resource pack content</span>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="dependencies">
                        <AccordionTrigger>dependencies (optional)</AccordionTrigger>
                        <AccordionContent>
                          <p className="mb-2">Links this pack to other required packs. Commonly used to link behavior and resource packs together.</p>
                          <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded text-sm">
                            Each dependency needs:<br/>
                            • uuid of the required pack<br/>
                            • version of the required pack
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* Quick Start Examples */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="mr-2" size={20} />
                Quick Start Examples
              </CardTitle>
              <CardDescription>
                Ready-to-use examples to get you started immediately
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="entity" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="entity">Simple Entity</TabsTrigger>
                  <TabsTrigger value="block">Custom Block</TabsTrigger>
                  <TabsTrigger value="item">Magic Item</TabsTrigger>
                </TabsList>
                
                <TabsContent value="entity" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Friendly Robot Entity</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(quickStartExamples.simpleEntity, "Friendly Robot Entity")}
                      data-testid="button-copy-entity"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    A simple friendly entity that walks around and looks at players. Save as 
                    <code>behavior_packs/YourAddon/entities/friendly_robot.json</code>
                  </p>
                  <CodePreview
                    code={quickStartExamples.simpleEntity}
                    language="json"
                    title="entities/friendly_robot.json"
                  />
                </TabsContent>
                
                <TabsContent value="block" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Custom Ore Block</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(quickStartExamples.simpleBlock, "Custom Ore Block")}
                      data-testid="button-copy-block"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    A basic custom block with mining properties. Save as 
                    <code>behavior_packs/YourAddon/blocks/custom_ore.json</code>
                  </p>
                  <CodePreview
                    code={quickStartExamples.simpleBlock}
                    language="json"
                    title="blocks/custom_ore.json"
                  />
                </TabsContent>
                
                <TabsContent value="item" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Energy Crystal Item</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(quickStartExamples.simpleItem, "Energy Crystal Item")}
                      data-testid="button-copy-item"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    A consumable item that gives speed effect. Save as 
                    <code>behavior_packs/YourAddon/items/energy_crystal.json</code>
                  </p>
                  <CodePreview
                    code={quickStartExamples.simpleItem}
                    language="json"
                    title="items/energy_crystal.json"
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-4 text-blue-900 dark:text-blue-100">Ready for the Next Step?</h3>
              <p className="text-blue-800 dark:text-blue-200 mb-4">
                Now that you understand the core concepts, dive deeper into specific areas:
              </p>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  className="h-auto p-4 flex-col items-start text-left"
                  onClick={() => onNavigate('entities')}
                  data-testid="button-navigate-entities"
                >
                  <Layers className="mb-2" size={20} />
                  <div>
                    <div className="font-semibold">Entities</div>
                    <div className="text-xs text-muted-foreground">50+ components</div>
                  </div>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-auto p-4 flex-col items-start text-left"
                  onClick={() => onNavigate('blocks')}
                  data-testid="button-navigate-blocks"
                >
                  <Package className="mb-2" size={20} />
                  <div>
                    <div className="font-semibold">Blocks</div>
                    <div className="text-xs text-muted-foreground">25+ components</div>
                  </div>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-auto p-4 flex-col items-start text-left"
                  onClick={() => onNavigate('items')}
                  data-testid="button-navigate-items"
                >
                  <Package className="mb-2" size={20} />
                  <div>
                    <div className="font-semibold">Items</div>
                    <div className="text-xs text-muted-foreground">25+ components</div>
                  </div>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-auto p-4 flex-col items-start text-left"
                  onClick={() => onNavigate('scripting')}
                  data-testid="button-navigate-scripting"
                >
                  <Code className="mb-2" size={20} />
                  <div>
                    <div className="font-semibold">Scripting</div>
                    <div className="text-xs text-muted-foreground">476+ APIs</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}