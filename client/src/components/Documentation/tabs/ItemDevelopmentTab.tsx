import { useState } from "react";
import { 
  Search, Shield, Copy, ExternalLink, Filter, BookOpen, Package, 
  Utensils, Sword, Sparkles, Zap, Eye, Clock, Target,
  ChevronRight, CheckCircle, AlertTriangle, Info, Lightbulb, 
  Hammer, Pickaxe, Apple, Crown, Shirt, Wrench, Activity,
  ArrowUpDown, BarChart3, Settings, ArrowRight, Code, FileText
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

// Import the existing ItemDocs to leverage its content
import ItemDocs from "../ItemDocs";

interface ItemDevelopmentTabProps {
  onNavigate?: (section: string) => void;
  onProgressUpdate?: (progress: number) => void;
}

export default function ItemDevelopmentTab({ onNavigate, onProgressUpdate }: ItemDevelopmentTabProps) {
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Advanced item development topics
  const advancedTopics = [
    {
      id: 'durability-systems',
      title: 'Advanced Durability Systems',
      description: 'Creating complex durability and repair mechanics',
      difficulty: 'intermediate' as const,
      estimatedTime: '35 min',
      icon: Activity,
      content: {
        overview: 'Advanced durability systems allow for complex item degradation, repair mechanics, and conditional durability loss.',
        example: `{
  "minecraft:item": {
    "description": {
      "identifier": "my_addon:magic_sword"
    },
    "components": {
      "minecraft:durability": {
        "max_durability": 500,
        "damage_chance": {
          "min": 5,
          "max": 10
        }
      },
      "minecraft:repairable": {
        "repair_items": [
          {
            "items": ["my_addon:magic_crystal"],
            "repair_amount": 100
          }
        ]
      }
    }
  }
}`
      }
    },
    {
      id: 'enchantment-integration',
      title: 'Enchantment Integration',
      description: 'Making items compatible with enchantments',
      difficulty: 'intermediate' as const,
      estimatedTime: '25 min',
      icon: Sparkles,
      content: {
        overview: 'Enchantment integration allows your custom items to receive and benefit from various enchantments.',
        example: `{
  "minecraft:item": {
    "description": {
      "identifier": "my_addon:crystal_pickaxe"
    },
    "components": {
      "minecraft:enchantable": {
        "value": 15,
        "slot": "pickaxe"
      },
      "minecraft:durability": {
        "max_durability": 800
      }
    }
  }
}`
      }
    },
    {
      id: 'custom-use-mechanics',
      title: 'Custom Use Mechanics',
      description: 'Creating items with special use behaviors',
      difficulty: 'advanced' as const,
      estimatedTime: '45 min',
      icon: Target,
      content: {
        overview: 'Custom use mechanics allow items to perform special actions when used, eaten, or activated.',
        patterns: [
          'Right-click activation items',
          'Consumable items with effects',
          'Tools with special abilities',
          'Throwable and projectile items'
        ]
      }
    },
    {
      id: 'rendering-models',
      title: 'Item Rendering & Models',
      description: 'Advanced visual customization for items',
      difficulty: 'advanced' as const,
      estimatedTime: '40 min',
      icon: Eye,
      content: {
        overview: 'Custom rendering and models allow items to have unique appearances beyond simple texture changes.',
        techniques: [
          'Custom geometry models',
          'Animated item textures',
          'Conditional rendering states',
          'Hand-held model positioning',
          'Inventory vs world appearance'
        ]
      }
    }
  ];

  // Item creation workflow
  const workflowSteps = [
    {
      id: 'concept-design',
      title: '1. Concept & Design',
      description: 'Define the item\'s purpose and mechanics',
      icon: Lightbulb,
      tasks: [
        'Define item category and purpose',
        'Plan gameplay mechanics',
        'Design visual appearance',
        'Consider balance implications'
      ]
    },
    {
      id: 'basic-implementation',
      title: '2. Basic Implementation',
      description: 'Create the core item structure',
      icon: Package,
      tasks: [
        'Set up item identifier',
        'Add basic components',
        'Configure stack properties',
        'Test basic functionality'
      ]
    },
    {
      id: 'mechanics-integration',
      title: '3. Mechanics Integration',
      description: 'Add special behaviors and interactions',
      icon: Wrench,
      tasks: [
        'Implement use mechanics',
        'Add durability if needed',
        'Configure enchantability',
        'Set up crafting recipes'
      ]
    },
    {
      id: 'visual-polish',
      title: '4. Visual Polish',
      description: 'Create textures and visual effects',
      icon: Eye,
      tasks: [
        'Create item textures',
        'Set up custom models if needed',
        'Add held item positioning',
        'Configure visual effects'
      ]
    },
    {
      id: 'testing-balancing',
      title: '5. Testing & Balancing',
      description: 'Optimize and balance the item',
      icon: CheckCircle,
      tasks: [
        'Test all item mechanics',
        'Balance gameplay impact',
        'Optimize performance',
        'Verify multiplayer compatibility'
      ]
    }
  ];

  // Item categories and patterns
  const itemCategories = [
    {
      type: 'Tools & Weapons',
      description: 'Functional items for gameplay',
      examples: ['Custom pickaxes', 'Magic wands', 'Special weapons'],
      difficulty: 'intermediate' as const,
      icon: Hammer
    },
    {
      type: 'Food & Consumables',
      description: 'Items that can be consumed',
      examples: ['Custom foods', 'Potions', 'Healing items'],
      difficulty: 'beginner' as const,
      icon: Apple
    },
    {
      type: 'Armor & Wearables',
      description: 'Protective and cosmetic gear',
      examples: ['Custom armor sets', 'Accessories', 'Cosmetic items'],
      difficulty: 'intermediate' as const,
      icon: Shield
    },
    {
      type: 'Utility Items',
      description: 'Items with special functions',
      examples: ['Transportation items', 'Building tools', 'Information items'],
      difficulty: 'advanced' as const,
      icon: Wrench
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
    <div className="space-y-6" data-testid="item-development-tab">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Item Development</h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Create custom items that enhance the Minecraft experience. From simple collectibles to complex tools
          and weapons, learn to craft items that players will treasure and use.
        </p>
      </div>

      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" data-testid="tab-overview">🎯 Overview</TabsTrigger>
          <TabsTrigger value="component-reference" data-testid="tab-components">🧩 Components</TabsTrigger>
          <TabsTrigger value="advanced-topics" data-testid="tab-advanced">🚀 Advanced</TabsTrigger>
          <TabsTrigger value="workflow" data-testid="tab-workflow">📋 Workflow</TabsTrigger>
          <TabsTrigger value="examples" data-testid="tab-examples">💡 Examples</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Item Basics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Component Types</span>
                    <span className="font-medium">30+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Item Categories</span>
                    <span className="font-medium">10+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Use Patterns</span>
                    <span className="font-medium">20+</span>
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => onNavigate?.('builder-item')}
                  data-testid="open-item-builder"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Open Item Builder
                </Button>
              </CardContent>
            </Card>

            {/* Key Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Key Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-center">Custom Textures</Badge>
                  <Badge variant="outline" className="w-full justify-center">Durability Systems</Badge>
                  <Badge variant="outline" className="w-full justify-center">Enchantments</Badge>
                  <Badge variant="outline" className="w-full justify-center">Use Mechanics</Badge>
                  <Badge variant="outline" className="w-full justify-center">Custom Models</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Item Template
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Eye className="h-4 w-4 mr-2" />
                  Texture Creator
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Code className="h-4 w-4 mr-2" />
                  Recipe Generator
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Wrench className="h-4 w-4 mr-2" />
                  Testing Tools
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Item Categories Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Item Categories & Types</CardTitle>
              <CardDescription>Understanding different approaches to item creation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {itemCategories.map((category) => (
                  <div key={category.type} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <category.icon className="h-5 w-5" />
                        <h4 className="font-semibold">{category.type}</h4>
                      </div>
                      <Badge variant="outline" className={getDifficultyColor(category.difficulty)}>
                        {category.difficulty}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                    <div className="space-y-1">
                      <h5 className="text-sm font-medium">Examples:</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {category.examples.map((example, index) => (
                          <li key={index}>• {example}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Item Component System */}
          <Card>
            <CardHeader>
              <CardTitle>Item Component System</CardTitle>
              <CardDescription>How components define item properties and behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Package className="h-4 w-4 text-blue-500" />
                    Core Properties
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Basic item characteristics and behavior
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>• Stack Size</li>
                    <li>• Display Name</li>
                    <li>• Tooltip Text</li>
                    <li>• Category</li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-green-500" />
                    Functionality
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    What the item can do and how it behaves
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>• Use Actions</li>
                    <li>• Durability</li>
                    <li>• Tool Properties</li>
                    <li>• Consumable Effects</li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Eye className="h-4 w-4 text-purple-500" />
                    Visual & Audio
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    How the item appears and sounds
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>• Icon Texture</li>
                    <li>• 3D Models</li>
                    <li>• Animations</li>
                    <li>• Sound Effects</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Component Reference Tab */}
        <TabsContent value="component-reference" className="space-y-6">
          {/* Embed the existing ItemDocs component */}
          <ItemDocs onNavigate={onNavigate} />
        </TabsContent>

        {/* Advanced Topics Tab */}
        <TabsContent value="advanced-topics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {advancedTopics.map((topic) => (
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
                      <Badge variant={topic.difficulty === 'advanced' ? 'destructive' : 'secondary'}>
                        {topic.difficulty}
                      </Badge>
                      <div className="text-sm text-muted-foreground mt-1">{topic.estimatedTime}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">{topic.content.overview}</p>
                  
                  {topic.content.example && (
                    <div className="space-y-2">
                      <h5 className="font-medium">Example Implementation</h5>
                      <CodePreview
                        code={topic.content.example}
                        language="json"
                        title={`${topic.title} Example`}
                      />
                    </div>
                  )}

                  {topic.content.patterns && (
                    <div className="space-y-2">
                      <h5 className="font-medium">Common Patterns</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {topic.content.patterns.map((pattern, index) => (
                          <li key={index}>• {pattern}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {topic.content.techniques && (
                    <div className="space-y-2">
                      <h5 className="font-medium">Key Techniques</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {topic.content.techniques.map((technique, index) => (
                          <li key={index}>• {technique}</li>
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
              <CardTitle>Item Development Workflow</CardTitle>
              <CardDescription>A systematic approach to creating high-quality items</CardDescription>
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
            {/* Magic Crystal Item */}
            <Card className="hover:shadow-lg transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  Magic Crystal
                </CardTitle>
                <CardDescription>A collectible item with special properties</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Badge variant="outline">Beginner</Badge>
                  <Badge variant="outline">10 min</Badge>
                </div>
                <CodePreview
                  code={`{
  "format_version": "1.21.0",
  "minecraft:item": {
    "description": {
      "identifier": "my_addon:magic_crystal",
      "menu_category": {
        "category": "items"
      }
    },
    "components": {
      "minecraft:max_stack_size": 16,
      "minecraft:rarity": "rare",
      "minecraft:glint": true,
      "minecraft:icon": {
        "texture": "magic_crystal"
      }
    }
  }
}`}
                  language="json"
                  title="Magic Crystal Item"
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => onNavigate?.('builder-item')}
                  data-testid="open-crystal-builder"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Build This Example
                </Button>
              </CardContent>
            </Card>

            {/* Magic Sword Tool */}
            <Card className="hover:shadow-lg transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sword className="h-5 w-5 text-red-500" />
                  Enchanted Sword
                </CardTitle>
                <CardDescription>A powerful weapon with durability and enchantments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Badge variant="secondary">Intermediate</Badge>
                  <Badge variant="outline">25 min</Badge>
                </div>
                <CodePreview
                  code={`{
  "format_version": "1.21.0",
  "minecraft:item": {
    "description": {
      "identifier": "my_addon:enchanted_sword",
      "menu_category": {
        "category": "equipment"
      }
    },
    "components": {
      "minecraft:max_stack_size": 1,
      "minecraft:durability": {
        "max_durability": 800
      },
      "minecraft:enchantable": {
        "value": 15,
        "slot": "sword"
      },
      "minecraft:weapon": {
        "on_hurt_entity": {
          "event": "sword_hit_effect"
        }
      }
    }
  }
}`}
                  language="json"
                  title="Enchanted Sword"
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => onNavigate?.('builder-item')}
                  data-testid="open-sword-builder"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Build This Example
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}