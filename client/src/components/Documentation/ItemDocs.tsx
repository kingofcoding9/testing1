import { useState } from "react";
import { 
  Search, Gem, Copy, ExternalLink, Filter, BookOpen, Package, 
  Utensils, Sword, Shield, Sparkles, Zap, Eye, Clock, Target,
  ChevronRight, CheckCircle, AlertTriangle, Info, Lightbulb, 
  Hammer, Pickaxe, Apple, Crown, Shirt, Wrench, Activity,
  ArrowUpDown, BarChart3, Settings
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import CodePreview from "@/components/Common/CodePreview";
import { itemComponents, ItemComponent } from "../../../../shared/itemRegistry";

interface ItemDocsProps {
  onNavigate?: (section: string) => void;
}

export default function ItemDocs({ onNavigate }: ItemDocsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedComponent, setSelectedComponent] = useState<ItemComponent | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stabilityFilter, setStabilityFilter] = useState<'all' | 'stable' | 'experimental' | 'beta'>('all');
  const [selectedTutorial, setSelectedTutorial] = useState<string>('basic-item');
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
  const filteredComponents = itemComponents.filter(component => {
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
  }, {} as Record<string, ItemComponent[]>);

  // Get unique categories for filter
  const categories = [...new Set(itemComponents.map(c => c.category))];
  
  // Category icons mapping
  const categoryIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
    'Core': Package,
    'Display': Eye,
    'Food': Utensils,
    'Tools': Hammer,
    'Weapons': Sword,
    'Armor': Shield,
    'Durability': Activity,
    'Enchanting': Sparkles,
    'Interaction': Target,
    'Animation': Zap,
    'Effects': Lightbulb,
    'Utility': Wrench,
    'Trading': ArrowUpDown
  };

  // Tutorial examples
  const tutorials = {
    'basic-item': {
      title: 'Basic Custom Item',
      description: 'Create a simple collectible item',
      difficulty: 'beginner' as const,
      estimatedTime: '5 minutes',
      components: ['minecraft:max_stack_size', 'minecraft:icon', 'minecraft:display_name'],
      code: `{
  "format_version": "1.21.0",
  "minecraft:item": {
    "description": {
      "identifier": "my_addon:magic_crystal",
      "menu_category": {
        "category": "items"
      }
    },
    "components": {
      "minecraft:max_stack_size": 64,
      "minecraft:icon": {
        "texture": "magic_crystal"
      },
      "minecraft:display_name": {
        "value": "Magic Crystal"
      },
      "minecraft:rarity": "epic",
      "minecraft:foil": true,
      "minecraft:hand_equipped": false
    }
  }
}`
    },
    'food-item': {
      title: 'Custom Food Item',
      description: 'Create a food item with special effects',
      difficulty: 'intermediate' as const,
      estimatedTime: '10 minutes',
      components: ['minecraft:food', 'minecraft:use_animation', 'minecraft:cooldown'],
      code: `{
  "format_version": "1.21.0",
  "minecraft:item": {
    "description": {
      "identifier": "my_addon:energy_bar",
      "menu_category": {
        "category": "nature"
      }
    },
    "components": {
      "minecraft:max_stack_size": 16,
      "minecraft:icon": {
        "texture": "energy_bar"
      },
      "minecraft:display_name": {
        "value": "Energy Bar"
      },
      "minecraft:food": {
        "nutrition": 6,
        "saturation_modifier": 0.8,
        "can_always_eat": false,
        "effects": [
          {
            "name": "speed",
            "chance": 1.0,
            "duration": 300,
            "amplifier": 1
          },
          {
            "name": "regeneration",
            "chance": 1.0,
            "duration": 100,
            "amplifier": 0
          }
        ]
      },
      "minecraft:use_animation": "eat",
      "minecraft:use_duration": 32,
      "minecraft:cooldown": {
        "category": "energy_foods",
        "duration": 5.0
      }
    }
  }
}`
    },
    'tool-item': {
      title: 'Custom Tool with Durability',
      description: 'Create a tool that breaks blocks efficiently',
      difficulty: 'intermediate' as const,
      estimatedTime: '15 minutes',
      components: ['minecraft:durability', 'minecraft:digger', 'minecraft:repairable'],
      code: `{
  "format_version": "1.21.0",
  "minecraft:item": {
    "description": {
      "identifier": "my_addon:crystal_pickaxe",
      "menu_category": {
        "category": "equipment"
      }
    },
    "components": {
      "minecraft:max_stack_size": 1,
      "minecraft:icon": {
        "texture": "crystal_pickaxe"
      },
      "minecraft:display_name": {
        "value": "Crystal Pickaxe"
      },
      "minecraft:durability": {
        "max_durability": 500,
        "damage_chance": {
          "min": 1,
          "max": 1
        }
      },
      "minecraft:digger": {
        "use_efficiency": true,
        "destroy_speeds": [
          {
            "block": {
              "tags": "q.any_tag('stone', 'metal')"
            },
            "speed": 12
          },
          {
            "block": "minecraft:obsidian",
            "speed": 15
          }
        ]
      },
      "minecraft:repairable": {
        "repair_items": [
          {
            "items": ["my_addon:magic_crystal"],
            "repair_amount": 100
          }
        ]
      },
      "minecraft:enchantable": {
        "value": 15,
        "slot": "pickaxe"
      },
      "minecraft:hand_equipped": true
    }
  }
}`
    },
    'weapon-item': {
      title: 'Custom Weapon with Effects',
      description: 'Create a weapon with special combat properties',
      difficulty: 'advanced' as const,
      estimatedTime: '20 minutes',
      components: ['minecraft:weapon', 'minecraft:durability', 'minecraft:enchantable'],
      code: `{
  "format_version": "1.21.0",
  "minecraft:item": {
    "description": {
      "identifier": "my_addon:flame_sword",
      "menu_category": {
        "category": "equipment"
      }
    },
    "components": {
      "minecraft:max_stack_size": 1,
      "minecraft:icon": {
        "texture": "flame_sword"
      },
      "minecraft:display_name": {
        "value": "Flame Sword"
      },
      "minecraft:durability": {
        "max_durability": 750,
        "damage_chance": {
          "min": 1,
          "max": 1
        }
      },
      "minecraft:weapon": {
        "on_hurt_entity": {
          "event": "my_addon:flame_damage",
          "target": "other"
        }
      },
      "minecraft:damage": {
        "value": 8
      },
      "minecraft:enchantable": {
        "value": 10,
        "slot": "sword"
      },
      "minecraft:repairable": {
        "repair_items": [
          {
            "items": ["minecraft:blaze_rod"],
            "repair_amount": 150
          }
        ]
      },
      "minecraft:hand_equipped": true,
      "minecraft:foil": true
    },
    "events": {
      "my_addon:flame_damage": {
        "damage": {
          "type": "fire",
          "amount": 2
        },
        "run_command": {
          "command": ["effect @s fire_resistance 3 0"]
        }
      }
    }
  }
}`
    },
    'armor-item': {
      title: 'Custom Armor Piece',
      description: 'Create armor with protection and special properties',
      difficulty: 'advanced' as const,
      estimatedTime: '25 minutes',
      components: ['minecraft:wearable', 'minecraft:armor', 'minecraft:durability'],
      code: `{
  "format_version": "1.21.0",
  "minecraft:item": {
    "description": {
      "identifier": "my_addon:crystal_helmet",
      "menu_category": {
        "category": "equipment"
      }
    },
    "components": {
      "minecraft:max_stack_size": 1,
      "minecraft:icon": {
        "texture": "crystal_helmet"
      },
      "minecraft:display_name": {
        "value": "Crystal Helmet"
      },
      "minecraft:durability": {
        "max_durability": 300,
        "damage_chance": {
          "min": 1,
          "max": 1
        }
      },
      "minecraft:wearable": {
        "slot": "slot.armor.head"
      },
      "minecraft:armor": {
        "protection": 3
      },
      "minecraft:enchantable": {
        "value": 12,
        "slot": "armor_head"
      },
      "minecraft:repairable": {
        "repair_items": [
          {
            "items": ["my_addon:magic_crystal"],
            "repair_amount": 75
          }
        ]
      },
      "minecraft:hand_equipped": false
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

  const itemPatterns = [
    {
      title: 'Collectible Items',
      description: 'Items primarily for collection and trading',
      icon: Gem,
      components: ['minecraft:max_stack_size', 'minecraft:icon', 'minecraft:rarity'],
      usage: 'Currencies, collectibles, and rare materials'
    },
    {
      title: 'Consumable Items',
      description: 'Items that provide temporary effects when used',
      icon: Apple,
      components: ['minecraft:food', 'minecraft:use_animation', 'minecraft:cooldown'],
      usage: 'Food, potions, and buff items'
    },
    {
      title: 'Equipment Items',
      description: 'Tools, weapons, and armor for gameplay',
      icon: Sword,
      components: ['minecraft:durability', 'minecraft:enchantable', 'minecraft:repairable'],
      usage: 'Combat gear, mining tools, and protective equipment'
    },
    {
      title: 'Functional Items',
      description: 'Items that serve specific mechanical purposes',
      icon: Wrench,
      components: ['minecraft:block_placer', 'minecraft:entity_placer', 'minecraft:throwable'],
      usage: 'Keys, spawn eggs, and utility items'
    }
  ];

  return (
    <section className="p-6 max-w-7xl mx-auto" data-testid="item-docs">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">Item Documentation</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Complete guide to creating custom items in Minecraft: Bedrock Edition
        </p>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Components</p>
                <p className="text-2xl font-bold">{itemComponents.length}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
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
                  {itemComponents.filter(c => c.stability === 'stable').length}
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
                  {itemComponents.filter(c => c.stability === 'experimental').length}
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
          <TabsTrigger value="patterns">Item Patterns</TabsTrigger>
          <TabsTrigger value="crafting">Crafting & Recipes</TabsTrigger>
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
                    Showing {filteredComponents.length} of {itemComponents.length} components
                  </span>
                  {filteredComponents.length < itemComponents.length && (
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
                  <CardTitle>Item Components</CardTitle>
                  <CardDescription>
                    Browse through all available item components and their properties
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="multiple" className="space-y-2">
                    {Object.entries(componentsByCategory).map(([category, components]) => {
                      const IconComponent = categoryIcons[category] || Package;
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
                      <li>• minecraft:max_stack_size - Stack limits</li>
                      <li>• minecraft:icon - Item texture</li>
                      <li>• minecraft:display_name - Custom name</li>
                      <li>• minecraft:durability - Tool/weapon lifespan</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium mb-1">Special Features</h5>
                    <ul className="text-muted-foreground space-y-1">
                      <li>• minecraft:food - Consumable nutrition</li>
                      <li>• minecraft:enchantable - Enchantment support</li>
                      <li>• minecraft:armor - Protection values</li>
                      <li>• minecraft:weapon - Combat properties</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium mb-1">Development Tips</h5>
                    <ul className="text-muted-foreground space-y-1">
                      <li>• Use max_stack_size: 1 for tools</li>
                      <li>• Include repair items for durability</li>
                      <li>• Test enchantment compatibility</li>
                      <li>• Balance nutrition values carefully</li>
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
                      <h5 className="font-medium mb-2">Complete Item Definition</h5>
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

        {/* Item Patterns Tab */}
        <TabsContent value="patterns" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {itemPatterns.map((pattern, index) => {
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2" size={20} />
                Item Balance Guidelines
              </CardTitle>
              <CardDescription>Recommendations for balanced item design</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h5 className="font-medium text-blue-600 dark:text-blue-400 mb-3">Food Items</h5>
                  <ul className="text-sm space-y-1">
                    <li>• Nutrition: 1-8 for snacks, 8-20 for meals</li>
                    <li>• Saturation: 0.3-0.8 typical range</li>
                    <li>• Effects: Max 2-3 per food item</li>
                    <li>• Duration: 30-300 seconds for effects</li>
                  </ul>
                </div>
                
                <div>
                  <h5 className="font-medium text-green-600 dark:text-green-400 mb-3">Tools</h5>
                  <ul className="text-sm space-y-1">
                    <li>• Durability: 100-1500 typical range</li>
                    <li>• Speed: 1-15 for destroy_speeds</li>
                    <li>• Efficiency: Enable for faster mining</li>
                    <li>• Repair: Use thematic materials</li>
                  </ul>
                </div>
                
                <div>
                  <h5 className="font-medium text-purple-600 dark:text-purple-400 mb-3">Weapons</h5>
                  <ul className="text-sm space-y-1">
                    <li>• Damage: 1-12 typical range</li>
                    <li>• Durability: 200-2000 for weapons</li>
                    <li>• Enchantability: 5-15 for weapons</li>
                    <li>• Effects: Balanced with cooldowns</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Crafting & Recipes Tab */}
        <TabsContent value="crafting" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="mr-2" size={20} />
                  Recipe Integration
                </CardTitle>
                <CardDescription>How to integrate your items with crafting recipes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Custom items can be used in crafting recipes and as crafting results. This allows for complex progression systems.
                </p>
                
                <div className="space-y-3">
                  <div>
                    <h5 className="font-medium">Recipe Files Location</h5>
                    <p className="text-sm text-muted-foreground">
                      behavior_packs/your_pack/recipes/item_name.json
                    </p>
                  </div>
                  
                  <div>
                    <h5 className="font-medium">Recipe Types</h5>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Shaped recipes (grid patterns)</li>
                      <li>• Shapeless recipes (any arrangement)</li>
                      <li>• Furnace recipes (smelting)</li>
                      <li>• Brewing recipes (potions)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="mr-2" size={20} />
                  Best Practices
                </CardTitle>
                <CardDescription>Guidelines for effective item and recipe design</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <h5 className="font-medium text-green-600 dark:text-green-400">✅ Do</h5>
                    <ul className="text-sm space-y-1">
                      <li>• Use descriptive item identifiers</li>
                      <li>• Balance durability with power</li>
                      <li>• Include repair recipes for tools</li>
                      <li>• Test recipe conflicts</li>
                      <li>• Consider progression curves</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-red-600 dark:text-red-400">❌ Don't</h5>
                    <ul className="text-sm space-y-1">
                      <li>• Override vanilla recipes carelessly</li>
                      <li>• Create overpowered food items</li>
                      <li>• Forget stack size considerations</li>
                      <li>• Skip enchantment compatibility</li>
                      <li>• Ignore creative menu categories</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Example Recipe Integration</CardTitle>
              <CardDescription>How to create recipes that use your custom items</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h5 className="font-medium mb-2">Shaped Recipe Example</h5>
                  <CodePreview 
                    language="json" 
                    code={`{
  "format_version": "1.21.0",
  "minecraft:recipe_shaped": {
    "description": {
      "identifier": "my_addon:crystal_pickaxe_recipe"
    },
    "tags": ["crafting_table"],
    "pattern": [
      "CCC",
      " S ",
      " S "
    ],
    "key": {
      "C": {
        "item": "my_addon:magic_crystal"
      },
      "S": {
        "item": "minecraft:stick"
      }
    },
    "result": {
      "item": "my_addon:crystal_pickaxe"
    }
  }
}`}
                  />
                </div>
                
                <div>
                  <h5 className="font-medium mb-2">Smelting Recipe Example</h5>
                  <CodePreview 
                    language="json" 
                    code={`{
  "format_version": "1.21.0",
  "minecraft:recipe_furnace": {
    "description": {
      "identifier": "my_addon:crystal_ingot_smelting"
    },
    "tags": ["furnace", "blast_furnace"],
    "input": {
      "item": "my_addon:raw_crystal",
      "data": 0,
      "count": 1
    },
    "output": "my_addon:crystal_ingot"
  }
}`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
}