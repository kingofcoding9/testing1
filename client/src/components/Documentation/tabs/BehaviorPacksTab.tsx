import { useState } from "react";
import { 
  Search, Settings, Copy, ExternalLink, Filter, BookOpen, Zap, 
  Database, Trophy, Coins, MapPin, Hammer, Pickaxe, Target,
  ChevronRight, CheckCircle, AlertTriangle, Info, Lightbulb, 
  Download, Upload, ArrowRight, Code, FileText, Cog,
  Activity, BarChart3, Users, Globe, Clock
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import CodePreview from "@/components/Common/CodePreview";

interface BehaviorPacksTabProps {
  onNavigate?: (section: string) => void;
  onProgressUpdate?: (progress: number) => void;
}

export default function BehaviorPacksTab({ onNavigate, onProgressUpdate }: BehaviorPacksTabProps) {
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Behavior pack topics
  const behaviorTopics = [
    {
      id: 'game-rules',
      title: 'Game Rules & Mechanics',
      description: 'Modifying core game mechanics and rules',
      difficulty: 'intermediate' as const,
      estimatedTime: '1.5 hours',
      icon: Settings,
      content: {
        overview: 'Game rules allow you to modify fundamental Minecraft mechanics without scripting.',
        ruleTypes: [
          'Player mechanics - Health, hunger, movement',
          'World generation - Ore distribution, biomes',
          'Game modes - Custom survival/creative rules',
          'Time and weather - Day/night cycles, seasons'
        ],
        examples: [
          'Custom difficulty scaling',
          'Modified player capabilities',
          'Environmental changes',
          'Resource availability'
        ]
      }
    },
    {
      id: 'loot-tables',
      title: 'Loot Table Systems',
      description: 'Creating complex drop systems and rewards',
      difficulty: 'intermediate' as const,
      estimatedTime: '2 hours',
      icon: Trophy,
      content: {
        overview: 'Loot tables control what items drop from various sources in the game.',
        lootSources: [
          'Entity drops - Mob death rewards',
          'Block drops - Mining and breaking',
          'Container loot - Chests, dungeons',
          'Fishing rewards - Custom catch tables'
        ],
        features: [
          'Conditional drops based on tools',
          'Random item selection with weights',
          'Fortune and looting enchantment support',
          'Complex condition combinations'
        ]
      }
    },
    {
      id: 'recipe-systems',
      title: 'Recipe & Crafting Systems',
      description: 'Custom crafting recipes and item creation',
      difficulty: 'beginner' as const,
      estimatedTime: '1 hour',
      icon: Hammer,
      content: {
        overview: 'Recipe systems allow players to craft custom items and modify existing recipes.',
        recipeTypes: [
          'Shaped crafting - Pattern-based recipes',
          'Shapeless crafting - Ingredient-based recipes',
          'Furnace recipes - Smelting and cooking',
          'Brewing recipes - Potion creation'
        ],
        features: [
          'Custom unlock conditions',
          'Recipe book integration',
          'Group organization',
          'Batch crafting support'
        ]
      }
    },
    {
      id: 'worldgen-features',
      title: 'World Generation & Features',
      description: 'Custom world generation and terrain features',
      difficulty: 'advanced' as const,
      estimatedTime: '3 hours',
      icon: Globe,
      content: {
        overview: 'World generation features allow you to add custom structures and modify terrain.',
        featureTypes: [
          'Structure generation - Buildings, ruins',
          'Ore distribution - Custom mineral placement',
          'Biome features - Trees, plants, decoration',
          'Terrain modification - Height maps, caves'
        ],
        complexity: [
          'Simple feature placement',
          'Conditional generation rules',
          'Multi-block structures',
          'Procedural generation systems'
        ]
      }
    },
    {
      id: 'trading-systems',
      title: 'Trading & Economy Systems',
      description: 'Custom villager trades and economic mechanics',
      difficulty: 'intermediate' as const,
      estimatedTime: '1.5 hours',
      icon: Coins,
      content: {
        overview: 'Trading systems enable custom economic interactions between players and NPCs.',
        tradeTypes: [
          'Villager trades - Custom profession trades',
          'Wandering trader - Special item trades',
          'Custom NPCs - Scripted trading entities',
          'Player markets - Community trading systems'
        ],
        mechanics: [
          'Dynamic pricing systems',
          'Supply and demand mechanics',
          'Trade unlocking conditions',
          'Reputation-based trading'
        ]
      }
    },
    {
      id: 'spawn-biome-rules',
      title: 'Spawn Rules & Biome Configuration',
      description: 'Controlling entity spawning and biome properties',
      difficulty: 'intermediate' as const,
      estimatedTime: '2 hours',
      icon: MapPin,
      content: {
        overview: 'Spawn rules and biome configuration control where and when entities appear in the world.',
        spawnControls: [
          'Entity spawn conditions - Location, time, biome',
          'Spawn density limits - Population control',
          'Biome restrictions - Environment-specific spawning',
          'Player proximity rules - Distance-based spawning'
        ],
        biomeFeatures: [
          'Custom biome properties - Temperature, humidity',
          'Biome-specific spawn rules',
          'Environmental effects',
          'Biome transition rules'
        ]
      }
    }
  ];

  // Behavior pack creation workflow
  const workflowSteps = [
    {
      id: 'planning-design',
      title: '1. Planning & Design',
      description: 'Define gameplay changes and mechanics',
      icon: Lightbulb,
      tasks: [
        'Define gameplay objectives',
        'Plan system interactions',
        'Document behavior changes',
        'Consider balance implications'
      ]
    },
    {
      id: 'core-implementation',
      title: '2. Core Implementation',
      description: 'Implement basic behavior modifications',
      icon: Cog,
      tasks: [
        'Set up pack structure',
        'Create manifest files',
        'Implement core mechanics',
        'Configure basic rules'
      ]
    },
    {
      id: 'system-integration',
      title: '3. System Integration',
      description: 'Connect different behavior systems',
      icon: Activity,
      tasks: [
        'Link related systems',
        'Balance interactions',
        'Test system conflicts',
        'Optimize performance'
      ]
    },
    {
      id: 'testing-balancing',
      title: '4. Testing & Balancing',
      description: 'Test gameplay and balance mechanics',
      icon: BarChart3,
      tasks: [
        'Playtest all mechanics',
        'Balance difficulty curves',
        'Fix interaction bugs',
        'Optimize spawn rates'
      ]
    },
    {
      id: 'polish-release',
      title: '5. Polish & Release',
      description: 'Final polish and community release',
      icon: Upload,
      tasks: [
        'Polish user experience',
        'Create documentation',
        'Package for distribution',
        'Gather community feedback'
      ]
    }
  ];

  // Quick reference for behavior pack components
  const quickReference = [
    {
      category: 'Core Files',
      items: [
        { name: 'manifest.json', description: 'Pack metadata and dependencies' },
        { name: 'pack_icon.png', description: 'Pack thumbnail image' },
        { name: 'biomes/', description: 'Biome configuration files' },
        { name: 'spawn_rules/', description: 'Entity spawn conditions' }
      ]
    },
    {
      category: 'Game Systems',
      items: [
        { name: 'loot_tables/', description: 'Drop and reward definitions' },
        { name: 'recipes/', description: 'Crafting recipe definitions' },
        { name: 'trading/', description: 'Villager and NPC trades' },
        { name: 'features/', description: 'World generation features' }
      ]
    },
    {
      category: 'Entities & Blocks',
      items: [
        { name: 'entities/', description: 'Entity behavior definitions' },
        { name: 'blocks/', description: 'Block behavior and properties' },
        { name: 'items/', description: 'Item behavior and mechanics' },
        { name: 'functions/', description: 'Command function files' }
      ]
    }
  ];

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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'intermediate': return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'advanced': return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      default: return 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6" data-testid="behavior-packs-tab">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Behavior Packs</h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Modify Minecraft's core gameplay mechanics with behavior packs. Create custom rules, recipes, loot tables,
          and world generation features to transform how the game works.
        </p>
      </div>

      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" data-testid="tab-overview">🎯 Overview</TabsTrigger>
          <TabsTrigger value="systems" data-testid="tab-systems">⚙️ Systems</TabsTrigger>
          <TabsTrigger value="workflow" data-testid="tab-workflow">📋 Workflow</TabsTrigger>
          <TabsTrigger value="examples" data-testid="tab-examples">💡 Examples</TabsTrigger>
          <TabsTrigger value="reference" data-testid="tab-reference">📚 Reference</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Behavior Power
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">System Types</span>
                    <span className="font-medium">6+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Game Rules</span>
                    <span className="font-medium">50+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Recipe Types</span>
                    <span className="font-medium">10+</span>
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => onNavigate?.('builder-recipe')}
                  data-testid="open-recipe-builder"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Open Recipe Builder
                </Button>
              </CardContent>
            </Card>

            {/* Key Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Key Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-center">Custom Recipes</Badge>
                  <Badge variant="outline" className="w-full justify-center">Loot Tables</Badge>
                  <Badge variant="outline" className="w-full justify-center">Trading Systems</Badge>
                  <Badge variant="outline" className="w-full justify-center">World Generation</Badge>
                  <Badge variant="outline" className="w-full justify-center">Spawn Rules</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Pack Template
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Hammer className="h-4 w-4 mr-2" />
                  Recipe Creator
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Trophy className="h-4 w-4 mr-2" />
                  Loot Designer
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Coins className="h-4 w-4 mr-2" />
                  Trade Editor
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Reference Sections */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickReference.map((section) => (
              <Card key={section.category}>
                <CardHeader>
                  <CardTitle className="text-lg">{section.category}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {section.items.map((item, index) => (
                    <div key={index} className="space-y-1">
                      <div className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400">
                        {item.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.description}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Behavior Pack Systems */}
          <Card>
            <CardHeader>
              <CardTitle>Behavior Pack Systems</CardTitle>
              <CardDescription>Core systems that behavior packs can modify and extend</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Settings className="h-4 w-4 text-blue-500" />
                    Core Mechanics
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Fundamental game rules and mechanics
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>• Player capabilities and limits</li>
                    <li>• World physics and rules</li>
                    <li>• Time and weather systems</li>
                    <li>• Difficulty and progression</li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Database className="h-4 w-4 text-green-500" />
                    Content Systems
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Item and content generation systems
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>• Crafting and recipe systems</li>
                    <li>• Loot and reward distribution</li>
                    <li>• Trading and economy</li>
                    <li>• Item and block behaviors</li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Globe className="h-4 w-4 text-purple-500" />
                    World Systems
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    World generation and environmental systems
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>• Terrain and biome generation</li>
                    <li>• Structure placement</li>
                    <li>• Feature distribution</li>
                    <li>• Environmental effects</li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4 text-orange-500" />
                    Entity Systems
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Entity behavior and interaction systems
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>• Spawn rules and population</li>
                    <li>• AI behavior patterns</li>
                    <li>• Entity interactions</li>
                    <li>• Player-entity relationships</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Systems Tab */}
        <TabsContent value="systems" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {behaviorTopics.map((topic) => (
              <Card key={topic.id} className="hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <topic.icon className="h-6 w-6" />
                      <div>
                        <CardTitle className="text-lg">{topic.title}</CardTitle>
                        <CardDescription>{topic.description}</CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={topic.difficulty === 'advanced' ? 'destructive' : topic.difficulty === 'intermediate' ? 'secondary' : 'outline'}>
                        {topic.difficulty}
                      </Badge>
                      <div className="text-sm text-muted-foreground mt-1">{topic.estimatedTime}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">{topic.content.overview}</p>
                  
                  {topic.content.ruleTypes && (
                    <div className="space-y-2">
                      <h5 className="font-medium">Rule Types</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {topic.content.ruleTypes.map((type, index) => (
                          <li key={index}>• {type}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {topic.content.lootSources && (
                    <div className="space-y-2">
                      <h5 className="font-medium">Loot Sources</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {topic.content.lootSources.map((source, index) => (
                          <li key={index}>• {source}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {topic.content.recipeTypes && (
                    <div className="space-y-2">
                      <h5 className="font-medium">Recipe Types</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {topic.content.recipeTypes.map((type, index) => (
                          <li key={index}>• {type}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {topic.content.featureTypes && (
                    <div className="space-y-2">
                      <h5 className="font-medium">Feature Types</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {topic.content.featureTypes.map((type, index) => (
                          <li key={index}>• {type}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {topic.content.tradeTypes && (
                    <div className="space-y-2">
                      <h5 className="font-medium">Trade Types</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {topic.content.tradeTypes.map((type, index) => (
                          <li key={index}>• {type}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {topic.content.spawnControls && (
                    <div className="space-y-2">
                      <h5 className="font-medium">Spawn Controls</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {topic.content.spawnControls.map((control, index) => (
                          <li key={index}>• {control}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Workflow Tab */}
        <TabsContent value="workflow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Behavior Pack Development Workflow</CardTitle>
              <CardDescription>A systematic approach to creating comprehensive behavior packs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {workflowSteps.map((step, index) => (
                <div key={step.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900">
                      <step.icon className="h-5 w-5 text-blue-600" />
                    </div>
                    {index < workflowSteps.length - 1 && (
                      <div className="w-px h-16 bg-border mt-2" />
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <div>
                      <h4 className="font-semibold text-lg">{step.title}</h4>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {step.tasks.map((task, taskIndex) => (
                        <div key={taskIndex} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>{task}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Examples Tab */}
        <TabsContent value="examples" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Custom Recipe */}
            <Card className="hover:shadow-lg transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hammer className="h-5 w-5 text-orange-500" />
                  Custom Crafting Recipe
                </CardTitle>
                <CardDescription>Simple shaped crafting recipe for custom items</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Badge variant="outline">Beginner</Badge>
                  <Badge variant="outline">15 min</Badge>
                </div>
                <CodePreview
                  code={`{
  "format_version": "1.21.0",
  "minecraft:recipe_shaped": {
    "description": {
      "identifier": "my_addon:magic_wand_recipe"
    },
    "tags": ["crafting_table"],
    "pattern": [
      " D ",
      " S ",
      " S "
    ],
    "key": {
      "D": {
        "item": "minecraft:diamond"
      },
      "S": {
        "item": "minecraft:stick"
      }
    },
    "result": {
      "item": "my_addon:magic_wand",
      "count": 1
    }
  }
}`}
                  language="json"
                  title="Magic Wand Recipe"
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => onNavigate?.('builder-recipe')}
                  data-testid="create-recipe"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Create Recipe
                </Button>
              </CardContent>
            </Card>

            {/* Custom Loot Table */}
            <Card className="hover:shadow-lg transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Custom Loot Table
                </CardTitle>
                <CardDescription>Advanced loot table with conditions and weights</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Badge variant="secondary">Intermediate</Badge>
                  <Badge variant="outline">25 min</Badge>
                </div>
                <CodePreview
                  code={`{
  "pools": [
    {
      "rolls": 1,
      "entries": [
        {
          "type": "item",
          "name": "minecraft:diamond",
          "weight": 1,
          "conditions": [
            {
              "condition": "random_chance",
              "chance": 0.1
            }
          ]
        },
        {
          "type": "item",
          "name": "minecraft:emerald",
          "weight": 3,
          "functions": [
            {
              "function": "set_count",
              "count": {
                "min": 1,
                "max": 3
              }
            }
          ]
        }
      ]
    }
  ]
}`}
                  language="json"
                  title="Treasure Chest Loot"
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => onNavigate?.('builder-loot')}
                  data-testid="create-loot-table"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Create Loot Table
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Reference Tab */}
        <TabsContent value="reference" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Behavior Pack File Structure</CardTitle>
              <CardDescription>Complete reference for organizing behavior pack files</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <pre className="text-sm font-mono">
{`behavior_pack/
├── manifest.json                    # Pack metadata
├── pack_icon.png                   # Pack thumbnail
├── biomes/                         # Biome definitions
│   └── custom_biome.json
├── entities/                       # Entity behaviors
│   └── custom_entity.json
├── loot_tables/                    # Drop tables
│   ├── blocks/
│   ├── entities/
│   └── chests/
├── recipes/                        # Crafting recipes
│   ├── shaped/
│   ├── shapeless/
│   └── furnace/
├── spawn_rules/                    # Entity spawning
│   └── custom_spawn.json
├── trading/                        # Villager trades
│   └── trades.json
├── features/                       # World generation
│   └── custom_feature.json
├── feature_rules/                  # Feature placement
│   └── placement_rules.json
├── items/                          # Item behaviors
│   └── custom_item.json
├── blocks/                         # Block behaviors
│   └── custom_block.json
└── functions/                      # Command functions
    └── setup.mcfunction`}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Common Patterns */}
          <Card>
            <CardHeader>
              <CardTitle>Common Behavior Patterns</CardTitle>
              <CardDescription>Frequently used patterns and best practices</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Recipe Patterns</h4>
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium">Tool Recipes</h5>
                      <p className="text-sm text-muted-foreground">Standard tool crafting patterns</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium">Armor Recipes</h5>
                      <p className="text-sm text-muted-foreground">Helmet, chestplate, leggings, boots</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium">Block Recipes</h5>
                      <p className="text-sm text-muted-foreground">Building and decorative blocks</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Loot Patterns</h4>
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium">Conditional Drops</h5>
                      <p className="text-sm text-muted-foreground">Tool and enchantment requirements</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium">Weighted Drops</h5>
                      <p className="text-sm text-muted-foreground">Rare vs common item distribution</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium">Quantity Ranges</h5>
                      <p className="text-sm text-muted-foreground">Variable drop amounts</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}