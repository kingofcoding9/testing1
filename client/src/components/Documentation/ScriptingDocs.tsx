import { useState } from "react";
import { 
  Search, Code, Copy, ExternalLink, Server, Terminal, Zap, 
  BookOpen, Database, Users, Globe, Gamepad2, MessageSquare,
  ChevronRight, CheckCircle, AlertTriangle, Info, Lightbulb,
  Play, Clock, Activity, BarChart3, Settings, Target, Layers,
  FileCode, Package, Shield, Eye, Wrench, Cpu
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
import { minecraftRegistry } from "../../../../shared/minecraftRegistry";
import type { ApiElement } from "../../../../shared/scriptRegistry";

interface ScriptingDocsProps {
  onNavigate?: (section: string) => void;
}

// Create a flat array of API elements from the registry for filtering
const scriptRegistry: ApiElement[] = Object.values(minecraftRegistry.modules)
  .flatMap(module => module.elements);

export default function ScriptingDocs({ onNavigate }: ScriptingDocsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAPI, setSelectedAPI] = useState<ApiElement | null>(null);
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'class' | 'interface' | 'enum' | 'function' | 'constant'>('all');
  const [stabilityFilter, setStabilityFilter] = useState<'all' | 'stable' | 'experimental' | 'beta'>('all');
  const [selectedTutorial, setSelectedTutorial] = useState<string>('getting-started');
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

  // Filter APIs based on search and filters
  const filteredAPIs = scriptRegistry.filter(api => {
    const matchesSearch = searchTerm === '' || 
      api.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      api.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      api.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
      api.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesModule = moduleFilter === 'all' || api.module === moduleFilter;
    const matchesType = typeFilter === 'all' || api.type === typeFilter;
    const matchesStability = stabilityFilter === 'all' || api.stability === stabilityFilter;
    
    return matchesSearch && matchesModule && matchesType && matchesStability;
  });

  // Group APIs by module
  const apisByModule = filteredAPIs.reduce((acc, api) => {
    const module = api.module;
    if (!acc[module]) {
      acc[module] = [];
    }
    acc[module].push(api);
    return acc;
  }, {} as Record<string, ApiElement[]>);

  // Get unique modules for filter
  const modules = Array.from(new Set(scriptRegistry.map((api: ApiElement) => api.module)));
  
  // Module icons mapping
  const moduleIcons: Record<string, any> = {
    '@minecraft/server': Server,
    '@minecraft/server-ui': MessageSquare,
    '@minecraft/server-admin': Shield,
    '@minecraft/server-gametest': Target,
    '@minecraft/server-net': Globe,
    '@minecraft/vanilla-data': Database,
    'system': Cpu,
    'common': Package
  };

  // Tutorial examples
  const tutorials = {
    'getting-started': {
      title: 'Getting Started with Scripting',
      description: 'Your first script and basic setup',
      difficulty: 'beginner' as const,
      estimatedTime: '15 minutes',
      sections: [
        {
          title: 'Setup Your Script',
          content: 'Create a new script file in your behavior pack',
          code: `// scripts/main.js
import { world, system } from '@minecraft/server';

// This is your main script file
console.log('Script loaded successfully!');

// Basic world interaction
world.sendMessage('§aHello from scripts!');`
        },
        {
          title: 'Event Handling',
          content: 'Listen for game events',
          code: `import { world } from '@minecraft/server';

// Listen for player spawn
world.afterEvents.playerSpawn.subscribe((event) => {
  const player = event.player;
  player.sendMessage(\`Welcome \${player.name}!\`);
  
  // Give starter items
  const inventory = player.getComponent('inventory');
  if (inventory) {
    inventory.container?.addItem(
      new ItemStack('minecraft:apple', 5)
    );
  }
});`
        }
      ]
    },
    'event-systems': {
      title: 'Advanced Event Systems',
      description: 'Master the event system for complex behaviors',
      difficulty: 'intermediate' as const,
      estimatedTime: '30 minutes',
      sections: [
        {
          title: 'Before vs After Events',
          content: 'Understanding event timing and cancellation',
          code: `import { world } from '@minecraft/server';

// Before events can be cancelled
world.beforeEvents.itemUse.subscribe((event) => {
  const { source, itemStack } = event;
  
  if (itemStack.typeId === 'minecraft:ender_pearl') {
    // Cancel the event to prevent teleportation
    event.cancel = true;
    source.sendMessage('§cEnder pearls are disabled!');
  }
});

// After events provide information after action
world.afterEvents.itemUse.subscribe((event) => {
  const { source, itemStack } = event;
  
  // Log item usage for analytics
  console.log(\`\${source.name} used \${itemStack.typeId}\`);
});`
        },
        {
          title: 'Custom Event Handling',
          content: 'Create custom event systems',
          code: `import { world, system } from '@minecraft/server';

class CustomEventManager {
  private listeners = new Map<string, Function[]>();
  
  on(eventName: string, callback: Function) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    this.listeners.get(eventName)!.push(callback);
  }
  
  emit(eventName: string, data: any) {
    const callbacks = this.listeners.get(eventName) || [];
    callbacks.forEach(callback => callback(data));
  }
}

const eventManager = new CustomEventManager();

// Register custom event
eventManager.on('playerLevelUp', (data) => {
  const { player, newLevel } = data;
  world.sendMessage(\`\${player.name} reached level \${newLevel}!\`);
});

// Trigger custom event
eventManager.emit('playerLevelUp', { 
  player: somePlayer, 
  newLevel: 10 
});`
        }
      ]
    },
    'ui-systems': {
      title: 'User Interface Development',
      description: 'Create interactive UIs and forms',
      difficulty: 'intermediate' as const,
      estimatedTime: '25 minutes',
      sections: [
        {
          title: 'Action Forms',
          content: 'Simple button-based menus',
          code: `import { ActionFormData } from '@minecraft/server-ui';
import { world } from '@minecraft/server';

class MenuSystem {
  static async showMainMenu(player) {
    const form = new ActionFormData()
      .title('§6Server Menu')
      .body('Choose an option:')
      .button('§aTeleport Hub', 'textures/ui/world_glyph_color')
      .button('§bPlayer Stats', 'textures/ui/icon_steve')
      .button('§eShop', 'textures/ui/coin')
      .button('§cClose');
    
    const response = await form.show(player);
    
    if (response.canceled) return;
    
    switch (response.selection) {
      case 0:
        player.teleport({ x: 0, y: 64, z: 0 });
        break;
      case 1:
        this.showPlayerStats(player);
        break;
      case 2:
        this.showShop(player);
        break;
    }
  }
}`
        },
        {
          title: 'Modal Forms',
          content: 'Forms with input fields and controls',
          code: `import { ModalFormData } from '@minecraft/server-ui';

class PlayerSettings {
  static async showSettingsForm(player) {
    const form = new ModalFormData()
      .title('§6Player Settings')
      .textField('Display Name:', 'Enter your display name', player.name)
      .slider('FOV:', 60, 120, 5, 90)
      .dropdown('Preferred Language:', [
        'English', 'Spanish', 'French', 'German'
      ], 0)
      .toggle('Enable Notifications', true)
      .toggle('Auto-Save Progress', true);
    
    const response = await form.show(player);
    
    if (response.canceled) return;
    
    const [displayName, fov, language, notifications, autoSave] = response.formValues;
    
    // Save player settings
    player.setDynamicProperty('settings', JSON.stringify({
      displayName,
      fov,
      language,
      notifications,
      autoSave
    }));
    
    player.sendMessage('§aSettings saved successfully!');
  }
}`
        }
      ]
    },
    'world-manipulation': {
      title: 'World Manipulation & Generation',
      description: 'Modify and generate world content dynamically',
      difficulty: 'advanced' as const,
      estimatedTime: '40 minutes',
      sections: [
        {
          title: 'Block Manipulation',
          content: 'Advanced block placement and modification',
          code: `import { world, BlockPermutation, ItemStack } from '@minecraft/server';

class WorldBuilder {
  static buildStructure(dimension, startPos, structure) {
    for (let x = 0; x < structure.length; x++) {
      for (let y = 0; y < structure[x].length; y++) {
        for (let z = 0; z < structure[x][y].length; z++) {
          const blockType = structure[x][y][z];
          
          if (blockType !== 'air') {
            const position = {
              x: startPos.x + x,
              y: startPos.y + y,
              z: startPos.z + z
            };
            
            const block = dimension.getBlock(position);
            if (block) {
              block.setPermutation(
                BlockPermutation.resolve(blockType)
              );
            }
          }
        }
      }
    }
  }
  
  static createTower(dimension, center, height, material) {
    for (let y = 0; y < height; y++) {
      const block = dimension.getBlock({
        x: center.x,
        y: center.y + y,
        z: center.z
      });
      
      if (block) {
        block.setPermutation(
          BlockPermutation.resolve(material)
        );
      }
    }
  }
}`
        },
        {
          title: 'Entity Management',
          content: 'Spawn and control entities dynamically',
          code: `import { world, EntityComponentTypes } from '@minecraft/server';

class EntityManager {
  static spawnGuardian(dimension, position, playerToProtect) {
    const guardian = dimension.spawnEntity('minecraft:iron_golem', position);
    
    // Set custom properties
    guardian.setDynamicProperty('isGuardian', true);
    guardian.setDynamicProperty('protectedPlayer', playerToProtect.id);
    
    // Add custom behavior
    guardian.addTag('custom_guardian');
    
    // Customize appearance
    const nameComponent = guardian.getComponent(EntityComponentTypes.Nameable);
    if (nameComponent) {
      nameComponent.nameTag = \`\${playerToProtect.name}'s Guardian\`;
    }
    
    return guardian;
  }
  
  static teleportAllEntitiesOfType(dimension, entityType, destination) {
    const entities = dimension.getEntities({
      type: entityType
    });
    
    entities.forEach(entity => {
      entity.teleport(destination);
    });
    
    return entities.length;
  }
}`
        }
      ]
    },
    'performance-optimization': {
      title: 'Performance Optimization',
      description: 'Write efficient scripts that scale well',
      difficulty: 'advanced' as const,
      estimatedTime: '35 minutes',
      sections: [
        {
          title: 'Efficient Event Handling',
          content: 'Optimize event listeners and processing',
          code: `import { world, system } from '@minecraft/server';

class PerformantEventHandler {
  private static eventQueue = [];
  private static processing = false;
  
  static init() {
    // Batch process events to reduce lag
    system.runInterval(() => {
      this.processEventQueue();
    }, 1); // Process every tick
    
    // Optimized player tracking
    world.afterEvents.playerSpawn.subscribe((event) => {
      this.queueEvent('playerSpawn', event);
    });
    
    world.afterEvents.playerLeave.subscribe((event) => {
      this.queueEvent('playerLeave', event);
    });
  }
  
  private static queueEvent(type: string, data: any) {
    this.eventQueue.push({ type, data, timestamp: Date.now() });
    
    // Prevent queue from growing too large
    if (this.eventQueue.length > 1000) {
      this.eventQueue.shift();
    }
  }
  
  private static processEventQueue() {
    if (this.processing || this.eventQueue.length === 0) return;
    
    this.processing = true;
    const batchSize = Math.min(10, this.eventQueue.length);
    
    for (let i = 0; i < batchSize; i++) {
      const event = this.eventQueue.shift();
      if (event) {
        this.handleEvent(event);
      }
    }
    
    this.processing = false;
  }
}`
        },
        {
          title: 'Memory Management',
          content: 'Manage memory and prevent leaks',
          code: `import { world, system } from '@minecraft/server';

class MemoryManager {
  private static intervals = new Map<string, number>();
  private static timeouts = new Map<string, number>();
  
  static setInterval(id: string, callback: () => void, ticks: number) {
    // Clean up existing interval if exists
    this.clearInterval(id);
    
    const intervalId = system.runInterval(callback, ticks);
    this.intervals.set(id, intervalId);
    
    return intervalId;
  }
  
  static clearInterval(id: string) {
    const intervalId = this.intervals.get(id);
    if (intervalId !== undefined) {
      system.clearRun(intervalId);
      this.intervals.delete(id);
    }
  }
  
  static setTimeout(id: string, callback: () => void, ticks: number) {
    this.clearTimeout(id);
    
    const timeoutId = system.runTimeout(callback, ticks);
    this.timeouts.set(id, timeoutId);
    
    return timeoutId;
  }
  
  static clearTimeout(id: string) {
    const timeoutId = this.timeouts.get(id);
    if (timeoutId !== undefined) {
      system.clearRun(timeoutId);
      this.timeouts.delete(id);
    }
  }
  
  static cleanup() {
    // Clear all managed intervals and timeouts
    this.intervals.forEach(id => system.clearRun(id));
    this.timeouts.forEach(id => system.clearRun(id));
    this.intervals.clear();
    this.timeouts.clear();
  }
}`
        }
      ]
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'class': return Code;
      case 'interface': return Layers;
      case 'enum': return Settings;
      case 'function': return Zap;
      case 'constant': return Database;
      default: return Package;
    }
  };

  return (
    <section className="p-6 max-w-7xl mx-auto" data-testid="scripting-docs">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">Scripting API Documentation</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Complete reference for Minecraft: Bedrock Edition scripting APIs and JavaScript integration
        </p>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">APIs</p>
                <p className="text-2xl font-bold">{scriptRegistry.length}</p>
              </div>
              <Code className="h-8 w-8 text-blue-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Modules</p>
                <p className="text-2xl font-bold">{modules.length}</p>
              </div>
              <Package className="h-8 w-8 text-green-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Stable</p>
                <p className="text-2xl font-bold">
                  {scriptRegistry.filter(api => api.stability === 'stable').length}
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
                  {scriptRegistry.filter(api => api.stability === 'experimental').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="api-reference" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="api-reference">API Reference</TabsTrigger>
          <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
          <TabsTrigger value="examples">Code Examples</TabsTrigger>
          <TabsTrigger value="best-practices">Best Practices</TabsTrigger>
        </TabsList>

        {/* API Reference Tab */}
        <TabsContent value="api-reference" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                    <Input
                      placeholder="Search APIs, modules, or descriptions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                      data-testid="input-api-search"
                    />
                  </div>
                </div>
                
                <Select value={moduleFilter} onValueChange={setModuleFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Module" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Modules</SelectItem>
                    {modules.map(module => (
                      <SelectItem key={module} value={module}>{module}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={typeFilter} onValueChange={(value: any) => setTypeFilter(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="class">Classes</SelectItem>
                    <SelectItem value="interface">Interfaces</SelectItem>
                    <SelectItem value="enum">Enums</SelectItem>
                    <SelectItem value="function">Functions</SelectItem>
                    <SelectItem value="constant">Constants</SelectItem>
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
              
              {(searchTerm || moduleFilter !== 'all' || typeFilter !== 'all' || stabilityFilter !== 'all') && (
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Showing {filteredAPIs.length} of {scriptRegistry.length} APIs
                  </span>
                  {filteredAPIs.length < scriptRegistry.length && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchTerm('');
                        setModuleFilter('all');
                        setTypeFilter('all');
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
            {/* API Browser */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Scripting APIs</CardTitle>
                  <CardDescription>
                    Browse through all available scripting APIs and their methods
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="multiple" className="space-y-2">
                    {Object.entries(apisByModule).map(([module, apis]) => {
                      const IconComponent = moduleIcons[module] || Package;
                      return (
                        <AccordionItem key={module} value={module} className="border rounded-lg">
                          <AccordionTrigger className="px-4 hover:bg-muted">
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-2">
                                <IconComponent size={16} />
                                <span className="font-mono text-sm">{module}</span>
                              </div>
                              <Badge variant="secondary">{apis.length}</Badge>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4">
                            <div className="space-y-2">
                              {apis.map((api) => {
                                const TypeIcon = getTypeIcon(api.type);
                                return (
                                  <div
                                    key={api.name}
                                    className="p-3 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                                    onClick={() => setSelectedAPI(api)}
                                    data-testid={`api-${api.name.replace(/[^a-zA-Z0-9]/g, '-')}`}
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <TypeIcon size={14} />
                                          <h4 className="font-mono text-sm text-primary">{api.name}</h4>
                                          <Badge variant="outline" className="text-xs">
                                            {api.type}
                                          </Badge>
                                          <Badge 
                                            variant="outline" 
                                            className={`text-xs ${getStabilityColor(api.stability || 'stable')}`}
                                          >
                                            {api.stability}
                                          </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{api.description}</p>
                                        {api.since && (
                                          <Badge variant="outline" className="mt-2 text-xs">
                                            Since {api.since}
                                          </Badge>
                                        )}
                                        {api.keywords.length > 0 && (
                                          <div className="flex flex-wrap gap-1 mt-2">
                                            {api.keywords.slice(0, 3).map((keyword: string) => (
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
                                );
                              })}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                </CardContent>
              </Card>
            </div>

            {/* API Details */}
            <div className="space-y-6">
              {selectedAPI ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="font-mono text-lg break-all">{selectedAPI.name}</CardTitle>
                    <CardDescription>{selectedAPI.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{selectedAPI.module}</Badge>
                      <Badge variant="outline">{selectedAPI.type}</Badge>
                      <Badge 
                        variant="outline" 
                        className={getStabilityColor(selectedAPI.stability || 'stable')}
                      >
                        {selectedAPI.stability}
                      </Badge>
                      {selectedAPI.since && (
                        <Badge variant="outline">
                          Since {selectedAPI.since}
                        </Badge>
                      )}
                    </div>

                    <Tabs defaultValue="overview">
                      <TabsList className="grid grid-cols-3 w-full">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="example">Example</TabsTrigger>
                        <TabsTrigger value="details">Details</TabsTrigger>
                      </TabsList>

                      <TabsContent value="overview" className="space-y-3">
                        <div className="space-y-3">
                          <div>
                            <h5 className="font-medium mb-2">Purpose</h5>
                            <p className="text-sm text-muted-foreground">{selectedAPI.description}</p>
                          </div>
                          
                          {selectedAPI.parameters && selectedAPI.parameters.length > 0 && (
                            <div>
                              <h5 className="font-medium mb-2">Parameters</h5>
                              <div className="space-y-2">
                                {selectedAPI.parameters.map((param, index) => (
                                  <div key={index} className="p-2 bg-muted rounded-lg">
                                    <div className="flex items-center justify-between">
                                      <span className="font-mono text-sm">{param.name}</span>
                                      <Badge variant="outline" className="text-xs">{param.type}</Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">{param.description}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {selectedAPI.returnType && (
                            <div>
                              <h5 className="font-medium mb-2">Returns</h5>
                              <Badge variant="outline">{selectedAPI.returnType}</Badge>
                            </div>
                          )}
                        </div>
                      </TabsContent>

                      <TabsContent value="example" className="space-y-3">
                        {selectedAPI.examples && selectedAPI.examples.length > 0 ? (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium">Code Example</h5>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(selectedAPI.examples![0].code, `${selectedAPI.name} example`)}
                                data-testid="button-copy-example"
                              >
                                <Copy size={14} className="mr-1" />
                                Copy
                              </Button>
                            </div>
                            <CodePreview code={selectedAPI.examples[0].code} language="javascript" />
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No example available</p>
                        )}
                      </TabsContent>

                      <TabsContent value="details" className="space-y-3">
                        <div className="space-y-3">
                          {selectedAPI.keywords.length > 0 && (
                            <div>
                              <h5 className="font-medium mb-2">Keywords</h5>
                              <div className="flex flex-wrap gap-1">
                                {selectedAPI.keywords.map((keyword: string) => (
                                  <Badge key={keyword} variant="secondary" className="text-xs">
                                    {keyword}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {selectedAPI.relatedElements && selectedAPI.relatedElements.length > 0 && (
                            <div>
                              <h5 className="font-medium mb-2">See Also</h5>
                              <div className="space-y-1">
                                {selectedAPI.relatedElements.map((ref: string, index: number) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {ref}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>

                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <Search size={48} className="text-muted-foreground mb-4" />
                    <h3 className="font-medium text-foreground mb-2">Select an API</h3>
                    <p className="text-sm text-muted-foreground">
                      Choose an API from the list to view its documentation and examples
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
                    <h5 className="font-medium mb-1">Core Modules</h5>
                    <ul className="text-muted-foreground space-y-1">
                      <li>• @minecraft/server - World interaction</li>
                      <li>• @minecraft/server-ui - User interfaces</li>
                      <li>• system - Timing and scheduling</li>
                      <li>• @minecraft/server-admin - Admin functions</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium mb-1">Common Patterns</h5>
                    <ul className="text-muted-foreground space-y-1">
                      <li>• Event subscription for reactivity</li>
                      <li>• Component-based entity manipulation</li>
                      <li>• Form-based user interaction</li>
                      <li>• Dynamic property storage</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium mb-1">Performance Tips</h5>
                    <ul className="text-muted-foreground space-y-1">
                      <li>• Batch operations when possible</li>
                      <li>• Use system.runInterval wisely</li>
                      <li>• Clean up event listeners</li>
                      <li>• Cache frequent calculations</li>
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
                    <CardTitle>{tutorials[selectedTutorial as keyof typeof tutorials].title}</CardTitle>
                    <CardDescription>
                      {tutorials[selectedTutorial as keyof typeof tutorials].description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
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

                    {tutorials[selectedTutorial as keyof typeof tutorials].sections.map((section, index) => (
                      <div key={index} className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-medium">{section.title}</h4>
                            <p className="text-sm text-muted-foreground">{section.content}</p>
                          </div>
                        </div>
                        
                        <div className="ml-11">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-sm">Code Example</h5>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(section.code, section.title)}
                              data-testid={`button-copy-section-${index}`}
                            >
                              <Copy size={14} className="mr-1" />
                              Copy
                            </Button>
                          </div>
                          <CodePreview code={section.code} language="javascript" />
                        </div>
                        
                        {index < tutorials[selectedTutorial as keyof typeof tutorials].sections.length - 1 && (
                          <Separator className="my-6" />
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Code Examples Tab */}
        <TabsContent value="examples" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Terminal className="mr-2" size={20} />
                  Event System Examples
                </CardTitle>
                <CardDescription>Common event handling patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <CodePreview 
                  language="javascript" 
                  code={`import { world } from '@minecraft/server';

// Player join/leave tracking
const players = new Set();

world.afterEvents.playerSpawn.subscribe((event) => {
  players.add(event.player.id);
  world.sendMessage(\`Welcome \${event.player.name}!\`);
});

world.afterEvents.playerLeave.subscribe((event) => {
  players.delete(event.playerId);
  world.sendMessage(\`\${event.playerName} left the game\`);
});

// Block interaction logging
world.afterEvents.playerInteractWithBlock.subscribe((event) => {
  const { player, block } = event;
  console.log(\`\${player.name} interacted with \${block.typeId}\`);
});`}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="mr-2" size={20} />
                  UI Form Examples
                </CardTitle>
                <CardDescription>Interactive user interface creation</CardDescription>
              </CardHeader>
              <CardContent>
                <CodePreview 
                  language="javascript" 
                  code={`import { ActionFormData, ModalFormData } from '@minecraft/server-ui';

// Simple action form
async function showMainMenu(player) {
  const form = new ActionFormData()
    .title('Server Menu')
    .body('Choose an option:')
    .button('Teleport Home')
    .button('Player Stats')
    .button('Settings');
  
  const response = await form.show(player);
  
  if (!response.canceled) {
    switch (response.selection) {
      case 0: 
        player.teleport({ x: 0, y: 64, z: 0 });
        break;
      case 1:
        showPlayerStats(player);
        break;
      case 2:
        showSettings(player);
        break;
    }
  }
}`}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="mr-2" size={20} />
                  World Manipulation
                </CardTitle>
                <CardDescription>Modify blocks and spawn entities</CardDescription>
              </CardHeader>
              <CardContent>
                <CodePreview 
                  language="javascript" 
                  code={`import { world, BlockPermutation } from '@minecraft/server';

// Build a simple structure
function buildHouse(dimension, center) {
  // Foundation
  for (let x = -2; x <= 2; x++) {
    for (let z = -2; z <= 2; z++) {
      const block = dimension.getBlock({
        x: center.x + x,
        y: center.y,
        z: center.z + z
      });
      block?.setPermutation(
        BlockPermutation.resolve('minecraft:stone')
      );
    }
  }
  
  // Walls
  for (let y = 1; y <= 3; y++) {
    // Front and back walls
    for (let x = -2; x <= 2; x++) {
      [center.z - 2, center.z + 2].forEach(z => {
        const block = dimension.getBlock({
          x: center.x + x,
          y: center.y + y,
          z: z
        });
        block?.setPermutation(
          BlockPermutation.resolve('minecraft:oak_planks')
        );
      });
    }
  }
}`}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2" size={20} />
                  Timing & Scheduling
                </CardTitle>
                <CardDescription>System timing and interval management</CardDescription>
              </CardHeader>
              <CardContent>
                <CodePreview 
                  language="javascript" 
                  code={`import { system, world } from '@minecraft/server';

// Run code on next tick
system.run(() => {
  console.log('This runs next tick');
});

// Repeating timer
const timerId = system.runInterval(() => {
  world.getAllPlayers().forEach(player => {
    player.sendMessage('§6Timer tick!');
  });
}, 100); // Every 5 seconds (100 ticks)

// Delayed execution
system.runTimeout(() => {
  system.clearRun(timerId);
  world.sendMessage('§aTimer stopped!');
}, 600); // After 30 seconds

// Conditional interval
let counter = 0;
const conditionalTimer = system.runInterval(() => {
  counter++;
  if (counter >= 10) {
    system.clearRun(conditionalTimer);
    world.sendMessage('§cConditional timer finished!');
  }
}, 20);`}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Best Practices Tab */}
        <TabsContent value="best-practices" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600 dark:text-green-400">✅ Best Practices</CardTitle>
                <CardDescription>Follow these guidelines for optimal script performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="text-sm space-y-2">
                  <li>• Always handle promise rejections and errors</li>
                  <li>• Use system.run for heavy computations</li>
                  <li>• Clean up intervals and timeouts properly</li>
                  <li>• Validate user input in forms and commands</li>
                  <li>• Use dynamic properties for persistent data</li>
                  <li>• Batch multiple operations together</li>
                  <li>• Test scripts in different game scenarios</li>
                  <li>• Use meaningful variable and function names</li>
                  <li>• Comment complex logic thoroughly</li>
                  <li>• Keep scripts modular and reusable</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-red-600 dark:text-red-400">❌ Common Mistakes</CardTitle>
                <CardDescription>Avoid these common pitfalls in script development</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="text-sm space-y-2">
                  <li>• Not checking if entities/blocks exist before use</li>
                  <li>• Creating memory leaks with uncleaned intervals</li>
                  <li>• Ignoring experimental API warnings</li>
                  <li>• Not handling form cancellation properly</li>
                  <li>• Overusing system.runInterval for simple tasks</li>
                  <li>• Hardcoding player names or IDs</li>
                  <li>• Not testing with multiple players</li>
                  <li>• Forgetting to import required modules</li>
                  <li>• Using synchronous operations in async contexts</li>
                  <li>• Not considering edge cases and error states</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2" size={20} />
                Performance Optimization Guidelines
              </CardTitle>
              <CardDescription>Techniques for writing efficient scripts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h5 className="font-medium text-blue-600 dark:text-blue-400 mb-3">Event Handling</h5>
                  <ul className="text-sm space-y-1">
                    <li>• Use specific event filters when available</li>
                    <li>• Unsubscribe from unused events</li>
                    <li>• Batch event processing when possible</li>
                    <li>• Avoid heavy computation in event handlers</li>
                  </ul>
                </div>
                
                <div>
                  <h5 className="font-medium text-green-600 dark:text-green-400 mb-3">Data Management</h5>
                  <ul className="text-sm space-y-1">
                    <li>• Use dynamic properties for persistence</li>
                    <li>• Cache frequently accessed data</li>
                    <li>• Minimize JSON parsing/stringifying</li>
                    <li>• Clean up unused dynamic properties</li>
                  </ul>
                </div>
                
                <div>
                  <h5 className="font-medium text-purple-600 dark:text-purple-400 mb-3">System Resources</h5>
                  <ul className="text-sm space-y-1">
                    <li>• Use appropriate interval durations</li>
                    <li>• Limit concurrent async operations</li>
                    <li>• Monitor script execution time</li>
                    <li>• Optimize entity/block queries</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lightbulb className="mr-2" size={20} />
                Advanced Techniques
              </CardTitle>
              <CardDescription>Professional patterns for complex addons</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h5 className="font-medium mb-2">Modular Architecture</h5>
                  <p className="text-sm text-muted-foreground mb-2">
                    Organize your scripts into modules for better maintainability and reusability.
                  </p>
                  <CodePreview 
                    language="javascript" 
                    code={`// utils/playerManager.js
export class PlayerManager {
  static getPlayerStats(player) {
    return {
      health: player.getComponent('health'),
      inventory: player.getComponent('inventory'),
      location: player.location
    };
  }
}

// main.js
import { PlayerManager } from './utils/playerManager.js';

world.afterEvents.playerSpawn.subscribe((event) => {
  const stats = PlayerManager.getPlayerStats(event.player);
  console.log('Player stats:', stats);
});`}
                  />
                </div>
                
                <div>
                  <h5 className="font-medium mb-2">Error Handling</h5>
                  <p className="text-sm text-muted-foreground mb-2">
                    Implement robust error handling to prevent script crashes.
                  </p>
                  <CodePreview 
                    language="javascript" 
                    code={`import { world } from '@minecraft/server';

function safeExecute(fn, errorMessage = 'An error occurred') {
  try {
    return fn();
  } catch (error) {
    console.error(\`\${errorMessage}:\`, error);
    world.sendMessage(\`§c\${errorMessage}\`);
    return null;
  }
}

// Usage
const result = safeExecute(() => {
  // Potentially dangerous operation
  return player.getComponent('inventory').container.getItem(0);
}, 'Failed to get player inventory item');`}
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