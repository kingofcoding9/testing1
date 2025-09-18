import { useState } from "react";
import { 
  Search, Image, Copy, ExternalLink, Filter, BookOpen, Palette, 
  Eye, Volume2, Sparkles, Layers, Play, Activity, Settings,
  ChevronRight, CheckCircle, AlertTriangle, Info, Lightbulb, 
  Download, Upload, ArrowRight, Code, FileText, Camera,
  Brush, Music, Film, Grid3X3, Zap, Target
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

interface ResourcePacksTabProps {
  onNavigate?: (section: string) => void;
  onProgressUpdate?: (progress: number) => void;
}

export default function ResourcePacksTab({ onNavigate, onProgressUpdate }: ResourcePacksTabProps) {
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Resource pack topics
  const resourceTopics = [
    {
      id: 'texture-creation',
      title: 'Texture Creation & Optimization',
      description: 'Creating beautiful, optimized textures for all game elements',
      difficulty: 'intermediate' as const,
      estimatedTime: '2 hours',
      icon: Brush,
      content: {
        overview: 'Texture creation is fundamental to resource packs, affecting every visual aspect of the game.',
        techniques: [
          'Proper UV mapping and texture layouts',
          'Compression and optimization techniques',
          'Animated texture creation',
          'Alpha channel and transparency',
          'Seamless texture tiling'
        ],
        resolutions: [
          '16x16 - Vanilla resolution',
          '32x32 - HD textures',
          '64x64 - High detail',
          '128x128+ - Ultra HD (performance impact)'
        ],
        formats: [
          'PNG - Standard format with transparency',
          'TGA - Alternative with alpha support',
          'Animated textures - .mcmeta files'
        ]
      }
    },
    {
      id: 'model-creation',
      title: 'Custom Models & Geometry',
      description: 'Creating 3D models for blocks, items, and entities',
      difficulty: 'advanced' as const,
      estimatedTime: '3 hours',
      icon: Grid3X3,
      content: {
        overview: 'Custom models allow you to break free from standard block shapes and create unique visual elements.',
        modelTypes: [
          'Block models - Custom block shapes',
          'Item models - Handheld and inventory items',
          'Entity models - Custom entity geometry',
          'Attachables - Wearable items and accessories'
        ],
        tools: [
          'Blockbench - Primary modeling tool',
          'Blender - Advanced 3D modeling',
          'MCreator - Visual model editor',
          'JSON editors - Manual editing'
        ]
      }
    },
    {
      id: 'animation-systems',
      title: 'Animation Systems',
      description: 'Creating smooth animations for models and textures',
      difficulty: 'advanced' as const,
      estimatedTime: '2.5 hours',
      icon: Play,
      content: {
        overview: 'Animations bring life to your models through movement, rotation, and transformation.',
        animationTypes: [
          'Texture animations - Animated block/item textures',
          'Model animations - 3D model movement',
          'Entity animations - Character and creature animations',
          'Particle animations - Visual effects'
        ],
        controllers: [
          'Animation controllers - Logic-based animation',
          'Render controllers - Conditional rendering',
          'State machines - Complex animation flows'
        ]
      }
    },
    {
      id: 'sound-integration',
      title: 'Sound & Audio Integration',
      description: 'Adding custom sounds and music to enhance immersion',
      difficulty: 'intermediate' as const,
      estimatedTime: '1.5 hours',
      icon: Volume2,
      content: {
        overview: 'Custom audio creates atmospheric and immersive experiences through sound effects and music.',
        audioTypes: [
          'Sound effects - Game interaction sounds',
          'Ambient sounds - Environmental audio',
          'Music - Background and situational music',
          'Voice lines - Character speech'
        ],
        formats: [
          'OGG Vorbis - Primary audio format',
          'WAV - Uncompressed audio',
          'MP3 - Compressed alternative'
        ]
      }
    },
    {
      id: 'ui-customization',
      title: 'UI Customization',
      description: 'Customizing the game interface and HUD elements',
      difficulty: 'advanced' as const,
      estimatedTime: '3 hours',
      icon: Settings,
      content: {
        overview: 'UI customization allows you to modify the game interface for better user experience.',
        uiElements: [
          'HUD elements - Health, hunger, hotbar',
          'Menu screens - Start, pause, settings',
          'Inventory interfaces - Chests, crafting',
          'Dialog boxes - Trading, books'
        ],
        techniques: [
          'Texture replacement - Swapping UI textures',
          'JSON modification - Changing UI behavior',
          'Custom fonts - Typography customization',
          'Icon replacement - Custom item/block icons'
        ]
      }
    },
    {
      id: 'particle-effects',
      title: 'Particle Effects',
      description: 'Creating stunning visual effects with particles',
      difficulty: 'advanced' as const,
      estimatedTime: '2 hours',
      icon: Sparkles,
      content: {
        overview: 'Particle effects add dynamic visual flair to your resource pack.',
        particleTypes: [
          'Environmental particles - Rain, snow, leaves',
          'Interactive particles - Breaking, hitting',
          'Magical effects - Spells, enchantments',
          'Atmospheric effects - Fog, dust, sparkles'
        ],
        properties: [
          'Emission patterns - How particles spawn',
          'Lifetime and decay - Particle duration',
          'Physics simulation - Movement and collision',
          'Texture and animation - Visual appearance'
        ]
      }
    }
  ];

  // Resource pack creation workflow
  const workflowSteps = [
    {
      id: 'planning-concept',
      title: '1. Planning & Concept',
      description: 'Define the visual style and scope',
      icon: Lightbulb,
      tasks: [
        'Define art style and theme',
        'Create reference mood boards',
        'Plan texture resolution',
        'Identify required assets'
      ]
    },
    {
      id: 'asset-creation',
      title: '2. Asset Creation',
      description: 'Create textures, models, and sounds',
      icon: Brush,
      tasks: [
        'Create base textures',
        'Design custom models',
        'Record or source audio',
        'Optimize file sizes'
      ]
    },
    {
      id: 'technical-implementation',
      title: '3. Technical Implementation',
      description: 'Implement assets in the resource pack',
      icon: Code,
      tasks: [
        'Structure pack directories',
        'Configure manifest files',
        'Set up model definitions',
        'Link audio files'
      ]
    },
    {
      id: 'testing-refinement',
      title: '4. Testing & Refinement',
      description: 'Test and polish the resource pack',
      icon: Eye,
      tasks: [
        'Test in-game appearance',
        'Check performance impact',
        'Refine animations',
        'Fix visual issues'
      ]
    },
    {
      id: 'distribution',
      title: '5. Distribution',
      description: 'Package and share your resource pack',
      icon: Upload,
      tasks: [
        'Package as .mcpack file',
        'Test installation process',
        'Create preview images',
        'Share with community'
      ]
    }
  ];

  // Quick reference for common tasks
  const quickReference = [
    {
      category: 'Texture Sizes',
      items: [
        { name: '16x16', description: 'Vanilla resolution, best performance' },
        { name: '32x32', description: 'HD quality, good balance' },
        { name: '64x64', description: 'High detail, moderate impact' },
        { name: '128x128+', description: 'Ultra HD, high impact' }
      ]
    },
    {
      category: 'File Formats',
      items: [
        { name: 'PNG', description: 'Standard for textures with transparency' },
        { name: 'JSON', description: 'Model and animation definitions' },
        { name: 'OGG', description: 'Audio files for sounds and music' },
        { name: 'MCMeta', description: 'Animation and metadata files' }
      ]
    },
    {
      category: 'Directory Structure',
      items: [
        { name: '/textures/', description: 'All texture files' },
        { name: '/models/', description: 'Custom geometry definitions' },
        { name: '/sounds/', description: 'Audio files and definitions' },
        { name: '/animations/', description: 'Animation files' }
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
    <div className="space-y-6" data-testid="resource-packs-tab">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Resource Packs</h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Transform the visual and audio experience of Minecraft with custom textures, models, animations, and sounds.
          Create immersive worlds that look and feel exactly as you envision.
        </p>
      </div>

      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" data-testid="tab-overview">🎯 Overview</TabsTrigger>
          <TabsTrigger value="creation-guides" data-testid="tab-guides">🎨 Creation Guides</TabsTrigger>
          <TabsTrigger value="workflow" data-testid="tab-workflow">📋 Workflow</TabsTrigger>
          <TabsTrigger value="examples" data-testid="tab-examples">💡 Examples</TabsTrigger>
          <TabsTrigger value="tools" data-testid="tab-tools">🛠️ Tools</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Resource Power
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Asset Types</span>
                    <span className="font-medium">6+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Texture Categories</span>
                    <span className="font-medium">20+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Model Types</span>
                    <span className="font-medium">10+</span>
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => onNavigate?.('texture-creator')}
                  data-testid="open-texture-creator"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Open Texture Creator
                </Button>
              </CardContent>
            </Card>

            {/* Key Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Key Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-center">Custom Textures</Badge>
                  <Badge variant="outline" className="w-full justify-center">3D Models</Badge>
                  <Badge variant="outline" className="w-full justify-center">Animations</Badge>
                  <Badge variant="outline" className="w-full justify-center">Sound Effects</Badge>
                  <Badge variant="outline" className="w-full justify-center">UI Customization</Badge>
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
                  Pack Template
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Brush className="h-4 w-4 mr-2" />
                  Texture Editor
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Grid3X3 className="h-4 w-4 mr-2" />
                  Model Creator
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Volume2 className="h-4 w-4 mr-2" />
                  Sound Manager
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

          {/* Resource Pack Structure */}
          <Card>
            <CardHeader>
              <CardTitle>Resource Pack Structure</CardTitle>
              <CardDescription>Understanding the anatomy of a resource pack</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    Core Files
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Essential files for pack function
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>• manifest.json - Pack metadata</li>
                    <li>• pack_icon.png - Pack thumbnail</li>
                    <li>• sounds.json - Audio definitions</li>
                    <li>• biomes_client.json - Biome visuals</li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Image className="h-4 w-4 text-green-500" />
                    Asset Directories
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Organized folders for different assets
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>• /textures/ - All texture files</li>
                    <li>• /models/ - 3D model definitions</li>
                    <li>• /sounds/ - Audio files</li>
                    <li>• /animations/ - Animation data</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Creation Guides Tab */}
        <TabsContent value="creation-guides" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {resourceTopics.map((topic) => (
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

                  {topic.content.modelTypes && (
                    <div className="space-y-2">
                      <h5 className="font-medium">Model Types</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {topic.content.modelTypes.map((type, index) => (
                          <li key={index}>• {type}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {topic.content.animationTypes && (
                    <div className="space-y-2">
                      <h5 className="font-medium">Animation Types</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {topic.content.animationTypes.map((type, index) => (
                          <li key={index}>• {type}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {topic.content.audioTypes && (
                    <div className="space-y-2">
                      <h5 className="font-medium">Audio Types</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {topic.content.audioTypes.map((type, index) => (
                          <li key={index}>• {type}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {topic.content.uiElements && (
                    <div className="space-y-2">
                      <h5 className="font-medium">UI Elements</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {topic.content.uiElements.map((element, index) => (
                          <li key={index}>• {element}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {topic.content.particleTypes && (
                    <div className="space-y-2">
                      <h5 className="font-medium">Particle Types</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {topic.content.particleTypes.map((type, index) => (
                          <li key={index}>• {type}</li>
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
              <CardTitle>Resource Pack Creation Workflow</CardTitle>
              <CardDescription>A step-by-step guide to creating professional resource packs</CardDescription>
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
            {/* Basic Resource Pack */}
            <Card className="hover:shadow-lg transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-purple-500" />
                  Basic Texture Pack
                </CardTitle>
                <CardDescription>Simple texture replacements for blocks and items</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Badge variant="outline">Beginner</Badge>
                  <Badge variant="outline">30 min</Badge>
                </div>
                <CodePreview
                  code={`{
  "format_version": 2,
  "header": {
    "description": "My Custom Texture Pack",
    "name": "Custom Textures",
    "uuid": "generated-uuid-here",
    "version": [1, 0, 0],
    "min_engine_version": [1, 20, 0]
  },
  "modules": [
    {
      "description": "Resource Pack",
      "type": "resources",
      "uuid": "generated-uuid-here",
      "version": [1, 0, 0]
    }
  ]
}`}
                  language="json"
                  title="Basic Resource Pack Manifest"
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => onNavigate?.('texture-creator')}
                  data-testid="create-texture-pack"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Create Texture Pack
                </Button>
              </CardContent>
            </Card>

            {/* Advanced Model Pack */}
            <Card className="hover:shadow-lg transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Grid3X3 className="h-5 w-5 text-green-500" />
                  Custom Model Pack
                </CardTitle>
                <CardDescription>Resource pack with custom 3D models and animations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Badge variant="destructive">Advanced</Badge>
                  <Badge variant="outline">2 hours</Badge>
                </div>
                <CodePreview
                  code={`{
  "format_version": "1.12.0",
  "minecraft:geometry": [
    {
      "description": {
        "identifier": "geometry.custom_block",
        "texture_width": 64,
        "texture_height": 64
      },
      "bones": [
        {
          "name": "root",
          "pivot": [0, 0, 0],
          "cubes": [
            {
              "origin": [-8, 0, -8],
              "size": [16, 12, 16],
              "uv": [0, 0]
            }
          ]
        }
      ]
    }
  ]
}`}
                  language="json"
                  title="Custom Block Geometry"
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  data-testid="create-model-pack"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Try Advanced Pack
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tools Tab */}
        <TabsContent value="tools" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Essential Tools for Resource Pack Creation</CardTitle>
              <CardDescription>Recommended tools and software for different aspects of resource pack development</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Texture Creation</h4>
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium">GIMP (Free)</h5>
                      <p className="text-sm text-muted-foreground">Powerful image editor with plugin support</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium">Paint.NET (Free)</h5>
                      <p className="text-sm text-muted-foreground">User-friendly editor with great plugins</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium">Photoshop (Paid)</h5>
                      <p className="text-sm text-muted-foreground">Industry standard with advanced features</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">3D Modeling</h4>
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium">Blockbench (Free)</h5>
                      <p className="text-sm text-muted-foreground">Minecraft-specific modeling tool</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium">Blender (Free)</h5>
                      <p className="text-sm text-muted-foreground">Professional 3D modeling suite</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium">Maya (Paid)</h5>
                      <p className="text-sm text-muted-foreground">Advanced modeling and animation</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Audio Editing</h4>
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium">Audacity (Free)</h5>
                      <p className="text-sm text-muted-foreground">Simple audio editor for sound effects</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium">Reaper (Paid)</h5>
                      <p className="text-sm text-muted-foreground">Professional audio workstation</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium">FL Studio (Paid)</h5>
                      <p className="text-sm text-muted-foreground">Music creation and sound design</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Pack Management</h4>
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium">VS Code (Free)</h5>
                      <p className="text-sm text-muted-foreground">JSON editing with extensions</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium">Bridge (Free)</h5>
                      <p className="text-sm text-muted-foreground">Minecraft addon development IDE</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium">Regolith (Free)</h5>
                      <p className="text-sm text-muted-foreground">Build system for addon development</p>
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