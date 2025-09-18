import { useState } from "react";
import { 
  Search, ChevronRight, Copy, ExternalLink, Filter, BookOpen, Zap, 
  Info, Eye, Brain, Settings, Layers, Target, Shield, Heart, 
  Activity, MapPin, Users, Clock, AlertTriangle, CheckCircle, 
  Play, Pause, SkipForward, HelpCircle, Github, FileText, TrendingUp
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import CodePreview from "@/components/Common/CodePreview";
import { entityComponents, EntityComponent } from "../../../../shared/entityRegistry";

interface EntityDocsProps {
  onNavigate?: (section: string) => void;
}

export default function EntityDocs({ onNavigate }: EntityDocsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedComponent, setSelectedComponent] = useState<EntityComponent | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stabilityFilter, setStabilityFilter] = useState<'all' | 'stable' | 'experimental' | 'beta'>('all');
  const [selectedTutorial, setSelectedTutorial] = useState<string>('basic-entity');
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
  const filteredComponents = entityComponents.filter(component => {
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
  }, {} as Record<string, EntityComponent[]>);

  // Get unique categories for filter
  const categories = [...new Set(entityComponents.map(c => c.category))];
  
  // Category icons mapping
  const categoryIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
    'Core': Heart,
    'Combat': Shield,
    'Movement': Activity,
    'Behavior': Brain,
    'Physics': Zap,
    'Environment': MapPin,
    'Visual': Eye,
    'Utility': Settings,
    'Interaction': Users,
    'AI': Target,
    'Health': Heart,
    'Attributes': TrendingUp
  };

  // Tutorial examples
  const tutorials = {
    'basic-entity': {
      title: 'Basic Friendly NPC',
      description: 'Create a simple entity that walks around and looks at players',
      difficulty: 'beginner' as const,
      estimatedTime: '10 minutes',
      components: ['minecraft:health', 'minecraft:movement', 'minecraft:behavior.look_at_player', 'minecraft:behavior.random_stroll'],
      code: `{
  "format_version": "1.21.0",
  "minecraft:entity": {
    "description": {
      "identifier": "my_addon:friendly_villager",
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
        "height": 1.9
      },
      "minecraft:movement": {
        "value": 0.25
      },
      "minecraft:navigation.walk": {
        "can_path_over_water": false,
        "avoid_water": true,
        "can_break_doors": false
      },
      "minecraft:movement.basic": {},
      "minecraft:jump.static": {
        "jump_power": 0.42
      },
      "minecraft:physics": {},
      "minecraft:pushable": {
        "is_pushable": true,
        "is_pushable_by_piston": true
      },
      "minecraft:behavior.float": {
        "priority": 0
      },
      "minecraft:behavior.look_at_player": {
        "priority": 7,
        "look_distance": 6.0,
        "probability": 0.02
      },
      "minecraft:behavior.random_stroll": {
        "priority": 6,
        "speed_multiplier": 1.0
      }
    }
  }
}`
    },
    'combat-entity': {
      title: 'Combat Entity with AI',
      description: 'Create an entity that attacks hostile mobs and defends players',
      difficulty: 'intermediate' as const,
      estimatedTime: '25 minutes',
      components: ['minecraft:health', 'minecraft:attack', 'minecraft:behavior.melee_attack', 'minecraft:behavior.nearest_attackable_target'],
      code: `{
  "format_version": "1.21.0",
  "minecraft:entity": {
    "description": {
      "identifier": "my_addon:guardian_robot",
      "is_spawnable": true,
      "is_summonable": true
    },
    "components": {
      "minecraft:health": {
        "value": 40,
        "max": 40
      },
      "minecraft:attack": {
        "damage": 6
      },
      "minecraft:collision_box": {
        "width": 0.8,
        "height": 2.0
      },
      "minecraft:movement": {
        "value": 0.3
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
      "minecraft:behavior.float": {
        "priority": 0
      },
      "minecraft:behavior.melee_attack": {
        "priority": 2,
        "speed_multiplier": 1.25,
        "track_target": true
      },
      "minecraft:behavior.nearest_attackable_target": {
        "priority": 1,
        "must_see": true,
        "reselect_targets": true,
        "entity_types": [
          {
            "filters": {
              "any_of": [
                { "test": "is_family", "subject": "other", "value": "monster" },
                { "test": "is_family", "subject": "other", "value": "zombie" }
              ]
            },
            "max_dist": 16
          }
        ]
      },
      "minecraft:behavior.follow_owner": {
        "priority": 6,
        "speed_multiplier": 1.0,
        "start_distance": 10,
        "stop_distance": 2
      }
    }
  }
}`
    },
    'advanced-entity': {
      title: 'Advanced Entity with States',
      description: 'Create a complex entity with multiple states and behaviors',
      difficulty: 'advanced' as const,
      estimatedTime: '45 minutes',
      components: ['minecraft:health', 'minecraft:variant', 'component_groups', 'events'],
      code: `{
  "format_version": "1.21.0",
  "minecraft:entity": {
    "description": {
      "identifier": "my_addon:elemental_spirit",
      "is_spawnable": true,
      "is_summonable": true
    },
    "components": {
      "minecraft:health": {
        "value": 30,
        "max": 30
      },
      "minecraft:variant": {
        "value": 0
      },
      "minecraft:collision_box": {
        "width": 0.6,
        "height": 1.8
      },
      "minecraft:movement": {
        "value": 0.25
      },
      "minecraft:navigation.fly": {
        "can_path_over_water": true,
        "can_path_from_air": true
      },
      "minecraft:movement.fly": {},
      "minecraft:physics": {
        "has_gravity": false
      },
      "minecraft:fire_immune": {},
      "minecraft:behavior.float": {
        "priority": 0
      }
    },
    "component_groups": {
      "my_addon:fire_form": {
        "minecraft:variant": {
          "value": 0
        },
        "minecraft:on_fire": {
          "fire_ticks": 100
        },
        "minecraft:attack": {
          "damage": 4,
          "effect_name": "fire_resistance",
          "effect_duration": 10
        },
        "minecraft:behavior.melee_attack": {
          "priority": 2
        }
      },
      "my_addon:water_form": {
        "minecraft:variant": {
          "value": 1
        },
        "minecraft:attack": {
          "damage": 3,
          "effect_name": "slowness",
          "effect_duration": 5
        },
        "minecraft:behavior.melee_attack": {
          "priority": 2
        }
      },
      "my_addon:earth_form": {
        "minecraft:variant": {
          "value": 2
        },
        "minecraft:health": {
          "value": 50,
          "max": 50
        },
        "minecraft:attack": {
          "damage": 7
        },
        "minecraft:behavior.melee_attack": {
          "priority": 2
        }
      }
    },
    "events": {
      "minecraft:entity_spawned": {
        "randomize": [
          {
            "weight": 33,
            "add": {
              "component_groups": ["my_addon:fire_form"]
            }
          },
          {
            "weight": 33,
            "add": {
              "component_groups": ["my_addon:water_form"]
            }
          },
          {
            "weight": 34,
            "add": {
              "component_groups": ["my_addon:earth_form"]
            }
          }
        ]
      },
      "my_addon:transform_fire": {
        "remove": {
          "component_groups": ["my_addon:water_form", "my_addon:earth_form"]
        },
        "add": {
          "component_groups": ["my_addon:fire_form"]
        }
      },
      "my_addon:transform_water": {
        "remove": {
          "component_groups": ["my_addon:fire_form", "my_addon:earth_form"]
        },
        "add": {
          "component_groups": ["my_addon:water_form"]
        }
      },
      "my_addon:transform_earth": {
        "remove": {
          "component_groups": ["my_addon:fire_form", "my_addon:water_form"]
        },
        "add": {
          "component_groups": ["my_addon:earth_form"]
        }
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

  return (
    <section className="p-6 max-w-7xl mx-auto" data-testid="entity-docs">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">Entity Documentation</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Complete reference for creating and customizing entities in Minecraft: Bedrock Edition
        </p>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Components</p>
                <p className="text-2xl font-bold">{entityComponents.length}</p>
              </div>
              <Layers className="h-8 w-8 text-blue-500" />
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
                  {entityComponents.filter(c => c.stability === 'stable').length}
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
                  {entityComponents.filter(c => c.stability === 'experimental').length}
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
          <TabsTrigger value="patterns">Common Patterns</TabsTrigger>
          <TabsTrigger value="ai-behaviors">AI & Behaviors</TabsTrigger>
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
                    Showing {filteredComponents.length} of {entityComponents.length} components
                  </span>
                  {filteredComponents.length < entityComponents.length && (
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
                  <CardTitle>Entity Components</CardTitle>
                  <CardDescription>
                    Browse through all available entity components and their properties
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="multiple" className="space-y-2">
                    {Object.entries(componentsByCategory).map(([category, components]) => {
                      const IconComponent = categoryIcons[category] || Layers;
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
                      <li>• minecraft:health - Entity health system</li>
                      <li>• minecraft:movement - Basic movement speed</li>
                      <li>• minecraft:physics - Physics simulation</li>
                      <li>• minecraft:collision_box - Collision boundaries</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium mb-1">Behavior Components</h5>
                    <ul className="text-muted-foreground space-y-1">
                      <li>• minecraft:behavior.float - Water floating</li>
                      <li>• minecraft:behavior.look_at_player - Look at players</li>
                      <li>• minecraft:behavior.random_stroll - Random movement</li>
                      <li>• minecraft:behavior.panic - Flee when hurt</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium mb-1">Development Tips</h5>
                    <ul className="text-muted-foreground space-y-1">
                      <li>• Start with core components first</li>
                      <li>• Test thoroughly in creative mode</li>
                      <li>• Use component groups for variants</li>
                      <li>• Check stability before production use</li>
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
                      <h5 className="font-medium mb-2">Complete Entity Definition</h5>
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

        {/* Common Patterns Tab */}
        <TabsContent value="patterns" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="mr-2" size={20} />
                  Passive Entities
                </CardTitle>
                <CardDescription>Non-aggressive entities like animals and NPCs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Common pattern for peaceful entities that interact with players but don't attack.
                </p>
                <div>
                  <h5 className="font-medium mb-2">Essential Components:</h5>
                  <ul className="text-sm space-y-1">
                    <li>• minecraft:health</li>
                    <li>• minecraft:movement</li>
                    <li>• minecraft:behavior.float</li>
                    <li>• minecraft:behavior.look_at_player</li>
                    <li>• minecraft:behavior.random_stroll</li>
                    <li>• minecraft:behavior.panic</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2" size={20} />
                  Combat Entities
                </CardTitle>
                <CardDescription>Aggressive entities that fight players or other mobs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Pattern for hostile entities with combat AI and targeting systems.
                </p>
                <div>
                  <h5 className="font-medium mb-2">Essential Components:</h5>
                  <ul className="text-sm space-y-1">
                    <li>• minecraft:health</li>
                    <li>• minecraft:attack</li>
                    <li>• minecraft:behavior.melee_attack</li>
                    <li>• minecraft:behavior.nearest_attackable_target</li>
                    <li>• minecraft:behavior.hurt_by_target</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2" size={20} />
                  Social Entities
                </CardTitle>
                <CardDescription>Entities that interact with each other and form groups</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Pattern for entities that exhibit social behaviors and group dynamics.
                </p>
                <div>
                  <h5 className="font-medium mb-2">Essential Components:</h5>
                  <ul className="text-sm space-y-1">
                    <li>• minecraft:behavior.follow_mob</li>
                    <li>• minecraft:behavior.find_herd</li>
                    <li>• minecraft:behavior.avoid_mob_type</li>
                    <li>• minecraft:behavior.share_items</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="mr-2" size={20} />
                  Utility Entities
                </CardTitle>
                <CardDescription>Functional entities that provide services or mechanics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Pattern for entities that serve specific gameplay functions or provide utilities.
                </p>
                <div>
                  <h5 className="font-medium mb-2">Essential Components:</h5>
                  <ul className="text-sm space-y-1">
                    <li>• minecraft:interact</li>
                    <li>• minecraft:trade_table</li>
                    <li>• minecraft:persistent</li>
                    <li>• minecraft:behavior.stay_while_sitting</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI & Behaviors Tab */}
        <TabsContent value="ai-behaviors" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="mr-2" size={20} />
                  Understanding AI Priorities
                </CardTitle>
                <CardDescription>How entity AI system works and priority management</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Entity behaviors use a priority system where lower numbers have higher priority. 
                  The AI system will always choose the highest priority behavior that can currently execute.
                </p>
                
                <div className="space-y-3">
                  <div>
                    <h5 className="font-medium text-red-600 dark:text-red-400">Priority 0-2: Critical Behaviors</h5>
                    <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                      <li>• minecraft:behavior.float (priority: 0)</li>
                      <li>• minecraft:behavior.panic (priority: 1)</li>
                      <li>• minecraft:behavior.melee_attack (priority: 2)</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-yellow-600 dark:text-yellow-400">Priority 3-5: Important Behaviors</h5>
                    <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                      <li>• minecraft:behavior.nearest_attackable_target (priority: 3)</li>
                      <li>• minecraft:behavior.follow_owner (priority: 4)</li>
                      <li>• minecraft:behavior.breed (priority: 5)</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-green-600 dark:text-green-400">Priority 6-10: Normal Behaviors</h5>
                    <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                      <li>• minecraft:behavior.random_stroll (priority: 6)</li>
                      <li>• minecraft:behavior.look_at_player (priority: 7)</li>
                      <li>• minecraft:behavior.random_look_around (priority: 8)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="mr-2" size={20} />
                  Common Behavior Combinations
                </CardTitle>
                <CardDescription>Proven behavior patterns that work well together</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium">Friendly NPC</h5>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>minecraft:behavior.float (0)</div>
                      <div>minecraft:behavior.panic (1)</div>
                      <div>minecraft:behavior.random_stroll (6)</div>
                      <div>minecraft:behavior.look_at_player (7)</div>
                      <div>minecraft:behavior.random_look_around (8)</div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h5 className="font-medium">Guard Entity</h5>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>minecraft:behavior.float (0)</div>
                      <div>minecraft:behavior.hurt_by_target (1)</div>
                      <div>minecraft:behavior.melee_attack (2)</div>
                      <div>minecraft:behavior.nearest_attackable_target (3)</div>
                      <div>minecraft:behavior.patrol (6)</div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h5 className="font-medium">Pet Entity</h5>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>minecraft:behavior.float (0)</div>
                      <div>minecraft:behavior.panic (1)</div>
                      <div>minecraft:behavior.follow_owner (4)</div>
                      <div>minecraft:behavior.sit (5)</div>
                      <div>minecraft:behavior.random_stroll (6)</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>AI Behavior Best Practices</CardTitle>
              <CardDescription>Guidelines for creating effective entity AI</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-green-600 dark:text-green-400 mb-3">✅ Do</h5>
                  <ul className="text-sm space-y-2">
                    <li>• Always include minecraft:behavior.float as priority 0</li>
                    <li>• Use priority gaps to allow inserting behaviors later</li>
                    <li>• Test behavior conflicts thoroughly</li>
                    <li>• Group related behaviors with similar priorities</li>
                    <li>• Use component groups for different AI states</li>
                    <li>• Include panic behavior for non-combat entities</li>
                  </ul>
                </div>
                
                <div>
                  <h5 className="font-medium text-red-600 dark:text-red-400 mb-3">❌ Don't</h5>
                  <ul className="text-sm space-y-2">
                    <li>• Skip the float behavior (entities will drown)</li>
                    <li>• Use the same priority for multiple behaviors</li>
                    <li>• Create circular behavior dependencies</li>
                    <li>• Overcomplicate simple entities</li>
                    <li>• Forget to test edge cases</li>
                    <li>• Ignore performance implications of complex AI</li>
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