import { useState } from "react";
import { Search, Box, Copy, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CodePreview from "@/components/Common/CodePreview";

export default function BlockDocs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('basic-blocks');

  const blockTopics = [
    {
      id: 'basic-blocks',
      title: 'Basic Blocks',
      description: 'Simple blocks with basic properties'
    },
    {
      id: 'custom-shapes',
      title: 'Custom Shapes',
      description: 'Blocks with unique geometries'
    },
    {
      id: 'interactive-blocks',
      title: 'Interactive Blocks',
      description: 'Blocks that respond to player interaction'
    },
    {
      id: 'animated-blocks',
      title: 'Animated Blocks',
      description: 'Blocks with animations and states'
    }
  ];

  const basicBlockExample = `{
  "format_version": "1.21.0",
  "minecraft:block": {
    "description": {
      "identifier": "my_addon:custom_stone",
      "register_to_creative_menu": true
    },
    "components": {
      "minecraft:destructible_by_mining": {
        "seconds_to_destroy": 2.0
      },
      "minecraft:destructible_by_explosion": {
        "explosion_resistance": 6.0
      },
      "minecraft:friction": 0.6,
      "minecraft:map_color": "#7F7F7F"
    }
  }
}`;

  const customShapeExample = `{
  "format_version": "1.21.0",
  "minecraft:block": {
    "description": {
      "identifier": "my_addon:custom_slab"
    },
    "components": {
      "minecraft:geometry": "geometry.custom_slab",
      "minecraft:material_instances": {
        "*": {
          "texture": "custom_slab",
          "render_method": "alpha_test"
        }
      },
      "minecraft:collision_box": {
        "origin": [-8, 0, -8],
        "size": [16, 8, 16]
      },
      "minecraft:selection_box": {
        "origin": [-8, 0, -8],
        "size": [16, 8, 16]
      }
    }
  }
}`;

  const blockComponents = [
    {
      name: 'minecraft:destructible_by_mining',
      description: 'Defines how long it takes to mine the block',
      properties: ['seconds_to_destroy'],
      category: 'Mining'
    },
    {
      name: 'minecraft:destructible_by_explosion',
      description: 'Sets the block\'s resistance to explosions',
      properties: ['explosion_resistance'],
      category: 'Mining'
    },
    {
      name: 'minecraft:friction',
      description: 'Controls how slippery the block surface is',
      properties: ['value (0.0 - 1.0)'],
      category: 'Physics'
    },
    {
      name: 'minecraft:geometry',
      description: 'References a custom 3D model for the block',
      properties: ['identifier'],
      category: 'Rendering'
    },
    {
      name: 'minecraft:material_instances',
      description: 'Defines textures and rendering for block faces',
      properties: ['texture', 'render_method'],
      category: 'Rendering'
    }
  ];

  const filteredComponents = blockComponents.filter(component =>
    component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    component.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderTopicContent = () => {
    switch (selectedTopic) {
      case 'basic-blocks':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Basic Block Structure</h3>
              <p className="text-muted-foreground mb-4">
                Basic blocks are the foundation of custom block creation. They define simple properties 
                like mining time, explosion resistance, and visual appearance.
              </p>
              <CodePreview code={basicBlockExample} language="json" />
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Core Properties</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>• <strong>identifier:</strong> Unique block ID</p>
                  <p>• <strong>register_to_creative_menu:</strong> Show in creative inventory</p>
                  <p>• <strong>destructible_by_mining:</strong> Mining properties</p>
                  <p>• <strong>map_color:</strong> Color on maps</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Best Practices</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>• Use descriptive identifiers</p>
                  <p>• Set appropriate mining times</p>
                  <p>• Consider explosion resistance</p>
                  <p>• Test in different game modes</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'custom-shapes':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Custom Block Shapes</h3>
              <p className="text-muted-foreground mb-4">
                Create blocks with unique shapes using custom geometry, collision boxes, and selection boxes.
              </p>
              <CodePreview code={customShapeExample} language="json" />
            </div>
            
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium text-foreground mb-2">Collision vs Selection Boxes</h4>
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Collision Box:</strong> Defines the physical boundaries for entity collision
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Selection Box:</strong> Defines the area highlighted when targeting the block
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <Box size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Select a topic to view documentation</p>
          </div>
        );
    }
  };

  return (
    <section className="p-6" data-testid="block-docs">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Block Documentation</h1>
          <p className="text-lg text-muted-foreground">
            Complete guide to creating custom blocks in Minecraft: Bedrock Edition
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Topic Navigation */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Topics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {blockTopics.map((topic) => (
                  <button
                    key={topic.id}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedTopic === topic.id 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => setSelectedTopic(topic.id)}
                    data-testid={`topic-${topic.id}`}
                  >
                    <div className="font-medium text-sm">{topic.title}</div>
                    <div className="text-xs opacity-80">{topic.description}</div>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Component Search */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Components</CardTitle>
                <div className="flex items-center space-x-2">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="text-sm"
                    data-testid="input-component-search"
                  />
                </div>
              </CardHeader>
              <CardContent className="max-h-64 overflow-y-auto">
                <div className="space-y-2">
                  {filteredComponents.map((component) => (
                    <div
                      key={component.name}
                      className="p-2 border rounded-lg hover:bg-muted cursor-pointer"
                      data-testid={`component-${component.name.replace('minecraft:', '')}`}
                    >
                      <div className="font-mono text-xs text-primary">{component.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">{component.description}</div>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {component.category}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-6">
                {renderTopicContent()}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="flex justify-between items-center mt-6">
              <Button variant="outline" size="sm" asChild>
                <a 
                  href="https://learn.microsoft.com/en-us/minecraft/creator/reference/content/blockreference/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  data-testid="button-official-docs"
                >
                  <ExternalLink size={14} className="mr-2" />
                  Official Docs
                </a>
              </Button>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" data-testid="button-copy-example">
                  <Copy size={14} className="mr-2" />
                  Copy Example
                </Button>
                <Button size="sm" data-testid="button-try-builder">
                  Try Block Builder
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
