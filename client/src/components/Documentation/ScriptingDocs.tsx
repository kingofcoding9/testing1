import { useState } from "react";
import { Search, Code, Copy, ExternalLink, Server, Cog } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import CodePreview from "@/components/Common/CodePreview";

export default function ScriptingDocs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAPI, setSelectedAPI] = useState('@minecraft/server');

  const scriptingAPIs = [
    {
      name: '@minecraft/server',
      description: 'Core server-side scripting API for world manipulation',
      version: '1.21.0',
      modules: [
        {
          name: 'world',
          description: 'Global world object for accessing game state',
          methods: [
            'sendMessage', 'playSound', 'spawnEntity', 'getPlayers', 'getDimension'
          ]
        },
        {
          name: 'Player',
          description: 'Player entity with extended functionality',
          methods: [
            'runCommand', 'teleport', 'addExperience', 'getInventory'
          ]
        },
        {
          name: 'Entity',
          description: 'Base entity class for all entities',
          methods: [
            'kill', 'setDynamicProperty', 'addTag', 'removeTag'
          ]
        }
      ]
    },
    {
      name: '@minecraft/server-ui',
      description: 'User interface components for creating forms and dialogs',
      version: '1.21.0',
      modules: [
        {
          name: 'ActionFormData',
          description: 'Create forms with buttons and actions',
          methods: [
            'title', 'body', 'button', 'show'
          ]
        },
        {
          name: 'ModalFormData',
          description: 'Create forms with input fields',
          methods: [
            'title', 'textField', 'dropdown', 'slider', 'show'
          ]
        }
      ]
    },
    {
      name: 'system',
      description: 'System-level APIs for timing and events',
      version: '1.21.0',
      modules: [
        {
          name: 'system',
          description: 'Global system object for scheduling',
          methods: [
            'run', 'runInterval', 'runTimeout', 'clearRun'
          ]
        }
      ]
    }
  ];

  const basicExample = `import { world } from '@minecraft/server';

// Send a message to all players
world.sendMessage("Welcome to my custom addon!");

// Listen for player join events
world.afterEvents.playerSpawn.subscribe((event) => {
  const player = event.player;
  player.sendMessage(\`Welcome, \${player.name}!\`);
});

// Spawn an entity at a location
const location = { x: 0, y: 64, z: 0 };
const pig = world.spawnEntity('minecraft:pig', location);`;

  const uiExample = `import { ActionFormData } from '@minecraft/server-ui';

// Create a simple action form
const form = new ActionFormData()
  .title("Custom Menu")
  .body("Choose an action:")
  .button("Give Items")
  .button("Teleport")
  .button("Cancel");

// Show the form to a player
form.show(player).then((response) => {
  if (response.canceled) return;
  
  switch (response.selection) {
    case 0:
      // Give items logic
      break;
    case 1:
      // Teleport logic
      break;
  }
});`;

  const systemExample = `import { system } from '@minecraft/server';

// Run code on the next tick
system.run(() => {
  console.log("This runs next tick");
});

// Run code repeatedly every second (20 ticks)
const intervalId = system.runInterval(() => {
  world.sendMessage("Timer tick!");
}, 20);

// Stop the interval after 10 seconds
system.runTimeout(() => {
  system.clearRun(intervalId);
}, 200);`;

  const eventExample = `import { world } from '@minecraft/server';

// Block placement event
world.afterEvents.playerPlaceBlock.subscribe((event) => {
  const { player, block } = event;
  player.sendMessage(\`You placed \${block.typeId}\`);
});

// Entity hurt event
world.afterEvents.entityHurt.subscribe((event) => {
  const { hurtEntity, damageSource } = event;
  if (hurtEntity.typeId === 'minecraft:player') {
    const player = hurtEntity;
    player.sendMessage("Ouch! That hurt!");
  }
});

// Chat command event
world.beforeEvents.chatSend.subscribe((event) => {
  const { sender, message } = event;
  
  if (message.startsWith('!heal')) {
    event.cancel = true;
    sender.runCommand('effect @s instant_health 1 255');
    sender.sendMessage("You have been healed!");
  }
});`;

  const filteredAPIs = scriptingAPIs.filter(api =>
    api.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    api.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderAPIContent = () => {
    const api = scriptingAPIs.find(a => a.name === selectedAPI);
    if (!api) return null;

    return (
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-semibold text-foreground">{api.name}</h3>
            <Badge variant="outline">v{api.version}</Badge>
          </div>
          <p className="text-muted-foreground mb-4">{api.description}</p>
        </div>

        <Accordion type="multiple" className="space-y-2">
          {api.modules.map((module) => (
            <AccordionItem key={module.name} value={module.name} className="border rounded-lg">
              <AccordionTrigger className="px-4 hover:bg-muted">
                <div className="flex items-center">
                  <Code className="mr-2" size={16} />
                  <span className="font-mono text-sm">{module.name}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <p className="text-sm text-muted-foreground mb-3">{module.description}</p>
                <div className="space-y-2">
                  <h5 className="font-medium text-sm">Available Methods:</h5>
                  <div className="grid grid-cols-2 gap-2">
                    {module.methods.map((method) => (
                      <div key={method} className="text-xs font-mono bg-muted p-2 rounded">
                        {method}()
                      </div>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    );
  };

  return (
    <section className="p-6" data-testid="scripting-docs">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Scripting API Documentation</h1>
          <p className="text-lg text-muted-foreground">
            Complete reference for Minecraft: Bedrock Edition scripting APIs and JavaScript integration
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* API Navigation */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">API Modules</CardTitle>
                <div className="flex items-center space-x-2">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search APIs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="text-sm"
                    data-testid="input-api-search"
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {filteredAPIs.map((api) => (
                  <button
                    key={api.name}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedAPI === api.name 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => setSelectedAPI(api.name)}
                    data-testid={`api-${api.name.replace('@minecraft/', '').replace('/', '-')}`}
                  >
                    <div className="flex items-center mb-1">
                      <Server className="mr-2" size={14} />
                      <span className="font-mono text-sm">{api.name}</span>
                    </div>
                    <div className="text-xs opacity-80">{api.description}</div>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Quick Reference */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Reference</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <h5 className="font-medium mb-1">Getting Started</h5>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Import required modules</li>
                    <li>• Register event listeners</li>
                    <li>• Use system.run for timing</li>
                    <li>• Handle errors gracefully</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium mb-1">Best Practices</h5>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Validate player input</li>
                    <li>• Use try-catch blocks</li>
                    <li>• Clean up intervals</li>
                    <li>• Test in different scenarios</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="api" className="space-y-4">
              <TabsList>
                <TabsTrigger value="api" data-testid="tab-api">API Reference</TabsTrigger>
                <TabsTrigger value="examples" data-testid="tab-examples">Examples</TabsTrigger>
                <TabsTrigger value="events" data-testid="tab-events">Events</TabsTrigger>
                <TabsTrigger value="tutorials" data-testid="tab-tutorials">Tutorials</TabsTrigger>
              </TabsList>

              <TabsContent value="api">
                <Card>
                  <CardContent className="p-6">
                    {renderAPIContent()}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="examples">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Basic World Interaction</CardTitle>
                      <CardDescription>
                        Essential world manipulation and player interaction
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <CodePreview code={basicExample} language="javascript" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">User Interface</CardTitle>
                      <CardDescription>
                        Creating forms and interactive menus
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <CodePreview code={uiExample} language="javascript" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">System & Timing</CardTitle>
                      <CardDescription>
                        Scheduling and timing system usage
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <CodePreview code={systemExample} language="javascript" />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="events">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Event Handling</CardTitle>
                    <CardDescription>
                      Listen for and respond to game events
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CodePreview code={eventExample} language="javascript" />
                    
                    <div className="mt-6 grid md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium mb-2">Before Events</h5>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Can be cancelled</li>
                          <li>• Occur before the action</li>
                          <li>• Allow modification</li>
                          <li>• Example: chatSend, itemUse</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium mb-2">After Events</h5>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Cannot be cancelled</li>
                          <li>• Occur after the action</li>
                          <li>• Read-only information</li>
                          <li>• Example: playerSpawn, entityHurt</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tutorials">
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Getting Started Tutorial</CardTitle>
                      <CardDescription>Step-by-step guide to your first script</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <h5 className="font-medium">1. Setup Script File</h5>
                        <p className="text-sm text-muted-foreground">
                          Create a JavaScript file in your behavior pack's scripts/ folder
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h5 className="font-medium">2. Import Required Modules</h5>
                        <p className="text-sm text-muted-foreground">
                          Use import statements to access Minecraft APIs
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h5 className="font-medium">3. Register Event Listeners</h5>
                        <p className="text-sm text-muted-foreground">
                          Subscribe to game events to trigger your code
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h5 className="font-medium">4. Test Your Script</h5>
                        <p className="text-sm text-muted-foreground">
                          Load your behavior pack and test functionality in-game
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            {/* Quick Actions */}
            <div className="flex justify-between items-center mt-6">
              <Button variant="outline" size="sm" asChild>
                <a 
                  href="https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  data-testid="button-official-docs"
                >
                  <ExternalLink size={14} className="mr-2" />
                  Official API Docs
                </a>
              </Button>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" data-testid="button-copy-example">
                  <Copy size={14} className="mr-2" />
                  Copy Example
                </Button>
                <Button size="sm" data-testid="button-try-script-studio">
                  Try Script Studio
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
