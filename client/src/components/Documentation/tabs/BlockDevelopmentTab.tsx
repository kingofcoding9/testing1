import { useState } from "react";
import { 
  Search, Box, Copy, ExternalLink, Filter, BookOpen, Layers, 
  Settings, Shield, Zap, Eye, Hammer, Pickaxe, Mountain,
  Grid3X3, Palette, Cog, Target, ChevronRight,
  CheckCircle, AlertTriangle, Info, Lightbulb, Play,
  Clock, Activity, BarChart3, Wrench, Building2,
  ArrowRight, Code, FileText
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

// Import the existing BlockDocs to leverage its content
import BlockDocs from "../BlockDocs";

interface BlockDevelopmentTabProps {
  onNavigate?: (section: string) => void;
  onProgressUpdate?: (progress: number) => void;
}

export default function BlockDevelopmentTab({ onNavigate, onProgressUpdate }: BlockDevelopmentTabProps) {
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Advanced block development topics
  const advancedTopics = [
    {
      id: 'redstone-integration',
      title: 'Redstone Integration',
      description: 'Creating blocks that interact with redstone circuits',
      difficulty: 'intermediate' as const,
      estimatedTime: '30 min',
      icon: Zap,
      content: {
        overview: 'Redstone integration allows your blocks to send and receive redstone signals, creating interactive contraptions.',
        example: `{
  "minecraft:block": {
    "description": {
      "identifier": "my_addon:redstone_sensor"
    },
    "components": {
      "minecraft:destructible_by_mining": {
        "seconds_to_destroy": 2.0
      },
      "minecraft:block_light_emission": 0,
      "minecraft:redstone_conductivity": {
        "redstone_conductor": true,
        "allows_wire_to_step_down": true
      }
    }
  }
}`
      }
    },
    {
      id: 'container-blocks',
      title: 'Container Blocks',
      description: 'Blocks with inventory storage and custom interfaces',
      difficulty: 'advanced' as const,
      estimatedTime: '45 min',
      icon: Box,
      content: {
        overview: 'Container blocks provide storage functionality and can have custom interfaces for player interaction.',
        example: `{
  "minecraft:block": {
    "description": {
      "identifier": "my_addon:storage_crate"
    },
    "components": {
      "minecraft:container": {
        "size": 27,
        "private": false
      },
      "minecraft:destructible_by_mining": {
        "seconds_to_destroy": 3.0
      }
    }
  }
}`
      }
    },
    {
      id: 'multi-block-structures',
      title: 'Multi-Block Structures',
      description: 'Creating structures that span multiple block positions',
      difficulty: 'advanced' as const,
      estimatedTime: '60 min',
      icon: Building2,
      content: {
        overview: 'Multi-block structures allow you to create large, complex constructions that work together as a single system.',
        tips: [
          'Use block tags to identify structure components',
          'Implement structure validation logic',
          'Handle partial structure destruction gracefully',
          'Consider performance implications of large structures'
        ]
      }
    },
    {
      id: 'custom-rendering',
      title: 'Custom Block Rendering',
      description: 'Advanced rendering techniques and custom geometries',
      difficulty: 'advanced' as const,
      estimatedTime: '40 min',
      icon: Eye,
      content: {
        overview: 'Custom rendering allows you to create blocks with unique visual appearances beyond standard cube shapes.',
        techniques: [
          'Custom geometry models',
          'Animated textures',
          'Particle effect integration',
          'Light emission patterns',
          'Transparency and blending modes'
        ]
      }
    }
  ];

  // Block creation workflow
  const workflowSteps = [
    {
      id: 'concept-planning',
      title: '1. Concept & Planning',
      description: 'Define the block\'s purpose and behavior',
      icon: Lightbulb,
      tasks: [
        'Define block functionality',
        'Plan interaction methods',
        'Consider placement rules',
        'Design visual appearance'
      ]
    },
    {
      id: 'basic-structure',
      title: '2. Basic Block Structure',
      description: 'Create the fundamental block definition',
      icon: Box,
      tasks: [
        'Set up block identifier',
        'Add core components',
        'Configure basic properties',
        'Test basic placement'
      ]
    },
    {
      id: 'mechanics-implementation',
      title: '3. Mechanics Implementation',
      description: 'Add gameplay mechanics and interactions',
      icon: Cog,
      tasks: [
        'Implement interaction logic',
        'Add state management',
        'Configure drop behavior',
        'Set up crafting recipes'
      ]
    },
    {
      id: 'visual-design',
      title: '4. Visual Design',
      description: 'Create textures and visual effects',
      icon: Palette,
      tasks: [
        'Create or assign textures',
        'Set up geometry if needed',
        'Add particle effects',
        'Configure lighting'
      ]
    },
    {
      id: 'integration-testing',
      title: '5. Integration & Testing',
      description: 'Test with other systems and optimize',
      icon: CheckCircle,
      tasks: [
        'Test block interactions',
        'Verify worldgen compatibility',
        'Optimize performance',
        'Test multiplayer scenarios'
      ]
    }
  ];

  // Block types and patterns
  const blockTypes = [
    {
      type: 'Decorative',
      description: 'Purely visual blocks for building',
      examples: ['Custom stones', 'Furniture blocks', 'Ornamental items'],
      difficulty: 'beginner' as const,
      icon: Palette
    },
    {
      type: 'Functional',
      description: 'Blocks with gameplay mechanics',
      examples: ['Crafting stations', 'Storage containers', 'Interactive devices'],
      difficulty: 'intermediate' as const,
      icon: Wrench
    },
    {
      type: 'Redstone',
      description: 'Blocks that interact with redstone',
      examples: ['Sensors', 'Logic gates', 'Automated systems'],
      difficulty: 'intermediate' as const,
      icon: Zap
    },
    {
      type: 'Advanced',
      description: 'Complex blocks with multiple systems',
      examples: ['Multi-block structures', 'Animated blocks', 'Network devices'],
      difficulty: 'advanced' as const,
      icon: Settings
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
    <div className="space-y-6" data-testid="block-development-tab">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Block Development</h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Create custom blocks that enhance Minecraft gameplay. From simple decorative blocks to complex
          mechanical systems, learn to build blocks that players will love to use.
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
                  <Box className="h-5 w-5" />
                  Block Basics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Component Types</span>
                    <span className="font-medium">40+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Block States</span>
                    <span className="font-medium">Unlimited</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Patterns</span>
                    <span className="font-medium">15+</span>
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => onNavigate?.('builder-block')}
                  data-testid="open-block-builder"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Open Block Builder
                </Button>
              </CardContent>
            </Card>

            {/* Key Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Key Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-center">Custom Textures</Badge>
                  <Badge variant="outline" className="w-full justify-center">Interaction Logic</Badge>
                  <Badge variant="outline" className="w-full justify-center">State Management</Badge>
                  <Badge variant="outline" className="w-full justify-center">Drop Control</Badge>
                  <Badge variant="outline" className="w-full justify-center">Redstone Integration</Badge>
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
                  Block Template
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Palette className="h-4 w-4 mr-2" />
                  Texture Creator
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Code className="h-4 w-4 mr-2" />
                  State Examples
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Wrench className="h-4 w-4 mr-2" />
                  Testing Tools
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Block Types Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Block Types & Categories</CardTitle>
              <CardDescription>Understanding different approaches to block creation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {blockTypes.map((blockType) => (
                  <div key={blockType.type} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <blockType.icon className="h-5 w-5" />
                        <h4 className="font-semibold">{blockType.type} Blocks</h4>
                      </div>
                      <Badge variant="outline" className={getDifficultyColor(blockType.difficulty)}>
                        {blockType.difficulty}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{blockType.description}</p>
                    <div className="space-y-1">
                      <h5 className="text-sm font-medium">Examples:</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {blockType.examples.map((example, index) => (
                          <li key={index}>• {example}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Block Component System */}
          <Card>
            <CardHeader>
              <CardTitle>Block Component System</CardTitle>
              <CardDescription>How components define block behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Box className="h-4 w-4 text-blue-500" />
                    Physical Properties
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Define how the block exists in the world
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>• Hardness & Mining</li>
                    <li>• Collision Detection</li>
                    <li>• Light Properties</li>
                    <li>• Material Type</li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4 text-green-500" />
                    Interaction System
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Control how players interact with blocks
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>• Click Interactions</li>
                    <li>• Placement Rules</li>
                    <li>• Break Behavior</li>
                    <li>• Drop Logic</li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    Dynamic Behavior
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Blocks that change and interact
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>• State Changes</li>
                    <li>• Tick Updates</li>
                    <li>• Redstone Logic</li>
                    <li>• Network Events</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Component Reference Tab */}
        <TabsContent value="component-reference" className="space-y-6">
          {/* Embed the existing BlockDocs component */}
          <BlockDocs onNavigate={onNavigate} />
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

                  {topic.content.tips && (
                    <div className="space-y-2">
                      <h5 className="font-medium">Best Practices</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {topic.content.tips.map((tip, index) => (
                          <li key={index}>• {tip}</li>
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
              <CardTitle>Block Development Workflow</CardTitle>
              <CardDescription>A systematic approach to creating high-quality blocks</CardDescription>
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
            {/* Simple Decorative Block */}
            <Card className="hover:shadow-lg transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-blue-500" />
                  Custom Stone Block
                </CardTitle>
                <CardDescription>A simple decorative block with custom properties</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Badge variant="outline">Beginner</Badge>
                  <Badge variant="outline">10 min</Badge>
                </div>
                <CodePreview
                  code={`{
  "format_version": "1.21.0",
  "minecraft:block": {
    "description": {
      "identifier": "my_addon:marble_block",
      "menu_category": {
        "category": "construction"
      }
    },
    "components": {
      "minecraft:destructible_by_mining": {
        "seconds_to_destroy": 3.0
      },
      "minecraft:destructible_by_explosion": {
        "explosion_resistance": 6.0
      },
      "minecraft:friction": 0.6
    }
  }
}`}
                  language="json"
                  title="Marble Block"
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => onNavigate?.('builder-block')}
                  data-testid="open-marble-block-builder"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Build This Example
                </Button>
              </CardContent>
            </Card>

            {/* Interactive Block */}
            <Card className="hover:shadow-lg transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-orange-500" />
                  Magic Workbench
                </CardTitle>
                <CardDescription>An interactive block with custom functionality</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Badge variant="secondary">Intermediate</Badge>
                  <Badge variant="outline">25 min</Badge>
                </div>
                <CodePreview
                  code={`{
  "format_version": "1.21.0",
  "minecraft:block": {
    "description": {
      "identifier": "my_addon:magic_workbench",
      "menu_category": {
        "category": "equipment"
      }
    },
    "components": {
      "minecraft:destructible_by_mining": {
        "seconds_to_destroy": 4.0
      },
      "minecraft:block_light_emission": 5,
      "minecraft:on_interact": {
        "event": "open_workbench_ui"
      }
    }
  }
}`}
                  language="json"
                  title="Magic Workbench"
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => onNavigate?.('builder-block')}
                  data-testid="open-workbench-builder"
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