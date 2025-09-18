import { useState } from "react";
import { Copy, Download, Play, Parentheses, Server, Cog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import CodePreview from "@/components/Common/CodePreview";
import { minecraftApi } from "@/lib/minecraft/docs";

interface APIMethod {
  name: string;
  description: string;
  parameters: Array<{
    name: string;
    type: string;
    description: string;
    optional?: boolean;
  }>;
  returns: string;
  example: string;
}

interface APIModule {
  name: string;
  description: string;
  methods: APIMethod[];
}

export default function ScriptStudio() {
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [methodParams, setMethodParams] = useState<Record<string, string>>({});
  const [generatedCode, setGeneratedCode] = useState('// Select a method to generate code');
  const [searchTerm, setSearchTerm] = useState('');

  const apiModules: APIModule[] = [
    {
      name: '@minecraft/server',
      description: 'Core server-side APIs for world and entity manipulation',
      methods: [
        {
          name: 'world.sendMessage',
          description: 'Sends a message to all players in the world',
          parameters: [
            { name: 'message', type: 'string', description: 'The message to send' }
          ],
          returns: 'void',
          example: 'world.sendMessage("Hello, Minecraft!");'
        },
        {
          name: 'world.playSound',
          description: 'Plays a sound at a specific location',
          parameters: [
            { name: 'soundId', type: 'string', description: 'The sound identifier' },
            { name: 'location', type: 'Vector3', description: 'The location to play the sound' },
            { name: 'volume', type: 'number', description: 'Volume level (0-1)', optional: true }
          ],
          returns: 'void',
          example: 'world.playSound("random.pop", { x: 0, y: 0, z: 0 }, 1.0);'
        },
        {
          name: 'world.getPlayers',
          description: 'Gets all players currently in the world',
          parameters: [],
          returns: 'Player[]',
          example: 'const players = world.getPlayers();'
        },
        {
          name: 'world.spawnEntity',
          description: 'Spawns an entity at the specified location',
          parameters: [
            { name: 'identifier', type: 'string', description: 'Entity type identifier' },
            { name: 'location', type: 'Vector3', description: 'Spawn location' }
          ],
          returns: 'Entity',
          example: 'const entity = world.spawnEntity("minecraft:pig", { x: 0, y: 64, z: 0 });'
        }
      ]
    },
    {
      name: 'system',
      description: 'System-level APIs for scheduling and events',
      methods: [
        {
          name: 'system.run',
          description: 'Schedules a function to run on the next tick',
          parameters: [
            { name: 'callback', type: 'Parentheses', description: 'Parentheses to execute' }
          ],
          returns: 'number',
          example: 'system.run(() => { console.log("Next tick!"); });'
        },
        {
          name: 'system.runInterval',
          description: 'Schedules a function to run repeatedly at intervals',
          parameters: [
            { name: 'callback', type: 'Parentheses', description: 'Parentheses to execute' },
            { name: 'tickInterval', type: 'number', description: 'Interval in ticks' }
          ],
          returns: 'number',
          example: 'system.runInterval(() => { world.sendMessage("Timer!"); }, 20);'
        }
      ]
    }
  ];

  const filteredModules = apiModules.filter(module =>
    module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    module.methods.some(method => 
      method.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const currentMethod = apiModules
    .flatMap(module => module.methods)
    .find(method => method.name === selectedMethod);

  const generateScript = () => {
    if (!currentMethod) return;

    const imports = selectedModule ? `import { ${selectedModule === '@minecraft/server' ? 'world' : 'system'} } from '${selectedModule}';\n\n` : '';
    
    const parameterValues = currentMethod.parameters.map(param => {
      const value = methodParams[param.name];
      if (!value && !param.optional) return `/* ${param.name}: ${param.type} */`;
      
      switch (param.type) {
        case 'string':
          return `"${value || 'example'}"`;
        case 'number':
          return value || '1';
        case 'Vector3':
          const coords = value ? value.split(',').map(n => n.trim()) : ['0', '0', '0'];
          return `{ x: ${coords[0] || '0'}, y: ${coords[1] || '0'}, z: ${coords[2] || '0'} }`;
        case 'Parentheses':
          return '() => {\n  // Your code here\n}';
        default:
          return value || 'undefined';
      }
    }).join(', ');

    const code = `${imports}// ${currentMethod.description}
${currentMethod.name}(${parameterValues});`;

    setGeneratedCode(code);
  };

  const handleMethodSelect = (method: APIMethod, module: string) => {
    setSelectedMethod(method.name);
    setSelectedModule(module);
    setMethodParams({});
    
    // Initialize parameters with empty values
    const initialParams: Record<string, string> = {};
    method.parameters.forEach(param => {
      initialParams[param.name] = '';
    });
    setMethodParams(initialParams);
  };

  const templates = [
    {
      name: 'Hello World',
      description: 'Basic message sending',
      code: `import { world } from '@minecraft/server';

world.sendMessage("Hello, Minecraft!");`
    },
    {
      name: 'Entity Spawner',
      description: 'Spawn entities at location',
      code: `import { world } from '@minecraft/server';

const spawnLocation = { x: 0, y: 64, z: 0 };
const entity = world.spawnEntity("minecraft:pig", spawnLocation);
world.sendMessage("Spawned a pig!");`
    },
    {
      name: 'Block Placer',
      description: 'Place blocks in world',
      code: `import { world, BlockPermutation } from '@minecraft/server';

const location = { x: 0, y: 64, z: 0 };
const block = BlockPermutation.resolve("minecraft:diamond_block");
world.setBlock(location, block);`
    },
    {
      name: 'Player Tracker',
      description: 'Track player movements',
      code: `import { world, system } from '@minecraft/server';

system.runInterval(() => {
  const players = world.getPlayers();
  players.forEach(player => {
    const location = player.location;
    console.log(\`Player \${player.name} at \${location.x}, \${location.y}, \${location.z}\`);
  });
}, 20); // Every second`
    }
  ];

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const downloadCode = () => {
    const blob = new Blob([generatedCode], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'script.js';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="p-6" data-testid="script-studio">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* API Explorer */}
          <div className="builder-form rounded-lg p-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">API Explorer</h3>
            
            {/* Search */}
            <div className="mb-4">
              <Input
                placeholder="Search APIs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-api-search"
              />
            </div>

            {/* API Tree */}
            <div className="max-h-96 overflow-y-auto">
              <Accordion type="multiple" className="space-y-2">
                {filteredModules.map((module) => (
                  <AccordionItem key={module.name} value={module.name} className="border border-border rounded-lg">
                    <AccordionTrigger className="px-3 py-2 hover:bg-muted rounded-lg">
                      <div className="flex items-center">
                        <Server className="mr-2" size={16} />
                        <span className="text-sm font-medium">{module.name}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-3 pb-2">
                      <p className="text-xs text-muted-foreground mb-2">{module.description}</p>
                      <div className="space-y-1">
                        {module.methods.map((method) => (
                          <button
                            key={method.name}
                            className="w-full flex items-center p-2 hover:bg-muted rounded text-left transition-colors"
                            onClick={() => handleMethodSelect(method, module.name)}
                            data-testid={`api-method-${method.name.replace('.', '-')}`}
                          >
                            <Parentheses className="mr-2" size={12} />
                            <span className="text-xs">{method.name}</span>
                          </button>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>

          {/* Configuration Panel */}
          <div className="builder-form rounded-lg p-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">Configuration</h3>
            
            <div id="method-config" className="space-y-4">
              {currentMethod ? (
                <div>
                  <h4 className="font-medium text-foreground mb-2">{currentMethod.name}</h4>
                  <p className="text-sm text-muted-foreground mb-4">{currentMethod.description}</p>
                  
                  {currentMethod.parameters.length > 0 && (
                    <div className="space-y-3">
                      <h5 className="text-sm font-medium text-foreground">Parameters:</h5>
                      {currentMethod.parameters.map((param) => (
                        <div key={param.name}>
                          <Label htmlFor={`param-${param.name}`}>
                            {param.name} ({param.type}){param.optional && ' *optional'}
                          </Label>
                          <Input
                            id={`param-${param.name}`}
                            placeholder={param.description}
                            value={methodParams[param.name] || ''}
                            onChange={(e) => setMethodParams({
                              ...methodParams,
                              [param.name]: e.target.value
                            })}
                            data-testid={`input-param-${param.name}`}
                          />
                          <p className="text-xs text-muted-foreground mt-1">{param.description}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <h5 className="text-sm font-medium text-foreground mb-2">Returns:</h5>
                    <p className="text-sm text-muted-foreground">{currentMethod.returns}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Cog className="mx-auto mb-2" size={48} />
                  <p>Select a method from the API Explorer to configure parameters</p>
                </div>
              )}
            </div>

            <div className="mt-6">
              <Button
                className="w-full"
                onClick={generateScript}
                disabled={!currentMethod}
                data-testid="button-generate-script"
              >
                <Play className="mr-2" size={16} />
                Generate Script
              </Button>
            </div>
          </div>

          {/* Code Output */}
          <div className="builder-form rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Generated Code</h3>
              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={copyCode}
                  data-testid="button-copy-code"
                >
                  <Copy className="mr-2" size={16} />
                  Copy
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={downloadCode}
                  data-testid="button-download-code"
                >
                  <Download className="mr-2" size={16} />
                  Download
                </Button>
              </div>
            </div>
            
            <div className="h-80 mb-4">
              <CodePreview code={generatedCode} language="javascript" />
            </div>

            {/* Script Templates */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">Quick Templates</h4>
              <div className="space-y-2">
                {templates.map((template) => (
                  <button
                    key={template.name}
                    className="w-full text-left p-2 hover:bg-muted rounded-lg transition-colors"
                    onClick={() => setGeneratedCode(template.code)}
                    data-testid={`template-${template.name.toLowerCase().replace(' ', '-')}`}
                  >
                    <div className="text-sm font-medium">{template.name}</div>
                    <div className="text-xs text-muted-foreground">{template.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
