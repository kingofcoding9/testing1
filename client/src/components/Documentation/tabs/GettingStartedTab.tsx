import { useState, useEffect } from "react";
import { 
  ChevronRight, BookOpen, FileText, Code, Layers, ArrowRight, Copy, Search, 
  Package, FolderTree, Settings, Play, CheckCircle, AlertCircle, 
  Download, Upload, Zap, BookmarkPlus, Eye, Lightbulb, Clock,
  Rocket, Target, Shield, Wrench, Users, Star, Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import CodePreview from "@/components/Common/CodePreview";

interface GettingStartedTabProps {
  onNavigate?: (section: string) => void;
  onProgressUpdate?: (progress: number) => void;
}

export default function GettingStartedTab({ onNavigate, onProgressUpdate }: GettingStartedTabProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [selectedTrack, setSelectedTrack] = useState('complete-beginner');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Learning tracks for different experience levels
  const learningTracks = {
    'complete-beginner': {
      title: 'Complete Beginner',
      description: 'Never created an addon before? Start here!',
      estimatedTime: '2-3 hours',
      difficulty: 'beginner' as const,
      icon: Rocket,
      steps: [
        {
          id: 'setup-environment',
          title: 'Setup Development Environment',
          description: 'Install tools and configure your workspace',
          estimatedTime: '20 min',
          completed: false
        },
        {
          id: 'understand-basics',
          title: 'Understand Addon Basics',
          description: 'Learn the fundamental concepts and structure',
          estimatedTime: '30 min',
          completed: false
        },
        {
          id: 'first-addon',
          title: 'Create Your First Addon',
          description: 'Build a simple custom block step by step',
          estimatedTime: '45 min',
          completed: false
        },
        {
          id: 'test-addon',
          title: 'Test in Minecraft',
          description: 'Load and test your addon in the game',
          estimatedTime: '15 min',
          completed: false
        },
        {
          id: 'next-steps',
          title: 'Next Steps',
          description: 'Where to go from here',
          estimatedTime: '10 min',
          completed: false
        }
      ]
    },
    'some-experience': {
      title: 'Some Experience',
      description: 'Familiar with basic modding concepts',
      estimatedTime: '1-2 hours',
      difficulty: 'intermediate' as const,
      icon: Target,
      steps: [
        {
          id: 'bedrock-differences',
          title: 'Bedrock vs Java Differences',
          description: 'Key differences from Java Edition modding',
          estimatedTime: '15 min',
          completed: false
        },
        {
          id: 'component-system',
          title: 'Component-Based Architecture',
          description: 'Understanding the component system',
          estimatedTime: '25 min',
          completed: false
        },
        {
          id: 'advanced-addon',
          title: 'Create an Advanced Addon',
          description: 'Build something with entities and behaviors',
          estimatedTime: '60 min',
          completed: false
        },
        {
          id: 'best-practices',
          title: 'Best Practices',
          description: 'Learn optimization and organization tips',
          estimatedTime: '20 min',
          completed: false
        }
      ]
    },
    'experienced': {
      title: 'Experienced Developer',
      description: 'Ready for advanced concepts and scripting',
      estimatedTime: '30-60 min',
      difficulty: 'advanced' as const,
      icon: Shield,
      steps: [
        {
          id: 'scripting-overview',
          title: 'Scripting API Overview',
          description: 'Introduction to JavaScript/TypeScript scripting',
          estimatedTime: '15 min',
          completed: false
        },
        {
          id: 'performance-optimization',
          title: 'Performance Optimization',
          description: 'Advanced optimization techniques',
          estimatedTime: '20 min',
          completed: false
        },
        {
          id: 'complex-systems',
          title: 'Complex System Design',
          description: 'Architecture patterns for large addons',
          estimatedTime: '25 min',
          completed: false
        }
      ]
    }
  };

  // Table of contents for comprehensive reference
  const tableOfContents = [
    { 
      id: 'environment-setup', 
      title: 'Development Environment Setup', 
      icon: Settings,
      description: 'Tools, software, and workspace configuration'
    },
    { 
      id: 'addon-basics', 
      title: 'Addon Architecture & Concepts', 
      icon: FolderTree,
      description: 'File structure, manifests, and basic concepts'
    },
    { 
      id: 'behavior-vs-resource', 
      title: 'Behavior vs Resource Packs', 
      icon: Package,
      description: 'Understanding the two pack types and when to use each'
    },
    { 
      id: 'identifiers-namespaces', 
      title: 'Identifiers & Namespaces', 
      icon: Code,
      description: 'Proper naming conventions and avoiding conflicts'
    },
    { 
      id: 'manifest-files', 
      title: 'Manifest Files Deep Dive', 
      icon: FileText,
      description: 'Complete manifest configuration and metadata'
    },
    { 
      id: 'component-system', 
      title: 'Component System Overview', 
      icon: Layers,
      description: 'How components work across entities, blocks, and items'
    },
    { 
      id: 'development-workflow', 
      title: 'Development Workflow', 
      icon: Wrench,
      description: 'Testing, debugging, and deployment strategies'
    },
    { 
      id: 'version-management', 
      title: 'Version Compatibility', 
      icon: BookmarkPlus,
      description: 'Format versions and backward compatibility'
    }
  ];

  // Update progress based on completed steps
  useEffect(() => {
    const track = learningTracks[selectedTrack as keyof typeof learningTracks];
    const completed = completedSteps.length;
    const total = track.steps.length;
    const progress = (completed / total) * 100;
    onProgressUpdate?.(progress);
  }, [completedSteps, selectedTrack, onProgressUpdate]);

  const markStepCompleted = (stepId: string) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
      toast({
        title: "Step completed!",
        description: "Great progress! Keep going.",
      });
    }
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

  // Filter table of contents based on search
  const filteredTOC = tableOfContents.filter(item =>
    searchTerm === '' || 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentTrack = learningTracks[selectedTrack as keyof typeof learningTracks];
  const progressPercentage = (completedSteps.length / currentTrack.steps.length) * 100;

  return (
    <div className="space-y-6" data-testid="getting-started-tab">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Welcome to Minecraft Bedrock Addon Development!</h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Learn everything you need to create amazing addons for Minecraft Bedrock Edition. 
          Whether you're a complete beginner or an experienced developer, we'll guide you through every step.
        </p>
      </div>

      <Tabs defaultValue="guided-learning" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="guided-learning" data-testid="tab-guided-learning">🎯 Guided Learning</TabsTrigger>
          <TabsTrigger value="quick-reference" data-testid="tab-quick-reference">📚 Quick Reference</TabsTrigger>
          <TabsTrigger value="examples" data-testid="tab-examples">💡 Examples & Templates</TabsTrigger>
        </TabsList>

        {/* Guided Learning Tab */}
        <TabsContent value="guided-learning" className="space-y-6">
          {/* Learning Track Selection */}
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold">Choose Your Learning Path</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(learningTracks).map(([key, track]) => (
                <Card 
                  key={key}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedTrack === key ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' : ''
                  }`}
                  onClick={() => setSelectedTrack(key)}
                  data-testid={`track-${key}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3 mb-2">
                      <track.icon className="h-6 w-6" />
                      <CardTitle className="text-lg">{track.title}</CardTitle>
                    </div>
                    <CardDescription>{track.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant={track.difficulty === 'beginner' ? 'default' : track.difficulty === 'intermediate' ? 'secondary' : 'destructive'}>
                        {track.difficulty}
                      </Badge>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {track.estimatedTime}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {track.steps.length} steps
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Selected Track Progress */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <currentTrack.icon className="h-6 w-6" />
                  <div>
                    <CardTitle>{currentTrack.title} Track</CardTitle>
                    <CardDescription>{currentTrack.description}</CardDescription>
                  </div>
                </div>
                <Badge variant="outline">
                  {completedSteps.length} / {currentTrack.steps.length} completed
                </Badge>
              </div>
              <Progress value={progressPercentage} className="mt-4" />
            </CardHeader>
            <CardContent className="space-y-4">
              {currentTrack.steps.map((step, index) => (
                <div 
                  key={step.id}
                  className={`p-4 rounded-lg border transition-all ${
                    completedSteps.includes(step.id) ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' :
                    index === currentStep ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800' :
                    'bg-gray-50 dark:bg-gray-950'
                  }`}
                  data-testid={`step-${step.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {completedSteps.includes(step.id) ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : (
                        <div className="h-6 w-6 rounded-full border-2 border-muted-foreground flex items-center justify-center">
                          <span className="text-sm font-medium">{index + 1}</span>
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium">{step.title}</h4>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">{step.estimatedTime}</span>
                      {!completedSteps.includes(step.id) && (
                        <Button
                          size="sm"
                          onClick={() => markStepCompleted(step.id)}
                          data-testid={`complete-${step.id}`}
                        >
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quick Reference Tab */}
        <TabsContent value="quick-reference" className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold">Quick Reference Guide</h3>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                  data-testid="reference-search"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTOC.map((item) => (
                <Card key={item.id} className="hover:shadow-lg transition-all cursor-pointer group">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </CardTitle>
                      <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Examples & Templates Tab */}
        <TabsContent value="examples" className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold">Starter Examples & Templates</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Basic Block Example */}
              <Card className="hover:shadow-lg transition-all">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Basic Custom Block
                  </CardTitle>
                  <CardDescription>Simple block with custom properties</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Badge variant="outline">Beginner</Badge>
                  <CodePreview
                    code={`{
  "format_version": "1.21.0",
  "minecraft:block": {
    "description": {
      "identifier": "my_addon:custom_stone"
    },
    "components": {
      "minecraft:destructible_by_mining": {
        "seconds_to_destroy": 3.0
      },
      "minecraft:friction": 0.6
    }
  }
}`}
                    language="json"
                    title="Basic Block Definition"
                  />
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => onNavigate?.('builder-block')}
                    className="w-full"
                    data-testid="open-block-builder"
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Open in Block Builder
                  </Button>
                </CardContent>
              </Card>

              {/* Simple Entity Example */}
              <Card className="hover:shadow-lg transition-all">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Friendly NPC
                  </CardTitle>
                  <CardDescription>Basic entity with movement and AI</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Badge variant="outline">Intermediate</Badge>
                  <CodePreview
                    code={`{
  "format_version": "1.21.0",
  "minecraft:entity": {
    "description": {
      "identifier": "my_addon:friendly_npc",
      "is_spawnable": true,
      "is_summonable": true
    },
    "components": {
      "minecraft:health": {
        "value": 20
      },
      "minecraft:movement": {
        "value": 0.25
      },
      "minecraft:behavior.look_at_player": {
        "priority": 1,
        "look_distance": 8
      }
    }
  }
}`}
                    language="json"
                    title="Simple Entity Definition"
                  />
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => onNavigate?.('builder-entity')}
                    className="w-full"
                    data-testid="open-entity-builder"
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Open in Entity Builder
                  </Button>
                </CardContent>
              </Card>

              {/* Custom Item Example */}
              <Card className="hover:shadow-lg transition-all">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Magic Wand Item
                  </CardTitle>
                  <CardDescription>Custom item with special properties</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Badge variant="outline">Beginner</Badge>
                  <CodePreview
                    code={`{
  "format_version": "1.21.0",
  "minecraft:item": {
    "description": {
      "identifier": "my_addon:magic_wand"
    },
    "components": {
      "minecraft:max_stack_size": 1,
      "minecraft:durability": {
        "max_durability": 100
      },
      "minecraft:enchantable": {
        "value": 10
      }
    }
  }
}`}
                    language="json"
                    title="Custom Item Definition"
                  />
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => onNavigate?.('builder-item')}
                    className="w-full"
                    data-testid="open-item-builder"
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Open in Item Builder
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Quick Start Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Start Actions</CardTitle>
              <CardDescription>Jump straight into creating content</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                onClick={() => onNavigate?.('builder-entity')}
                className="h-auto flex-col gap-2 p-4"
                data-testid="quick-start-entity"
              >
                <Target className="h-6 w-6" />
                Create Entity
              </Button>
              <Button 
                onClick={() => onNavigate?.('builder-block')}
                className="h-auto flex-col gap-2 p-4"
                variant="outline"
                data-testid="quick-start-block"
              >
                <Package className="h-6 w-6" />
                Create Block
              </Button>
              <Button 
                onClick={() => onNavigate?.('builder-item')}
                className="h-auto flex-col gap-2 p-4"
                variant="outline"
                data-testid="quick-start-item"
              >
                <Star className="h-6 w-6" />
                Create Item
              </Button>
              <Button 
                onClick={() => onNavigate?.('texture-creator')}
                className="h-auto flex-col gap-2 p-4"
                variant="outline"
                data-testid="quick-start-texture"
              >
                <Eye className="h-6 w-6" />
                Create Texture
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}