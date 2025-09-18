import { useState } from "react";
import { 
  Search, Box, Copy, ExternalLink, Filter, BookOpen, Layers, 
  Settings, Shield, Zap, Eye, Hammer, Pickaxe, Mountain,
  Grid3X3, Palette, Cog, Target, ChevronRight,
  CheckCircle, AlertTriangle, Info, Lightbulb, Play,
  Clock, Activity, BarChart3, Wrench, Building2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import CodePreview from "@/components/Common/CodePreview";
import { blockComponents, BlockComponent } from "../../../../shared/blockRegistry";

interface BlockDocsProps {
  onNavigate?: (section: string) => void;
}

export default function BlockDocs({ onNavigate }: BlockDocsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedComponent, setSelectedComponent] = useState<BlockComponent | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stabilityFilter, setStabilityFilter] = useState<'all' | 'stable' | 'experimental' | 'beta'>('all');
  const [selectedTutorial, setSelectedTutorial] = useState<string>('basic-block');
  const { toast } = useToast();

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

  // Filter components based on search and filters
  const filteredComponents = blockComponents.filter(component => {
    const matchesSearch = searchTerm === '' || 
      component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      component.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      component.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDifficulty = difficultyFilter === 'all' || component.difficulty === difficultyFilter;
    const matchesCategory = categoryFilter === 'all' || component.category === categoryFilter;
    const matchesStability = stabilityFilter === 'all' || component.stability === stabilityFilter;
    
    return matchesSearch && matchesDifficulty && matchesCategory && matchesStability;
  });

  // Group components by category
  const componentsByCategory = filteredComponents.reduce((acc, component) => {
    const category = component.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(component);
    return acc;
  }, {} as Record<string, BlockComponent[]>);

  // Get unique categories for filter
  const categories = [...new Set(blockComponents.map(c => c.category))];
  
  // Category icons mapping
  const categoryIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
    'Core': Box,
    'Physics': Zap,
    'Rendering': Eye,
    'Mining': Pickaxe,
    'Collision': Shield,
    'Material': Palette,
    'Geometry': Grid3X3,
    'State': Settings,
    'Interaction': Target,
    'Redstone': Activity,
    'Utility': Wrench
  };

  // Tutorial examples
  const tutorials = {
    'basic-block': {
      title: 'Basic Custom Block',
      description: 'Create a simple block with custom properties',
      difficulty: 'beginner' as const,
      estimatedTime: '5 minutes',
      components: ['minecraft:destructible_by_mining', 'minecraft:destructible_by_explosion', 'minecraft:friction'],
      code: `{
  "format_version": "1.21.0",
  "minecraft:block": {
    "description": {
      "identifier": "my_addon:custom_stone",
      "menu_category": {
        "category": "construction"
      }
    },
    "components": {
      "minecraft:destructible_by_mining": {
        "seconds_to_destroy": 2.5
      },
      "minecraft:destructible_by_explosion": {
        "explosion_resistance": 6.0
      },
      "minecraft:friction": 0.6,
      "minecraft:map_color": "#7F7F7F",
      "minecraft:material_instances": {
        "*": {
          "texture": "custom_stone",
          "render_method": "opaque"
        }
      }
    }
  }
}`
    },
    'custom-geometry': {
      title: 'Custom Shape Block',
      description: 'Create a block with custom 3D geometry and collision',
      difficulty: 'intermediate' as const,
      estimatedTime: '15 minutes',
      components: ['minecraft:geometry', 'minecraft:collision_box', 'minecraft:selection_box'],
      code: `{
  "format_version": "1.21.0",
  "minecraft:block": {
    "description": {
      "identifier": "my_addon:custom_pillar",
      "menu_category": {
        "category": "construction"
      }
    },
    "components": {
      "minecraft:geometry": "minecraft:geometry.custom_pillar",
      "minecraft:material_instances": {
        "*": {
          "texture": "custom_pillar",
          "render_method": "opaque"
        },
        "up": {
          "texture": "custom_pillar_top",
          "render_method": "opaque"
        },
        "down": {
          "texture": "custom_pillar_top",
          "render_method": "opaque"
        }
      },
      "minecraft:collision_box": {
        "origin": [-4, 0, -4],
        "size": [8, 16, 8]
      },
      "minecraft:selection_box": {
        "origin": [-4, 0, -4],
        "size": [8, 16, 8]
      },
      "minecraft:destructible_by_mining": {
        "seconds_to_destroy": 3.0
      },
      "minecraft:destructible_by_explosion": {
        "explosion_resistance": 8.0
      }
    }
  }
}`
    },
    'interactive-block': {
      title: 'Interactive Block with States',
      description: 'Create a block that changes state when interacted with',
      difficulty: 'advanced' as const,
      estimatedTime: '30 minutes',
      components: ['minecraft:on_interact', 'minecraft:block_light_emission', 'minecraft:permutations'],
      code: `{
  "format_version": "1.21.0",
  "minecraft:block": {
    "description": {
      "identifier": "my_addon:magic_lamp",
      "menu_category": {
        "category": "items"
      },
      "states": {
        "my_addon:lit": [false, true]
      }
    },
    "components": {
      "minecraft:destructible_by_mining": {
        "seconds_to_destroy": 1.0
      },
      "minecraft:geometry": "minecraft:geometry.lamp",
      "minecraft:material_instances": {
        "*": {
          "texture": "magic_lamp_off",
          "render_method": "alpha_test"
        }
      },
      "minecraft:on_interact": {
        "event": "my_addon:toggle_light"
      }
    },
    "permutations": [
      {
        "condition": "q.block_state('my_addon:lit') == true",
        "components": {
          "minecraft:block_light_emission": 15,
          "minecraft:material_instances": {
            "*": {
              "texture": "magic_lamp_on",
              "render_method": "alpha_test"
            }
          }
        }
      }
    ],
    "events": {
      "my_addon:toggle_light": {
        "set_block_state": {
          "my_addon:lit": "!q.block_state('my_addon:lit')"
        }
      }
    }
  }
}`
    },
    'multiface-block': {
      title: 'Multi-Face Block',
      description: 'Create a block with different textures on each face',
      difficulty: 'intermediate' as const,
      estimatedTime: '20 minutes',
      components: ['minecraft:material_instances', 'minecraft:unit_cube'],
      code: `{
  "format_version": "1.21.0",
  "minecraft:block": {
    "description": {
      "identifier": "my_addon:crate",
      "menu_category": {
        "category": "construction"
      }
    },
    "components": {
      "minecraft:unit_cube": {},
      "minecraft:material_instances": {
        "*": {
          "texture": "crate_side",
          "render_method": "opaque"
        },
        "up": {
          "texture": "crate_top",
          "render_method": "opaque"
        },
        "down": {
          "texture": "crate_bottom",
          "render_method": "opaque"
        },
        "north": {
          "texture": "crate_front",
          "render_method": "opaque"
        }
      },
      "minecraft:destructible_by_mining": {
        "seconds_to_destroy": 2.0
      },
      "minecraft:destructible_by_explosion": {
        "explosion_resistance": 4.0
      },
      "minecraft:flammable": {
        "catch_chance_modifier": 5,
        "destroy_chance_modifier": 20
      }
    }
  }
}`
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 dark:text-green-400';
      case 'intermediate': return 'text-yellow-600 dark:text-yellow-400';
      case 'advanced': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStabilityColor = (stability: string) => {
    switch (stability) {
      case 'stable': return 'text-green-600 dark:text-green-400';
      case 'experimental': return 'text-orange-600 dark:text-orange-400';
      case 'beta': return 'text-blue-600 dark:text-blue-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const blockPatterns = [
    {
      title: 'Decorative Blocks',
      description: 'Blocks primarily for visual appeal and building',
      icon: Palette,
      components: ['minecraft:material_instances', 'minecraft:geometry', 'minecraft:map_color'],
      usage: 'Perfect for architectural details and themed builds'
    },
    {
      title: 'Functional Blocks',
      description: 'Blocks that serve specific gameplay purposes',
      icon: Cog,
      components: ['minecraft:on_interact', 'minecraft:inventory', 'minecraft:redstone'],
      usage: 'Crafting stations, storage, or utility blocks'
    },
    {
      title: 'Natural Blocks',
      description: 'Blocks that fit into world generation',
      icon: Mountain,
      components: ['minecraft:destructible_by_mining', 'minecraft:loot', 'minecraft:placement_filter'],
      usage: 'Ores, stones, and environmental blocks'
    },
    {
      title: 'Technical Blocks',
      description: 'Blocks for redstone and automation',
      icon: Activity,
      components: ['minecraft:redstone', 'minecraft:block_light_emission', 'minecraft:ticking'],
      usage: 'Redstone components and automation systems'
    }
  ];

  return (
    <section className="p-6 max-w-7xl mx-auto" data-testid="block-docs">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">Block Documentation</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Complete guide to creating custom blocks in Minecraft: Bedrock Edition
        </p>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Components</p>
                <p className="text-2xl font-bold">{blockComponents.length}</p>
              </div>
              <Box className="h-8 w-8 text-blue-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold">{categories.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-green-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Stable</p>
                <p className="text-2xl font-bold">
                  {blockComponents.filter(c => c.stability === 'stable').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Experimental</p>
                <p className="text-2xl font-bold">
                  {blockComponents.filter(c => c.stability === 'experimental').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="components" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
          <TabsTrigger value="patterns">Block Patterns</TabsTrigger>
          <TabsTrigger value="best-practices">Best Practices</TabsTrigger>
        </TabsList>

        {/* Components Tab */}
        <TabsContent value="components" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                    <Input
                      placeholder="Search components, keywords, or descriptions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                      data-testid="input-component-search"
                    />
                  </div>
                </div>
                
                <Select value={difficultyFilter} onValueChange={(value: any) => setDifficultyFilter(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Difficulties</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={stabilityFilter} onValueChange={(value: any) => setStabilityFilter(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Stability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stability</SelectItem>
                    <SelectItem value="stable">Stable</SelectItem>
                    <SelectItem value="experimental">Experimental</SelectItem>
                    <SelectItem value="beta">Beta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {(searchTerm || difficultyFilter !== 'all' || categoryFilter !== 'all' || stabilityFilter !== 'all') && (
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Showing {filteredComponents.length} of {blockComponents.length} components
                  </span>
                  {filteredComponents.length < blockComponents.length && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchTerm('');
                        setDifficultyFilter('all');
                        setCategoryFilter('all');
                        setStabilityFilter('all');
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Component Browser */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Block Components</CardTitle>
                  <CardDescription>
                    Browse through all available block components and their properties
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="multiple" className="space-y-2">
                    {Object.entries(componentsByCategory).map(([category, components]) => {
                      const IconComponent = categoryIcons[category] || Box;
                      return (
                        <AccordionItem key={category} value={category} className="border rounded-lg">
                          <AccordionTrigger className="px-4 hover:bg-muted">
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-2">
                                <IconComponent size={16} />
                                <span className="font-medium">{category}</span>
                              </div>
                              <Badge variant="secondary">{components.length}</Badge>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4">
                            <div className="space-y-2">
                              {components.map((component) => (
                                <div
                                  key={component.name}
                                  className="p-3 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                                  onClick={() => setSelectedComponent(component)}
                                  data-testid={`component-${component.name.replace('minecraft:', '').replace(':', '-')}`}
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-mono text-sm text-primary">{component.name}</h4>
                                        <Badge 
                                          variant={component.difficulty === 'beginner' ? 'secondary' : 
                                                  component.difficulty === 'intermediate' ? 'default' : 'destructive'}
                                          className="text-xs"
                                        >
                                          {component.difficulty}
                                        </Badge>
                                        <Badge 
                                          variant="outline" 
                                          className={`text-xs ${getStabilityColor(component.stability)}`}
                                        >
                                          {component.stability}
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-muted-foreground">{component.description}</p>
                                      {component.version && (
                                        <Badge variant="outline" className="mt-2 text-xs">
                                          Since {component.version}
                                        </Badge>
                                      )}
                                      {component.keywords.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                          {component.keywords.slice(0, 3).map(keyword => (
                                            <Badge key={keyword} variant="outline" className="text-xs">
                                              {keyword}
                                            </Badge>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                    <ChevronRight size={16} className="text-muted-foreground" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                </CardContent>
              </Card>
            </div>

            {/* Component Details */}
            <div className="space-y-6">
              {selectedComponent ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="font-mono text-lg break-all">{selectedComponent.name}</CardTitle>
                    <CardDescription>{selectedComponent.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{selectedComponent.category}</Badge>
                      <Badge 
                        variant={selectedComponent.difficulty === 'beginner' ? 'secondary' : 
                                selectedComponent.difficulty === 'intermediate' ? 'default' : 'destructive'}
                      >
                        {selectedComponent.difficulty}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={getStabilityColor(selectedComponent.stability)}
                      >
                        {selectedComponent.stability}
                      </Badge>
                      {selectedComponent.version && (
                        <Badge variant="outline">
                          Since {selectedComponent.version}
                        </Badge>
                      )}
                    </div>

                    <Tabs defaultValue="properties">
                      <TabsList className="grid grid-cols-3 w-full">
                        <TabsTrigger value="properties">Properties</TabsTrigger>
                        <TabsTrigger value="example">Example</TabsTrigger>
                        <TabsTrigger value="details">Details</TabsTrigger>
                      </TabsList>

                      <TabsContent value="properties" className="space-y-3">
                        {selectedComponent.properties && selectedComponent.properties.length > 0 ? (
                          <div className="space-y-3">
                            {selectedComponent.properties.map((prop) => (
                              <div key={prop.name} className="p-3 bg-muted rounded-lg">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h5 className="font-mono text-sm font-medium">{prop.name}</h5>
                                    <p className="text-xs text-muted-foreground mt-1">{prop.description}</p>
                                  </div>
                                  <div className="text-right">
                                    <Badge variant="outline" className="text-xs">
                                      {prop.type}
                                    </Badge>
                                    {prop.required && (
                                      <Badge variant="destructive" className="ml-1 text-xs">
                                        Required
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                {prop.default !== undefined && (
                                  <p className="text-xs text-muted-foreground mt-2">
                                    Default: <code className="bg-background px-1 rounded">{JSON.stringify(prop.default)}</code>
                                  </p>
                                )}
                                {(prop.min !== undefined || prop.max !== undefined) && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Range: {prop.min ?? '∞'} to {prop.max ?? '∞'}
                                  </p>
                                )}
                                {prop.options && (
                                  <div className="mt-2">
                                    <p className="text-xs text-muted-foreground mb-1">Options:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {prop.options.map(option => (
                                        <Badge key={option} variant="outline" className="text-xs">
                                          {option}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No configurable properties</p>
                        )}
                      </TabsContent>

                      <TabsContent value="example" className="space-y-3">
                        {selectedComponent.example ? (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium">Usage Example</h5>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(selectedComponent.example!, `${selectedComponent.name} example`)}
                                data-testid="button-copy-example"
                              >
                                <Copy size={14} className="mr-1" />
                                Copy
                              </Button>
                            </div>
                            <CodePreview code={selectedComponent.example} language="json" />
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No example available</p>
                        )}
                      </TabsContent>

                      <TabsContent value="details" className="space-y-3">
                        <div className="space-y-3">
                          {selectedComponent.dependencies && selectedComponent.dependencies.length > 0 && (
                            <div>
                              <h5 className="font-medium mb-2">Dependencies</h5>
                              <div className="flex flex-wrap gap-1">
                                {selectedComponent.dependencies.map(dep => (
                                  <Badge key={dep} variant="outline" className="text-xs">
                                    {dep}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {selectedComponent.conflicts && selectedComponent.conflicts.length > 0 && (
                            <div>
                              <h5 className="font-medium mb-2">Conflicts With</h5>
                              <div className="flex flex-wrap gap-1">
                                {selectedComponent.conflicts.map(conflict => (
                                  <Badge key={conflict} variant="destructive" className="text-xs">
                                    {conflict}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {selectedComponent.keywords.length > 0 && (
                            <div>
                              <h5 className="font-medium mb-2">Keywords</h5>
                              <div className="flex flex-wrap gap-1">
                                {selectedComponent.keywords.map(keyword => (
                                  <Badge key={keyword} variant="secondary" className="text-xs">
                                    {keyword}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>

                    {selectedComponent.documentation && (
                      <div>
                        <Button variant="outline" size="sm" className="w-full" asChild>
                          <a 
                            href={selectedComponent.documentation} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            data-testid="button-view-docs"
                          >
                            <ExternalLink size={14} className="mr-2" />
                            View Official Documentation
                          </a>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <Search size={48} className="text-muted-foreground mb-4" />
                    <h3 className="font-medium text-foreground mb-2">Select a Component</h3>
                    <p className="text-sm text-muted-foreground">
                      Choose a component from the list to view its documentation and examples
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Quick Reference */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Quick Reference</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <h5 className="font-medium mb-1">Essential Components</h5>
                    <ul className="text-muted-foreground space-y-1">
                      <li>• minecraft:unit_cube - Standard cube shape</li>
                      <li>• minecraft:material_instances - Textures</li>
                      <li>• minecraft:destructible_by_mining - Mining</li>
                      <li>• minecraft:map_color - Color on maps</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium mb-1">Advanced Features</h5>
                    <ul className="text-muted-foreground space-y-1">
                      <li>• minecraft:geometry - Custom shapes</li>
                      <li>• minecraft:block_light_emission - Light source</li>
                      <li>• minecraft:on_interact - Player interaction</li>
                      <li>• minecraft:ticking - Active behavior</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium mb-1">Development Tips</h5>
                    <ul className="text-muted-foreground space-y-1">
                      <li>• Start with unit_cube for simple blocks</li>
                      <li>• Test collision boxes thoroughly</li>
                      <li>• Use appropriate render methods</li>
                      <li>• Consider performance for complex geometry</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Tutorials Tab */}
        <TabsContent value="tutorials" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Choose a Tutorial</h3>
              {Object.entries(tutorials).map(([key, tutorial]) => (
                <Card
                  key={key}
                  className={`cursor-pointer transition-colors ${selectedTutorial === key ? 'border-primary' : ''}`}
                  onClick={() => setSelectedTutorial(key)}
                  data-testid={`tutorial-${key}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{tutorial.title}</h4>
                      <Badge 
                        variant={tutorial.difficulty === 'beginner' ? 'secondary' : 
                                tutorial.difficulty === 'intermediate' ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {tutorial.difficulty}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{tutorial.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock size={12} />
                      <span>{tutorial.estimatedTime}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="lg:col-span-2">
              {tutorials[selectedTutorial as keyof typeof tutorials] && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{tutorials[selectedTutorial as keyof typeof tutorials].title}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(
                          tutorials[selectedTutorial as keyof typeof tutorials].code,
                          tutorials[selectedTutorial as keyof typeof tutorials].title
                        )}
                        data-testid="button-copy-tutorial"
                      >
                        <Copy size={14} className="mr-1" />
                        Copy
                      </Button>
                    </CardTitle>
                    <CardDescription>
                      {tutorials[selectedTutorial as keyof typeof tutorials].description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge 
                        variant={tutorials[selectedTutorial as keyof typeof tutorials].difficulty === 'beginner' ? 'secondary' : 
                                tutorials[selectedTutorial as keyof typeof tutorials].difficulty === 'intermediate' ? 'default' : 'destructive'}
                      >
                        {tutorials[selectedTutorial as keyof typeof tutorials].difficulty}
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock size={12} />
                        {tutorials[selectedTutorial as keyof typeof tutorials].estimatedTime}
                      </Badge>
                    </div>

                    <div>
                      <h5 className="font-medium mb-2">Components Used</h5>
                      <div className="flex flex-wrap gap-1">
                        {tutorials[selectedTutorial as keyof typeof tutorials].components.map(component => (
                          <Badge key={component} variant="outline" className="text-xs">
                            {component}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h5 className="font-medium mb-2">Complete Block Definition</h5>
                      <CodePreview 
                        code={tutorials[selectedTutorial as keyof typeof tutorials].code} 
                        language="json" 
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Block Patterns Tab */}
        <TabsContent value="patterns" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {blockPatterns.map((pattern, index) => {
              const IconComponent = pattern.icon;
              return (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <IconComponent className="mr-2" size={20} />
                      {pattern.title}
                    </CardTitle>
                    <CardDescription>{pattern.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{pattern.usage}</p>
                    <div>
                      <h5 className="font-medium mb-2">Key Components:</h5>
                      <div className="flex flex-wrap gap-1">
                        {pattern.components.map(component => (
                          <Badge key={component} variant="outline" className="text-xs">
                            {component}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Best Practices Tab */}
        <TabsContent value="best-practices" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600 dark:text-green-400">✅ Best Practices</CardTitle>
                <CardDescription>Follow these guidelines for optimal block design</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="text-sm space-y-2">
                  <li>• Use descriptive and unique identifiers</li>
                  <li>• Set appropriate mining times for game balance</li>
                  <li>• Include proper explosion resistance values</li>
                  <li>• Use consistent texture naming conventions</li>
                  <li>• Test collision boxes with player movement</li>
                  <li>• Consider performance impact of custom geometry</li>
                  <li>• Include map_color for minimap appearance</li>
                  <li>• Use proper render methods for transparency</li>
                  <li>• Test with different resource packs</li>
                  <li>• Document block states and interactions</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-red-600 dark:text-red-400">❌ Common Mistakes</CardTitle>
                <CardDescription>Avoid these common pitfalls in block development</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="text-sm space-y-2">
                  <li>• Forgetting to set mining properties</li>
                  <li>• Using generic identifiers that conflict</li>
                  <li>• Oversized collision boxes affecting gameplay</li>
                  <li>• Missing texture references causing errors</li>
                  <li>• Inappropriate light emission values</li>
                  <li>• Complex geometry without performance testing</li>
                  <li>• Not considering block placement rules</li>
                  <li>• Inconsistent block state management</li>
                  <li>• Overusing experimental features</li>
                  <li>• Skipping compatibility testing</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lightbulb className="mr-2" size={20} />
                Performance Optimization
              </CardTitle>
              <CardDescription>Guidelines for maintaining good performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h5 className="font-medium text-blue-600 dark:text-blue-400 mb-3">Geometry</h5>
                  <ul className="text-sm space-y-1">
                    <li>• Keep polygon count reasonable</li>
                    <li>• Use unit_cube when possible</li>
                    <li>• Optimize complex models</li>
                    <li>• Consider LOD for distant blocks</li>
                  </ul>
                </div>
                
                <div>
                  <h5 className="font-medium text-green-600 dark:text-green-400 mb-3">Textures</h5>
                  <ul className="text-sm space-y-1">
                    <li>• Use appropriate resolutions</li>
                    <li>• Minimize unique textures</li>
                    <li>• Optimize file sizes</li>
                    <li>• Reuse existing textures</li>
                  </ul>
                </div>
                
                <div>
                  <h5 className="font-medium text-purple-600 dark:text-purple-400 mb-3">Behavior</h5>
                  <ul className="text-sm space-y-1">
                    <li>• Minimize ticking blocks</li>
                    <li>• Optimize event handling</li>
                    <li>• Use efficient state changes</li>
                    <li>• Avoid unnecessary calculations</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
}