import { useState } from "react";
import { 
  Search, Layers, Copy, ExternalLink, Filter, BookOpen, Zap, 
  Cpu, BarChart3, Network, Shield, Target, Settings,
  ChevronRight, CheckCircle, AlertTriangle, Info, Lightbulb, 
  Clock, Activity, Database, Code, FileText, Wrench,
  ArrowRight, TrendingUp, Brain, Users, Globe
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

interface AdvancedTopicsTabProps {
  onNavigate?: (section: string) => void;
  onProgressUpdate?: (progress: number) => void;
}

export default function AdvancedTopicsTab({ onNavigate, onProgressUpdate }: AdvancedTopicsTabProps) {
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Advanced topics
  const advancedTopics = [
    {
      id: 'performance-optimization',
      title: 'Performance Optimization',
      description: 'Advanced techniques for optimizing addon performance',
      difficulty: 'advanced' as const,
      estimatedTime: '3 hours',
      icon: TrendingUp,
      content: {
        overview: 'Performance optimization ensures your addons run smoothly without impacting game performance.',
        strategies: [
          'Entity optimization - Efficient AI and component usage',
          'Script optimization - Memory management and execution',
          'Asset optimization - Texture and model compression',
          'Network optimization - Multiplayer performance',
          'Memory management - Preventing memory leaks'
        ],
        metrics: [
          'Frame rate impact assessment',
          'Memory usage monitoring',
          'Entity count optimization',
          'Script execution profiling',
          'Network bandwidth analysis'
        ],
        tools: [
          'Minecraft profiler commands',
          'Performance monitoring tools',
          'Memory usage analyzers',
          'Script debuggers',
          'Network traffic monitors'
        ]
      }
    },
    {
      id: 'custom-components',
      title: 'Custom Component Development',
      description: 'Creating reusable components and systems',
      difficulty: 'advanced' as const,
      estimatedTime: '4 hours',
      icon: Layers,
      content: {
        overview: 'Custom components allow you to create modular, reusable systems that can be shared across projects.',
        componentTypes: [
          'Entity components - Reusable entity behaviors',
          'Block components - Custom block functionality',
          'Item components - Specialized item behaviors',
          'UI components - Custom interface elements',
          'System components - Cross-cutting concerns'
        ],
        designPrinciples: [
          'Single responsibility principle',
          'Dependency injection patterns',
          'Event-driven architecture',
          'State management patterns',
          'Error handling strategies'
        ],
        patterns: [
          'Factory patterns for component creation',
          'Observer patterns for event handling',
          'Strategy patterns for behavior variation',
          'Decorator patterns for feature extension',
          'Registry patterns for component management'
        ]
      }
    },
    {
      id: 'architecture-patterns',
      title: 'Complex Architecture Patterns',
      description: 'Design patterns for large-scale addon development',
      difficulty: 'advanced' as const,
      estimatedTime: '3.5 hours',
      icon: Brain,
      content: {
        overview: 'Architecture patterns help organize complex addons into maintainable, scalable systems.',
        patterns: [
          'Model-View-Controller (MVC) - Separation of concerns',
          'Entity-Component-System (ECS) - Data-driven design',
          'Observer pattern - Event-driven communication',
          'Command pattern - Action encapsulation',
          'State machine pattern - Complex state management'
        ],
        principles: [
          'Separation of concerns',
          'Dependency inversion',
          'Open/closed principle',
          'Interface segregation',
          'Single responsibility'
        ],
        scalability: [
          'Modular addon architecture',
          'Plugin system design',
          'Configuration management',
          'Asset loading strategies',
          'Performance monitoring'
        ]
      }
    },
    {
      id: 'version-compatibility',
      title: 'Version Compatibility Management',
      description: 'Handling different Minecraft versions and format updates',
      difficulty: 'intermediate' as const,
      estimatedTime: '2 hours',
      icon: Shield,
      content: {
        overview: 'Version compatibility ensures your addons work across different Minecraft versions.',
        strategies: [
          'Format version management',
          'Feature detection patterns',
          'Graceful degradation',
          'Version-specific implementations',
          'Migration strategies'
        ],
        challenges: [
          'API changes between versions',
          'Deprecated component handling',
          'New feature integration',
          'Backward compatibility',
          'Testing across versions'
        ],
        solutions: [
          'Conditional feature loading',
          'Version abstraction layers',
          'Feature flag systems',
          'Automated testing pipelines',
          'Documentation versioning'
        ]
      }
    },
    {
      id: 'memory-management',
      title: 'Memory Management & Optimization',
      description: 'Advanced memory optimization techniques',
      difficulty: 'advanced' as const,
      estimatedTime: '2.5 hours',
      icon: Brain,
      content: {
        overview: 'Proper memory management prevents performance issues and crashes in complex addons.',
        techniques: [
          'Object pooling for frequent allocations',
          'Garbage collection optimization',
          'Memory leak detection and prevention',
          'Efficient data structures',
          'Resource cleanup strategies'
        ],
        monitoring: [
          'Memory usage profiling',
          'Leak detection tools',
          'Performance metrics collection',
          'Resource tracking systems',
          'Automated testing for memory issues'
        ],
        patterns: [
          'Lazy loading for large assets',
          'Caching strategies for computed data',
          'Weak references for event handlers',
          'Resource disposal patterns',
          'Memory-efficient algorithms'
        ]
      }
    },
    {
      id: 'multiplayer-systems',
      title: 'Multiplayer System Design',
      description: 'Creating addons that work seamlessly in multiplayer',
      difficulty: 'advanced' as const,
      estimatedTime: '4 hours',
      icon: Users,
      content: {
        overview: 'Multiplayer systems require careful consideration of networking, synchronization, and server performance.',
        challenges: [
          'State synchronization between clients',
          'Network latency handling',
          'Server authority patterns',
          'Client prediction and rollback',
          'Bandwidth optimization'
        ],
        patterns: [
          'Client-server architecture',
          'Event-driven networking',
          'State replication systems',
          'Conflict resolution strategies',
          'Load balancing techniques'
        ],
        considerations: [
          'Server performance impact',
          'Network security concerns',
          'Player experience consistency',
          'Graceful disconnection handling',
          'Cross-platform compatibility'
        ]
      }
    }
  ];

  // Performance metrics and benchmarks
  const performanceMetrics = [
    {
      category: 'Entity Performance',
      metrics: [
        { name: 'Entity Count', target: '< 100 active', description: 'Active entities with AI' },
        { name: 'Component Updates', target: '< 1000/tick', description: 'Component updates per tick' },
        { name: 'Pathfinding', target: '< 10 active', description: 'Concurrent pathfinding operations' },
        { name: 'AI Complexity', target: '< 20 behaviors', description: 'Behaviors per entity' }
      ]
    },
    {
      category: 'Script Performance',
      metrics: [
        { name: 'Execution Time', target: '< 5ms/frame', description: 'Script execution per frame' },
        { name: 'Memory Usage', target: '< 100MB', description: 'Script memory consumption' },
        { name: 'Event Handlers', target: '< 50 active', description: 'Active event subscriptions' },
        { name: 'API Calls', target: '< 1000/sec', description: 'API calls per second' }
      ]
    },
    {
      category: 'Asset Performance',
      metrics: [
        { name: 'Texture Memory', target: '< 256MB', description: 'Total texture memory' },
        { name: 'Model Complexity', target: '< 1000 vertices', description: 'Vertices per model' },
        { name: 'Animation Data', target: '< 50MB', description: 'Animation memory usage' },
        { name: 'Audio Files', target: '< 100MB', description: 'Total audio memory' }
      ]
    }
  ];

  // Best practices by topic
  const bestPractices = [
    {
      topic: 'Code Organization',
      practices: [
        'Use modular architecture with clear separation of concerns',
        'Implement consistent naming conventions across all files',
        'Create reusable components and utility functions',
        'Document complex logic and architectural decisions',
        'Use version control with meaningful commit messages'
      ]
    },
    {
      topic: 'Performance',
      practices: [
        'Profile regularly and optimize bottlenecks',
        'Use object pooling for frequently created objects',
        'Implement lazy loading for large assets',
        'Cache expensive computations when possible',
        'Monitor memory usage and prevent leaks'
      ]
    },
    {
      topic: 'Testing',
      practices: [
        'Write automated tests for critical functionality',
        'Test across different game versions',
        'Perform load testing with many entities',
        'Test multiplayer scenarios thoroughly',
        'Use continuous integration for automated testing'
      ]
    },
    {
      topic: 'Maintenance',
      practices: [
        'Keep dependencies up to date',
        'Maintain comprehensive documentation',
        'Plan for version migrations early',
        'Monitor community feedback and bug reports',
        'Provide clear update and migration guides'
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
    <div className="space-y-6" data-testid="advanced-topics-tab">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Advanced Topics</h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Master advanced techniques for creating professional-grade addons. Learn performance optimization,
          complex architecture patterns, and best practices for large-scale development.
        </p>
      </div>

      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" data-testid="tab-overview">🎯 Overview</TabsTrigger>
          <TabsTrigger value="topics" data-testid="tab-topics">🚀 Advanced Topics</TabsTrigger>
          <TabsTrigger value="performance" data-testid="tab-performance">📊 Performance</TabsTrigger>
          <TabsTrigger value="patterns" data-testid="tab-patterns">🏗️ Patterns</TabsTrigger>
          <TabsTrigger value="best-practices" data-testid="tab-practices">💡 Best Practices</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Advanced Skills
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Topics Covered</span>
                    <span className="font-medium">6+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Design Patterns</span>
                    <span className="font-medium">15+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Optimization Techniques</span>
                    <span className="font-medium">25+</span>
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => onNavigate?.('script-studio')}
                  data-testid="open-advanced-tools"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Open Advanced Tools
                </Button>
              </CardContent>
            </Card>

            {/* Key Areas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Key Areas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-center">Performance</Badge>
                  <Badge variant="outline" className="w-full justify-center">Architecture</Badge>
                  <Badge variant="outline" className="w-full justify-center">Memory Management</Badge>
                  <Badge variant="outline" className="w-full justify-center">Multiplayer</Badge>
                  <Badge variant="outline" className="w-full justify-center">Optimization</Badge>
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
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Performance Tools
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Code className="h-4 w-4 mr-2" />
                  Architecture Guide
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Brain className="h-4 w-4 mr-2" />
                  Memory Profiler
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Network className="h-4 w-4 mr-2" />
                  Network Tools
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Advanced Development Principles */}
          <Card>
            <CardHeader>
              <CardTitle>Advanced Development Principles</CardTitle>
              <CardDescription>Core principles for professional addon development</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    Performance First
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Design with performance in mind from the beginning
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>• Profile early and often</li>
                    <li>• Optimize critical paths</li>
                    <li>• Monitor resource usage</li>
                    <li>• Test under load</li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Layers className="h-4 w-4 text-green-500" />
                    Modular Architecture
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Build systems that are maintainable and extensible
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>• Separate concerns clearly</li>
                    <li>• Use dependency injection</li>
                    <li>• Design for testability</li>
                    <li>• Plan for changes</li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-purple-500" />
                    Robust Error Handling
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Handle failures gracefully and provide good user experience
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>• Anticipate failure modes</li>
                    <li>• Provide meaningful errors</li>
                    <li>• Implement recovery strategies</li>
                    <li>• Log for debugging</li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4 text-orange-500" />
                    Multiplayer Awareness
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Design systems that work well in multiplayer environments
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>• Consider server performance</li>
                    <li>• Handle network latency</li>
                    <li>• Synchronize state properly</li>
                    <li>• Test with multiple players</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Topics Tab */}
        <TabsContent value="topics" className="space-y-6">
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
                  
                  {topic.content.strategies && (
                    <div className="space-y-2">
                      <h5 className="font-medium">Key Strategies</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {topic.content.strategies.map((strategy, index) => (
                          <li key={index}>• {strategy}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {topic.content.componentTypes && (
                    <div className="space-y-2">
                      <h5 className="font-medium">Component Types</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {topic.content.componentTypes.map((type, index) => (
                          <li key={index}>• {type}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {topic.content.patterns && (
                    <div className="space-y-2">
                      <h5 className="font-medium">Design Patterns</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {topic.content.patterns.map((pattern, index) => (
                          <li key={index}>• {pattern}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {topic.content.techniques && (
                    <div className="space-y-2">
                      <h5 className="font-medium">Techniques</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {topic.content.techniques.map((technique, index) => (
                          <li key={index}>• {technique}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {topic.content.challenges && (
                    <div className="space-y-2">
                      <h5 className="font-medium">Challenges</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {topic.content.challenges.map((challenge, index) => (
                          <li key={index}>• {challenge}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics & Benchmarks</CardTitle>
              <CardDescription>Target metrics for optimal addon performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {performanceMetrics.map((category) => (
                <div key={category.category} className="space-y-4">
                  <h4 className="text-lg font-semibold">{category.category}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {category.metrics.map((metric, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium">{metric.name}</h5>
                          <Badge variant="outline">{metric.target}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{metric.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Performance Tools */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Monitoring Tools</CardTitle>
              <CardDescription>Tools and techniques for measuring addon performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-blue-500" />
                    Built-in Profiling
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Use Minecraft's built-in profiling commands
                  </p>
                  <CodePreview
                    code="/execute run debug start
/execute run debug stop
/tick profiler start
/tick profiler stop"
                    language="text"
                    title="Profiler Commands"
                  />
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Brain className="h-4 w-4 text-green-500" />
                    Memory Monitoring
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Script-based memory usage tracking
                  </p>
                  <CodePreview
                    code={`// Memory usage tracking
class MemoryMonitor {
  track(name, obj) {
    const size = JSON.stringify(obj).length;
    console.log(\`\${name}: \${size} bytes\`);
  }
}`}
                    language="javascript"
                    title="Memory Monitor"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Patterns Tab */}
        <TabsContent value="patterns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Architecture Design Patterns</CardTitle>
              <CardDescription>Proven patterns for complex addon development</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-6">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-3">Entity-Component-System (ECS) Pattern</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Separate data (components) from logic (systems) for better performance and maintainability.
                  </p>
                  <CodePreview
                    code={`// ECS Implementation Example
class ComponentManager {
  constructor() {
    this.components = new Map();
  }
  
  addComponent(entityId, componentType, data) {
    if (!this.components.has(componentType)) {
      this.components.set(componentType, new Map());
    }
    this.components.get(componentType).set(entityId, data);
  }
  
  getComponent(entityId, componentType) {
    return this.components.get(componentType)?.get(entityId);
  }
}

class MovementSystem {
  update(componentManager) {
    const positions = componentManager.components.get('Position');
    const velocities = componentManager.components.get('Velocity');
    
    for (const [entityId, velocity] of velocities) {
      const position = positions.get(entityId);
      if (position) {
        position.x += velocity.x;
        position.y += velocity.y;
        position.z += velocity.z;
      }
    }
  }
}`}
                    language="javascript"
                    title="ECS Pattern Implementation"
                  />
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-3">Observer Pattern for Events</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Decouple event producers from consumers for flexible, maintainable event systems.
                  </p>
                  <CodePreview
                    code={`// Observer Pattern Implementation
class EventEmitter {
  constructor() {
    this.listeners = new Map();
  }
  
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }
  
  emit(event, data) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }
  
  off(event, callback) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }
}

// Usage
const gameEvents = new EventEmitter();
gameEvents.on('playerJoin', (player) => {
  console.log(\`\${player.name} joined the game\`);
});`}
                    language="javascript"
                    title="Observer Pattern for Events"
                  />
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-3">Factory Pattern for Component Creation</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Standardize object creation with configurable factories for different component types.
                  </p>
                  <CodePreview
                    code={`// Factory Pattern for Components
class ComponentFactory {
  static create(type, config) {
    switch (type) {
      case 'health':
        return new HealthComponent(config.maxHealth, config.currentHealth);
      case 'movement':
        return new MovementComponent(config.speed, config.acceleration);
      case 'inventory':
        return new InventoryComponent(config.size, config.items);
      default:
        throw new Error(\`Unknown component type: \${type}\`);
    }
  }
}

// Component definitions
class HealthComponent {
  constructor(maxHealth = 100, currentHealth = maxHealth) {
    this.maxHealth = maxHealth;
    this.currentHealth = currentHealth;
  }
}

class MovementComponent {
  constructor(speed = 1, acceleration = 0.1) {
    this.speed = speed;
    this.acceleration = acceleration;
  }
}

// Usage
const healthComp = ComponentFactory.create('health', { 
  maxHealth: 200, 
  currentHealth: 150 
});`}
                    language="javascript"
                    title="Factory Pattern Implementation"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Best Practices Tab */}
        <TabsContent value="best-practices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Development Best Practices</CardTitle>
              <CardDescription>Essential practices for professional addon development</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {bestPractices.map((section) => (
                <div key={section.topic} className="space-y-4">
                  <h4 className="text-lg font-semibold">{section.topic}</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {section.practices.map((practice, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{practice}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Advanced Testing Strategies */}
          <Card>
            <CardHeader>
              <CardTitle>Advanced Testing Strategies</CardTitle>
              <CardDescription>Comprehensive testing approaches for complex addons</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Unit Testing</h4>
                  <p className="text-sm text-muted-foreground mb-3">Test individual components in isolation</p>
                  <ul className="text-sm space-y-1">
                    <li>• Test component functionality</li>
                    <li>• Mock external dependencies</li>
                    <li>• Verify edge cases</li>
                    <li>• Automated test execution</li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Integration Testing</h4>
                  <p className="text-sm text-muted-foreground mb-3">Test component interactions</p>
                  <ul className="text-sm space-y-1">
                    <li>• Test system integration</li>
                    <li>• Verify data flow</li>
                    <li>• Test event handling</li>
                    <li>• Cross-component communication</li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Performance Testing</h4>
                  <p className="text-sm text-muted-foreground mb-3">Validate performance requirements</p>
                  <ul className="text-sm space-y-1">
                    <li>• Load testing with many entities</li>
                    <li>• Memory usage validation</li>
                    <li>• Frame rate impact measurement</li>
                    <li>• Stress testing scenarios</li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">User Acceptance Testing</h4>
                  <p className="text-sm text-muted-foreground mb-3">Validate real-world usage</p>
                  <ul className="text-sm space-y-1">
                    <li>• Player experience testing</li>
                    <li>• Multiplayer scenario testing</li>
                    <li>• Different device testing</li>
                    <li>• Community feedback integration</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}