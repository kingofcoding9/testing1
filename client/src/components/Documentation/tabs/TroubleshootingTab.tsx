import { useState } from "react";
import { 
  Search, AlertTriangle, Copy, ExternalLink, Filter, BookOpen, Wrench, 
  Bug, HelpCircle, Shield, Database, Network, Eye, Settings,
  ChevronRight, CheckCircle, Info, Lightbulb, Clock, Activity,
  Download, Upload, ArrowRight, Code, FileText, Zap,
  BarChart3, Users, Globe, Target, Layers
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

interface TroubleshootingTabProps {
  onNavigate?: (section: string) => void;
  onProgressUpdate?: (progress: number) => void;
}

export default function TroubleshootingTab({ onNavigate, onProgressUpdate }: TroubleshootingTabProps) {
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Common error categories
  const errorCategories = [
    {
      id: 'manifest-errors',
      title: 'Manifest & Configuration Errors',
      description: 'Issues with manifest.json and pack configuration',
      difficulty: 'beginner' as const,
      icon: FileText,
      errorCount: 12,
      commonErrors: [
        {
          error: 'Invalid manifest format',
          cause: 'Syntax errors in manifest.json',
          solution: 'Validate JSON syntax and format version',
          code: `{
  "format_version": 2,
  "header": {
    "description": "My Addon",
    "name": "My Addon",
    "uuid": "valid-uuid-here",
    "version": [1, 0, 0],
    "min_engine_version": [1, 20, 0]
  }
}`
        },
        {
          error: 'Pack not loading',
          cause: 'Incorrect file structure or missing files',
          solution: 'Check file paths and ensure all required files exist',
          steps: [
            'Verify manifest.json is in root directory',
            'Check all file paths are correct',
            'Ensure pack_icon.png exists',
            'Validate all JSON files'
          ]
        }
      ]
    },
    {
      id: 'scripting-errors',
      title: 'Scripting & Code Errors',
      description: 'JavaScript/TypeScript runtime and logic errors',
      difficulty: 'intermediate' as const,
      icon: Code,
      errorCount: 18,
      commonErrors: [
        {
          error: 'Script execution failed',
          cause: 'Runtime errors in JavaScript code',
          solution: 'Check console logs and fix syntax/logic errors',
          debugging: [
            'Use console.log() for debugging',
            'Check browser/game console for errors',
            'Validate API calls and parameters',
            'Test with simplified code first'
          ]
        },
        {
          error: 'API call failures',
          cause: 'Incorrect API usage or unavailable methods',
          solution: 'Verify API availability and correct usage',
          code: `// Check API availability before use
if (world && world.getPlayers) {
  const players = world.getPlayers();
  // Safe to use players array
} else {
  console.error('Players API not available');
}`
        }
      ]
    },
    {
      id: 'performance-issues',
      title: 'Performance & Optimization Issues',
      description: 'Frame drops, memory leaks, and performance problems',
      difficulty: 'advanced' as const,
      icon: BarChart3,
      errorCount: 8,
      commonErrors: [
        {
          error: 'Frame rate drops',
          cause: 'Too many entities or expensive operations',
          solution: 'Optimize entity counts and script execution',
          optimization: [
            'Limit active entities to <100',
            'Use entity pooling for frequent spawns',
            'Batch operations where possible',
            'Profile and optimize hot paths'
          ]
        },
        {
          error: 'Memory leaks',
          cause: 'Objects not being garbage collected',
          solution: 'Proper cleanup and memory management',
          prevention: [
            'Remove event listeners when done',
            'Clear object references',
            'Use weak references where appropriate',
            'Monitor memory usage during development'
          ]
        }
      ]
    },
    {
      id: 'multiplayer-issues',
      title: 'Multiplayer & Networking Issues',
      description: 'Problems that occur in multiplayer environments',
      difficulty: 'advanced' as const,
      icon: Users,
      errorCount: 10,
      commonErrors: [
        {
          error: 'Desync between players',
          cause: 'State not properly synchronized',
          solution: 'Implement proper state synchronization',
          patterns: [
            'Use server authority for important state',
            'Send state updates to all players',
            'Handle player disconnections gracefully',
            'Validate state changes on server'
          ]
        },
        {
          error: 'Network lag issues',
          cause: 'Too frequent network updates',
          solution: 'Optimize network communication',
          techniques: [
            'Batch network updates',
            'Use delta compression',
            'Prioritize important updates',
            'Implement client prediction'
          ]
        }
      ]
    },
    {
      id: 'compatibility-issues',
      title: 'Compatibility & Version Issues',
      description: 'Problems with different game versions or platforms',
      difficulty: 'intermediate' as const,
      icon: Globe,
      errorCount: 6,
      commonErrors: [
        {
          error: 'Addon not working on new version',
          cause: 'API changes or deprecated features',
          solution: 'Update code for new API versions',
          migration: [
            'Check format version requirements',
            'Update deprecated API calls',
            'Test on target game version',
            'Provide fallbacks for missing features'
          ]
        },
        {
          error: 'Platform-specific issues',
          cause: 'Different behavior on mobile/console',
          solution: 'Test and adapt for platform differences',
          considerations: [
            'Performance differences',
            'Input method variations',
            'Screen size adaptations',
            'Platform-specific limitations'
          ]
        }
      ]
    }
  ];

  // Debugging tools and techniques
  const debuggingTools = [
    {
      tool: 'Console Logging',
      description: 'Basic debugging with console output',
      usage: [
        'Use console.log() for variable inspection',
        'console.error() for error reporting',
        'console.warn() for warnings',
        'console.time() for performance timing'
      ],
      example: `// Debug logging example
console.log('Player count:', players.length);
console.error('Failed to spawn entity:', error);
console.time('entity-update');
// ... expensive operation
console.timeEnd('entity-update');`
    },
    {
      tool: 'Game Commands',
      description: 'Built-in Minecraft debugging commands',
      commands: [
        '/tick query - Check game tick rate',
        '/debug start/stop - Performance profiling',
        '/reload - Reload behavior packs',
        '/function - Test custom functions'
      ],
      example: `# Performance debugging
/tick query
/debug start
# ... perform actions to test
/debug stop`
    },
    {
      tool: 'Error Boundaries',
      description: 'Structured error handling in scripts',
      patterns: [
        'Try-catch blocks for error handling',
        'Graceful degradation on failures',
        'Error reporting to logs',
        'Recovery mechanisms'
      ],
      example: `try {
  // Potentially failing operation
  const result = dangerousOperation();
  console.log('Success:', result);
} catch (error) {
  console.error('Operation failed:', error);
  // Fallback behavior
  handleFailure();
}`
    }
  ];

  // Performance troubleshooting checklist
  const performanceChecklist = [
    {
      category: 'Entity Performance',
      checks: [
        { item: 'Entity count under 100 active entities', critical: true },
        { item: 'No entities with unused AI components', critical: true },
        { item: 'Pathfinding limited to nearby entities', critical: true },
        { item: 'Entity despawning working correctly', critical: false },
        { item: 'Entity pooling implemented for frequent spawns', critical: false }
      ]
    },
    {
      category: 'Script Performance',
      checks: [
        { item: 'Scripts execute under 5ms per frame', critical: true },
        { item: 'No infinite loops or runaway scripts', critical: true },
        { item: 'Event handlers are properly cleaned up', critical: true },
        { item: 'Heavy operations are batched or async', critical: false },
        { item: 'Memory usage is stable over time', critical: false }
      ]
    },
    {
      category: 'Asset Performance',
      checks: [
        { item: 'Textures are optimized for size', critical: false },
        { item: 'Models have reasonable vertex counts', critical: false },
        { item: 'Audio files are compressed', critical: false },
        { item: 'Animations are not too complex', critical: false },
        { item: 'Particle effects are optimized', critical: false }
      ]
    }
  ];

  // Quick fixes for common issues
  const quickFixes = [
    {
      problem: 'Addon not appearing in game',
      fixes: [
        'Check manifest.json syntax',
        'Verify file structure',
        'Restart Minecraft',
        'Clear game cache'
      ]
    },
    {
      problem: 'Script not running',
      fixes: [
        'Check console for errors',
        'Verify import statements',
        'Ensure proper event registration',
        'Test with minimal code'
      ]
    },
    {
      problem: 'Poor performance',
      fixes: [
        'Reduce entity count',
        'Optimize script execution',
        'Check for memory leaks',
        'Profile critical sections'
      ]
    },
    {
      problem: 'Multiplayer issues',
      fixes: [
        'Test with multiple players',
        'Check state synchronization',
        'Verify server authority',
        'Handle disconnections'
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
    <div className="space-y-6" data-testid="troubleshooting-tab">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Troubleshooting</h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Solve common problems and debug issues in your Minecraft Bedrock addons. From manifest errors to
          performance issues, find solutions to keep your addons running smoothly.
        </p>
      </div>

      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" data-testid="tab-overview">🎯 Overview</TabsTrigger>
          <TabsTrigger value="common-errors" data-testid="tab-errors">🐛 Common Errors</TabsTrigger>
          <TabsTrigger value="debugging" data-testid="tab-debugging">🔍 Debugging</TabsTrigger>
          <TabsTrigger value="performance" data-testid="tab-performance">⚡ Performance</TabsTrigger>
          <TabsTrigger value="quick-fixes" data-testid="tab-quick-fixes">🚀 Quick Fixes</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Issue Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Error Types</span>
                    <span className="font-medium">5+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Common Issues</span>
                    <span className="font-medium">54+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Debug Tools</span>
                    <span className="font-medium">10+</span>
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => onNavigate?.('validator')}
                  data-testid="open-debug-tools"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Open Debug Tools
                </Button>
              </CardContent>
            </Card>

            {/* Issue Types */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bug className="h-5 w-5" />
                  Issue Types
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-center">Manifest Errors</Badge>
                  <Badge variant="outline" className="w-full justify-center">Script Issues</Badge>
                  <Badge variant="outline" className="w-full justify-center">Performance</Badge>
                  <Badge variant="outline" className="w-full justify-center">Multiplayer</Badge>
                  <Badge variant="outline" className="w-full justify-center">Compatibility</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Validate Manifest
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Code className="h-4 w-4 mr-2" />
                  Check Scripts
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Performance Test
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Get Help
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Error Categories Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {errorCategories.slice(0, 3).map((category) => (
              <Card key={category.id} className="hover:shadow-lg transition-all cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <category.icon className="h-5 w-5" />
                      <CardTitle className="text-lg">{category.title}</CardTitle>
                    </div>
                    <Badge variant="outline">{category.errorCount} issues</Badge>
                  </div>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={getDifficultyColor(category.difficulty)}>
                      {category.difficulty}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      View Details
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Troubleshooting Process */}
          <Card>
            <CardHeader>
              <CardTitle>Systematic Troubleshooting Process</CardTitle>
              <CardDescription>Follow this process to efficiently diagnose and fix issues</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-2">
                    <Eye className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold mb-1">Identify</h4>
                  <p className="text-xs text-muted-foreground">What exactly is the problem?</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-2">
                    <Search className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold mb-1">Investigate</h4>
                  <p className="text-xs text-muted-foreground">Gather information and logs</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mb-2">
                    <Target className="h-6 w-6 text-orange-600" />
                  </div>
                  <h4 className="font-semibold mb-1">Isolate</h4>
                  <p className="text-xs text-muted-foreground">Narrow down the cause</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-2">
                    <Wrench className="h-6 w-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold mb-1">Fix</h4>
                  <p className="text-xs text-muted-foreground">Apply the solution</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-2">
                    <CheckCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <h4 className="font-semibold mb-1">Verify</h4>
                  <p className="text-xs text-muted-foreground">Test the fix thoroughly</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Common Errors Tab */}
        <TabsContent value="common-errors" className="space-y-6">
          <div className="space-y-6">
            {errorCategories.map((category) => (
              <Card key={category.id} className="hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <category.icon className="h-6 w-6" />
                      <div>
                        <CardTitle className="text-lg">{category.title}</CardTitle>
                        <CardDescription>{category.description}</CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={category.difficulty === 'advanced' ? 'destructive' : category.difficulty === 'intermediate' ? 'secondary' : 'outline'}>
                        {category.difficulty}
                      </Badge>
                      <div className="text-sm text-muted-foreground mt-1">{category.errorCount} common issues</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Accordion type="single" collapsible>
                    {category.commonErrors.map((error, index) => (
                      <AccordionItem key={index} value={`error-${category.id}-${index}`}>
                        <AccordionTrigger className="text-left">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            <span className="font-medium">{error.error}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h5 className="font-medium mb-2 text-red-700 dark:text-red-300">Cause:</h5>
                              <p className="text-sm text-muted-foreground">{error.cause}</p>
                            </div>
                            <div>
                              <h5 className="font-medium mb-2 text-green-700 dark:text-green-300">Solution:</h5>
                              <p className="text-sm text-muted-foreground">{error.solution}</p>
                            </div>
                          </div>
                          
                          {error.code && (
                            <div className="space-y-2">
                              <h5 className="font-medium">Example Fix:</h5>
                              <CodePreview
                                code={error.code}
                                language="json"
                                title="Solution Code"
                              />
                            </div>
                          )}

                          {error.steps && (
                            <div className="space-y-2">
                              <h5 className="font-medium">Steps to Fix:</h5>
                              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                                {error.steps.map((step, stepIndex) => (
                                  <li key={stepIndex}>{step}</li>
                                ))}
                              </ol>
                            </div>
                          )}

                          {error.debugging && (
                            <div className="space-y-2">
                              <h5 className="font-medium">Debugging Tips:</h5>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                {error.debugging.map((tip, tipIndex) => (
                                  <li key={tipIndex}>• {tip}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {error.optimization && (
                            <div className="space-y-2">
                              <h5 className="font-medium">Optimization Tips:</h5>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                {error.optimization.map((tip, tipIndex) => (
                                  <li key={tipIndex}>• {tip}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Debugging Tab */}
        <TabsContent value="debugging" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Debugging Tools & Techniques</CardTitle>
              <CardDescription>Essential tools and methods for diagnosing addon issues</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {debuggingTools.map((tool, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4">
                  <h4 className="text-lg font-semibold">{tool.tool}</h4>
                  <p className="text-sm text-muted-foreground">{tool.description}</p>
                  
                  {tool.usage && (
                    <div className="space-y-2">
                      <h5 className="font-medium">Usage:</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {tool.usage.map((usage, usageIndex) => (
                          <li key={usageIndex}>• {usage}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {tool.commands && (
                    <div className="space-y-2">
                      <h5 className="font-medium">Commands:</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {tool.commands.map((command, commandIndex) => (
                          <li key={commandIndex} className="font-mono">• {command}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {tool.patterns && (
                    <div className="space-y-2">
                      <h5 className="font-medium">Patterns:</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {tool.patterns.map((pattern, patternIndex) => (
                          <li key={patternIndex}>• {pattern}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {tool.example && (
                    <div className="space-y-2">
                      <h5 className="font-medium">Example:</h5>
                      <CodePreview
                        code={tool.example}
                        language={tool.tool.includes('Command') ? 'bash' : 'javascript'}
                        title={`${tool.tool} Example`}
                      />
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Advanced Debugging */}
          <Card>
            <CardHeader>
              <CardTitle>Advanced Debugging Techniques</CardTitle>
              <CardDescription>Professional debugging strategies for complex issues</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Bisection Debugging</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Systematically disable half of your code to isolate issues
                  </p>
                  <ol className="text-sm space-y-1 list-decimal list-inside">
                    <li>Disable half of your features</li>
                    <li>Test if issue persists</li>
                    <li>Focus on the problematic half</li>
                    <li>Repeat until issue is isolated</li>
                  </ol>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Rubber Duck Debugging</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Explain your problem step-by-step to find the solution
                  </p>
                  <ol className="text-sm space-y-1 list-decimal list-inside">
                    <li>Describe what should happen</li>
                    <li>Explain what actually happens</li>
                    <li>Walk through the code logic</li>
                    <li>Often reveals the problem</li>
                  </ol>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Log Analysis</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Use structured logging to trace execution flow
                  </p>
                  <CodePreview
                    code={`// Structured logging
const logger = {
  trace: (msg, data) => console.log(\`[TRACE] \${msg}\`, data),
  error: (msg, error) => console.error(\`[ERROR] \${msg}\`, error)
};

logger.trace('Starting entity update', { entityId });
logger.error('Failed to update entity', error);`}
                    language="javascript"
                    title="Structured Logging"
                  />
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Performance Profiling</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Measure and optimize performance bottlenecks
                  </p>
                  <CodePreview
                    code={`// Performance profiling
console.time('entity-system-update');
updateAllEntities();
console.timeEnd('entity-system-update');

// Memory usage tracking
console.log('Memory usage:', 
  performance.memory?.usedJSHeapSize || 'N/A');`}
                    language="javascript"
                    title="Performance Profiling"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Troubleshooting Checklist</CardTitle>
              <CardDescription>Systematic checks to identify and resolve performance issues</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {performanceChecklist.map((category) => (
                <div key={category.category} className="space-y-4">
                  <h4 className="text-lg font-semibold">{category.category}</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {category.checks.map((check, index) => (
                      <div key={index} className={`flex items-center gap-3 p-3 border rounded-lg ${check.critical ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950' : 'border-border'}`}>
                        <input 
                          type="checkbox" 
                          className="h-4 w-4" 
                          data-testid={`perf-check-${category.category.toLowerCase()}-${index}`}
                        />
                        <span className="text-sm flex-1">{check.item}</span>
                        {check.critical && (
                          <Badge variant="destructive" className="text-xs">Critical</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Performance Monitoring */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Monitoring Tools</CardTitle>
              <CardDescription>Tools and commands for monitoring addon performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Game Commands</h4>
                  <CodePreview
                    code={`# Check tick rate
/tick query

# Performance profiling
/debug start
# ... perform test actions
/debug stop

# Memory information
/tellraw @s {"rawtext":[{"text":"Entities: "},{"score":{"name":"*","objective":"entity_count"}}]}`}
                    language="text"
                    title="Performance Commands"
                  />
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Script Monitoring</h4>
                  <CodePreview
                    code={`// Performance monitoring class
class PerformanceMonitor {
  static startTimer(name) {
    console.time(name);
  }
  
  static endTimer(name) {
    console.timeEnd(name);
  }
  
  static logMemory() {
    if (performance.memory) {
      console.log('Memory:', {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize
      });
    }
  }
}`}
                    language="javascript"
                    title="Script Performance Monitor"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quick Fixes Tab */}
        <TabsContent value="quick-fixes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Fixes for Common Problems</CardTitle>
              <CardDescription>Immediate solutions for frequently encountered issues</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {quickFixes.map((fix, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <h4 className="font-semibold text-lg">{fix.problem}</h4>
                    <div className="space-y-2">
                      <h5 className="font-medium text-sm">Quick Fixes:</h5>
                      <ul className="space-y-2">
                        {fix.fixes.map((solution, solutionIndex) => (
                          <li key={solutionIndex} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span>{solution}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Emergency Troubleshooting */}
          <Card>
            <CardHeader>
              <CardTitle>Emergency Troubleshooting</CardTitle>
              <CardDescription>When everything breaks - steps to get back to a working state</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-950">
                <h4 className="font-semibold mb-3 text-red-800 dark:text-red-200">🚨 Emergency Recovery Steps</h4>
                <ol className="text-sm text-red-700 dark:text-red-300 space-y-2 list-decimal list-inside">
                  <li><strong>Disable the addon</strong> - Remove from active packs to stop further damage</li>
                  <li><strong>Backup your world</strong> - Create a backup before any major changes</li>
                  <li><strong>Restart Minecraft</strong> - Clear any memory issues or stuck processes</li>
                  <li><strong>Check recent changes</strong> - Revert the last modifications made</li>
                  <li><strong>Test with minimal code</strong> - Strip down to basics and rebuild</li>
                  <li><strong>Validate all JSON</strong> - Ensure all files have correct syntax</li>
                  <li><strong>Clear cache</strong> - Remove cached files and temporary data</li>
                  <li><strong>Reinstall addon</strong> - Fresh installation to rule out corruption</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Community Support */}
          <Card>
            <CardHeader>
              <CardTitle>Getting Community Help</CardTitle>
              <CardDescription>How to effectively ask for help when you're stuck</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">What to Include</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Clear description of the problem</li>
                    <li>• Steps to reproduce the issue</li>
                    <li>• Expected vs actual behavior</li>
                    <li>• Error messages and logs</li>
                    <li>• Relevant code snippets</li>
                    <li>• Game version and platform</li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Where to Get Help</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Official Minecraft Discord</li>
                    <li>• Bedrock Addons Reddit</li>
                    <li>• GitHub issues for tools</li>
                    <li>• Stack Overflow</li>
                    <li>• Community forums</li>
                    <li>• Developer documentation</li>
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