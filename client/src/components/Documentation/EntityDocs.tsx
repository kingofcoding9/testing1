import { useState } from "react";
import { Search, ChevronRight, Copy, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CodePreview from "@/components/Common/CodePreview";
import { entityComponents, EntityComponent } from "@/lib/minecraft/components";

export default function EntityDocs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedComponent, setSelectedComponent] = useState<EntityComponent | null>(null);

  const filteredComponents = entityComponents.filter(component =>
    component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    component.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    component.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const componentsByCategory = filteredComponents.reduce((acc, component) => {
    if (!acc[component.category]) {
      acc[component.category] = [];
    }
    acc[component.category].push(component);
    return acc;
  }, {} as Record<string, EntityComponent[]>);

  const copyExample = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <section className="p-6" data-testid="entity-docs">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Entity Documentation</h1>
          <p className="text-lg text-muted-foreground">
            Complete reference for creating and customizing entities in Minecraft: Bedrock Edition
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Component Browser */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Entity Components</CardTitle>
                <CardDescription>
                  Browse through all available entity components and their properties
                </CardDescription>
                <div className="flex items-center space-x-2">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search components..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    data-testid="input-component-search"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="space-y-2">
                  {Object.entries(componentsByCategory).map(([category, components]) => (
                    <AccordionItem key={category} value={category} className="border rounded-lg">
                      <AccordionTrigger className="px-4 hover:bg-muted">
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium">{category}</span>
                          <Badge variant="secondary">{components.length}</Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="space-y-2">
                          {components.map((component) => (
                            <div
                              key={component.name}
                              className="p-3 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                              onClick={() => setSelectedComponent(component)}
                              data-testid={`component-${component.name.replace('minecraft:', '').replace(':', '-')}`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-mono text-sm text-primary">{component.name}</h4>
                                  <p className="text-sm text-muted-foreground mt-1">{component.description}</p>
                                  {component.version && (
                                    <Badge variant="outline" className="mt-2 text-xs">
                                      Since {component.version}
                                    </Badge>
                                  )}
                                </div>
                                <ChevronRight size={16} className="text-muted-foreground" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>

          {/* Component Details */}
          <div className="space-y-6">
            {selectedComponent ? (
              <Card>
                <CardHeader>
                  <CardTitle className="font-mono text-lg">{selectedComponent.name}</CardTitle>
                  <CardDescription>{selectedComponent.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Badge variant="secondary">{selectedComponent.category}</Badge>
                    {selectedComponent.version && (
                      <Badge variant="outline" className="ml-2">
                        Since {selectedComponent.version}
                      </Badge>
                    )}
                  </div>

                  <Tabs defaultValue="properties">
                    <TabsList>
                      <TabsTrigger value="properties">Properties</TabsTrigger>
                      <TabsTrigger value="example">Example</TabsTrigger>
                    </TabsList>

                    <TabsContent value="properties" className="space-y-3">
                      {selectedComponent.properties && selectedComponent.properties.length > 0 ? (
                        <div className="space-y-3">
                          {selectedComponent.properties.map((prop) => (
                            <div key={prop.name} className="p-3 bg-muted rounded-lg">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h5 className="font-mono text-sm font-medium">{prop.name}</h5>
                                  <p className="text-xs text-muted-foreground mt-1">{prop.description}</p>
                                </div>
                                <div className="text-right">
                                  <Badge variant="outline" className="text-xs">
                                    {prop.type}
                                  </Badge>
                                  {prop.required && (
                                    <Badge variant="destructive" className="ml-1 text-xs">
                                      Required
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              {prop.default && (
                                <p className="text-xs text-muted-foreground mt-2">
                                  Default: <code className="bg-background px-1 rounded">{prop.default}</code>
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No configurable properties</p>
                      )}
                    </TabsContent>

                    <TabsContent value="example" className="space-y-3">
                      {selectedComponent.example ? (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium">Usage Example</h5>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyExample(selectedComponent.example!)}
                              data-testid="button-copy-example"
                            >
                              <Copy size={14} className="mr-1" />
                              Copy
                            </Button>
                          </div>
                          <CodePreview code={selectedComponent.example} language="json" />
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No example available</p>
                      )}
                    </TabsContent>
                  </Tabs>

                  {selectedComponent.documentation && (
                    <div>
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <a 
                          href={selectedComponent.documentation} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          data-testid="button-view-docs"
                        >
                          <ExternalLink size={14} className="mr-2" />
                          View Official Documentation
                        </a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Search size={48} className="text-muted-foreground mb-4" />
                  <h3 className="font-medium text-foreground mb-2">Select a Component</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose a component from the list to view its documentation and examples
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
                  <h5 className="font-medium mb-1">Common Components</h5>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• minecraft:health - Entity health</li>
                    <li>• minecraft:movement - Movement speed</li>
                    <li>• minecraft:behavior.* - AI behaviors</li>
                    <li>• minecraft:physics - Physics simulation</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium mb-1">Tips</h5>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Always include required components</li>
                    <li>• Test thoroughly in creative mode</li>
                    <li>• Use component groups for variants</li>
                    <li>• Check format_version compatibility</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
