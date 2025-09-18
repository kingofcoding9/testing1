import { useState } from "react";
import { 
  Search, Code, Copy, ExternalLink, Server, Terminal, Zap, 
  BookOpen, Database, Users, Globe, Gamepad2, MessageSquare,
  ChevronRight, CheckCircle, AlertTriangle, Info, Lightbulb,
  Play, Clock, Activity, BarChart3, Settings, Target, Layers,
  FileCode, Package, Shield, Eye, Wrench, Cpu, ArrowRight
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

// Import the existing ScriptingDocs to leverage its content
import ScriptingDocs from "../ScriptingDocs";

interface ScriptingApiTabProps {
  onNavigate?: (section: string) => void;
  onProgressUpdate?: (progress: number) => void;
}

export default function ScriptingApiTab({ onNavigate, onProgressUpdate }: ScriptingApiTabProps) {
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Advanced scripting topics
  const advancedTopics = [
    {
      id: 'performance-patterns',
      title: 'Performance Optimization Patterns',
      description: 'Writing efficient scripts that don\'t impact game performance',
      difficulty: 'advanced' as const,
      estimatedTime: '45 min',
      icon: BarChart3,
      content: {
        overview: 'Performance optimization is crucial for scripts that run frequently or handle large amounts of data.',
        patterns: [
          'Event batching and throttling',
          'Efficient entity querying and filtering',
          'Memory management and cleanup',
          'Asynchronous operation handling',
          'Caching strategies for expensive operations'
        ],
        example: `import { system, world } from '@minecraft/server';

// Efficient entity querying with batching
class EntityManager {
  private entityCache = new Map();
  private lastCacheUpdate = 0;
  private readonly CACHE_DURATION = 100; // ticks

  getEntitiesInRange(location, range, typeId) {
    const now = system.currentTick;
    const cacheKey = \`\${location.x},\${location.y},\${location.z}_\${range}_\${typeId}\`;
    
    if (now - this.lastCacheUpdate < this.CACHE_DURATION && 
        this.entityCache.has(cacheKey)) {
      return this.entityCache.get(cacheKey);
    }
    
    const entities = world.getEntities({
      location,
      maxDistance: range,
      type: typeId
    });
    
    this.entityCache.set(cacheKey, entities);
    this.lastCacheUpdate = now;
    return entities;
  }
}`
      }
    },
    {
      id: 'event-system-mastery',
      title: 'Event System Deep Dive',
      description: 'Advanced event handling and custom event systems',
      difficulty: 'advanced' as const,
      estimatedTime: '50 min',
      icon: Zap,
      content: {
        overview: 'Master the event system to create responsive and interactive addons.',
        concepts: [
          'Event priority and ordering',
          'Custom event creation and dispatch',
          'Event cancellation and modification',
          'Cross-script communication',
          'Event-driven architecture patterns'
        ],
        example: `import { world, system } from '@minecraft/server';

// Custom event system for addon communication
class EventBus {
  private listeners = new Map();

  on(eventName, callback, priority = 0) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    
    const eventListeners = this.listeners.get(eventName);
    eventListeners.push({ callback, priority });
    eventListeners.sort((a, b) => b.priority - a.priority);
  }

  emit(eventName, data) {
    const listeners = this.listeners.get(eventName);
    if (!listeners) return;

    for (const { callback } of listeners) {
      try {
        const result = callback(data);
        if (result === false) break; // Stop propagation
      } catch (error) {
        console.error(\`Event handler error for \${eventName}:\`, error);
      }
    }
  }
}

export const eventBus = new EventBus();`
      }
    },
    {
      id: 'debugging-testing',
      title: 'Debugging & Testing Strategies',
      description: 'Effective techniques for debugging and testing scripts',
      difficulty: 'intermediate' as const,
      estimatedTime: '35 min',
      icon: Wrench,
      content: {
        overview: 'Proper debugging and testing practices are essential for creating reliable scripts.',
        strategies: [
          'Console logging and debug output',
          'Error handling and graceful failures',
          'Unit testing for script functions',
          'Integration testing in game',
          'Performance profiling and monitoring'
        ],
        example: `// Debug utility class
class Debug {
  static enabled = true;
  static logLevel = 'info'; // 'debug', 'info', 'warn', 'error'
  
  static log(level, message, ...args) {
    if (!this.enabled) return;
    
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    
    if (messageLevelIndex >= currentLevelIndex) {
      console.log(\`[\${level.toUpperCase()}] \${message}\`, ...args);
    }
  }
  
  static debug(message, ...args) { this.log('debug', message, ...args); }
  static info(message, ...args) { this.log('info', message, ...args); }
  static warn(message, ...args) { this.log('warn', message, ...args); }
  static error(message, ...args) { this.log('error', message, ...args); }
}`
      }
    },
    {
      id: 'typescript-integration',
      title: 'TypeScript Development',
      description: 'Using TypeScript for better script development',
      difficulty: 'intermediate' as const,
      estimatedTime: '40 min',
      icon: FileCode,
      content: {
        overview: 'TypeScript provides type safety and better development experience for Minecraft scripts.',
        benefits: [
          'Type safety and error prevention',
          'Better IDE support and autocomplete',
          'Refactoring tools and navigation',
          'Interface definitions for complex data',
          'Compile-time error checking'
        ],
        setup: `// tsconfig.json for Minecraft Bedrock scripting
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}`
      }
    }
  ];

  // Scripting learning path
  const learningPath = [
    {
      id: 'basics',
      title: 'JavaScript/TypeScript Basics',
      description: 'Core language features and concepts',
      estimatedTime: '2 hours',
      icon: Code,
      topics: [
        'Variables, functions, and objects',
        'Async/await and promises',
        'Modules and imports',
        'Error handling'
      ]
    },
    {
      id: 'minecraft-apis',
      title: 'Minecraft API Fundamentals',
      description: 'Understanding the core Minecraft scripting APIs',
      estimatedTime: '3 hours',
      icon: Gamepad2,
      topics: [
        'World and dimension access',
        'Entity manipulation',
        'Block operations',
        'Player interactions'
      ]
    },
    {
      id: 'event-handling',
      title: 'Event-Driven Programming',
      description: 'Responding to game events and creating interactions',
      estimatedTime: '2 hours',
      icon: Zap,
      topics: [
        'Event subscription and handling',
        'Custom event creation',
        'Event timing and scheduling',
        'Performance considerations'
      ]
    },
    {
      id: 'advanced-systems',
      title: 'Advanced System Design',
      description: 'Creating complex, maintainable script systems',
      estimatedTime: '4 hours',
      icon: Layers,
      topics: [
        'Modular architecture patterns',
        'State management',
        'Cross-script communication',
        'Performance optimization'
      ]
    }
  ];

  // Quick reference sections
  const quickReference = [
    {
      id: 'common-apis',
      title: 'Most Used APIs',
      items: [
        { name: 'world.getPlayers()', description: 'Get all players in the world' },
        { name: 'player.runCommand()', description: 'Execute a command as a player' },
        { name: 'world.getEntities()', description: 'Query entities with filters' },
        { name: 'dimension.getBlock()', description: 'Get block at location' },
        { name: 'system.runTimeout()', description: 'Schedule delayed execution' }
      ]
    },
    {
      id: 'event-types',
      title: 'Common Events',
      items: [
        { name: 'world.afterEvents.playerJoin', description: 'When a player joins' },
        { name: 'world.afterEvents.itemUse', description: 'When an item is used' },
        { name: 'world.afterEvents.blockBreak', description: 'When a block is broken' },
        { name: 'world.afterEvents.entityHit', description: 'When an entity is hit' },
        { name: 'system.afterEvents.scriptEventReceive', description: 'Custom script events' }
      ]
    },
    {
      id: 'utilities',
      title: 'Utility Functions',
      items: [
        { name: 'Vector3Utils.add()', description: 'Vector addition operations' },
        { name: 'BlockPermutation.resolve()', description: 'Create block permutations' },
        { name: 'Entity.getComponent()', description: 'Access entity components' },
        { name: 'Player.sendMessage()', description: 'Send messages to players' },
        { name: 'Dimension.runCommand()', description: 'Execute commands in dimension' }
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
    <div className="space-y-6" data-testid="scripting-api-tab">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Scripting & APIs</h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Harness the power of JavaScript and TypeScript to create dynamic, interactive addons.
          From simple automation to complex game mechanics, scripting opens unlimited possibilities.
        </p>
      </div>

      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" data-testid="tab-overview">🎯 Overview</TabsTrigger>
          <TabsTrigger value="learning-path" data-testid="tab-learning">📚 Learning Path</TabsTrigger>
          <TabsTrigger value="api-reference" data-testid="tab-api">🔍 API Reference</TabsTrigger>
          <TabsTrigger value="advanced-topics" data-testid="tab-advanced">🚀 Advanced</TabsTrigger>
          <TabsTrigger value="examples" data-testid="tab-examples">💡 Examples</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Scripting Power
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">API Modules</span>
                    <span className="font-medium">8+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Available APIs</span>
                    <span className="font-medium">476+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Event Types</span>
                    <span className="font-medium">50+</span>
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => onNavigate?.('script-studio')}
                  data-testid="open-script-studio"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Open Script Studio
                </Button>
              </CardContent>
            </Card>

            {/* Key Capabilities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Key Capabilities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-center">World Manipulation</Badge>
                  <Badge variant="outline" className="w-full justify-center">Entity Control</Badge>
                  <Badge variant="outline" className="w-full justify-center">Player Interactions</Badge>
                  <Badge variant="outline" className="w-full justify-center">UI Systems</Badge>
                  <Badge variant="outline" className="w-full justify-center">Event Handling</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <FileCode className="h-4 w-4 mr-2" />
                  Script Template
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Eye className="h-4 w-4 mr-2" />
                  API Explorer
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Play className="h-4 w-4 mr-2" />
                  Example Scripts
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Wrench className="h-4 w-4 mr-2" />
                  Debug Tools
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Reference Sections */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickReference.map((section) => (
              <Card key={section.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{section.title}</CardTitle>
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

          {/* Scripting Modules Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Scripting Modules Overview</CardTitle>
              <CardDescription>Core modules available for Minecraft Bedrock scripting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Server className="h-4 w-4 text-blue-500" />
                    @minecraft/server
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Core server-side scripting capabilities
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>• World and dimension access</li>
                    <li>• Entity and player management</li>
                    <li>• Block operations</li>
                    <li>• Event system</li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-green-500" />
                    @minecraft/server-ui
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    User interface and form creation
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>• Modal forms and dialogs</li>
                    <li>• Action bars and titles</li>
                    <li>• Custom UI elements</li>
                    <li>• Player input handling</li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-red-500" />
                    @minecraft/server-admin
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Server administration and management
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>• Variable management</li>
                    <li>• Secret handling</li>
                    <li>• Server configuration</li>
                    <li>• Admin commands</li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4 text-purple-500" />
                    @minecraft/server-gametest
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Testing and validation framework
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>• Automated testing</li>
                    <li>• Structure templates</li>
                    <li>• Test assertions</li>
                    <li>• Mock environments</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Learning Path Tab */}
        <TabsContent value="learning-path" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scripting Learning Path</CardTitle>
              <CardDescription>A structured approach to mastering Minecraft Bedrock scripting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {learningPath.map((step, index) => (
                <div key={step.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900">
                      <step.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    {index < learningPath.length - 1 && (
                      <div className="w-px h-20 bg-border mt-2" />
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-lg">{step.title}</h4>
                        <p className="text-muted-foreground">{step.description}</p>
                      </div>
                      <Badge variant="outline">{step.estimatedTime}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {step.topics.map((topic, topicIndex) => (
                        <div key={topicIndex} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>{topic}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Reference Tab */}
        <TabsContent value="api-reference" className="space-y-6">
          {/* Embed the existing ScriptingDocs component */}
          <ScriptingDocs onNavigate={onNavigate} />
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
                        language="javascript"
                        title={`${topic.title} Example`}
                      />
                    </div>
                  )}

                  {topic.content.patterns && (
                    <div className="space-y-2">
                      <h5 className="font-medium">Key Patterns</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {topic.content.patterns.map((pattern, index) => (
                          <li key={index}>• {pattern}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {topic.content.concepts && (
                    <div className="space-y-2">
                      <h5 className="font-medium">Core Concepts</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {topic.content.concepts.map((concept, index) => (
                          <li key={index}>• {concept}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {topic.content.strategies && (
                    <div className="space-y-2">
                      <h5 className="font-medium">Strategies</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {topic.content.strategies.map((strategy, index) => (
                          <li key={index}>• {strategy}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {topic.content.benefits && (
                    <div className="space-y-2">
                      <h5 className="font-medium">Benefits</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {topic.content.benefits.map((benefit, index) => (
                          <li key={index}>• {benefit}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {topic.content.setup && (
                    <div className="space-y-2">
                      <h5 className="font-medium">Setup Configuration</h5>
                      <CodePreview
                        code={topic.content.setup}
                        language="json"
                        title="Configuration Example"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Examples Tab */}
        <TabsContent value="examples" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Simple Player Welcome Script */}
            <Card className="hover:shadow-lg transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-500" />
                  Player Welcome System
                </CardTitle>
                <CardDescription>Greet players when they join the world</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Badge variant="outline">Beginner</Badge>
                  <Badge variant="outline">10 min</Badge>
                </div>
                <CodePreview
                  code={`import { world } from '@minecraft/server';

// Welcome new players
world.afterEvents.playerJoin.subscribe((event) => {
  const player = event.player;
  
  // Send welcome message
  player.sendMessage('§aWelcome to our server!');
  
  // Give starter items
  const inventory = player.getComponent('inventory').container;
  inventory.addItem(new ItemStack('minecraft:bread', 5));
  
  // Teleport to spawn
  player.teleport({ x: 0, y: 70, z: 0 });
  
  console.log(\`Player \${player.name} joined the game\`);
});`}
                  language="javascript"
                  title="Welcome Script"
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => onNavigate?.('script-studio')}
                  data-testid="open-welcome-script"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Try This Script
                </Button>
              </CardContent>
            </Card>

            {/* Advanced Entity Controller */}
            <Card className="hover:shadow-lg transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-500" />
                  Dynamic Entity Controller
                </CardTitle>
                <CardDescription>Advanced entity manipulation and AI control</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Badge variant="destructive">Advanced</Badge>
                  <Badge variant="outline">45 min</Badge>
                </div>
                <CodePreview
                  code={`import { world, system } from '@minecraft/server';

class EntityController {
  constructor(entityTypeId) {
    this.entityTypeId = entityTypeId;
    this.controlledEntities = new Set();
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    world.afterEvents.entitySpawn.subscribe((event) => {
      if (event.entity.typeId === this.entityTypeId) {
        this.registerEntity(event.entity);
      }
    });
  }

  registerEntity(entity) {
    this.controlledEntities.add(entity);
    
    // Add custom behavior
    system.runInterval(() => {
      if (entity.isValid()) {
        this.updateEntityBehavior(entity);
      } else {
        this.controlledEntities.delete(entity);
      }
    }, 20); // Run every second
  }

  updateEntityBehavior(entity) {
    const nearbyPlayers = entity.dimension.getPlayers({
      location: entity.location,
      maxDistance: 10
    });

    if (nearbyPlayers.length > 0) {
      // Custom AI behavior when players are near
      entity.addTag('player_nearby');
    } else {
      entity.removeTag('player_nearby');
    }
  }
}

// Initialize controller for custom entities
const myEntityController = new EntityController('my_addon:custom_mob');`}
                  language="javascript"
                  title="Entity Controller"
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => onNavigate?.('script-studio')}
                  data-testid="open-entity-controller"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Try This Script
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}