import { useState } from "react";
import { 
  Search, Target, Copy, ExternalLink, Filter, BookOpen, Zap, 
  Info, Eye, Brain, Settings, Layers, Shield, Heart, 
  Activity, MapPin, Users, Clock, AlertTriangle, CheckCircle, 
  Play, Pause, SkipForward, HelpCircle, Github, FileText, TrendingUp,
  ArrowRight, ChevronRight, Lightbulb, Wrench, Code
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

// Import the existing EntityDocs to leverage its content
import EntityDocs from "../EntityDocs";

interface EntityDevelopmentTabProps {
  onNavigate?: (section: string) => void;
  onProgressUpdate?: (progress: number) => void;
}

export default function EntityDevelopmentTab({ onNavigate, onProgressUpdate }: EntityDevelopmentTabProps) {
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Advanced entity development topics
  const advancedTopics = [
    {
      id: 'state-machines',
      title: 'Entity State Machines',
      description: 'Advanced behavior control using state machines',
      difficulty: 'advanced' as const,
      estimatedTime: '45 min',
      icon: Brain,
      content: {
        overview: 'State machines provide a powerful way to control complex entity behaviors by defining discrete states and transitions.',
        example: `{
  "minecraft:entity": {
    "description": {
      "identifier": "my_addon:guard_entity",
      "is_spawnable": true
    },
    "component_groups": {
      "patrol_mode": {
        "minecraft:behavior.random_stroll": {
          "priority": 2,
          "speed_multiplier": 0.5
        }
      },
      "alert_mode": {
        "minecraft:behavior.nearest_attackable_target": {
          "priority": 1,
          "entity_types": [{"filters": {"test": "is_family", "subject": "other", "value": "player"}}]
        }
      },
      "combat_mode": {
        "minecraft:behavior.melee_attack": {
          "priority": 1,
          "speed_multiplier": 1.5
        }
      }
    },
    "events": {
      "enter_patrol": {"add": {"component_groups": ["patrol_mode"]}},
      "enter_alert": {"add": {"component_groups": ["alert_mode"]}},
      "enter_combat": {"add": {"component_groups": ["combat_mode"]}}
    }
  }
}`
      }
    },
    {
      id: 'animation-integration',
      title: 'Animation Integration',
      description: 'Syncing animations with entity behaviors and states',
      difficulty: 'intermediate' as const,
      estimatedTime: '30 min',
      icon: Play,
      content: {
        overview: 'Proper animation integration creates immersive entity experiences by syncing visual feedback with behavior.',
        example: `{
  "format_version": "1.21.0",
  "minecraft:client_entity": {
    "description": {
      "identifier": "my_addon:custom_mob"
    },
    "render_controllers": [
      "controller.render.custom_mob"
    ],
    "animations": {
      "walk": "animation.custom_mob.walk",
      "idle": "animation.custom_mob.idle",
      "attack": "animation.custom_mob.attack"
    },
    "animation_controllers": [
      "controller.animation.custom_mob.movement"
    ]
  }
}`
      }
    },
    {
      id: 'performance-optimization',
      title: 'Entity Performance Optimization',
      description: 'Optimization techniques for entity-heavy worlds',
      difficulty: 'advanced' as const,
      estimatedTime: '40 min',
      icon: TrendingUp,
      content: {
        overview: 'Optimize entity performance through component selection, behavior priorities, and efficient AI patterns.',
        tips: [
          'Use appropriate behavior priorities to prevent conflicts',
          'Limit expensive behaviors like pathfinding for distant entities',
          'Use component groups for state management instead of adding/removing components',
          'Implement entity culling for decorative entities',
          'Use efficient target selectors and filters'
        ]
      }
    },
    {
      id: 'multiplayer-considerations',
      title: 'Multiplayer Entity Design',
      description: 'Designing entities that work well in multiplayer environments',
      difficulty: 'advanced' as const,
      estimatedTime: '35 min',
      icon: Users,
      content: {
        overview: 'Multiplayer entities require careful consideration of networking, synchronization, and server performance.',
        considerations: [
          'Minimize server-side calculations for cosmetic entities',
          'Use appropriate targeting behaviors for multi-player scenarios',
          'Consider entity limits and spawn management',
          'Handle player disconnections gracefully',
          'Optimize for network bandwidth'
        ]
      }
    }
  ];

  // Entity creation workflow steps
  const workflowSteps = [
    {
      id: 'concept-design',
      title: '1. Concept & Design',
      description: 'Define the entity\'s purpose, behavior, and appearance',
      icon: Lightbulb,
      tasks: [
        'Define entity role and purpose',
        'Sketch behavior patterns',
        'Plan interaction systems',
        'Consider performance impact'
      ]
    },
    {
      id: 'basic-setup',
      title: '2. Basic Entity Setup',
      description: 'Create the basic entity structure and core components',
      icon: Settings,
      tasks: [
        'Set up entity identifier and description',
        'Add core components (health, movement)',
        'Configure basic spawning properties',
        'Test basic functionality'
      ]
    },
    {
      id: 'behavior-implementation',
      title: '3. Behavior Implementation',
      description: 'Add AI behaviors and interaction logic',
      icon: Brain,
      tasks: [
        'Implement movement behaviors',
        'Add targeting and combat logic',
        'Configure interaction behaviors',
        'Set up component groups for states'
      ]
    },
    {
      id: 'visual-polish',
      title: '4. Visual Polish',
      description: 'Add textures, models, and animations',
      icon: Eye,
      tasks: [
        'Create or assign textures',
        'Set up geometry and models',
        'Implement animations',
        'Add particle effects'
      ]
    },
    {
      id: 'testing-optimization',
      title: '5. Testing & Optimization',
      description: 'Test thoroughly and optimize performance',
      icon: CheckCircle,
      tasks: [
        'Test all behaviors and interactions',
        'Optimize component usage',
        'Test in multiplayer scenarios',
        'Validate performance impact'
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

  return (
    <div className="space-y-6" data-testid="entity-development-tab">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Entity Development</h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Master the art of creating custom entities in Minecraft Bedrock Edition. From simple mobs to complex AI systems,
          learn everything you need to bring your entity concepts to life.
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
                  <Target className="h-5 w-5" />
                  Entity Basics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Component Types</span>
                    <span className="font-medium">100+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Behavior Types</span>
                    <span className="font-medium">50+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">AI Patterns</span>
                    <span className="font-medium">25+</span>
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => onNavigate?.('builder-entity')}
                  data-testid="open-entity-builder"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Open Entity Builder
                </Button>
              </CardContent>
            </Card>

            {/* Key Concepts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Key Concepts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-center">Component System</Badge>
                  <Badge variant="outline" className="w-full justify-center">Behavior Priorities</Badge>
                  <Badge variant="outline" className="w-full justify-center">Component Groups</Badge>
                  <Badge variant="outline" className="w-full justify-center">Event System</Badge>
                  <Badge variant="outline" className="w-full justify-center">State Management</Badge>
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
                  Entity Template
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Eye className="h-4 w-4 mr-2" />
                  Behavior Examples
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Code className="h-4 w-4 mr-2" />
                  AI Patterns
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Wrench className="h-4 w-4 mr-2" />
                  Debug Tools
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Entity Architecture Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Entity Architecture Overview</CardTitle>
              <CardDescription>Understanding the component-based entity system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    Core Components
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Essential components that define basic entity properties
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>• Health & Damage</li>
                    <li>• Movement & Physics</li>
                    <li>• Collision & Hitbox</li>
                    <li>• Spawn Rules</li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Brain className="h-4 w-4 text-blue-500" />
                    Behavior Components
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    AI behaviors that control entity actions
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>• Movement Patterns</li>
                    <li>• Target Selection</li>
                    <li>• Combat Behaviors</li>
                    <li>• Interaction Logic</li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Eye className="h-4 w-4 text-green-500" />
                    Visual Components
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Rendering and visual effects
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>• Geometry & Models</li>
                    <li>• Textures & Materials</li>
                    <li>• Animations</li>
                    <li>• Particle Effects</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Common Entity Patterns */}
          <Card>
            <CardHeader>
              <CardTitle>Common Entity Patterns</CardTitle>
              <CardDescription>Proven patterns for different entity types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold">Passive Entities</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Random stroll behavior</li>
                    <li>• Avoid player on approach</li>
                    <li>• Panic when damaged</li>
                    <li>• Look at interesting entities</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold">Hostile Entities</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Target nearest attackable</li>
                    <li>• Melee or ranged attack</li>
                    <li>• Pursue and path-find</li>
                    <li>• Guard and patrol areas</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Utility Entities</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Interact with players</li>
                    <li>• Custom trade systems</li>
                    <li>• Follow specific players</li>
                    <li>• Conditional behaviors</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Environmental Entities</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Decorative and ambient</li>
                    <li>• Particle effect triggers</li>
                    <li>• Sound effect sources</li>
                    <li>• World interaction points</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Component Reference Tab */}
        <TabsContent value="component-reference" className="space-y-6">
          {/* Embed the existing EntityDocs component */}
          <EntityDocs onNavigate={onNavigate} />
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
                      <h5 className="font-medium">Optimization Tips</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {topic.content.tips.map((tip, index) => (
                          <li key={index}>• {tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {topic.content.considerations && (
                    <div className="space-y-2">
                      <h5 className="font-medium">Key Considerations</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {topic.content.considerations.map((consideration, index) => (
                          <li key={index}>• {consideration}</li>
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
              <CardTitle>Entity Development Workflow</CardTitle>
              <CardDescription>A step-by-step guide to creating professional entities</CardDescription>
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
            {/* Simple Friendly NPC */}
            <Card className="hover:shadow-lg transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-green-500" />
                  Friendly Village NPC
                </CardTitle>
                <CardDescription>A simple, approachable entity that looks at players</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Badge variant="outline">Beginner</Badge>
                  <Badge variant="outline">15 min</Badge>
                </div>
                <CodePreview
                  code={`{
  "format_version": "1.21.0",
  "minecraft:entity": {
    "description": {
      "identifier": "my_addon:friendly_villager",
      "is_spawnable": true,
      "is_summonable": true
    },
    "components": {
      "minecraft:health": {"value": 20},
      "minecraft:movement": {"value": 0.25},
      "minecraft:behavior.look_at_player": {
        "priority": 1,
        "look_distance": 8
      },
      "minecraft:behavior.random_stroll": {
        "priority": 2,
        "speed_multiplier": 0.8
      }
    }
  }
}`}
                  language="json"
                  title="Friendly NPC Entity"
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => onNavigate?.('builder-entity')}
                  data-testid="open-friendly-npc-builder"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Build This Example
                </Button>
              </CardContent>
            </Card>

            {/* Guard Entity */}
            <Card className="hover:shadow-lg transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-red-500" />
                  Guard Entity
                </CardTitle>
                <CardDescription>A protective entity that attacks threats</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Badge variant="destructive">Advanced</Badge>
                  <Badge variant="outline">45 min</Badge>
                </div>
                <CodePreview
                  code={`{
  "format_version": "1.21.0",
  "minecraft:entity": {
    "description": {
      "identifier": "my_addon:guard_entity",
      "is_spawnable": true
    },
    "components": {
      "minecraft:health": {"value": 40},
      "minecraft:movement": {"value": 0.3},
      "minecraft:behavior.nearest_attackable_target": {
        "priority": 1,
        "entity_types": [
          {"filters": {"test": "is_family", "subject": "other", "value": "monster"}}
        ]
      },
      "minecraft:behavior.melee_attack": {
        "priority": 2,
        "speed_multiplier": 1.2
      }
    }
  }
}`}
                  language="json"
                  title="Guard Entity"
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => onNavigate?.('builder-entity')}
                  data-testid="open-guard-builder"
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